// js/firebase/auth.js
import { auth, db } from "./config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// === Registro de usuario ===
export async function registerUser(name, email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Actualizar perfil básico en Auth
    await updateProfile(user, { displayName: name });

    // Crear documento del usuario en Firestore
    const userDoc = doc(db, "users", user.uid);
    await setDoc(userDoc, {
      name,
      email,
      photoURL: null,
      role: "Miembro de Publicloud",
      joinedAt: new Date().toISOString(),
      followers: 0,
      following: 0,
      likes: 0,
    });

    return user;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
}


// === Login ===
export async function loginUser(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
}

// === Logout ===
export async function logoutUser() {
  await signOut(auth);
}

// === Listener de sesión (útil para proteger páginas) ===
export function onUserStateChange(callback) {
  onAuthStateChanged(auth, callback);
}

// === Obtener datos del usuario desde Firestore ===
export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return null;
  }
}
