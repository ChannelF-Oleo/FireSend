import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

// Inicializar Firebase Admin si no existe (Singleton Pattern)
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

export const instagramWebhook = onRequest(async (req, res) => {
  // ------------------------------------------------------
  // 1. VERIFICACIÓN (Meta Challenge - GET)
  // ------------------------------------------------------
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Token secreto que configurarás en Meta
    const VERIFY_TOKEN = "firesend_secret_token_123"; 

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
    const body = req.body;

    // Verificar que sea un evento de página o instagram
    if (body.object === "instagram" || body.object === "page") {
      
      try {
        // Iteramos sobre las "entries" (Meta puede agrupar eventos)
        // Usamos 'any' en el iterador para evitar errores de tipado estricto en la estructura compleja de Meta
        for (const entry of body.entry as any[]) {
          
          // Solo nos interesa el array 'messaging'
          if (entry.messaging) {
            for (const webhookEvent of entry.messaging) {
              
              // Verificamos que sea un mensaje de texto y NO sea un eco (is_echo)
              // (is_echo true significa que es un mensaje que enviaste tú, no el cliente)
              if (webhookEvent.message && !webhookEvent.message.is_echo && webhookEvent.message.text) {
                
                const senderId = webhookEvent.sender.id;    // ID del Cliente
                const pageId = webhookEvent.recipient.id;   // ID de tu Página
                const text = webhookEvent.message.text;     // Contenido

                logger.info(`📩 Nuevo mensaje de ${senderId}: ${text}`);

                // --- ESCRITURA ATÓMICA EN FIRESTORE ---
                // Definimos ID único para la conversación
                const conversationId = `${pageId}_${senderId}`;
                const conversationRef = db.collection("conversations").doc(conversationId);

                // A. Guardar el mensaje en la sub-colección 'messages'
                await conversationRef.collection("messages").add({
                  text: text,
                  sender_id: senderId,
                  recipient_id: pageId, // Aquí usamos la variable pageId que ya tenemos
                  timestamp: new Date(),
                  status: "pending",     // Estado inicial para que lo tome la IA
                  type: "user"
                });

                // B. Actualizar la conversación principal (para que salga en el Inbox)
                await conversationRef.set({
                  last_message: text,
                  last_updated: new Date(),
                  user_id: senderId,
                  page_id: pageId,
                  unread_count: 1 // Incrementamos (lógica simple por ahora)
                }, { merge: true });
              }
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