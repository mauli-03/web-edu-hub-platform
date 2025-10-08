// Interactive Cards Animation
document.addEventListener('DOMContentLoaded', function() {
    // Select all interactive cards
    const cards = document.querySelectorAll('.interactive-card');
    
    // Add entry animation with staggered delay
    cards.forEach((card, index) => {
        // Add initial invisible state
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        // Trigger entrance animation with staggered delay
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 150)); // Stagger the animations
    });
    
    // Optional: Add intersection observer for animation when scrolling into view
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Add class for CSS animations when in viewport
        cards.forEach(card => {
            observer.observe(card);
        });
    }
    
    // Optional: Add touch support for mobile
    if ('ontouchstart' in window) {
        cards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            card.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
        });
        
        // Add CSS for touch devices
        const style = document.createElement('style');
        style.textContent = `
            .touch-active .card-inner {
                transform: rotateY(180deg);
            }
        `;
        document.head.appendChild(style);
    }
}); 