import * as logger from "firebase-functions/logger";

interface SendMessageParams {
  recipientId: string;
  message: string;
  accessToken: string;
}

export class InstagramService {
  private readonly graphApiUrl = "https://graph.facebook.com/v21.0";

  /**
   * Envía un mensaje de texto a través de la Graph API de Meta
   * 
   * @param params - Parámetros del mensaje
   * @returns ID del mensaje enviado
   */
  async sendMessage(params: SendMessageParams): Promise<string> {
    const { recipientId, message, accessToken } = params;

    try {
      logger.info(`Enviando mensaje a ${recipientId}`);

      const response = await fetch(`${this.graphApiUrl}/me/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          access_token: accessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Meta API Error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      logger.info(`Mensaje enviado exitosamente: ${data.message_id}`);

      return data.message_id;
    } catch (error) {
      logger.error("Error enviando mensaje a Instagram:", error);
      throw new Error(
        `Error enviando mensaje: ${error instanceof Error ? error.message : "Desconocido"}`
      );
    }
  }

  /**
   * Marca un mensaje como leído (opcional, mejora UX)
   */
  async markAsRead(
    senderId: string,
    accessToken: string
  ): Promise<void> {
    try {
      await fetch(`${this.graphApiUrl}/me/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: senderId },
          sender_action: "mark_seen",
          access_token: accessToken,
        }),
      });

      logger.info(`Mensaje marcado como leído para ${senderId}`);
    } catch (error) {
      // No es crítico, solo log
      logger.warn("Error marcando mensaje como leído:", error);
    }
  }

  /**
   * Muestra el indicador de "escribiendo..." (typing indicator)
   */
  async sendTypingIndicator(
    recipientId: string,
    accessToken: string
  ): Promise<void> {
    try {
      await fetch(`${this.graphApiUrl}/me/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          sender_action: "typing_on",
          access_token: accessToken,
        }),
      });

      logger.info(`Indicador de escritura activado para ${recipientId}`);
    } catch (error) {
      logger.warn("Error activando typing indicator:", error);
    }
  }
}
