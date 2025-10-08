import AuthManager from './auth.js';

class HelpPage {
    constructor() {
        this.initPage();
        this.initSearch();
        this.initFeedback();
        this.initChatWidget();
        this.initSectionLinks();
    }

    initPage() {
        // Check authentication
        if (!AuthManager.isAuthenticated()) {
            // Use the redirectToLogin function from utils.js if it exists
            if (typeof redirectToLogin === 'function') {
                redirectToLogin();
            } else {
                // Save current path before redirecting
                localStorage.setItem('redirectAfterLogin', window.location.pathname);
                window.location.href = 'login.html';
            }
            return;
        }

        this.updateWelcomeMessage();
    }

    updateWelcomeMessage() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const welcomeElement = document.getElementById('welcomeMessage');
        
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${userInfo.name || 'User'}!`;
        }
    }

    // Search functionality
    initSearch() {
        const searchInput = document.querySelector('.search-bar input');
        if (!searchInput) return;
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                // Simulate search functionality
                const searchTerm = searchInput.value.trim().toLowerCase();
                if (searchTerm) {
                    // In a real implementation, this would search through help topics
                    console.log('Searching for:', searchTerm);
                    
                    // For demo purposes, scroll to a section that might match the search term
                    if (searchTerm.includes('faq') || searchTerm.includes('question')) {
                        document.getElementById('faq-section').scrollIntoView({ behavior: 'smooth' });
                    } else if (searchTerm.includes('contact') || searchTerm.includes('support')) {
                        document.getElementById('contact-section').scrollIntoView({ behavior: 'smooth' });
                    } else if (searchTerm.includes('trouble') || searchTerm.includes('issue')) {
                        document.getElementById('trouble-section').scrollIntoView({ behavior: 'smooth' });
                    } else if (searchTerm.includes('guide') || searchTerm.includes('tutorial')) {
                        document.getElementById('guides-section').scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    }

    // Feedback buttons functionality
    initFeedback() {
        const positiveBtn = document.querySelector('.btn-outline-success');
        const negativeBtn = document.querySelector('.btn-outline-danger');
        
        if (positiveBtn) {
            positiveBtn.addEventListener('click', () => {
                this.showFeedbackMessage(true);
            });
        }
        
        if (negativeBtn) {
            negativeBtn.addEventListener('click', () => {
                // Redirect to contact form when the user needs more help
                document.getElementById('contact-section').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // Show feedback message
    showFeedbackMessage(isPositive) {
        const feedbackSection = document.querySelector('.feedback-cta .col-md-8');
        if (!feedbackSection) return;
        
        feedbackSection.innerHTML = isPositive ? 
            '<div class="alert alert-success">Thank you for your feedback! We\'re glad we could help.</div>' :
            '<div class="alert alert-info">We\'re sorry we couldn\'t resolve your issue. Please contact our support team.</div>';
        
        // Reset after 3 seconds
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    // Chat widget functionality
    initChatWidget() {
        const chatButton = document.querySelector('.chat-widget button');
        if (!chatButton) return;
        
        chatButton.addEventListener('click', () => {
            // In a real implementation, this would open a chat interface
            alert('Chat support will be available soon! Please use our contact form for now.');
        });
    }

    // Scroll to section when clicked on navbar links
    initSectionLinks() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new HelpPage();
});
