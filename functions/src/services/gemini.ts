import { GoogleGenerativeAI } from "@google/generative-ai";
import * as logger from "firebase-functions/logger";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  /**
   * Genera una respuesta usando el historial de conversación
   *
   * @param messages - Array de mensajes del chat
   * @param systemPrompt - Instrucciones del sistema (personalidad del bot)
   * @returns Respuesta generada por la IA
   */
  async generateResponse(
    messages: ChatMessage[],
    systemPrompt: string,
  ): Promise<string> {
    try {
      const generativeModel = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: systemPrompt,
      });

      // Convertir historial al formato de Gemini
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const chat = generativeModel.startChat({
        history,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });

      // El último mensaje es el que queremos responder
      const lastMessage = messages[messages.length - 1];
      logger.info(`Llamando a Gemini con ${messages.length} mensajes`);

      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response.text();

      if (!response) {
        throw new Error("Gemini no devolvió respuesta");
      }

      logger.info("Respuesta generada exitosamente");
      return response.trim();
    } catch (error) {
      logger.error("Error llamando a Gemini:", error);
      throw new Error(
        `Error en Gemini: ${error instanceof Error ? error.message : "Desconocido"}`,
      );
    }
  }

  /**
   * Genera un resumen del contexto de la conversación
   * Útil para comprimir historiales largos
   */
  async summarizeConversation(messages: ChatMessage[]): Promise<string> {
    try {
      const generativeModel = this.client.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const summaryPrompt = `Resume esta conversación en 2-3 oraciones capturando los puntos clave y el estado actual:

${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

      const result = await generativeModel.generateContent(summaryPrompt);
      return result.response.text()?.trim() || "";
    } catch (error) {
      logger.error("Error generando resumen:", error);
      return "";
    }
  }
}
