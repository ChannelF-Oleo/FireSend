import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { GeminiService } from "../services/gemini";
import { InstagramService } from "../services/instagram";

// Inicializar Firebase Admin si no existe
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

const DEBOUNCE_MS = 3000;
const MAX_HISTORY_MESSAGES = 20; // Aumentado para mejor contexto

/**
 * Formatea el historial para dar contexto a Gemini
 */
function formatHistoryForAI(
  messages: Array<{ role: string; content: string }>,
): string {
  return messages
    .map((msg) => `${msg.role === "user" ? "Usuario" : "Bot"}: ${msg.content}`)
    .join("\n");
}

/**
 * Verifica si el último mensaje es del bot (anti-bucle)
 */
async function isLastMessageFromBot(
  messagesRef: FirebaseFirestore.CollectionReference,
): Promise<boolean> {
  const lastMessages = await messagesRef
    .orderBy("timestamp", "desc")
    .limit(1)
    .get();

  if (lastMessages.empty) return false;

  const lastMsg = lastMessages.docs[0].data();
  return lastMsg.type === "assistant" || lastMsg.type === "bot";
}

/**
 * Worker que procesa mensajes nuevos con lógica de debounce y anti-bucle
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

    // Filtro 1: Solo mensajes de usuario
    if (messageData.type !== "user") {
      logger.info("Mensaje del bot, ignorando");
      return null;
    }

    // Filtro 2: Solo mensajes pendientes
    if (messageData.status !== "pending") {
      logger.info("Mensaje ya procesado, ignorando");
      return null;
    }

    logger.info(
      `Procesando mensaje ${messageId} en conversación ${conversationId}`,
    );

    // Debounce: esperar antes de procesar
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS));

    const messagesRef = db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages");

    // Verificar si hay mensajes más recientes
    const newerMessages = await messagesRef
      .where("timestamp", ">", messageData.timestamp)
      .where("type", "==", "user")
      .limit(1)
      .get();

    if (!newerMessages.empty) {
      logger.info(`Mensaje ${messageId} ya no es el más reciente, abortando`);
      return null;
    }

    // TAREA 4: Seguridad Anti-Bucle - verificar que el último mensaje NO sea del bot
    const botWasLast = await isLastMessageFromBot(messagesRef);
    if (botWasLast) {
      logger.warn(
        "Último mensaje es del bot, posible bucle detectado, abortando",
      );
      return null;
    }

    // Obtener datos de la conversación
    const conversationDoc = await db
      .collection("conversations")
      .doc(conversationId)
      .get();

    const conversationData = conversationDoc.data();
    if (!conversationData) {
      logger.error("Conversación no encontrada");
      return null;
    }

    // Verificar si el bot está pausado para esta conversación
    if (conversationData.bot_paused) {
      logger.info(`Bot pausado para conversación ${conversationId}, ignorando`);
      await messagesRef.doc(messageId).update({
        status: "skipped_bot_paused",
      });
      return null;
    }

    const tenantId = conversationData.tenant_id;
    const tenantDoc = await db.collection("tenants").doc(tenantId).get();
    const tenantData = tenantDoc.data();

    if (!tenantData) {
      logger.error(`Tenant ${tenantId} no encontrado`);
      return null;
    }

    // Verificar interruptor maestro del bot
    if (tenantData.isBotActive === false) {
      logger.info(
        `Bot desactivado globalmente para tenant ${tenantId}, guardando mensaje sin responder`,
      );
      await messagesRef.doc(messageId).update({
        status: "skipped_bot_disabled",
      });
      return null;
    }

    const geminiKey = tenantData.geminiKey || process.env.GEMINI_API_KEY;
    const instagramToken = tenantData.instagramToken;
    const systemPrompt =
      tenantData.systemPrompt ||
      "Eres un asistente de ventas amable y profesional.";

    if (!geminiKey) {
      logger.error("Gemini API Key no configurada");
      return null;
    }

    if (!instagramToken) {
      logger.error("Instagram Access Token no configurado");
      return null;
    }

    // TAREA 4: Recuperar últimos N mensajes para contexto
    const historySnapshot = await messagesRef
      .orderBy("timestamp", "desc")
      .limit(MAX_HISTORY_MESSAGES)
      .get();

    // Invertir para orden cronológico
    const chatHistory = historySnapshot.docs.reverse().map((doc) => {
      const data = doc.data();
      return {
        role: data.type === "user" ? "user" : "assistant",
        content: data.text,
      };
    }) as Array<{ role: "user" | "assistant"; content: string }>;

    logger.info(`Historial recuperado: ${chatHistory.length} mensajes`);
    logger.debug(`Contexto:\n${formatHistoryForAI(chatHistory)}`);

    try {
      const geminiService = new GeminiService(geminiKey);

      // RAG: Buscar contexto relevante en la base de conocimiento
      let ragContext: string | undefined;
      const lastUserMessage = chatHistory[chatHistory.length - 1]?.content;

      if (lastUserMessage) {
        try {
          // Obtener vectores del tenant
          const vectorsSnapshot = await db
            .collection("tenants")
            .doc(tenantId)
            .collection("vectors")
            .get();

          if (!vectorsSnapshot.empty) {
            // Generar embedding de la pregunta
            const queryEmbedding =
              await geminiService.generateEmbedding(lastUserMessage);

            // Buscar documentos relevantes
            const vectors = vectorsSnapshot.docs.map((doc) => ({
              content: doc.data().content,
              embedding: doc.data().embedding,
            }));

            const relevantDocs = await geminiService.searchRelevantDocs(
              queryEmbedding,
              vectors,
              3,
            );

            if (relevantDocs.length > 0) {
              ragContext = relevantDocs.map((d) => d.content).join("\n\n");
              logger.info(
                `RAG: Encontrados ${relevantDocs.length} documentos relevantes`,
              );
            }
          }
        } catch (ragError) {
          logger.warn(
            "Error en búsqueda RAG, continuando sin contexto:",
            ragError,
          );
        }
      }

      // Generar respuesta con contexto RAG
      const aiResponse = await geminiService.generateResponse(
        chatHistory,
        systemPrompt,
        ragContext,
      );

      logger.info(
        `Respuesta de IA generada: ${aiResponse.substring(0, 50)}...`,
      );

      // Análisis de sentimiento (async, no bloquea)
      geminiService
        .analyzeSentiment(lastUserMessage)
        .then(async (sentiment) => {
          try {
            await messagesRef.doc(messageId).update({ sentiment });
          } catch (e) {
            logger.warn("Error guardando sentimiento:", e);
          }
        });

      const instagramService = new InstagramService();
      const senderId = messageData.sender_id;

      await instagramService.sendTypingIndicator(senderId, instagramToken);

      const sentMessageId = await instagramService.sendMessage({
        recipientId: senderId,
        message: aiResponse,
        accessToken: instagramToken,
      });

      // Guardar respuesta del bot
      await messagesRef.add({
        text: aiResponse,
        sender_id: conversationData.page_id,
        recipient_id: senderId,
        timestamp: FieldValue.serverTimestamp(),
        status: "sent",
        type: "assistant",
        instagram_message_id: sentMessageId,
      });

      // Actualizar conversación
      await db.collection("conversations").doc(conversationId).update({
        last_message: aiResponse,
        last_message_at: FieldValue.serverTimestamp(),
        unread_count: 0,
      });

      // Marcar mensaje original como procesado
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
