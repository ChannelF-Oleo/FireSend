import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

// Inicializar Firebase Admin si no existe
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

const META_APP_ID = process.env.META_APP_ID || "";
const META_APP_SECRET = process.env.META_APP_SECRET || "";
const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface TokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface PageData {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}

interface PagesResponse {
  data: PageData[];
}

/**
 * Endpoint para intercambiar Short-Lived Token por Long-Lived Token
 * POST /authInstagram
 */
export const authInstagram = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido" });
      return;
    }

    const { shortLivedToken, userId } = req.body;

    if (!shortLivedToken || !userId) {
      res
        .status(400)
        .json({ error: "shortLivedToken y userId son requeridos" });
      return;
    }

    if (!META_APP_ID || !META_APP_SECRET) {
      logger.error("META_APP_ID o META_APP_SECRET no configurados");
      res.status(500).json({ error: "Configuración de Meta incompleta" });
      return;
    }

    try {
      const tokenExchangeUrl = new URL(`${GRAPH_API_URL}/oauth/access_token`);
      tokenExchangeUrl.searchParams.append("grant_type", "fb_exchange_token");
      tokenExchangeUrl.searchParams.append("client_id", META_APP_ID);
      tokenExchangeUrl.searchParams.append("client_secret", META_APP_SECRET);
      tokenExchangeUrl.searchParams.append(
        "fb_exchange_token",
        shortLivedToken,
      );

      const tokenResponse = await fetch(tokenExchangeUrl.toString());

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        res.status(400).json({
          error: "Error al intercambiar token",
          details: errorData.error?.message,
        });
        return;
      }

      const tokenData: TokenExchangeResponse = await tokenResponse.json();
      const longLivedToken = tokenData.access_token;
      const expiresIn = tokenData.expires_in || 5184000;

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

      await db.collection("tenants").doc(userId).set(
        {
          facebookToken: longLivedToken,
          tokenExpiresAt: expiresAt,
          tokenUpdatedAt: FieldValue.serverTimestamp(),
          oauthConnected: true,
        },
        { merge: true },
      );

      logger.info(`Token guardado para usuario ${userId}`);
      res.status(200).json({
        success: true,
        expiresAt: expiresAt.toISOString(),
        expiresInDays: Math.floor(expiresIn / 86400),
      });
    } catch (error) {
      logger.error("Error en authInstagram:", error);
      res.status(500).json({
        error: "Error interno",
        details: error instanceof Error ? error.message : "Desconocido",
      });
    }
  },
);

/**
 * Endpoint para obtener las páginas del usuario con Instagram Business
 * POST /getPages
 */
export const getPages = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido" });
      return;
    }

    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: "userId es requerido" });
      return;
    }

    try {
      const tenantDoc = await db.collection("tenants").doc(userId).get();
      const tenantData = tenantDoc.data();

      if (!tenantData?.facebookToken) {
        res.status(400).json({ error: "Usuario no tiene token de Facebook" });
        return;
      }

      const pagesUrl = new URL(`${GRAPH_API_URL}/me/accounts`);
      pagesUrl.searchParams.append("access_token", tenantData.facebookToken);
      pagesUrl.searchParams.append(
        "fields",
        "id,name,access_token,instagram_business_account",
      );

      const pagesResponse = await fetch(pagesUrl.toString());
      if (!pagesResponse.ok) {
        const errorData = await pagesResponse.json();
        res.status(400).json({
          error: "Error al obtener páginas",
          details: errorData.error?.message,
        });
        return;
      }

      const pagesData: PagesResponse = await pagesResponse.json();
      const pagesWithInstagram = pagesData.data
        .filter((page) => page.instagram_business_account)
        .map((page) => ({
          pageId: page.id,
          pageName: page.name,
          instagramAccountId: page.instagram_business_account?.id,
          pageAccessToken: page.access_token,
        }));

      res.status(200).json({ success: true, pages: pagesWithInstagram });
    } catch (error) {
      logger.error("Error en getPages:", error);
      res.status(500).json({
        error: "Error interno",
        details: error instanceof Error ? error.message : "Desconocido",
      });
    }
  },
);

/**
 * Endpoint para conectar una página específica y crear mapeo automático
 * POST /connectPage
 */
export const connectPage = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido" });
      return;
    }

    const { userId, pageId, instagramAccountId, pageAccessToken, pageName } =
      req.body;
    if (!userId || !pageId || !instagramAccountId || !pageAccessToken) {
      res.status(400).json({ error: "Faltan parámetros requeridos" });
      return;
    }

    try {
      const batch = db.batch();

      // Actualizar tenant con configuración de Instagram
      const tenantRef = db.collection("tenants").doc(userId);
      batch.set(
        tenantRef,
        {
          instagramToken: pageAccessToken,
          instagramPageId: instagramAccountId,
          connectedPageId: pageId,
          connectedPageName: pageName,
          instagramConnectedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      // Crear entrada en pages_map para el webhook (TAREA 2)
      const pageMapRef = db.collection("pages_map").doc(instagramAccountId);
      batch.set(pageMapRef, {
        tenant_id: userId,
        page_id: pageId,
        instagram_account_id: instagramAccountId,
        page_name: pageName,
        connected_at: FieldValue.serverTimestamp(),
      });

      await batch.commit();
      logger.info(`Página ${pageId} conectada para usuario ${userId}`);
      res
        .status(200)
        .json({
          success: true,
          message: "Página conectada",
          instagramAccountId,
        });
    } catch (error) {
      logger.error("Error en connectPage:", error);
      res
        .status(500)
        .json({
          error: "Error interno",
          details: error instanceof Error ? error.message : "Desconocido",
        });
    }
  },
);

/**
 * Endpoint para desconectar Instagram
 * POST /disconnectInstagram
 */
export const disconnectInstagram = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido" });
      return;
    }

    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: "userId es requerido" });
      return;
    }

    try {
      const tenantDoc = await db.collection("tenants").doc(userId).get();
      const tenantData = tenantDoc.data();
      const batch = db.batch();

      if (tenantData?.instagramPageId) {
        batch.delete(
          db.collection("pages_map").doc(tenantData.instagramPageId),
        );
      }

      batch.update(db.collection("tenants").doc(userId), {
        instagramToken: null,
        instagramPageId: null,
        facebookToken: null,
        connectedPageId: null,
        connectedPageName: null,
        oauthConnected: false,
        tokenExpiresAt: null,
      });

      await batch.commit();
      res
        .status(200)
        .json({ success: true, message: "Instagram desconectado" });
    } catch (error) {
      logger.error("Error en disconnectInstagram:", error);
      res
        .status(500)
        .json({
          error: "Error interno",
          details: error instanceof Error ? error.message : "Desconocido",
        });
    }
  },
);
