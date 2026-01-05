import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { InstagramService } from "../services/instagram";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

/**
 * Endpoint para enviar mensajes manuales desde el dashboard
 * POST /sendManualMessage
 */
export const sendManualMessage = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido" });
      return;
    }

    const { userId, conversationId, recipientId, message } = req.body;

    if (!userId || !conversationId || !recipientId || !message) {
      res.status(400).json({ error: "Faltan parámetros requeridos" });
      return;
    }

    try {
      // 1. Obtener token del tenant
      const tenantDoc = await db.collection("tenants").doc(userId).get();
      const tenantData = tenantDoc.data();

      if (!tenantData?.instagramToken) {
        res.status(400).json({ error: "Token de Instagram no configurado" });
        return;
      }

      // 2. Verificar que la conversación pertenece al tenant
      const convDoc = await db.collection("conversations").doc(conversationId).get();
      if (!convDoc.exists || convDoc.data()?.tenant_id !== userId) {
        res.status(403).json({ error: "No tienes acceso a esta conversación" });
        return;
      }

      // 3. Enviar mensaje via Instagram API
      const instagramService = new InstagramService();
      
      // Mostrar typing indicator
      await instagramService.sendTypingIndicator(recipientId, tenantData.instagramToken);
      
      // Enviar mensaje
      const sentMessageId = await instagramService.sendMessage({
        recipientId,
        message,
        accessToken: tenantData.instagramToken,
      });

      // 4. Guardar mensaje en Firestore
      const messagesRef = db.collection("conversations").doc(conversationId).collection("messages");
      
      await messagesRef.add({
        text: message,
        sender_id: tenantData.instagramPageId || "manual",
        recipient_id: recipientId,
        timestamp: FieldValue.serverTimestamp(),
        status: "sent",
        type: "assistant",
        source: "manual", // Indica que fue enviado manualmente
        instagram_message_id: sentMessageId,
      });

      // 5. Actualizar conversación
      await db.collection("conversations").doc(conversationId).update({
        last_message: message,
        last_message_at: FieldValue.serverTimestamp(),
        unread_count: 0,
      });

      logger.info(`Mensaje manual enviado a ${recipientId} por usuario ${userId}`);

      res.status(200).json({
        success: true,
        messageId: sentMessageId,
      });

    } catch (error) {
      logger.error("Error enviando mensaje manual:", error);
      res.status(500).json({
        error: "Error al enviar mensaje",
        details: error instanceof Error ? error.message : "Desconocido",
      });
    }
  }
);

/**
 * Endpoint para cambiar el stage de una conversación
 * POST /updateConversationStage
 */
export const updateConversationStage = onRequest(
  { cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido" });
      return;
    }

    const { userId, conversationId, stage } = req.body;
    const validStages = ["active", "negotiation", "closed", "qualified"];

    if (!userId || !conversationId || !stage) {
      res.status(400).json({ error: "Faltan parámetros requeridos" });
      return;
    }

    if (!validStages.includes(stage)) {
      res.status(400).json({ error: "Stage inválido", validStages });
      return;
    }

    try {
      const convDoc = await db.collection("conversations").doc(conversationId).get();
      
      if (!convDoc.exists || convDoc.data()?.tenant_id !== userId) {
        res.status(403).json({ error: "No tienes acceso a esta conversación" });
        return;
      }

      await db.collection("conversations").doc(conversationId).update({
        stage,
        stage_updated_at: FieldValue.serverTimestamp(),
      });

      res.status(200).json({ success: true, stage });

    } catch (error) {
      logger.error("Error actualizando stage:", error);
      res.status(500).json({ error: "Error al actualizar" });
    }
  }
);
