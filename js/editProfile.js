// js/editProfile.js
import { auth, db, storage } from "./firebase/config.js";
import {
  onUserStateChange,
  getUserProfile,
} from "./firebase/auth.js";
import {
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

class EditProfileManager {
  constructor() {
    this.currentUser = null;
    this.userData = null;
    this.init();
  }

  init() {
    this.observeAuthState();
  }

  observeAuthState() {
    onUserStateChange(async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      this.currentUser = user;
      this.userData = await getUserProfile(user.uid);
      this.setupModal();
    });
  }

  setupModal() {
    const editBtn = document.querySelector(".btn--ghost"); // "Edit profile"
    const modal = document.getElementById("editProfileModal");
    const cancelBtn = document.getElementById("cancelEdit");
    const form = document.getElementById("editProfileForm");

    if (!editBtn || !modal || !form) return;

    // Rellenar datos actuales
    document.getElementById("editName").value =
      this.userData?.name || this.currentUser.displayName || "";
    document.getElementById("editRole").value =
      this.userData?.role || "Miembro de Publicloud";
      
    document.getElementById("editLocation").value = this.userData?.location || "";
    document.getElementById("editBio").value = this.userData?.bio || "";
    
    // === Abrir modal ===
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.add("show");
    });

    // === Cerrar modal (botón cancelar o fondo) ===
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("show");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });

    // === Guardar cambios ===
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.saveProfileChanges();
      modal.classList.remove("show");
    });
  }

  async saveProfileChanges() {
    const newName = document.getElementById("editName").value.trim();
    const newRole = document.getElementById("editRole").value.trim();
    const newPhotoFile = document.getElementById("editPhoto").files[0];
    const newCoverFile = document.getElementById("editCover").files[0];
    const newLocation = document.getElementById("editLocation").value.trim();
    const newBio = document.getElementById("editBio").value.trim();

    try {
      let photoURL = this.userData?.photoURL || this.currentUser.photoURL || null;
      let coverURL = this.userData?.coverURL || null;

      // === Subir foto de perfil ===
      if (newPhotoFile) {
        const avatarRef = ref(storage, `avatars/${this.currentUser.uid}.jpg`);
        await uploadBytes(avatarRef, newPhotoFile);
        photoURL = await getDownloadURL(avatarRef);
      }

      // === Subir cover ===
      if (newCoverFile) {
        const coverRef = ref(storage, `covers/${this.currentUser.uid}.jpg`);
        await uploadBytes(coverRef, newCoverFile);
        coverURL = await getDownloadURL(coverRef);
      }

      // === Actualizar Auth (nombre y foto) ===
      await updateProfile(this.currentUser, {
        displayName: newName,
        photoURL: photoURL,
      });

      // === Actualizar Firestore ===
      const userRef = doc(db, "users", this.currentUser.uid);
      await updateDoc(userRef, {
        name: newName,
        role: newRole,
        location: newLocation,
        bio: newBio,
        photoURL: photoURL,
        coverURL: coverURL,
      });

      alert("✅ Perfil actualizado correctamente");
      window.location.reload();
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("❌ Error al guardar los cambios");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new EditProfileManager());
