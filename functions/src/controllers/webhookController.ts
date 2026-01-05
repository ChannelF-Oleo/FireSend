import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { verifyMetaSignature } from "../utils/security";

// Inicializar Firebase Admin si no existe (Singleton Pattern)
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// Tipos de mensaje soportados
type MessageType =
  | "text"
  | "story_reply"
  | "story_mention"
  | "attachment"
  | "unknown";

interface ProcessedMessage {
  text: string;
  type: MessageType;
  storyId?: string;
  attachmentUrl?: string;
}

/**
 * Busca el tenant_id usando la colección pages_map
 * @param recipientId - ID de la página/cuenta de Instagram que recibe el mensaje
 */
async function findTenantByPageId(recipientId: string): Promise<string | null> {
  try {
    const pageMapDoc = await db.collection("pages_map").doc(recipientId).get();
    if (pageMapDoc.exists) {
      return pageMapDoc.data()?.tenant_id || null;
    }
    logger.warn(`No se encontró mapeo para página ${recipientId}`);
    return null;
  } catch (error) {
    logger.error("Error buscando tenant:", error);
    return null;
  }
}

/**
 * Procesa diferentes tipos de mensajes de Instagram
 */
function processMessageContent(webhookEvent: any): ProcessedMessage | null {
  const message = webhookEvent.message;

  if (!message) return null;

  // 1. Story Reply (respuesta a una historia)
  if (message.reply_to?.story) {
    return {
      text: message.text || "[Respuesta a historia]",
      type: "story_reply",
      storyId: message.reply_to.story.id,
    };
  }

  // 2. Story Mention (mención en una historia)
  if (message.attachments?.[0]?.type === "story_mention") {
    return {
      text: "[Te mencionaron en una historia]",
      type: "story_mention",
      storyId: message.attachments[0].payload?.url,
    };
  }

  // 3. Attachment (imagen, video, etc.)
  if (message.attachments?.length > 0 && !message.text) {
    const attachment = message.attachments[0];
    return {
      text: `[${attachment.type || "Archivo"} recibido]`,
      type: "attachment",
      attachmentUrl: attachment.payload?.url,
    };
  }

  // 4. Texto plano
  if (message.text) {
    return {
      text: message.text,
      type: "text",
    };
  }

  return null;
}

export const instagramWebhook = onRequest(async (req, res) => {
  // ------------------------------------------------------
  // 1. VERIFICACIÓN (Meta Challenge - GET)
  // ------------------------------------------------------
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Token secreto desde variables de entorno
    const VERIFY_TOKEN =
      process.env.META_VERIFY_TOKEN || "firesend_secret_token_123";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      logger.info("Webhook verificado correctamente.");
      res.status(200).send(challenge);
    } else {
      logger.warn("Fallo de verificación de Webhook.");
      res.sendStatus(403);
    }
    return;
  }

  // ------------------------------------------------------
  // 2. INGESTA DE MENSAJES (POST)
  // ------------------------------------------------------
  if (req.method === "POST") {
    // VALIDACIÓN DE FIRMA DE SEGURIDAD (OBLIGATORIA)
    const signature = req.headers["x-hub-signature-256"] as string | undefined;
    const appSecret = process.env.META_APP_SECRET;

    // La validación de firma es OBLIGATORIA en producción
    if (!appSecret) {
      logger.error(
        "META_APP_SECRET no configurado - Rechazando petición por seguridad",
      );
      res
        .status(500)
        .json({ error: "Server misconfigured: META_APP_SECRET required" });
      return;
    }

    const rawBody = JSON.stringify(req.body);
    const isValid = verifyMetaSignature(rawBody, signature, appSecret);

    if (!isValid) {
      logger.error("Firma de Meta inválida - Petición rechazada");
      res.sendStatus(403);
      return;
    }
    logger.info("Firma de Meta verificada correctamente");

    const body = req.body;

    // Verificar que sea un evento de página o instagram
    if (body.object === "instagram" || body.object === "page") {
      try {
        // Iteramos sobre las "entries" (Meta puede agrupar eventos)
        for (const entry of body.entry as any[]) {
          if (entry.messaging) {
            for (const webhookEvent of entry.messaging) {
              // Filtrar ecos (mensajes enviados por nosotros)
              if (webhookEvent.message?.is_echo) {
                logger.info("Mensaje eco ignorado");
                continue;
              }

              // Procesar contenido del mensaje (texto, story reply, mention, etc.)
              const processedMessage = processMessageContent(webhookEvent);
              if (!processedMessage) {
                logger.info("Mensaje sin contenido procesable, ignorando");
                continue;
              }

              const senderId = webhookEvent.sender.id;
              const recipientId = webhookEvent.recipient.id;

              // TAREA 2: Buscar tenant usando pages_map
              const tenantId = await findTenantByPageId(recipientId);
              if (!tenantId) {
                logger.warn(
                  `No hay tenant configurado para página ${recipientId}`,
                );
                continue;
              }

              logger.info(
                `📩 Mensaje [${processedMessage.type}] de ${senderId}: ${processedMessage.text}`,
              );

              // Guardar en colección global conversations (única fuente de verdad)
              const conversationId = `${recipientId}_${senderId}`;
              const conversationRef = db
                .collection("conversations")
                .doc(conversationId);

              // A. Guardar mensaje en sub-colección
              await conversationRef.collection("messages").add({
                text: processedMessage.text,
                sender_id: senderId,
                recipient_id: recipientId,
                timestamp: FieldValue.serverTimestamp(),
                status: "pending",
                type: "user",
                message_type: processedMessage.type,
                ...(processedMessage.storyId && {
                  story_id: processedMessage.storyId,
                }),
                ...(processedMessage.attachmentUrl && {
                  attachment_url: processedMessage.attachmentUrl,
                }),
              });

              // B. Actualizar conversación principal
              await conversationRef.set(
                {
                  last_message: processedMessage.text,
                  last_message_at: FieldValue.serverTimestamp(),
                  tenant_id: tenantId,
                  instagram_user_id: senderId,
                  instagram_username: senderId,
                  page_id: recipientId,
                  stage: "active",
                  unread_count: FieldValue.increment(1),
                },
                { merge: true },
              );
            }
          }
        }

        // Respuesta EXITOSA a Meta (Vital responder <200ms)
        res.status(200).send("EVENT_RECEIVED");
      } catch (error) {
        logger.error("Error procesando webhook:", error);
        res.sendStatus(500);
      }
    } else {
      // Evento no reconocido
      res.sendStatus(404);
    }
    return;
  }

  // Método HTTP no soportado
  res.sendStatus(405);
});
