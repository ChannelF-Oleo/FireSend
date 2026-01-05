/**
 * Inicialización centralizada de Firebase Admin SDK
 * Usar este módulo en lugar de inicializar en cada archivo
 */
import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App;
let db: Firestore;

// Singleton pattern para evitar reinicializaciones
if (getApps().length === 0) {
  app = initializeApp();
} else {
  app = getApps()[0];
}

db = getFirestore(app);

export { app, db };
