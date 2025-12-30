import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { OpenAIService } from "../services/openai";
import { InstagramService } from "../services/instagram";

const db = getFirestore();

/**
 * Worker que procesa mensajes nuevos con lógica de debounce
 *
 * Trigger: Cuando se crea un documento en conversations/{convId}/messages
 * Lógica:
 * 1. Espera 3-5 segundos (debounce)
 * 2. Verifica si hay mensajes más recientes
 * 3. Si es el último mensaje: procesa con IA y responde
 * 4. Si no: aborta (otro worker lo procesará)
 */
export const onNewMessage = onDocumentCreated(
  {
    document: "conversations/{conversationId}/messages/{messageId}",
    region: "us-central1",
    secrets: [],
  },
  async (event) => {
    const messageData = event.data?.data();
    const conversationId = event.params.conversationId;
    const messageId = event.params.messageId;

    if (!messageData) {
      logger.warn("Mensaje sin datos, abortando");
      return null;
    }

    if (messageData.type !== "user") {
      logger.info("Mensaje del bot, ignorando");
      return null;
    }

    if (messageData.status !== "pending") {
      logger.info("Mensaje ya procesado, ignorando");
      return null;
    }

    logger.info(
      `Procesando mensaje ${messageId} en conversación ${conversationId}`,
    );

    const DEBOUNCE_MS = 3000;
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS));

    const messagesRef = db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages");

    const newerMessages = await messagesRef
      .where("timestamp", ">", messageData.timestamp)
      .where("type", "==", "user")
      .limit(1)
      .get();

    if (!newerMessages.empty) {
      logger.info(`Mensaje ${messageId} ya no es el más reciente, abortando`);
      return null;
    }

    const conversationDoc = await db
      .collection("conversations")
      .doc(conversationId)
      .get();

    const conversationData = conversationDoc.data();
    if (!conversationData) {
      logger.error("Conversación no encontrada");
      return null;
    }

    const tenantId = conversationData.tenant_id;
    const tenantDoc = await db.collection("tenants").doc(tenantId).get();
    const tenantData = tenantDoc.data();

    if (!tenantData) {
      logger.error(`Tenant ${tenantId} no encontrado`);
      return null;
    }

    const openaiKey = tenantData.openaiKey || process.env.OPENAI_API_KEY;
    const instagramToken = tenantData.instagramToken;
    const systemPrompt =
      tenantData.systemPrompt ||
      "Eres un asistente de ventas amable y profesional.";

    if (!openaiKey) {
      logger.error("OpenAI API Key no configurada");
      return null;
    }

    if (!instagramToken) {
      logger.error("Instagram Access Token no configurado");
      return null;
    }

    const historySnapshot = await messagesRef
      .orderBy("timestamp", "asc")
      .limit(20)
      .get();

    const chatHistory = historySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        role: data.type === "user" ? "user" : "assistant",
        content: data.text,
      };
    }) as Array<{ role: "user" | "assistant"; content: string }>;

    logger.info(`Historial recuperado: ${chatHistory.length} mensajes`);

    try {
      const openaiService = new OpenAIService(openaiKey);
      const aiResponse = await openaiService.generateResponse(
        chatHistory,
        systemPrompt,
      );

      logger.info(
        `Respuesta de IA generada: ${aiResponse.substring(0, 50)}...`,
      );

      const instagramService = new InstagramService();
      const senderId = messageData.sender_id;

      await instagramService.sendTypingIndicator(senderId, instagramToken);

      const sentMessageId = await instagramService.sendMessage({
        recipientId: senderId,
        message: aiResponse,
        accessToken: instagramToken,
      });

      await messagesRef.add({
        text: aiResponse,
        sender_id: conversationData.page_id,
        recipient_id: senderId,
        timestamp: FieldValue.serverTimestamp(),
        status: "sent",
        type: "assistant",
        instagram_message_id: sentMessageId,
      });

      await db.collection("conversations").doc(conversationId).update({
        last_message: aiResponse,
        last_message_at: FieldValue.serverTimestamp(),
        unread_count: 0,
      });

      await messagesRef.doc(messageId).update({
        status: "processed",
      });

      logger.info(`✅ Mensaje procesado exitosamente: ${messageId}`);
      return { success: true, messageId };
    } catch (error) {
      logger.error("Error procesando mensaje:", error);

      await messagesRef.doc(messageId).update({
        status: "failed",
        error: error instanceof Error ? error.message : "Error desconocido",
      });

      return { success: false, error };
    }
  },
);
