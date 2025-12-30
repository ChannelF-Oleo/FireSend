import * as webhook from "./controllers/webhookController";
import { onNewMessage } from "./workers/messageProcessor";

// Exportamos la función webhook para que Google Cloud la despliegue
export const webhookHandler = webhook.instagramWebhook;

// Exportamos el worker de procesamiento de mensajes
export const messageProcessor = onNewMessage;
