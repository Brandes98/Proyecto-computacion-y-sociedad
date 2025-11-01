// js/profile.js
import { auth, db } from "./firebase/config.js";
import { onUserStateChange, logoutUser, getUserProfile } from "./firebase/auth.js";
import { collection, query, where, deleteDoc, updateDoc,getDoc, getDocs, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { ref, deleteObject } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { storage } from "./firebase/config.js";

class ProfileManager {
  constructor() {
    this.currentUser = null;
    this.userData = null;
    this.init();
  }

  init() {
    this.observeAuthState();
    this.attachEventListeners();
    this.attachDesignActions();
  }

  observeAuthState() {
    onUserStateChange(async (user) => {
      if (!user) {
        console.warn("⚠️ Usuario no autenticado, redirigiendo...");
        window.location.href = "login.html";
        return;
      }

      this.currentUser = user;
      this.userData = await getUserProfile(user.uid);
      this.loadUserProfile();
      this.loadUserDesigns();
    });
  }

  loadUserProfile() {
    const coverEl = document.querySelector(".cover");
    const profileName = document.querySelector(".profile-name");
    const roleEl = document.querySelector(".profile-role");
    const avatarEl = document.querySelector(".avatar-xl");
    const joinDateEl = document.querySelector(".join-date");
    const locationEl = document.querySelector(".profile-loc");
    const bioEl = document.querySelector(".profile-bio");

    const followersEl = document.getElementById("followersCount");
    const followingEl = document.getElementById("followingCount");
    const likesEl = document.getElementById("likesCount");

    const name = this.userData?.name || this.currentUser.displayName || "Usuario";
    const role = this.userData?.role || "Miembro de Publicloud";
    const photo = this.userData?.photoURL || "img/avatar-default.png";
    const cover = this.userData?.coverURL;
    const joined = this.userData?.joinedAt || this.currentUser.metadata.creationTime;
    const location = this.userData?.location || "Ubicación no especificada";
    const bio = this.userData?.bio || "Aún no ha agregado una descripción.";

    // === Render ===
    if (profileName) profileName.textContent = name;
    if (roleEl) roleEl.textContent = role;
    if (avatarEl) avatarEl.src = photo;
    if (coverEl && cover) {
      coverEl.style.backgroundImage = `url(${cover})`;
      coverEl.style.backgroundSize = "cover";
      coverEl.style.backgroundPosition = "center";
    }
    if (joinDateEl) {
      const date = new Date(joined);
      joinDateEl.textContent = date.toLocaleDateString("es-CR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (locationEl) locationEl.textContent = `📍 ${location}`;
    if (bioEl) bioEl.textContent = bio;

    if (followersEl) followersEl.textContent = this.userData?.followers ?? 0;
    if (followingEl) followingEl.textContent = this.userData?.following ?? 0;
    if (likesEl) likesEl.textContent = this.userData?.totalLikes ?? 0;
  }

  attachEventListeners() {
    document.addEventListener("click", async (e) => {
      if (e.target.classList.contains("logout-btn")) {
        e.preventDefault();
        await logoutUser();
        window.location.href = "login.html";
      }
    });
  }

  async loadUserDesigns() {
    const designGrid = document.querySelector(".design-grid");
    const designCountEl = document.querySelector(".designs-count");
    const likesTotalEl = document.querySelector(".total-likes");

    if (!designGrid) return;

    try {
      const q = query(collection(db, "designs"), where("authorId", "==", this.currentUser.uid));
      const snapshot = await getDocs(q);
      const designs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      let totalLikes = 0;

      // Contador de diseños
      if (designCountEl) designCountEl.textContent = designs.length;

      if (designs.length === 0) {
        designGrid.innerHTML = `
          <div class="empty-state">
            <p>Aún no has subido ningún diseño</p>
            <a href="upload.html" class="btn btn--primary">Subir primer diseño</a>
          </div>
        `;
        return;
      }

      const html = designs
      .map((d) => {
        totalLikes += d.likes || 0;
        return `
          <div class="design-card" data-id="${d.id}">
            <img src="${d.fileURL}" alt="${d.title}" class="design-img" />
            <div class="design-info">
              <h3>${d.title}</h3>
              <p>${d.description}</p>
              <div class="design-meta">
                <span class="design-category">${d.category}</span>
                <span class="design-likes">❤️ ${d.likes || 0}</span>
              </div>
              <div class="modal-actions">
                <button class="btn-action edit-btn btn btn--primary" title="Editar diseño" data-id="${d.id}">Editar</button>
                <button class="btn-action delete-btn btn btn--ghost" title="Eliminar diseño" data-id="${d.id}">Eliminar</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
        
      designGrid.innerHTML = html;

      // Actualizar total de likes
      if (likesTotalEl) likesTotalEl.textContent = totalLikes;

    } catch (error) {
      console.error("Error al cargar diseños:", error);
      designGrid.innerHTML = `<p>Error al cargar tus diseños.</p>`;
    }
  }

  // === Escucha eventos en los botones de editar / eliminar ===
attachDesignActions() {
  document.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("delete-btn")) {
      await this.handleDeleteDesign(id);
    }
    if (e.target.classList.contains("edit-btn")) {
      await this.openEditModal(id);
    }
  });
}

// === Eliminar diseño ===
async handleDeleteDesign(id) {
  const confirmDelete = confirm("¿Seguro que deseas eliminar este diseño?");
  if (!confirmDelete) return;

  try {
    const docRef = doc(db, "designs", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      alert("❌ El diseño no existe o ya fue eliminado.");
      return;
    }

    const data = snap.data();

    // Eliminar archivo del Storage
    if (data.fileURL) {
      const fileRef = ref(storage, decodeURIComponent(data.fileURL.split("/o/")[1].split("?")[0]));
      await deleteObject(fileRef);
    }

    // Eliminar documento Firestore
    await deleteDoc(docRef);

    alert("✅ Diseño eliminado correctamente.");
    this.loadUserDesigns();
  } catch (error) {
    console.error("Error al eliminar diseño:", error);
    alert("❌ No se pudo eliminar el diseño.");
  }
}

// === Abrir modal para editar ===
async openEditModal(id) {
  const modal = document.getElementById("editDesignModal");
  const cancelBtn = document.getElementById("cancelDesignEdit");
  const form = document.getElementById("editDesignForm");

  try {
    const docRef = doc(db, "designs", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return alert("No se encontró el diseño.");

    const data = snap.data();
    document.getElementById("editTitle").value = data.title || "";
    document.getElementById("editDescription").value = data.description || "";
    document.getElementById("editCategory").value = data.category || "otros";

    modal.classList.add("show");

    cancelBtn.onclick = () => modal.classList.remove("show");

    form.onsubmit = async (e) => {
      e.preventDefault();
      await updateDoc(docRef, {
        title: document.getElementById("editTitle").value.trim(),
        description: document.getElementById("editDescription").value.trim(),
        category: document.getElementById("editCategory").value,
      });
      alert("✅ Diseño actualizado correctamente.");
      modal.classList.remove("show");
      this.loadUserDesigns();
    };
  } catch (error) {
    console.error("Error al abrir modal de edición:", error);
  }
}


}

document.addEventListener("DOMContentLoaded", () => new ProfileManager());
