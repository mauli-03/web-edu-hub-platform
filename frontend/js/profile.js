import AuthManager from './auth.js';

class ProfilePage {
    constructor() {
        this.initPage();
    }

    initPage() {
        // Check authentication
        if (!AuthManager.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Load user profile
        this.loadUserProfile();
    }

    loadUserProfile() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        
        // Update profile elements
        document.getElementById('profileName').textContent = userInfo.name || 'User';
        document.getElementById('profileEmail').textContent = userInfo.email || 'user@example.com';
        document.getElementById('fullName').textContent = userInfo.name || 'User Full Name';
        document.getElementById('emailAddress').textContent = userInfo.email || 'user@example.com';
        document.getElementById('joinDate').textContent = userInfo.joinDate || 'January 2024';

        // Welcome message
        const welcomeElement = document.getElementById('welcomeMessage');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${userInfo.name || 'User'}!`;
        }
    }
}

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfilePage();
});
