// js/auth.js
import { registerUser, loginUser, logoutUser, onUserStateChange } from "./firebase/auth.js";

class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.observeAuthState();
  }

  attachEventListeners() {
    const loginForm = document.querySelector("#loginForm");
    const registerForm = document.querySelector("#registerForm");
    const logoutBtns = document.querySelectorAll(".logout-btn");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    logoutBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleLogout(e));
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    try {
      await loginUser(email, password);
      this.showMessage("Inicio de sesión exitoso", "success");
      setTimeout(() => (window.location.href = "index.html"), 1200);
    } catch (error) {
      console.error(error);
      this.showMessage(this.getErrorMessage(error), "error");
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    try {
      await registerUser(name, email, password);
      this.showMessage("Registro exitoso. Redirigiendo...", "success");
      setTimeout(() => (window.location.href = "login.html"), 1500);
    } catch (error) {
      console.error(error);
      this.showMessage(this.getErrorMessage(error), "error");
    }
  }

  async handleLogout(e) {
    e.preventDefault();
    try {
      await logoutUser();
      window.location.href = "index.html";
    } catch (error) {
      console.error(error);
      alert("Error al cerrar sesión");
    }
  }

  observeAuthState() {
    onUserStateChange((user) => {
      const protectedPages = ["dashboard.html", "upload.html"];
      const currentPage = window.location.pathname.split("/").pop();

      if (!user && protectedPages.includes(currentPage)) {
        window.location.href = "login.html";
      }
    });
  }

  showMessage(message, type) {
    const existingMessage = document.querySelector(".auth-message");
    if (existingMessage) existingMessage.remove();

    const msg = document.createElement("div");
    msg.className = `auth-message auth-message--${type}`;
    msg.textContent = message;

    const form = document.querySelector("form");
    if (form) form.insertBefore(msg, form.firstChild);
  }

  getErrorMessage(error) {
    const code = error.code || "";
    switch (code) {
      case "auth/user-disabled":
        return "La cuenta ha sido deshabilitada por un administrador.";
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Intenta nuevamente más tarde.";
      case "auth/missing-password":
        return "Debes ingresar una contraseña.";
      case "auth/invalid-email":
        return "Correo inválido.";
      case "auth/user-not-found":
        return "Usuario no encontrado.";
      case "auth/wrong-password":
        return "Contraseña incorrecta.";
      case "auth/email-already-in-use":
        return "El correo ya está registrado.";
      case "auth/weak-password":
        return "La contraseña es demasiado débil.";
      default:
        return "Ocurrió un error. Intenta nuevamente.";
    }
  }
}

// === Inicializar ===
document.addEventListener("DOMContentLoaded", () => new AuthManager());
