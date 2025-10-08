import AuthManager from './auth.js';

class ResourcesPage {
    constructor() {
        this.initPage();
    }

    

    updateWelcomeMessage() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const welcomeElement = document.getElementById('welcomeMessage');
        
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${userInfo.name || 'User'}!`;
        }
    }
}

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResourcesPage();
});
