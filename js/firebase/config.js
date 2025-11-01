// js/firebase/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// La configuración viene desde firebase-env.js (no versionado)
const firebaseConfig = window.__FIREBASE_CONFIG__;

if (!firebaseConfig) {
  throw new Error("No se encontró la configuración de Firebase. Asegúrate de incluir firebase-env.js antes.");
}

// Inicializar Firebase y exportar módulos
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
