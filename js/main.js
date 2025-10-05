document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('publicloud_current_user'));
    const isLoggedIn = !!currentUser;
    
    updateNavigationState(isLoggedIn, currentUser);
    
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }

    const smoothLinks = document.querySelectorAll('a[href^="#"]');
    smoothLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

function updateNavigationState(isLoggedIn, user) {
    const headerActions = document.querySelector('.header-actions');
    const profile = document.querySelector('.profile');
    
    if (headerActions && !isLoggedIn) {
        headerActions.style.display = 'flex';
    } else if (headerActions && isLoggedIn) {
        headerActions.innerHTML = `
            <a href="dashboard.html" class="profile">
                <img class="profile__avatar" src="img/avatar-camila.avif" alt="${user.name}" />
                <span>${user.name}</span>
            </a>
        `;
    }
}

class NotificationManager {
    static show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        const container = this.getOrCreateContainer();
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    static getOrCreateContainer() {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }
}

window.NotificationManager = NotificationManager;