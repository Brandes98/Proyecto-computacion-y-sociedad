class UploadManager {
    constructor() {
        this.designs = JSON.parse(localStorage.getItem('publicloud_designs')) || [];
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.setupFileUpload();
    }

    attachEventListeners() {
        const uploadForm = document.querySelector('#uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        }
    }

    setupFileUpload() {
        const fileInput = document.querySelector('#file');
        const dropZone = document.querySelector('.file-drop-zone');
        
        if (!fileInput || !dropZone) return;

        dropZone.addEventListener('click', () => fileInput.click());
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.previewFile(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.previewFile(e.target.files[0]);
            }
        });
    }

    previewFile(file) {
        const preview = document.querySelector('.file-preview');
        if (!preview) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
                <p>${file.name}</p>
            `;
        };
        reader.readAsDataURL(file);
    }

    handleUpload(e) {
        e.preventDefault();
        
        const authManager = new AuthManager();
        const currentUser = authManager.getCurrentUser();
        
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const title = document.querySelector('#title').value;
        const description = document.querySelector('#description').value;
        const category = document.querySelector('#category').value;
        const fileInput = document.querySelector('#file');

        if (!title || !description || !fileInput.files[0]) {
            this.showMessage('Por favor completa todos los campos', 'error');
            return;
        }

        const newDesign = {
            id: Date.now(),
            title,
            description,
            category,
            authorId: currentUser.id,
            authorName: currentUser.name,
            uploadDate: new Date().toISOString(),
            likes: 0,
            fileName: fileInput.files[0].name,
            image: `img/obras/user-${Date.now()}.jpg`,
            author: {
                name: currentUser.name,
                avatar: "img/avatar-camila.avif"
            },
            stats: {
                likes: 0,
                views: 0
            }
        };

        this.designs.push(newDesign);
        localStorage.setItem('publicloud_designs', JSON.stringify(this.designs));
        
        const publicDesigns = JSON.parse(localStorage.getItem('publicloud_public_designs')) || [];
        publicDesigns.unshift(newDesign);
        localStorage.setItem('publicloud_public_designs', JSON.stringify(publicDesigns));
        
        this.showMessage('Diseño subido exitosamente', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    showMessage(message, type) {
        const existingMessage = document.querySelector('.upload-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `upload-message upload-message--${type}`;
        messageEl.textContent = message;
        
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(messageEl, form.firstChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UploadManager();
});