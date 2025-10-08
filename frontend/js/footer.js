/**
 * Footer functionality for Education Hub
 * Handles back to top button, copyright year, and other footer interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Back to top button functionality
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Smooth scroll to top when clicked
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Update copyright year to current year
    const copyrightYear = document.querySelector('.footer-bottom p');
    if (copyrightYear) {
        const currentYear = new Date().getFullYear();
        copyrightYear.innerHTML = copyrightYear.innerHTML.replace(/\d{4}/, currentYear);
    }
    
    // Footer subscribe form handling
    const subscribeForm = document.querySelector('.footer-subscribe');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = subscribeForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (validateEmail(email)) {
                // Here you would typically send this to your backend
                // For demo purposes, we'll just show a success message
                const successMessage = document.createElement('div');
                successMessage.className = 'subscribe-success';
                successMessage.textContent = 'Thank you for subscribing!';
                successMessage.style.color = '#2ecc71';
                successMessage.style.marginTop = '0.5rem';
                successMessage.style.fontSize = '0.9rem';
                
                // Remove any previous message
                const previousMessage = subscribeForm.nextElementSibling;
                if (previousMessage && previousMessage.classList.contains('subscribe-success')) {
                    previousMessage.remove();
                }
                
                subscribeForm.after(successMessage);
                emailInput.value = '';
                
                // Remove success message after 3 seconds
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    successMessage.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => successMessage.remove(), 500);
                }, 3000);
            } else {
                emailInput.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.5)';
                emailInput.focus();
                
                // Remove error indication after 2 seconds
                setTimeout(() => {
                    emailInput.style.boxShadow = '';
                }, 2000);
            }
        });
    }
    
    // Helper function to validate email
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    // Add hover effect on footer sections for better interactivity
    const footerSections = document.querySelectorAll('.footer-section');
    footerSections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            section.style.transform = 'translateY(-5px)';
            section.style.transition = 'transform 0.3s ease';
        });
        
        section.addEventListener('mouseleave', () => {
            section.style.transform = 'translateY(0)';
        });
    });
}); 