/**
 * Add Navbar Module - Simplified version
 * This script is a bridge component that adds the navbar to pages using the old method.
 * It's maintained for backward compatibility with pages not yet updated to use auto-navbar.js directly.
 * 
 * For new pages, use auto-navbar.js directly in the <head> section:
 * <script src="../js/auto-navbar.js"></script>
 */

// This script is now a thin wrapper around the main auto-navbar.js functionality
(function() {
    console.info('Using legacy navbar loader - consider updating to auto-navbar.js directly');
    
    // Check if auto-navbar script is already loaded
    if (!window.navbarInitialized && !document.querySelector('script[src*="auto-navbar.js"]')) {
        // Load the auto-navbar script dynamically
        const script = document.createElement('script');
        script.src = '../js/auto-navbar.js';
        document.head.appendChild(script);
    } else {
        // Auto-navbar is already loaded, just make sure navbar is initialized
        if (typeof initNavbar === 'function') {
            initNavbar();
        } else {
            console.warn('Navbar initialization function not found');
        }
    }
})(); 