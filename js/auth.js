class AuthManager {
    constructor() {
        // this.users = JSON.parse(localStorage.getItem('publicloud_users')) || [];
        this.users = [
            { id: 1, name: 'Camila', email: 'camila@example.com', password: 'password123' }
        ];
        this.currentUser = JSON.parse(localStorage.getItem('publicloud_current_user')) || null;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.checkAuthStatus();
    }

    attachEventListeners() {
        const loginForm = document.querySelector('#loginForm');
        const registerForm = document.querySelector('#registerForm');
        const logoutBtns = document.querySelectorAll('.logout-btn');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleLogout(e));
        });
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('publicloud_current_user', JSON.stringify(user));
            this.showMessage('Inicio de sesión exitoso', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            this.showMessage('Credenciales incorrectas', 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.querySelector('#name').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        if (this.users.find(u => u.email === email)) {
            this.showMessage('El email ya está registrado', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            joinDate: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('publicloud_users', JSON.stringify(this.users));
        
        this.showMessage('Registro exitoso. Redirigiendo...', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }

    handleLogout(e) {
        e.preventDefault();
        this.currentUser = null;
        localStorage.removeItem('publicloud_current_user');
        window.location.href = 'index.html';
    }

    checkAuthStatus() {
        const protectedPages = ['dashboard.html', 'upload.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage) && !this.currentUser) {
            window.location.href = 'login.html';
        }
    }

    showMessage(message, type) {
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `auth-message auth-message--${type}`;
        messageEl.textContent = message;
        
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(messageEl, form.firstChild);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});