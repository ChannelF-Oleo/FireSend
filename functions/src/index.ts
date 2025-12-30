import * as webhook from "./controllers/webhookController";

// Exportamos la función para que Google Cloud la despliegue
export const webhookHandler = webhook.instagramWebhook;


