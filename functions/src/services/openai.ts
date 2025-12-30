import OpenAI from "openai";
import * as logger from "firebase-functions/logger";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  /**
   * Genera una respuesta usando el historial de conversación
   * 
   * @param messages - Array de mensajes en formato OpenAI
   * @param systemPrompt - Instrucciones del sistema (personalidad del bot)
   * @returns Respuesta generada por la IA
   */
  async generateResponse(
    messages: ChatMessage[],
    systemPrompt: string
  ): Promise<string> {
    try {
      // Construir el array de mensajes con el system prompt al inicio
      const fullMessages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...messages,
      ];

      logger.info(`Llamando a OpenAI con ${messages.length} mensajes`);

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 500, // Limitar para respuestas concisas
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("OpenAI no devolvió respuesta");
      }

      logger.info("Respuesta generada exitosamente");
      return response.trim();
    } catch (error) {
      logger.error("Error llamando a OpenAI:", error);
      throw new Error(
        `Error en OpenAI: ${error instanceof Error ? error.message : "Desconocido"}`
      );
    }
  }

  /**
   * Genera un resumen del contexto de la conversación
   * Útil para comprimir historiales largos
   */
  async summarizeConversation(messages: ChatMessage[]): Promise<string> {
    try {
      const summaryPrompt = `Resume esta conversación en 2-3 oraciones capturando los puntos clave y el estado actual:

${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo", // Modelo más barato para resúmenes
        messages: [{ role: "user", content: summaryPrompt }],
        temperature: 0.3,
        max_tokens: 150,
      });

      return completion.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      logger.error("Error generando resumen:", error);
      return ""; // Fallar silenciosamente, no es crítico
    }
  }
}
