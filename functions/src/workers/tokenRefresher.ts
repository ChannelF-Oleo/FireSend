import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

const META_APP_ID = process.env.META_APP_ID || "";
const META_APP_SECRET = process.env.META_APP_SECRET || "";
const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

// Refrescar tokens que expiran en menos de 7 días
const DAYS_BEFORE_EXPIRY = 7;

/**
 * Cron Job Semanal para refrescar tokens de Facebook/Instagram
 * Se ejecuta cada lunes a las 3:00 AM UTC
 */
export const refreshTokens = onSchedule(
  {
    schedule: "0 3 * * 1", // Cada lunes a las 3:00 AM
    timeZone: "UTC",
    region: "us-central1",
  },
  async () => {
    logger.info("🔄 Iniciando refresh de tokens...");

    if (!META_APP_ID || !META_APP_SECRET) {
      logger.error("META_APP_ID o META_APP_SECRET no configurados");
      return;
    }

    try {
      const now = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(now.getDate() + DAYS_BEFORE_EXPIRY);

      // Buscar tenants con tokens que expiran pronto
      const tenantsSnapshot = await db
        .collection("tenants")
        .where("oauthConnected", "==", true)
        .where("tokenExpiresAt", "<=", thresholdDate)
        .get();

      logger.info(`Encontrados ${tenantsSnapshot.size} tokens para refrescar`);

      let refreshed = 0;
      let failed = 0;

      for (const tenantDoc of tenantsSnapshot.docs) {
        const tenantData = tenantDoc.data();
        const tenantId = tenantDoc.id;

        if (!tenantData.facebookToken) {
          logger.warn(`Tenant ${tenantId} sin token de Facebook`);
          continue;
        }

        try {
          // Llamar al endpoint de refresh de Facebook
          const refreshUrl = new URL(`${GRAPH_API_URL}/oauth/access_token`);
          refreshUrl.searchParams.append("grant_type", "fb_exchange_token");
          refreshUrl.searchParams.append("client_id", META_APP_ID);
          refreshUrl.searchParams.append("client_secret", META_APP_SECRET);
          refreshUrl.searchParams.append(
            "fb_exchange_token",
            tenantData.facebookToken,
          );

          const response = await fetch(refreshUrl.toString());

          if (!response.ok) {
            const errorData = await response.json();
            logger.error(
              `Error refrescando token para ${tenantId}:`,
              errorData,
            );
            failed++;
            continue;
          }

          const tokenData = await response.json();
          const newToken = tokenData.access_token;
          const expiresIn = tokenData.expires_in || 5184000;

          const newExpiresAt = new Date();
          newExpiresAt.setSeconds(newExpiresAt.getSeconds() + expiresIn);

          // Actualizar token en Firestore
          await db.collection("tenants").doc(tenantId).update({
            facebookToken: newToken,
            tokenExpiresAt: newExpiresAt,
            tokenUpdatedAt: FieldValue.serverTimestamp(),
            lastTokenRefresh: FieldValue.serverTimestamp(),
          });

          logger.info(`✅ Token refrescado para tenant ${tenantId}`);
          refreshed++;
        } catch (error) {
          logger.error(`Error procesando tenant ${tenantId}:`, error);
          failed++;
        }
      }

      logger.info(
        `🔄 Refresh completado: ${refreshed} exitosos, ${failed} fallidos`,
      );
    } catch (error) {
      logger.error("Error en cron job de refresh:", error);
    }
  },
);
