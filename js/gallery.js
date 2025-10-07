class GalleryManager {
    constructor() {
        this.mockDesigns = this.generateMockData();
        this.userDesigns = JSON.parse(localStorage.getItem('publicloud_public_designs')) || [];
        this.designs = [...this.userDesigns, ...this.mockDesigns];
        this.init();
    }

    generateMockData() {
        return [
            {
                id: 1,
                title: "Bosque mágico",
                image: "img/Rectangle 4.png",
                author: {
                    name: "Dianne Russell",
                    avatar: "img/profile_img/photo.png"
                },
                stats: {
                    likes: 850,
                    views: 4902
                },
                category: "ilustracion"
            },
            {
                id: 2,
                title: "Cubismo",
                image: "img/Rectangle 4-1.png",
                author: {
                    name: "Arlene McCoy",
                    avatar: "img/profile_img/photo-1.png"
                },
                stats: {
                    likes: 583,
                    views: 4023
                },
                category: "arte-digital"
            },
            {
                id: 3,
                title: "Esfera cósmica",
                image: "img/Rectangle 4-2.png",
                author: {
                    name: "Kathryn Murphy",
                    avatar: "img/profile_img/photo-2.png"
                },
                stats: {
                    likes: 103,
                    views: 7293
                },
                category: "arte-digital"
            },
            {
                id: 4,
                title: "Nebulosa",
                image: "img/Rectangle 4-3.png",
                author: {
                    name: "Guy Hawkins",
                    avatar: "img/profile_img/Rectangle 18.png"
                },
                stats: {
                    likes: 483,
                    views: 2813
                },
                category: "fotografia"
            },
            {
                id: 5,
                title: "Arrecife",
                image: "img/Rectangle 4-4.png",
                author: {
                    name: "Eleanor Pena",
                    avatar: "img/profile_img/Rectangle 18-1.png"
                },
                stats: {
                    likes: 493,
                    views: 4923
                },
                category: "ilustracion"
            },
            {
                id: 6,
                title: "Oleaje",
                image: "img/Rectangle 4-5.png",
                author: {
                    name: "Cody Fisher",
                    avatar: "img/profile_img/Rectangle 18-2.png"
                },
                stats: {
                    likes: 501,
                    views: 1249
                },
                category: "fotografia"
            },
            {
                id: 7,
                title: "Planeta",
                image: "img/Rectangle 4-6.png",
                author: {
                    name: "Savannah Nguyen",
                    avatar: "img/avatar-camila.avif"
                },
                stats: {
                    likes: 482,
                    views: 4713
                },
                category: "arte-digital"
            },
            {
                id: 8,
                title: "Rostros",
                image: "img/Rectangle 4-7.png",
                author: {
                    name: "Brooklyn Simmons",
                    avatar: "img/profile_img/photo.png"
                },
                stats: {
                    likes: 392,
                    views: 2834
                },
                category: "ilustracion"
            },
            {
                id: 9,
                title: "Jardín de cristal",
                image: "img/Rectangle 4-8.png",
                author: {
                    name: "Devon Lane",
                    avatar: "img/profile_img/photo-1.png"
                },
                stats: {
                    likes: 627,
                    views: 3456
                },
                category: "diseno-grafico"
            },
            {
                id: 10,
                title: "Montañas etéreas",
                image: "img/Rectangle 4-9.png",
                author: {
                    name: "Courtney Henry",
                    avatar: "img/profile_img/photo-2.png"
                },
                stats: {
                    likes: 745,
                    views: 5821
                },
                category: "fotografia"
            },
            {
                id: 11,
                title: "Geometría urbana",
                image: "img/Rectangle 4-10.png",
                author: {
                    name: "Jerome Bell",
                    avatar: "img/profile_img/Rectangle 18.png"
                },
                stats: {
                    likes: 298,
                    views: 2147
                },
                category: "diseno-grafico"
            },
            {
                id: 12,
                title: "Océano de luz",
                image: "img/Rectangle 4-11.png",
                author: {
                    name: "Theresa Webb",
                    avatar: "img/profile_img/Rectangle 18-1.png"
                },
                stats: {
                    likes: 856,
                    views: 6734
                },
                category: "arte-digital"
            }
        ];
    }

    generateArtistData() {
        return {
            id: 1,
            name: "Luna Evergreen",
            avatar: "img/avatar-camila.avif",
            bio: "Luna Evergreen es una artista digital visionaria renombrada por sus creaciones etéreas y encantadoras que transportan a los espectadores a reinos mágicos. Con un estilo distintivo que combina elementos fantásticos con técnicas digitales avanzadas, Luna ha ganado reconocimiento internacional por su capacidad de crear mundos imaginarios llenos de belleza y misterio.",
            socialLinks: [
                { type: "website", icon: "🌐", url: "#" },
                { type: "instagram", icon: "📷", url: "#" },
                { type: "twitter", icon: "✕", url: "#" }
            ],
            works: [
                {
                    id: 1,
                    title: "Sinfonía celestial",
                    image: "img/Rectangle 4-6.png",
                    description: "Explora el cosmos a través de los paisajes celestiales de Luna, donde las estrellas danzan en armonía creando melodías visuales que resuenan en el alma. Esta obra representa la conexión entre la música del universo y la belleza visual."
                },
                {
                    id: 2,
                    title: "Criaturas mágicas",
                    image: "img/Rectangle 4-8.png",
                    description: "Encuentra seres míticos y criaturas fantásticas en los imaginativos diseños de Luna, donde cada personaje cuenta una historia única llena de magia y misterio. Estas criaturas habitan en mundos paralelos llenos de color y vida."
                }
            ]
        };
    }

    generateTestimonialsData() {
        return [
            {
                id: 1,
                name: "Jackson Chen",
                avatar: "img/profile_img/photo.png",
                testimonial: "He sido miembro de Publicloud durante más de un año y ha transformado completamente mi carrera como artista digital. La comunidad es increíblemente solidaria y las herramientas disponibles son de primera clase. No puedo imaginar crear arte sin esta plataforma."
            },
            {
                id: 2,
                name: "Sophia Lee",
                avatar: "img/profile_img/photo-1.png",
                testimonial: "Publicloud ha sido un recurso invaluable para mí como artista digital. Las conexiones que he hecho aquí han llevado a colaboraciones increíbles y mi trabajo ha alcanzado audiencias que nunca pensé posibles. Es más que una plataforma, es una familia creativa."
            },
            {
                id: 3,
                name: "Alex Kim",
                avatar: "img/profile_img/photo-2.png",
                testimonial: "La comunidad me ha impulsado a crear y compartir con confianza. Cada día encuentro nueva inspiración en el trabajo de otros artistas y recibo feedback constructivo que me ayuda a crecer. Publicloud ha sido fundamental en mi desarrollo artístico."
            }
        ];
    }

    generateLogosData() {
        return [
            { id: 1, name: "Creative Studios", image: "img/logos/1.png" },
            { id: 2, name: "Digital Arts Academy", image: "img/logos/2.png" },
            { id: 3, name: "Innovation Lab", image: "img/logos/3.png" },
            { id: 4, name: "Design Masters", image: "img/logos/4.png" },
        ];
    }

    generateFooterData() {
        return {
            brand: {
                logo: "img/logo.svg",
                name: "Publicloud"
            },
            sections: [
                {
                    title: "Extras",
                    links: [
                        { text: "Consejos", url: "#" },
                        { text: "Recursos", url: "#" },
                        { text: "Compartir tu arte", url: "#" }
                    ]
                },
                {
                    title: "Nosotros",
                    links: [
                        { text: "Publicloud", url: "#" },
                        { text: "Privacidad", url: "#" },
                        { text: "Términos y condiciones", url: "#" },
                        { text: "Preguntas frecuentes", url: "#" }
                    ]
                },
                {
                    title: "Redes Sociales",
                    links: [
                        { text: "Twitter", url: "#" },
                        { text: "Instagram", url: "#" },
                        { text: "Facebook", url: "#" },
                        { text: "YouTube", url: "#" }
                    ]
                }
            ]
        };
    }

    init() {
        // Solo renderizar las secciones que existen en la página actual
        if (document.querySelector('.grid')) {
            this.renderGallery();
        }
        if (document.querySelector('#artistas .container')) {
            this.renderArtistSection();
        }
        if (document.querySelector('.testimonials')) {
            this.renderTestimonials();
        }
        if (document.querySelector('.logos')) {
            this.renderLogos();
        }
        if (document.querySelector('.footer__grid')) {
            this.renderFooter();
        }
        this.attachEventListeners();
    }

    renderGallery(designs = this.designs, limit = 8) {
        const gridContainer = document.querySelector('.grid');
        if (!gridContainer) return;

        const designsToShow = designs.slice(0, limit);
        
        gridContainer.innerHTML = designsToShow.map(design => `
            <article class="card" data-id="${design.id}">
                <img class="card__img" src="${design.image}" alt="${design.title}" loading="lazy" />
                <div class="card__meta">
                    <div class="user">
                        <img src="${design.author.avatar}" alt="${design.author.name}" loading="lazy">
                        <span>${design.author.name}</span>
                    </div>
                    <div class="stats">
                        <span class="like-btn" data-id="${design.id}">❤ ${design.stats.likes}</span>
                        <span>👁 ${design.stats.views}</span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    renderArtistSection() {
        const artistSection = document.querySelector('#artistas .container');
        if (!artistSection) return;

        const artistData = this.generateArtistData();
        
        const newContent = `
            <h2 class="section__title">ARTISTAS</h2>

            <article class="artist">
                <img class="artist__avatar" src="${artistData.avatar}" alt="${artistData.name}" />
                <div class="artist__info">
                    <h3>${artistData.name}</h3>
                    <p>${artistData.bio}</p>
                    <div class="artist__links">
                        ${artistData.socialLinks.map(link => `
                            <a href="${link.url}" aria-label="${link.type}">${link.icon}</a>
                        `).join('')}
                    </div>
                </div>
            </article>

            <div class="artist__works">
                ${artistData.works.map(work => `
                    <figure class="work">
                        <img src="${work.image}" alt="${work.title}" />
                        <figcaption>
                            <h4>${work.title}</h4>
                            <p>${work.description}</p>
                        </figcaption>
                    </figure>
                `).join('')}
            </div>

            <div class="dots" aria-label="paginación">
                <span class="dot dot--active"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        `;
        artistSection.innerHTML = newContent;
    }

    renderTestimonials() {
        const testimonialsContainer = document.querySelector('.testimonials');
        if (!testimonialsContainer) return;

        const testimonials = this.generateTestimonialsData();
        
        testimonialsContainer.innerHTML = testimonials.map(testimonial => `
            <article class="testimonial">
                <img src="${testimonial.avatar}" alt="${testimonial.name}" />
                <div>
                    <h4>${testimonial.name}</h4>
                    <p>${testimonial.testimonial}</p>
                </div>
            </article>
        `).join('');
    }

    renderLogos() {
        const logosContainer = document.querySelector('.logos');
        if (!logosContainer) return;

        const logos = this.generateLogosData();
        
        logosContainer.innerHTML = logos.map(logo => `
            <img src="${logo.image}" alt="${logo.name}">
        `).join('');
    }

    renderFooter() {
        const footerGrid = document.querySelector('.footer__grid');
        if (!footerGrid) return;

        const footerData = this.generateFooterData();
        
        footerGrid.innerHTML = `
            <div class="footer__brand">
                <img src="${footerData.brand.logo}" alt="${footerData.brand.name}">
                <p>${footerData.brand.name}</p>
            </div>

            ${footerData.sections.map(section => `
                <div class="footer__col">
                    <h5>${section.title}</h5>
                    ${section.links.map(link => `
                        <a href="${link.url}">${link.text}</a>
                    `).join('')}
                </div>
            `).join('')}
        `;
    }

    attachEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('like-btn')) {
                this.toggleLike(parseInt(e.target.dataset.id));
            }
            
            if (e.target.closest('.card')) {
                const card = e.target.closest('.card');
                const designId = parseInt(card.dataset.id);
                this.viewDesign(designId);
            }
        });

        const verMasBtn = document.querySelector('.cta-row .btn--primary');
        if (verMasBtn) {
            verMasBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadMoreDesigns();
            });
        }

        const subirBtn = document.querySelector('.cta-row .btn--ghost');
        if (subirBtn) {
            subirBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentUser = JSON.parse(localStorage.getItem('publicloud_current_user'));
                if (currentUser) {
                    window.location.href = 'upload.html';
                } else {
                    window.location.href = 'login.html';
                }
            });
        }
    }

    toggleLike(designId) {
        const design = this.designs.find(d => d.id === designId);
        if (design) {
            design.stats.likes += 1;
            this.renderGallery();
            
            if (window.NotificationManager) {
                window.NotificationManager.show('¡Te gusta este diseño!', 'success', 2000);
            }
        }
    }

    viewDesign(designId) {
        const design = this.designs.find(d => d.id === designId);
        if (design) {
            design.stats.views += 1;
            console.log(`Viewing design: ${design.title} by ${design.author.name}`);
        }
    }

    loadMoreDesigns() {
        const currentCount = document.querySelectorAll('.card').length;
        this.renderGallery(this.designs, currentCount + 4);
        
        if (window.NotificationManager) {
            window.NotificationManager.show('Más diseños cargados', 'info', 2000);
        }
    }

    filterByCategory(category) {
        if (category === 'all') {
            this.renderGallery();
        } else {
            const filtered = this.designs.filter(design => design.category === category);
            this.renderGallery(filtered);
        }
    }

    searchDesigns(query) {
        const filtered = this.designs.filter(design => 
            design.title.toLowerCase().includes(query.toLowerCase()) ||
            design.author.name.toLowerCase().includes(query.toLowerCase())
        );
        this.renderGallery(filtered);
    }

    getDesigns() {
        return this.designs;
    }

    addDesign(newDesign) {
        const design = {
            id: Date.now(),
            ...newDesign,
            stats: {
                likes: 0,
                views: 0
            }
        };
        this.designs.unshift(design);
        this.renderGallery();
        return design;
    }

    refreshGallery() {
        this.userDesigns = JSON.parse(localStorage.getItem('publicloud_public_designs')) || [];
        this.designs = [...this.userDesigns, ...this.mockDesigns];
        this.renderGallery();
    }

    // Métodos que simulan llamadas a endpoints
    async fetchDesigns() {
        // Simula una llamada a API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.generateMockData());
            }, 500);
        });
    }

    async fetchArtistData() {
        // Simula una llamada a API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.generateArtistData());
            }, 300);
        });
    }

    async fetchTestimonials() {
        // Simula una llamada a API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.generateTestimonialsData());
            }, 200);
        });
    }

    async fetchLogos() {
        // Simula una llamada a API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.generateLogosData());
            }, 100);
        });
    }

    async fetchFooterData() {
        // Simula una llamada a API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.generateFooterData());
            }, 150);
        });
    }

    // Métodos para recargar secciones individualmente
    async reloadGallery() {
        const designs = await this.fetchDesigns();
        this.mockDesigns = designs;
        this.designs = [...this.userDesigns, ...this.mockDesigns];
        this.renderGallery();
    }

    async reloadArtistSection() {
        const artistData = await this.fetchArtistData();
        this.renderArtistSection();
    }

    async reloadTestimonials() {
        const testimonials = await this.fetchTestimonials();
        this.renderTestimonials();
    }

    async reloadLogos() {
        const logos = await this.fetchLogos();
        this.renderLogos();
    }

    async reloadFooter() {
        const footerData = await this.fetchFooterData();
        this.renderFooter();
    }

    // Método para recargar todo el contenido
    async reloadAllData() {
        await Promise.all([
            this.reloadGallery(),
            this.reloadArtistSection(),
            this.reloadTestimonials(),
            this.reloadLogos(),
            this.reloadFooter()
        ]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global del manager de datos
    window.dataManager = new GalleryManager();
    
    // Solo inicializar galería si existe el contenedor
    if (document.querySelector('.grid')) {
        window.galleryManager = window.dataManager;
    }
});
