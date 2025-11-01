// js/gallery.js
import { db, auth } from "./firebase/config.js";
import { onUserStateChange } from "./firebase/auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,

} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

class GalleryManager {
  constructor() {
    this.designs = [];
    this.mockDesigns = this.generateMockData(); // datos de respaldo
    this.currentUser = null;
    this.init();
  }

  init() {
    onUserStateChange(async (user) => {
      this.currentUser = user || null;
      await this.loadDesignsFromFirebase();
      this.initSections();
      this.attachEventListeners();
    });
  }

  async loadDesignsFromFirebase() {
    try {
      // 1️⃣ Obtener todos los diseños
      const q = query(collection(db, "designs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const allDesigns = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 2️⃣ Filtrar diseños que no pertenezcan al usuario actual
      const filteredDesigns = this.currentUser
        ? allDesigns.filter((d) => d.authorId !== this.currentUser.uid)
        : allDesigns;

      // 3️⃣ Obtener la colección de usuarios 
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersMap = {};
      usersSnapshot.forEach((u) => {
        usersMap[u.id] = u.data();
      });

      // 4️⃣ Enriquecer cada diseño con photoURL y autor
      const enrichedDesigns = filteredDesigns.map((d) => ({
        ...d,
        authorPhotoURL: usersMap[d.authorId]?.photoURL || "img/avatar-default.png",
        authorDisplayName: usersMap[d.authorId]?.name || d.authorName || "Usuario desconocido",
      }));

      // 5️⃣ Guardar y renderizar
      this.designs = enrichedDesigns.length > 0 ? enrichedDesigns : this.mockDesigns;
      this.renderGallery();
    } catch (error) {
      console.error("Error al cargar diseños:", error);
      this.designs = this.mockDesigns;
      this.renderGallery();
    }
  }
  

  /* === RENDER === */
  getInitials(name) {
    if (!name) return 'U';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  renderGallery(designs = this.designs, limitCount = 8) {
    const gridContainer = document.querySelector(".grid");
    if (!gridContainer) return;

    const items = designs.slice(0, limitCount);

    gridContainer.innerHTML = items
      .map(
        (design) => `
        <article class="card" data-id="${design.id}">
          <img class="card__img" src="${design.fileURL || design.image}" alt="${design.title}" loading="lazy" />
          <div class="card__meta">
            <div class="user">
              <img src="${design.authorPhotoURL}" alt="${design.authorDisplayName}" loading="lazy" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="avatar-placeholder" style="display:none; width:28px; height:28px; border-radius:50%; font-size:10px;">${this.getInitials(design.authorDisplayName)}</div>
              <span>${design.authorDisplayName}</span>
            </div>
            <div class="stats">
              <span class="like-btn" data-id="${design.id}">❤ ${design.likes || design.stats?.likes || 0}</span>
              <span>👁 ${design.views || design.stats?.views || 0}</span>
            </div>
          </div>
        </article>
      `
      )
      .join("");
      
      this.markUserLikes();
      
      // Manejar visibilidad del botón "Ver más"
      this.updateVerMasButtonVisibility(limitCount, designs.length);
  }

  updateVerMasButtonVisibility(currentShowing, totalAvailable) {
    if (currentShowing >= totalAvailable) {
      this.hideVerMasButton();
    } else {
      this.showVerMasButton();
    }
  }

  /* === OTRAS SECCIONES === */
  initSections() {
    if (document.querySelector("#artistas .container")) this.renderArtistSection();
    if (document.querySelector(".testimonials")) this.renderTestimonials();
    if (document.querySelector(".logos")) this.renderLogos();
    if (document.querySelector(".footer__grid")) this.renderFooter();
  }

  async renderArtistSection() {
    const artistSection = document.querySelector("#artistas .container");
    if (!artistSection) return;

    try {
      // Obtener todos los artistas
      const usersSnap = await getDocs(collection(db, "users"));

      if (usersSnap.empty) {
        artistSection.innerHTML = `
          <h2 class="section__title">ARTISTAS</h2>
          <p>No hay artistas registrados aún.</p>
        `;
        return;
      }

      // Filtrar al usuario actual
      const allUsers = usersSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.id !== this.currentUser?.uid);

      // Limitar a máximo 3 artistas distintos
      const selectedArtists = allUsers.slice(0, 3);

      // Para cada artista, obtener sus diseños (máximo 2)
      const artistData = await Promise.all(
        selectedArtists.map(async (user) => {
          const designsQuery = query(
            collection(db, "designs"),
            where("authorId", "==", user.id),
            orderBy("createdAt", "desc"),
            limit(2)
          );

          const designSnap = await getDocs(designsQuery);
          user.designs = designSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          return user;
        })
      );

      // === Renderizar HTML ===
      artistSection.innerHTML = `
        <h2 class="section__title">ARTISTAS</h2>
        ${artistData
          .map(
            (artist) => `
            <article class="artist">
              <img class="artist__avatar" src="${artist.photoURL}" alt="${artist.name}" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="avatar-placeholder" style="display:none; width:64px; height:64px; border-radius:50%; font-size:20px;">${this.getInitials(artist.name)}</div>
              <div class="artist__info">
                <h3>${artist.name}</h3>
                <p>${artist.bio || "Este artista aún no ha agregado una descripción."}</p>
              </div>
            </article>
            <div class="artist__works">
              ${
                artist.designs.length > 0
                  ? artist.designs
                      .map(
                        (work) => `
                <figure class="work" onclick="window.location.href='design.html?id=${work.id}'" style="cursor:pointer;">
                  <img src="${work.fileURL}" alt="${work.title}" />
                  <figcaption>
                    <h4>${work.title}</h4>
                    <p>${work.description || "Sin descripción"}</p>
                  </figcaption>
                </figure>`
                      )
                      .join("")
                  : `<p class="muted">Aún no ha subido diseños.</p>`
              }
            </div>
          `
          )
          .join("")}
      `;
    } catch (error) {
      console.error("Error al cargar artistas:", error);
      artistSection.innerHTML = `
        <h2 class="section__title">ARTISTAS</h2>
        <p>Error al cargar los artistas.</p>
      `;
    }
  }

  async renderTestimonials() {
  const container = document.querySelector(".testimonials");
  const section = document.querySelector(".testimonials-actions") || document.querySelector(".container");
  if (!container || !section) return;

  try {
    // === 1️⃣ Cargar testimonios desde Firebase ===
    const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const testimonials = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // === 2️⃣ Renderizar testimonios existentes ===
    container.innerHTML = testimonials
      .map(
        (t) => `
        <article class="testimonial">
          <img src="${t.photoURL || 'img/avatar-default.png'}" alt="${t.authorName}" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
          <div class="avatar-placeholder" style="display:none; width:50px; height:50px; border-radius:50%; font-size:16px;">${this.getInitials(t.authorName)}</div>
          <div>
            <h4>${t.authorName}</h4>
            <p>${t.text}</p>
          </div>
        </article>
      `
      )
      .join("");

    // === 3️⃣ Crear botón (si no existe aún) ===
    let addBtn = document.querySelector(".add-testimonial-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        console.log("🟢 Botón 'Agregar testimonio' presionado");
        this.openTestimonialModal();
      });
    }

    // === 4️⃣ Escuchar clic del botón (y log de depuración) ===
    addBtn.addEventListener("click", () => {
      console.log("🟢 Botón 'Agregar testimonio' presionado");
      this.openTestimonialModal();
    });
  } catch (error) {
    console.error("Error al cargar testimonios:", error);
    container.innerHTML = `<p>Error al cargar testimonios.</p>`;
  }
}

