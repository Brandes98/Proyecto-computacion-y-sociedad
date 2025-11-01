// js/main.js
import { onUserStateChange } from "./firebase/auth.js";

// === Función para manejar placeholders de imágenes ===
function setupImagePlaceholders() {
  // Función para crear placeholder basado en el nombre
  function createPlaceholder(name) {
    if (!name) return 'U';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  // Función para manejar error de imagen
  function handleImageError(img, fallbackText) {
    img.style.display = 'none';
    
    // Crear elemento de placeholder
    const placeholder = document.createElement('div');
    placeholder.className = img.className + ' placeholder';
    placeholder.textContent = fallbackText;
    
    // Copiar estilos de dimensiones si existen
    const computedStyle = window.getComputedStyle(img);
    placeholder.style.width = computedStyle.width;
    placeholder.style.height = computedStyle.height;
    placeholder.style.borderRadius = computedStyle.borderRadius;
    
    // Insertar placeholder después de la imagen
    img.parentNode.insertBefore(placeholder, img.nextSibling);
  }

  // Observador para detectar nuevas imágenes agregadas dinámicamente
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const images = node.querySelectorAll ? node.querySelectorAll('img[src*="avatar"], img[src*="profile"], .profile__avatar, .avatar-xl, .user img') : [];
          images.forEach(setupImagePlaceholder);
          
          if (node.matches && node.matches('img[src*="avatar"], img[src*="profile"], .profile__avatar, .avatar-xl, .user img')) {
            setupImagePlaceholder(node);
          }
        }
      });
    });
  });

  // Función para configurar placeholder en una imagen específica
  function setupImagePlaceholder(img) {
    if (img.dataset.placeholderSetup) return; // Evitar configurar múltiples veces
    img.dataset.placeholderSetup = 'true';

    const altText = img.alt || '';
    const fallbackText = createPlaceholder(altText);

    // Si la imagen ya falló o no tiene src
    if (!img.src || img.src === window.location.href) {
      handleImageError(img, fallbackText);
      return;
    }

    // Manejar error de carga
    img.addEventListener('error', () => {
      handleImageError(img, fallbackText);
    });

    // Verificar si la imagen ya está cargada pero falló
    if (img.complete && img.naturalWidth === 0) {
      handleImageError(img, fallbackText);
    }
  }

  // Configurar imágenes existentes
  const existingImages = document.querySelectorAll('img[src*="avatar"], img[src*="profile"], .profile__avatar, .avatar-xl, .user img');
  existingImages.forEach(setupImagePlaceholder);

  // Observar cambios en el DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Configuración especial para el dashboard
  const dashboardAvatar = document.querySelector('.avatar-xl');
  if (dashboardAvatar) {
    setupDashboardAvatar(dashboardAvatar);
  }
}

// === Función especial para avatar del dashboard ===
function setupDashboardAvatar(img) {
  if (!img || img.dataset.placeholderSetup) return;
  img.dataset.placeholderSetup = 'true';

  const altText = img.alt || '';
  const fallbackText = altText.split(' ').map(word => word[0]).join('').toUpperCase() || 'U';

  function showPlaceholder() {
    img.style.display = 'none';
    
    const placeholder = document.createElement('div');
    placeholder.className = 'avatar-xl placeholder';
    placeholder.textContent = fallbackText;
    placeholder.style.width = '80px';
    placeholder.style.height = '80px';
    placeholder.style.borderRadius = '50%';
    
    img.parentNode.insertBefore(placeholder, img.nextSibling);
  }

  if (!img.src || img.src === window.location.href) {
    showPlaceholder();
    return;
  }

  img.addEventListener('error', showPlaceholder);

  if (img.complete && img.naturalWidth === 0) {
    showPlaceholder();
  }
}

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
  // === Configurar placeholders de imágenes ===
  setupImagePlaceholders();
  
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
