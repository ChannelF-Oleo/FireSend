import * as logger from "firebase-functions/logger";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface VectorDocument {
  content: string;
  embedding: number[];
  score?: number;
}

// Lazy-loaded module reference
let GoogleGenerativeAI: typeof import("@google/generative-ai").GoogleGenerativeAI;

export class GeminiService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Lazy load the Google Generative AI SDK to avoid deployment timeouts
   */
  private async getClient() {
    if (!GoogleGenerativeAI) {
      const module = await import("@google/generative-ai");
      GoogleGenerativeAI = module.GoogleGenerativeAI;
    }
    return new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Genera embedding para un texto
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const client = await this.getClient();
      const model = client.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      logger.error("Error generando embedding:", error);
      throw error;
    }
  }

  /**
   * Calcula similitud coseno entre dos vectores
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Busca los documentos más relevantes usando similitud de vectores
   */
  async searchRelevantDocs(
    queryEmbedding: number[],
    vectors: VectorDocument[],
    topK: number = 3,
  ): Promise<VectorDocument[]> {
    // Calcular similitud para cada documento
    const scored = vectors.map((doc) => ({
      ...doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    // Ordenar por score y tomar los top K
    return scored
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK)
      .filter((doc) => (doc.score || 0) > 0.5); // Solo docs con buena similitud
  }

  /**
   * Genera una respuesta usando el historial de conversación y contexto RAG
   *
   * @param messages - Array de mensajes del chat
   * @param systemPrompt - Instrucciones del sistema (personalidad del bot)
   * @param context - Contexto adicional de la base de conocimiento
   * @returns Respuesta generada por la IA
   */
  async generateResponse(
    messages: ChatMessage[],
    systemPrompt: string,
    context?: string,
  ): Promise<string> {
    try {
      const client = await this.getClient();

      // Construir prompt del sistema con contexto RAG
      let enhancedPrompt = systemPrompt;

      if (context) {
        enhancedPrompt = `${systemPrompt}

INFORMACIÓN DE REFERENCIA (usa esto para responder preguntas sobre productos, servicios o información del negocio):
---
${context}
---

INSTRUCCIONES IMPORTANTES:
- Si la pregunta del usuario se relaciona con la información de referencia, úsala para dar una respuesta precisa.
- Si no encuentras la información en la referencia, responde de forma general o indica que no tienes esa información específica.
- Nunca inventes información que no esté en la referencia.`;
      }

      const generativeModel = client.getGenerativeModel({
        model: this.model,
        systemInstruction: enhancedPrompt,
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
      logger.info(
        `Llamando a Gemini con ${messages.length} mensajes${context ? " + contexto RAG" : ""}`,
      );

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
   * Analiza el sentimiento de un mensaje (1-10)
   */
  async analyzeSentiment(message: string): Promise<number> {
    try {
      const client = await this.getClient();
      const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(
        `Analiza el sentimiento del siguiente mensaje y responde SOLO con un número del 1 al 10, donde 1 es muy negativo y 10 es muy positivo:

"${message}"

Responde solo el número:`,
      );

      const score = parseInt(result.response.text()?.trim() || "5");
      return Math.min(10, Math.max(1, score));
    } catch (error) {
      logger.error("Error analizando sentimiento:", error);
      return 5; // Neutral por defecto
    }
  }

  /**
   * Genera un resumen del contexto de la conversación
   * Útil para comprimir historiales largos
   */
  async summarizeConversation(messages: ChatMessage[]): Promise<string> {
    try {
      const client = await this.getClient();
      const generativeModel = client.getGenerativeModel({
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
