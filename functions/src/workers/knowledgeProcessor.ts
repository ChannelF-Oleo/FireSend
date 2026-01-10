import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { initializeApp, getApps } from "firebase-admin/app";

// Tamaño máximo de chunk (en caracteres)
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * Lazy initialization de Firebase Admin
 */
function getDb() {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getFirestore();
}

function getStorageInstance() {
  if (getApps().length === 0) {
    initializeApp();
  }
  return getStorage();
}

/**
 * Extrae texto de un archivo según su tipo
 */
async function extractText(
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  if (contentType === "text/plain" || contentType === "text/csv") {
    return buffer.toString("utf-8");
  }

  if (contentType === "application/pdf") {
    // Para PDF, usamos una extracción básica
    // En producción, considera usar pdf-parse o similar
    const text = buffer.toString("utf-8");
    // Intentar extraer texto legible del PDF
    const cleanText = text
      .replace(/[^\x20-\x7E\n\r]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return cleanText.length > 100 ? cleanText : "Contenido PDF no extraíble";
  }

  // Para otros tipos, intentar como texto
  return buffer.toString("utf-8");
}

/**
 * Divide el texto en chunks con overlap
 */
function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    let chunk = text.slice(start, end);

    // Intentar cortar en un punto natural (espacio, punto)
    if (end < text.length) {
      const lastSpace = chunk.lastIndexOf(" ");
      const lastPeriod = chunk.lastIndexOf(".");
      const cutPoint = Math.max(lastSpace, lastPeriod);
      if (cutPoint > CHUNK_SIZE * 0.5) {
        chunk = chunk.slice(0, cutPoint + 1);
      }
    }

    chunks.push(chunk.trim());
    start = start + CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks.filter((c) => c.length > 50); // Filtrar chunks muy pequeños
}

/**
 * Genera embedding usando Gemini
 */
async function generateEmbedding(
  text: string,
  apiKey: string,
): Promise<number[]> {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    logger.error("Error generando embedding:", error);
    throw error;
  }
}

/**
 * Worker que procesa archivos subidos a Storage
 */
export const onFileUpload = onObjectFinalized(
  {
    region: "us-central1",
    bucket: "firesend-2fc54.firebasestorage.app",
  },
  async (event) => {
    const filePath = event.data.name;
    const contentType = event.data.contentType;

    // Solo procesar archivos en la carpeta de documentos
    if (!filePath?.startsWith("tenants/") || !filePath.includes("/docs/")) {
      logger.info(`Ignorando archivo: ${filePath}`);
      return null;
    }

    // Lazy init
    const db = getDb();
    const storage = getStorageInstance();

    // Extraer tenantId del path: tenants/{tenantId}/docs/{fileName}
    const pathParts = filePath.split("/");
    const tenantId = pathParts[1];
    const fileName = pathParts[pathParts.length - 1];

    logger.info(`Procesando documento: ${fileName} para tenant: ${tenantId}`);

    // Crear registro en Firestore
    const docRef = db
      .collection("tenants")
      .doc(tenantId)
      .collection("knowledge_docs")
      .doc();

    await docRef.set({
      fileName,
      fileType: contentType,
      fileSize: Number(event.data.size) || 0,
      status: "processing",
      uploadedAt: FieldValue.serverTimestamp(),
      storagePath: filePath,
    });

    try {
      // Obtener API key del tenant
      const tenantDoc = await db.collection("tenants").doc(tenantId).get();
      const tenantData = tenantDoc.data();
      const apiKey = tenantData?.geminiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("Gemini API Key no configurada");
      }

      // Descargar archivo
      const bucket = storage.bucket(event.data.bucket);
      const file = bucket.file(filePath);
      const [buffer] = await file.download();

      // Extraer texto
      const text = await extractText(buffer, contentType || "text/plain");
      logger.info(`Texto extraído: ${text.length} caracteres`);

      if (text.length < 100) {
        throw new Error("No se pudo extraer suficiente texto del documento");
      }

      // Dividir en chunks
      const chunks = chunkText(text);
      logger.info(`Documento dividido en ${chunks.length} chunks`);

      // Generar embeddings y guardar vectores
      const vectorsRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("vectors");

      let processedChunks = 0;

      for (const chunk of chunks) {
        try {
          const embedding = await generateEmbedding(chunk, apiKey);

          await vectorsRef.add({
            docId: docRef.id,
            content: chunk,
            embedding,
            createdAt: FieldValue.serverTimestamp(),
          });

          processedChunks++;

          // Rate limiting básico
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          logger.warn(`Error procesando chunk: ${error}`);
        }
      }

      // Actualizar estado del documento
      await docRef.update({
        status: "ready",
        chunksCount: processedChunks,
        processedAt: FieldValue.serverTimestamp(),
      });

      logger.info(
        `✅ Documento procesado: ${fileName}, ${processedChunks} chunks`,
      );
      return { success: true, chunks: processedChunks };
    } catch (error) {
      logger.error("Error procesando documento:", error);

      await docRef.update({
        status: "error",
        error: error instanceof Error ? error.message : "Error desconocido",
      });

      return { success: false, error };
    }
  },
);
