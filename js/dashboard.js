class DashboardManager {
    constructor() {
        this.designs = JSON.parse(localStorage.getItem('publicloud_designs')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('publicloud_current_user')) || null;
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.loadUserDesigns();
        this.attachEventListeners();
    }

    loadUserProfile() {
        if (!this.currentUser) return;

        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = this.currentUser.name;
        }

        const userDesigns = this.designs.filter(design => design.authorId === this.currentUser.id);
        const designCount = document.querySelector('.designs-count');
        if (designCount) {
            designCount.textContent = userDesigns.length;
        }
    }

    loadUserDesigns() {
        const designGrid = document.querySelector('.design-grid');
        if (!designGrid) return;

        const userDesigns = this.designs.filter(design => design.authorId === this.currentUser.id);
        
        if (userDesigns.length === 0) {
            designGrid.innerHTML = `
                <div class="empty-state">
                    <p>Aún no has subido ningún diseño</p>
                    <a href="upload.html" class="btn btn--primary">Subir primer diseño</a>
                </div>
            `;
            return;
        }

        designGrid.innerHTML = userDesigns.map(design => `
            <div class="design-card" data-id="${design.id}">
                <div class="design-placeholder">
                    <span>📄</span>
                    <p>${design.fileName}</p>
                </div>
                <div class="design-info">
                    <h3>${design.title}</h3>
                    <p>${design.description}</p>
                    <div class="design-meta">
                        <span class="design-category">${design.category}</span>
                        <span class="design-likes">❤️ ${design.likes}</span>
                    </div>
                </div>
                <div class="design-actions">
                    <button class="btn-icon like-btn" data-id="${design.id}">❤️</button>
                    <button class="btn-icon delete-btn" data-id="${design.id}">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('like-btn')) {
                this.toggleLike(e.target.dataset.id);
            }
            
            if (e.target.classList.contains('delete-btn')) {
                this.deleteDesign(e.target.dataset.id);
            }
        });
    }

    toggleLike(designId) {
        const design = this.designs.find(d => d.id == designId);
        if (design) {
            design.likes = design.likes + 1;
            localStorage.setItem('publicloud_designs', JSON.stringify(this.designs));
            this.loadUserDesigns();
        }
    }

    deleteDesign(designId) {
        if (confirm('¿Estás seguro de que quieres eliminar este diseño?')) {
            this.designs = this.designs.filter(d => d.id != designId);
            localStorage.setItem('publicloud_designs', JSON.stringify(this.designs));
            this.loadUserDesigns();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});