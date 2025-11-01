import { db, auth } from "./firebase/config.js";
import { doc, getDoc, collection, query, where, getDocs, limit, increment, updateDoc, setDoc, deleteDoc, runTransaction } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// === Obtener ID del diseño desde la URL ===
const params = new URLSearchParams(window.location.search);
const designId = params.get("id");

if (!designId) {
  document.body.innerHTML = "<p>No se encontró el diseño.</p>";
  throw new Error("No se proporcionó ID de diseño");
}

async function loadDesignDetail() {
  try {
    
    // === Obtener diseño ===
    const designRef = doc(db, "designs", designId);
    const designSnap = await getDoc(designRef);
    

    if (!designSnap.exists()) {
      document.body.innerHTML = "<p>Diseño no encontrado.</p>";
      return;
    }

    const design = designSnap.data();

    // === Incrementar contador de vistas ===
    try {
      const designRef = doc(db, "designs", designId);
      await updateDoc(designRef, {
        views: increment(1),
      });
      console.log("👁️ Vista incrementada");
    } catch (e) {
      console.warn("No se pudo actualizar el contador de vistas:", e);
    }


    const authorId = design.authorId;

    // === Obtener info del autor ===
    const authorRef = doc(db, "users", authorId);
    const authorSnap = await getDoc(authorRef);
    const author = authorSnap.exists() ? authorSnap.data() : {};

    // === Renderizar diseño ===
    document.getElementById("designTitle").textContent = design.title;
    document.getElementById("designDescription").textContent = design.description;
    document.getElementById("designImage").src = design.fileURL;
    document.getElementById("likesNum").textContent = design.likes || 0;
    document.getElementById("viewsNum").textContent = design.views || 0;

    // === LIKE / UNLIKE ===
    const likeBtn = document.getElementById("likeBtn");
    const likesNumEl = document.getElementById("likesNum");

    onAuthStateChanged(auth, async (user) => {
      if (!likeBtn) return;

      // Si no hay sesión, deshabilitar
      if (!user) {
        likeBtn.disabled = true;
        likeBtn.title = "Inicia sesión para dar like";
        return;
      }

      const currentUserId = user.uid;
      const likeRef = doc(db, "designs", designId, "likes", currentUserId);
      const designRef = doc(db, "designs", designId);

      // === 1️⃣ Comprobar si ya dio like ===
      const likeSnap = await getDoc(likeRef);
      let hasLiked = likeSnap.exists();

      // Estado inicial visual
      likeBtn.classList.toggle("liked", hasLiked);

      likeBtn.addEventListener("click", async () => {
        try {
          if (!hasLiked) {
            // === LIKE ===
            await Promise.all([
              setDoc(likeRef, { likedAt: new Date() }),
              updateDoc(designRef, { likes: increment(1) })
            ]);

            hasLiked = true;
            likeBtn.classList.add("liked");

            const currentLikes = parseInt(likesNumEl.textContent) || 0;
            likesNumEl.textContent = currentLikes + 1;

            console.log("❤️ Like agregado");
          } else {
            // === UNLIKE ===
            await Promise.all([
              deleteDoc(likeRef),
              updateDoc(designRef, { likes: increment(-1) })
            ]);

            hasLiked = false;
            likeBtn.classList.remove("liked");

            const currentLikes = parseInt(likesNumEl.textContent) || 0;
            likesNumEl.textContent = Math.max(0, currentLikes - 1);

            console.log("💔 Like removido");
          }
        } catch (err) {
          console.error("Error al dar like/unlike:", err);
        }
      });
    });


    // === Renderizar autor ===
    document.getElementById("artistAvatar").src = author.photoURL || "img/avatar-default.png";
    document.getElementById("artistName").textContent = author.name || "Artista anónimo";
    document.getElementById("artistRole").textContent = author.role || "Digital Artist";
    document.getElementById("artistLocation").textContent = author.location || "📍 Sin ubicación";
    document.getElementById("followersCount").textContent = author.followers || 0;
    document.getElementById("followingCount").textContent = author.following || 0;
    document.getElementById("likesCount").textContent = author.totalLikes || 0;

contactBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const subject = encodeURIComponent(`Consulta sobre tu diseño "${design.title}" en Publicloud`);
  const body = encodeURIComponent(
    `Hola ${author.name || "artista"},\n\nMe encantó tu diseño "${design.title}" y me gustaría ponerme en contacto contigo.\n\n¡Saludos!`
  );

  const mailto = `mailto:${author.email}?subject=${subject}&body=${body}`;
  const gmail  = `https://mail.google.com/mail/?view=cm&fs=1&to=${author.email}&su=${subject}&body=${body}`;

  console.log("📧 Intentando abrir correo a:", author.email);

  // === Crear enlace temporal ===
  const link = document.createElement("a");
  link.href = mailto;
  link.target = "_self"; // usa misma pestaña (no se bloquea)
  document.body.appendChild(link);

  // === Disparar click en el mismo contexto del usuario ===
  link.click();

  // === Fallback: si mailto no responde, cambia a Gmail en la MISMA pestaña ===
  setTimeout(() => {
    console.log("📭 Mailto no respondió, redirigiendo a Gmail web...");
    window.location.href = gmail;
  }, 600);

  document.body.removeChild(link);
});



    // === FOLLOW / UNFOLLOW ===
    const followBtn = document.getElementById("followBtn");

    onAuthStateChanged(auth, async (user) => {
      if (!followBtn) return;

      // Si no hay sesión, botón deshabilitado
      if (!user) {
        followBtn.textContent = "Follow";
        followBtn.disabled = true;
        followBtn.title = "Inicia sesión para seguir artistas";
        return;
      }

      const currentUserId = user.uid;     // quien sigue
      const artistId = authorId;          // a quién seguimos (definido arriba cuando cargaste el diseño)

      // Evitar seguirse a sí mismo
      if (currentUserId === artistId) {
        followBtn.style.display = "none";
        return;
      }

      const followingRef = doc(db, "users", currentUserId, "following", artistId);
      const followerRef  = doc(db, "users", artistId,      "followers", currentUserId);
      const meRef        = doc(db, "users", currentUserId);
      const artistRef    = doc(db, "users", artistId);

      // Estado inicial
      const followingSnap = await getDoc(followingRef);
      let isFollowing = followingSnap.exists();
      followBtn.textContent = isFollowing ? "Following" : "Follow";
      followBtn.classList.toggle("following", isFollowing);

      followBtn.onclick = async () => {
        try {
          if (!isFollowing) {
            // === FOLLOW ===
            // 1) crear relación en subcolecciones
            await Promise.all([
              setDoc(followingRef, { followedAt: new Date() }),
              setDoc(followerRef,  { followedAt: new Date() })
            ]);

            // 2) actualizar contadores de forma consistente
            await runTransaction(db, async (tx) => {
              const meSnap     = await tx.get(meRef);
              const artistSnap = await tx.get(artistRef);

              const myFollowing   = Math.max(0, (meSnap.data()?.following || 0) + 1);
              const hisFollowers  = Math.max(0, (artistSnap.data()?.followers || 0) + 1);

              tx.update(meRef,     { following: myFollowing });
              tx.update(artistRef, { followers: hisFollowers });
            });

            // 3) actualizar UI
            isFollowing = true;
            followBtn.textContent = "Unfollow";
            followBtn.classList.add("following");

            // refrescar contadores visibles si están en la página
            const followersEl = document.getElementById("followersCount");
            if (followersEl) {
              followersEl.textContent = String(Number(followersEl.textContent || 0) + 1);
            }

          } else {
            // === UNFOLLOW ===
            // 1) eliminar relación en subcolecciones (incluye el id del follower)
            await Promise.all([
              deleteDoc(followingRef),
              deleteDoc(followerRef)
            ]);

            // 2) decrementar contadores y evitar negativos
            await runTransaction(db, async (tx) => {
              const meSnap     = await tx.get(meRef);
              const artistSnap = await tx.get(artistRef);

              const myFollowing  = Math.max(0, (meSnap.data()?.following || 0) - 1);
              const hisFollowers = Math.max(0, (artistSnap.data()?.followers || 0) - 1);

              tx.update(meRef,     { following: myFollowing });
              tx.update(artistRef, { followers: hisFollowers });
            });

            // 3) actualizar UI
            isFollowing = false;
            followBtn.textContent = "Follow";
            followBtn.classList.remove("following");

            const followersEl = document.getElementById("followersCount");
            if (followersEl) {
              followersEl.textContent = String(Math.max(0, Number(followersEl.textContent || 0) - 1));
            }
          }
        } catch (err) {
          console.error("Error en follow/unfollow:", err);
        }
      };
    });


    // === LIKE ARTIST / UNLIKE ARTIST ===
    const likeArtistBtn = document.getElementById("likeArtistBtn");
    const artistLikesEl = document.getElementById("likesCount");

    onAuthStateChanged(auth, async (user) => {
      if (!likeArtistBtn) return;

      if (!user) {
        likeArtistBtn.disabled = true;
        likeArtistBtn.title = "Inicia sesión para dar like al artista";
        return;
      }

      const currentUserId = user.uid;
      const artistId = authorId;

      // Evitar que el artista se dé like a sí mismo
      if (currentUserId === artistId) {
        likeArtistBtn.style.display = "none";
        return;
      }

      const likeRef = doc(db, "users", artistId, "profileLikes", currentUserId);
      const artistRef = doc(db, "users", artistId);

      try {
        const likeSnap = await getDoc(likeRef);
        let hasLikedArtist = likeSnap.exists();

        likeArtistBtn.textContent = hasLikedArtist ? "Liked" : "Like Artist";
        likeArtistBtn.classList.toggle("liked", hasLikedArtist);

        likeArtistBtn.onclick = async () => {
          try {
            if (!hasLikedArtist) {
              // === DAR LIKE AL ARTISTA ===
              await Promise.all([
                setDoc(likeRef, { likedAt: new Date() }),
                updateDoc(artistRef, { totalLikes: increment(1) })
              ]);

              hasLikedArtist = true;
              likeArtistBtn.textContent = "Liked";
              likeArtistBtn.classList.add("liked");

              const count = parseInt(artistLikesEl.textContent) || 0;
              artistLikesEl.textContent = count + 1;

              console.log("Like al artista agregado");
            } else {
              // === QUITAR LIKE AL ARTISTA ===
              await Promise.all([
                deleteDoc(likeRef),
                updateDoc(artistRef, { totalLikes: increment(-1) })
              ]);

              hasLikedArtist = false;
              likeArtistBtn.textContent = "Like Artist";
              likeArtistBtn.classList.remove("liked");

              const count = parseInt(artistLikesEl.textContent) || 0;
              artistLikesEl.textContent = Math.max(0, count - 1);

              console.log("Like al artista quitado");
            }
          } catch (e) {
            console.error("Error al dar like al artista:", e);
          }
        };
      } catch (err) {
        console.error("Error al verificar like del artista:", err);
      }
    });


    // === Cargar diseños relacionados ===
    const q = query(
      collection(db, "designs"),
      where("authorId", "==", authorId),
      limit(2)
    );
    const snap = await getDocs(q);
    const related = snap.docs
      .filter((d) => d.id !== designId)
      .map((d) => ({ id: d.id, ...d.data() }));

    const relatedGrid = document.getElementById("relatedGrid");
    relatedGrid.innerHTML =
      related.length > 0
        ? related
            .map(
              (r) => `
          <div class="related-card" onclick="window.location.href='design.html?id=${r.id}'">
            <img src="${r.fileURL}" alt="${r.title}" />
            <h4>${r.title}</h4>
          </div>
        `
            )
            .join("")
        : "<p>No hay más diseños de este artista.</p>";



    // === Activar botón de descarga ===
    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn && design.fileURL) {
      downloadBtn.addEventListener("click", () => {
        try {
          console.log("🟢 Descargando archivo desde Firebase Storage...");

          // Deshabilitar temporalmente el botón
          downloadBtn.classList.add("downloading");
          downloadBtn.textContent = "Descargando...";

          // Crear enlace temporal para forzar descarga
          const a = document.createElement("a");
          a.href = design.fileURL;
          a.download = design.fileName || "diseño_publicloud";
          // abrir en nueva pestaña 
          a.target = "_blank";
          document.body.appendChild(a);
          a.click();
          a.remove();

          // Restaurar botón después de un momento
          setTimeout(() => {
            downloadBtn.classList.remove("downloading");
            downloadBtn.textContent = "Descargar";
          }, 1500);
        } catch (error) {
          console.error("❌ Error al descargar:", error);
          alert("No se pudo iniciar la descarga.");
          downloadBtn.textContent = "Descargar";
          downloadBtn.classList.remove("downloading");
        }
      });
    }

    
  } catch (err) {
    console.error("Error al cargar diseño:", err);
    document.body.innerHTML = "<p>Error al cargar el diseño.</p>";
  }
}

loadDesignDetail();
