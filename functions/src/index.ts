import * as webhook from "./controllers/webhookController";
import * as auth from "./controllers/authController";
import * as message from "./controllers/messageController";
import { onNewMessage } from "./workers/messageProcessor";
import { refreshTokens } from "./workers/tokenRefresher";

// Webhook de Instagram
export const webhookHandler = webhook.instagramWebhook;

// Worker de procesamiento de mensajes con IA
export const messageProcessor = onNewMessage;

// Endpoints de autenticación OAuth
export const authInstagram = auth.authInstagram;
export const getPages = auth.getPages;
export const connectPage = auth.connectPage;
export const disconnectInstagram = auth.disconnectInstagram;

// Endpoints de mensajes manuales
export const sendManualMessage = message.sendManualMessage;
export const updateConversationStage = message.updateConversationStage;

// Cron Job para refresh de tokens
export const tokenRefresher = refreshTokens;
