import * as crypto from "crypto";
import * as logger from "firebase-functions/logger";

/**
 * Verifica la firma HMAC SHA-256 de Meta (X-Hub-Signature-256)
 * 
 * @param payload - Body raw de la petición (string)
 * @param signature - Header "X-Hub-Signature-256" (formato: "sha256=...")
 * @param appSecret - Secret de la App de Meta (desde env)
 * @returns true si la firma es válida
 */
export function verifyMetaSignature(
  payload: string,
  signature: string | undefined,
  appSecret: string
): boolean {
  if (!signature) {
    logger.warn("Firma ausente en la petición");
    return false;
  }

  // Meta envía el header en formato "sha256=HASH"
  const signatureParts = signature.split("=");
  if (signatureParts.length !== 2 || signatureParts[0] !== "sha256") {
    logger.warn("Formato de firma inválido");
    return false;
  }

  const receivedHash = signatureParts[1];

  // Calcular el HMAC esperado
  const expectedHash = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest("hex");

  // Comparación segura contra timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(receivedHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );

  if (!isValid) {
    logger.warn("Firma inválida detectada");
  }

  return isValid;
}
