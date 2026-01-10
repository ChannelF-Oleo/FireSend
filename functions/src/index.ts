import * as webhook from "./controllers/webhookController";
import * as auth from "./controllers/authController";
import * as message from "./controllers/messageController";
import { onNewMessage } from "./workers/messageProcessor";
import { refreshTokens } from "./workers/tokenRefresher";
import { onMessageStats, onConversationUpdate } from "./workers/statsUpdater";
import { onFileUpload } from "./workers/knowledgeProcessor";

// Webhook de Instagram
export const webhookHandler = webhook.instagramWebhook;

// Worker de procesamiento de mensajes con IA
export const messageProcessor = onNewMessage;

// Workers de estadísticas
export const statsMessageProcessor = onMessageStats;
export const statsConversationProcessor = onConversationUpdate;

// Worker de procesamiento de documentos (RAG)
export const knowledgeProcessor = onFileUpload;

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
