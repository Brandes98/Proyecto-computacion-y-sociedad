// js/main.js
import { onUserStateChange } from "./firebase/auth.js";

// === Verificar sesión activa y actualizar la UI ===
onUserStateChange((user) => {
  if (user) {
    console.log("Usuario activo:", user.displayName);

    updateNavigationState(true, user);
  } else {
    console.warn("No hay usuario activo, redirigiendo...");
    updateNavigationState(false, null);
    window.location.href = "login.html";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // === Menú hamburguesa ===
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
    });
  }

  // === Scroll suave ===
  const smoothLinks = document.querySelectorAll('a[href^="#"]');
  smoothLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
});

// === Actualiza la navegación (según estado de sesión) ===
function updateNavigationState(isLoggedIn, user) {
  const headerActions = document.querySelector(".header-actions");

  if (!headerActions) return;

  if (!isLoggedIn) {
    // Usuario NO logueado
    headerActions.innerHTML = `
      <div class="auth-links">
        <a href="login.html" class="btn btn--secondary">Iniciar sesión</a>
        <a href="register.html" class="btn btn--primary">Registrarse</a>
      </div>
    `;
  } else {
    // Usuario logueado
    const userName = user.displayName || user.email;
    const avatarUrl =
      user.photoURL || "img/avatar-default.png";

    headerActions.innerHTML = `
      <div class="user-info">
        <a href="profile.html" class="profile">
          <img class="profile__avatar" src="${avatarUrl}" alt="${userName}" />
          <span>${userName}</span>
        </a>
      </div>
    `;
  }
}

// === Sistema de notificaciones (igual que antes) ===
class NotificationManager {
  static show(message, type = "info", duration = 3000) {
    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.textContent = message;

    const container = this.getOrCreateContainer();
    container.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  static getOrCreateContainer() {
    let container = document.querySelector(".notification-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "notification-container";
      document.body.appendChild(container);
    }
    return container;
  }
}

window.NotificationManager = NotificationManager;