  openTestimonialModal() {
    if (!this.currentUser) {
      alert("Debes iniciar sesión para dejar un testimonio.");
      return;
    }

    document.querySelectorAll('.testimonial-modal').forEach(m => m.remove());

    // Crear modal específico
    const modal = document.createElement("div");
    modal.className = "testimonial-modal show";
    modal.innerHTML = `
      <div class="testimonial-modal__content">
        <h2 class="testimonial-modal__title">Nuevo testimonio</h2>
        <form id="testimonialForm" class="testimonial-modal__form">
          <label for="testimonialText">Tu comentario</label>
          <textarea id="testimonialText" rows="4" placeholder="Comparte tu experiencia..." required></textarea>
          <div class="testimonial-modal__actions">
            <button type="submit" class="btn btn--primary publish-btn">Publicar</button>
            <button type="button" class="btn btn--ghost cancel-btn">Cancelar</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    //  Añadir listeners después de insertar el modal en el DOM
    const cancelBtn = modal.querySelector(".cancel-btn");
    const form = modal.querySelector("#testimonialForm");

    // Cerrar el modal
    cancelBtn.addEventListener("click", () => {
      modal.remove();
    });

    // Manejar el envío del formulario
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = modal.querySelector("#testimonialText").value.trim();

      if (!text) {
        alert("Por favor escribe un comentario antes de publicar.");
        return;
      }

      try {

        await addDoc(collection(db, "testimonials"), {
          authorId: this.currentUser.uid,
          authorName: this.currentUser.displayName || this.currentUser.email,
          photoURL: this.currentUser.photoURL || "img/avatar-default.png",
          text,
          createdAt: serverTimestamp(),
        });

        alert("✅ Testimonio agregado correctamente");
        modal.remove();

        // Recargar lista de testimonios
        await this.renderTestimonials();
      } catch (error) {
        console.error("Error al agregar testimonio:", error);
        alert("❌ No se pudo publicar el testimonio.");
      }
    });
  }


  renderLogos() {
    const logosContainer = document.querySelector(".logos");
    if (!logosContainer) return;
    const logos = this.generateLogosData();
    logosContainer.innerHTML = logos.map((logo) => `<img src="${logo.image}" alt="${logo.name}">`).join("");
  }

  renderFooter() {
    const footerGrid = document.querySelector(".footer__grid");
    if (!footerGrid) return;
    const footerData = this.generateFooterData();
    footerGrid.innerHTML = `
      <div class="footer__brand">
        <img src="${footerData.brand.logo}" alt="${footerData.brand.name}">
        <p>${footerData.brand.name}</p>
      </div>
      ${footerData.sections
        .map(
          (section) => `
        <div class="footer__col">
          <h5>${section.title}</h5>
          ${section.links.map((link) => `<a href="${link.url}">${link.text}</a>`).join("")}
        </div>
      `
        )
        .join("")}
    `;
  }

  /* === INTERACCIÓN === */
  attachEventListeners() {
    document.addEventListener("click", (e) => {
      // --- Clic en botón de "like" ---
      if (e.target.classList.contains("like-btn")) {
        e.stopPropagation(); // ❌ evita que el clic llegue al card
        this.toggleLike(e.target.dataset.id);
        return; // termina el flujo aquí
      }

      // --- Clic en la tarjeta (card) ---
      const card = e.target.closest(".card");
      if (card && !e.target.classList.contains("like-btn")) {
        const designId = card.dataset.id;
        this.viewDesign(designId);
      }
    });

    // --- Clic en "Ver más" ---
    const verMasBtn = document.querySelector(".cta-row .btn--primary");
    if (verMasBtn && !verMasBtn.hasAttribute('data-listener-attached')) {
      verMasBtn.setAttribute('data-listener-attached', 'true');
      verMasBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.loadMoreDesigns();
      });
    }
  }

  async toggleLike(designId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Inicia sesión para dar like a un diseño ❤️");
        return;
      }

      const currentUserId = user.uid;
      const likeRef = doc(db, "designs", designId, "likes", currentUserId);
      const designRef = doc(db, "designs", designId);

      const likeSnap = await getDoc(likeRef);
      const hasLiked = likeSnap.exists();

      const btn = document.querySelector(`.like-btn[data-id='${designId}']`);
      const likesLabel = btn?.textContent.match(/\d+/)
        ? parseInt(btn.textContent.match(/\d+/)[0])
        : 0;

      if (!hasLiked) {
        // === DAR LIKE ===
        await Promise.all([
          setDoc(likeRef, { likedAt: new Date() }),
          updateDoc(designRef, { likes: increment(1) }),
        ]);

        if (btn) {
          btn.classList.add("liked");
          btn.textContent = `❤ ${likesLabel + 1}`;
        }

        console.log(`✅ Like agregado al diseño ${designId}`);
      } else {
        // === QUITAR LIKE ===
        await Promise.all([
          deleteDoc(likeRef),
          updateDoc(designRef, { likes: increment(-1) }),
        ]);

        if (btn) {
          btn.classList.remove("liked");
          btn.textContent = `❤ ${Math.max(0, likesLabel - 1)}`;
        }

        console.log(`💔 Like removido del diseño ${designId}`);
      }
    } catch (error) {
      console.error("Error al dar like:", error);
    }
  }

  async markUserLikes() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userId = user.uid;
      const designsRef = collection(db, "designs");
      const snapshot = await getDocs(designsRef);

      for (const docSnap of snapshot.docs) {
        const designId = docSnap.id;
        const likeRef = doc(db, "designs", designId, "likes", userId);
        const likeSnap = await getDoc(likeRef);

        if (likeSnap.exists()) {
          const btn = document.querySelector(`.like-btn[data-id='${designId}']`);
          if (btn) btn.classList.add("liked");
        }
      }
    } catch (error) {
      console.error("Error al marcar likes del usuario:", error);
    }
  }

  viewDesign(id) {
    window.location.href = `design.html?id=${encodeURIComponent(id)}`;
  }

  loadMoreDesigns() {
    const current = document.querySelectorAll(".card").length;
    const total = this.designs.length;
    
    // Si ya se están mostrando todos los diseños, no hacer nada
    if (current >= total) {
      this.hideVerMasButton();
      return;
    }
    
    // Mostrar 4 diseños más o todos los restantes
    const newLimit = Math.min(current + 4, total);
    this.renderGallery(this.designs, newLimit);
    
    // Asegurarse de marcar los likes del usuario después de renderizar más diseños
    this.markUserLikes();
    
    // Si ya se muestran todos los diseños, ocultar el botón
    if (newLimit >= total) {
      this.hideVerMasButton();
    }
  }

  hideVerMasButton() {
    const verMasBtn = document.querySelector(".cta-row .btn--primary");
    if (verMasBtn) {
      verMasBtn.style.display = 'none';
    }
  }

  showVerMasButton() {
    const verMasBtn = document.querySelector(".cta-row .btn--primary");
    if (verMasBtn) {
      verMasBtn.style.display = 'inline-block';
    }
  }

  /* === DATOS MOCK (aún no en Firebase) === */
  generateMockData() {
    return [
      {
        id: 1,
        title: "Bosque mágico",
        image: "img/Rectangle 4.png",
        author: { name: "Dianne Russell", avatar: "img/profile_img/photo.png" },
        stats: { likes: 850, views: 4902 },
        category: "ilustracion",
      },
      {
        id: 2,
        title: "Cubismo",
        image: "img/Rectangle 4-1.png",
        author: { name: "Arlene McCoy", avatar: "img/profile_img/photo-1.png" },
        stats: { likes: 583, views: 4023 },
        category: "arte-digital",
      },
    ];
  }

  generateArtistData() {
    return {
      name: "Luna Evergreen",
      avatar: "img/avatar-camila.avif",
      bio: "Luna Evergreen es una artista digital visionaria...",
      socialLinks: [
        { type: "website", icon: "🌐", url: "#" },
        { type: "instagram", icon: "📷", url: "#" },
        { type: "twitter", icon: "✕", url: "#" },
      ],
      works: [
        { title: "Sinfonía celestial", image: "img/Rectangle 4-6.png", description: "Explora el cosmos..." },
        { title: "Criaturas mágicas", image: "img/Rectangle 4-8.png", description: "Encuentra seres míticos..." },
      ],
    };
  }

  generateTestimonialsData() {
    return [
      { name: "Jackson Chen", avatar: "img/profile_img/photo.png", testimonial: "He sido miembro de Publicloud..." },
      { name: "Sophia Lee", avatar: "img/profile_img/photo-1.png", testimonial: "Publicloud ha sido un recurso..." },
    ];
  }

  generateLogosData() {
    return [
      { name: "Creative Studios", image: "img/logos/1.png" },
      { name: "Digital Arts Academy", image: "img/logos/2.png" },
      { name: "Innovation Lab", image: "img/logos/3.png" },
      { name: "Design Masters", image: "img/logos/4.png" },
    ];
  }

  generateFooterData() {
    return {
      brand: { logo: "img/logo.svg", name: "Publicloud" },
      sections: [
        {
          title: "Extras",
          links: [
            { text: "Consejos", url: "#" },
            { text: "Recursos", url: "#" },
            { text: "Compartir tu arte", url: "#" },
          ],
        },
        {
          title: "Nosotros",
          links: [
            { text: "Publicloud", url: "#" },
            { text: "Privacidad", url: "#" },
            { text: "Términos y condiciones", url: "#" },
            { text: "Preguntas frecuentes", url: "#" },
          ],
        },
        {
          title: "Redes Sociales",
          links: [
            { text: "Twitter", url: "#" },
            { text: "Instagram", url: "#" },
            { text: "Facebook", url: "#" },
            { text: "YouTube", url: "#" },
          ],
        },
      ],
    };
  }
}

document.addEventListener("DOMContentLoaded", () => new GalleryManager());
