import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

// Inicializar Firebase Admin si no existe
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

/**
 * Obtiene la fecha en formato YYYY-MM-DD para usar como ID de documento
 */
function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Obtiene la hora del día (0-23)
 */
function getHourOfDay(date: Date = new Date()): number {
  return date.getHours();
}

/**
 * Obtiene el día de la semana (0=Domingo, 6=Sábado)
 */
function getDayOfWeek(date: Date = new Date()): number {
  return date.getDay();
}

/**
 * Worker que actualiza estadísticas cuando se crea un nuevo mensaje
 */
export const onMessageStats = onDocumentCreated(
  {
    document: "conversations/{conversationId}/messages/{messageId}",
    region: "us-central1",
  },
  async (event) => {
    const messageData = event.data?.data();
    const conversationId = event.params.conversationId;

    if (!messageData) {
      return null;
    }

    try {
      // Obtener tenant_id de la conversación
      const conversationDoc = await db
        .collection("conversations")
        .doc(conversationId)
        .get();

      const conversationData = conversationDoc.data();
      if (!conversationData) {
        logger.warn(`Conversación ${conversationId} no encontrada`);
        return null;
      }

      const tenantId = conversationData.tenant_id;
      const dateKey = getDateKey();
      const hour = getHourOfDay();
      const dayOfWeek = getDayOfWeek();
      const messageType = messageData.type; // 'user' | 'assistant'

      // Referencia al documento de stats del día
      const statsRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("stats_daily")
        .doc(dateKey);

      // Actualizar contadores atómicos
      const updates: Record<string, unknown> = {
        date: dateKey,
        updated_at: FieldValue.serverTimestamp(),
        total_messages: FieldValue.increment(1),
        [`hourly_messages.${hour}`]: FieldValue.increment(1),
        [`daily_activity.${dayOfWeek}`]: FieldValue.increment(1),
      };

      if (messageType === "user") {
        updates.user_messages = FieldValue.increment(1);

        // Guardar sentimiento si existe
        if (messageData.sentiment) {
          updates.total_sentiment = FieldValue.increment(messageData.sentiment);
          updates.sentiment_count = FieldValue.increment(1);
        }
      } else if (messageType === "assistant") {
        updates.ai_messages = FieldValue.increment(1);
        // Calcular tiempo ahorrado (2 min por mensaje de IA)
        updates.time_saved_minutes = FieldValue.increment(2);
      }

      // Si el mensaje fue procesado por humano (intervención manual)
      if (messageData.manual_intervention) {
        updates.human_interventions = FieldValue.increment(1);
      }

      await statsRef.set(updates, { merge: true });

      logger.info(
        `Stats actualizadas para tenant ${tenantId}, fecha ${dateKey}`,
      );
      return { success: true };
    } catch (error) {
      logger.error("Error actualizando stats:", error);
      return { success: false, error };
    }
  },
);

/**
 * Worker que actualiza estadísticas de conversación cuando cambia el stage
 */
export const onConversationUpdate = onDocumentCreated(
  {
    document: "conversations/{conversationId}",
    region: "us-central1",
  },
  async (event) => {
    const conversationData = event.data?.data();
    const conversationId = event.params.conversationId;

    if (!conversationData) {
      return null;
    }

    try {
      const tenantId = conversationData.tenant_id;
      const dateKey = getDateKey();

      const statsRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("stats_daily")
        .doc(dateKey);

      await statsRef.set(
        {
          date: dateKey,
          updated_at: FieldValue.serverTimestamp(),
          new_conversations: FieldValue.increment(1),
        },
        { merge: true },
      );

      logger.info(`Nueva conversación registrada para tenant ${tenantId}`);
      return { success: true };
    } catch (error) {
      logger.error("Error registrando conversación:", error);
      return { success: false, error };
    }
  },
);
