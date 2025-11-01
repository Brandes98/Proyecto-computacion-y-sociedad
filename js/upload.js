// js/upload.js
import { auth, db, storage } from "./firebase/config.js";
import { onUserStateChange } from "./firebase/auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

class UploadManager {
  constructor() {
    this.currentUser = null;
    this.fileInput = document.getElementById("file");
    this.form = document.getElementById("uploadForm");
    this.preview = document.querySelector(".file-preview");

    this.init();
  }

  init() {
    this.observeAuthState();
  }

  observeAuthState() {
    onUserStateChange((user) => {
      if (!user) {
        alert("⚠️ Debes iniciar sesión para subir un diseño.");
        window.location.href = "login.html";
        return;
      }
      this.currentUser = user;
      this.attachEventListeners();
    });
  }

  attachEventListeners() {
    if (!this.form) return;

    // Previsualizar archivo
    this.fileInput.addEventListener("change", (e) => this.handleFilePreview(e));

    // Enviar formulario
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  handleFilePreview(e) {
    const file = e.target.files[0];
    if (!file) {
      this.preview.innerHTML = "";
      return;
    }

    const ext = file.name.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.preview.innerHTML = `
          <div class="preview-image">
            <img src="${ev.target.result}" alt="${file.name}">
          </div>
        `;
      };
      reader.readAsDataURL(file);
    } else {
      this.preview.innerHTML = `
        <div class="preview-file">
          <span>📄 ${file.name}</span>
        </div>
      `;
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;
    const file = this.fileInput.files[0];

    if (!file) {
      alert("⚠️ Debes seleccionar un archivo para subir.");
      return;
    }

    try {
      // === Subir archivo a Storage ===
      const filePath = `designs/${this.currentUser.uid}/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);

      // === Guardar metadatos en Firestore ===
      await addDoc(collection(db, "designs"), {
        title,
        description,
        category,
        fileURL,
        fileName: file.name,
        authorId: this.currentUser.uid,
        authorName: this.currentUser.displayName || this.currentUser.email,
        likes: 0,
        createdAt: serverTimestamp(),
      });

      alert("✅ Diseño subido correctamente.");
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Error al subir diseño:", error);
      alert("❌ Error al subir el diseño. Intenta nuevamente.");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new UploadManager());
