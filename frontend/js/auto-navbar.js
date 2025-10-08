/**
 * Auto Navbar Loader - Optimized Version
 * This script automatically adds the navbar to any page that includes it.
 * Include in the <head> of your HTML for automatic navbar inclusion:
 * <script src="../js/auto-navbar.js"></script>
 */

// Check if document is already complete or still loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}

function isUniversityPage() {
    return window.location.pathname.includes('university.html');
}

function initNavbar() {
    // Add base styles immediately to prevent layout shifts
    addBaseStyles();
    
    // Create navbar container if it doesn't exist
    let navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        navbarContainer = document.createElement('div');
        navbarContainer.id = 'navbar-container';
        
        // Add a loading indicator
        navbarContainer.innerHTML = '<div class="loading-navbar">Loading navigation...</div>';
        
        // Insert at the beginning of body
        if (document.body.firstChild) {
            document.body.insertBefore(navbarContainer, document.body.firstChild);
        } else {
            document.body.appendChild(navbarContainer);
        }
    }
    
    // Preload critical resources
    preloadResources();
    
    // Try to use cached navbar first for immediate display
    const cachedNavbar = localStorage.getItem('navbar_cache');
    const cacheTimestamp = localStorage.getItem('navbar_cache_timestamp');
    const currentTime = new Date().getTime();
    
    // Cache is valid for 1 hour (3600000ms)
    const isCacheValid = cachedNavbar && cacheTimestamp && 
                         (currentTime - cacheTimestamp < 3600000);
    
    if (isCacheValid) {
        // Use cached version immediately for fast rendering
        navbarContainer.innerHTML = cachedNavbar;
        
        // Initialize navbar behavior
        initNavbarBehavior();
        
        // Still fetch the latest version in the background
        setTimeout(() => {
            loadAndCacheNavbar(navbarContainer, false);
        }, 2000); // Delay the refetch to prioritize page content
    } else {
        // No valid cache, load from server
        loadAndCacheNavbar(navbarContainer, true);
    }
    
    // Make sure body has correct styling
    document.body.classList.add('has-navbar');
}

function loadAndCacheNavbar(container, isInitialLoad) {
    const paths = [
        '../pages/navbar.html',
        '/frontend/pages/navbar.html'
    ];
    
    // Try to fetch using the first path, fall back to the second if needed
    fetch(paths[0])
        .then(response => response.ok ? response : fetch(paths[1]))
        .then(response => {
            if (!response.ok) throw new Error('Failed to load navbar');
            return response.text();
        })
        .then(html => {
            // Only update DOM if this is the initial load or cache was invalid
            if (isInitialLoad) {
                container.innerHTML = html;
            }
            
            // Cache the navbar HTML and timestamp
            localStorage.setItem('navbar_cache', html);
            localStorage.setItem('navbar_cache_timestamp', new Date().getTime());
            
            // Initialize navbar behavior if this is initial load
            if (isInitialLoad) {
                initNavbarBehavior();
            }
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
            if (isInitialLoad) {
                // Show fallback navbar on error
                container.innerHTML = `
                    <nav class="main-navigation">
                        <div class="nav-container">
                            <a class="navbar-brand" href="home.html">
                                <span class="brand-text">EduHub</span>
                            </a>
                            <div class="auth-buttons">
                                <a href="login.html" class="btn btn-login">Login</a>
                                <a href="register.html" class="btn btn-register">Sign Up</a>
                            </div>
                        </div>
                    </nav>
                `;
            }
        });
}

function initNavbarBehavior() {
    // Load navbar.js with high priority
    if (!window.navbarInitialized && !document.querySelector('script[src*="navbar.js"]')) {
        const script = document.createElement('script');
        script.src = '../js/navbar.js';
        // Remove async to ensure it loads in order
        // script.async = true;
        // Use defer instead for better execution timing
        script.defer = true;
        // Insert at beginning of body for higher priority
        if (document.body.firstChild) {
            document.body.insertBefore(script, document.body.firstChild);
        } else {
            document.body.appendChild(script);
        }
        
        // Manually update the navbar auth state
        checkAndUpdateNavbarAuth();
    }
    
    // Add padding to body to account for fixed navbar
    addBodyPadding();
    
    // Mark as initialized
    window.navbarInitialized = true;
}

// New function to check auth state and update navbar
function checkAndUpdateNavbarAuth() {
    // Check for auth token
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Wait a moment for DOM to be ready
    setTimeout(() => {
        // Try multiple ways to update the navbar
        if (typeof updateNavbarAuthState === 'function') {
            updateNavbarAuthState();
        } else if (window.updateNavbarAuthState) {
            window.updateNavbarAuthState();
        } else {
            // Direct DOM manipulation if function not available
            const loggedOutButtons = document.getElementById('logged-out-buttons');
            const loggedInButtons = document.getElementById('logged-in-buttons');
            const mobileLoggedOutButtons = document.getElementById('mobile-logged-out-buttons');
            const mobileLoggedInButtons = document.getElementById('mobile-logged-in-buttons');
            
            if (token) {
                // User is logged in
                if (loggedOutButtons) loggedOutButtons.classList.add('hidden');
                if (loggedInButtons) {
                    loggedInButtons.classList.remove('hidden');
                    
                    const userGreeting = document.getElementById('user-greeting');
                    if (userGreeting && user.name) {
                        userGreeting.textContent = `Hi, ${user.name}`;
                    }
                }
                
                // Mobile version
                if (mobileLoggedOutButtons) mobileLoggedOutButtons.classList.add('hidden');
                if (mobileLoggedInButtons) {
                    mobileLoggedInButtons.classList.remove('hidden');
                    
                    const mobileUserGreeting = document.getElementById('mobile-user-greeting');
                    if (mobileUserGreeting && user.name) {
                        mobileUserGreeting.textContent = `Hi, ${user.name}`;
                    }
                }
            } else {
                // User is logged out
                if (loggedInButtons) loggedInButtons.classList.add('hidden');
                if (loggedOutButtons) loggedOutButtons.classList.remove('hidden');
                
                // Mobile version
                if (mobileLoggedInButtons) mobileLoggedInButtons.classList.add('hidden');
                if (mobileLoggedOutButtons) mobileLoggedOutButtons.classList.remove('hidden');
            }
        }
    }, 500);
}

function preloadResources() {
    // Preload critical CSS files
    preloadCSS('../css/navbar.css');
    
    // Preload Font Awesome
    if (!document.querySelector('link[href*="font-awesome"]')) {
        preloadCSS('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
    }
}

function preloadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = function() {
        this.onload = null;
        this.rel = 'stylesheet';
    };
    document.head.appendChild(link);
}

function addBaseStyles() {
    if (!isUniversityPage()) {
        document.body.style.paddingTop = '72px';
    }
    // Add a style tag with minimal base styles to prevent FOUC
    if (!document.getElementById('navbar-base-styles')) {
        const style = document.createElement('style');
        style.id = 'navbar-base-styles';
        style.textContent = `
            body.has-navbar {
                background-color: #1e1e1e;
                color: #ffffff;
                margin: 0;
                padding-top: 70px; /* Provisional space for navbar */
                font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            #navbar-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                background-color: #121212;
                min-height: 60px;
                will-change: transform; /* Hardware acceleration hint */
            }
            
            .loading-navbar {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 60px;
                color: #ff6b00;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }
}

function addBodyPadding() {
    const navbar = document.querySelector('.main-navigation');
    if (navbar) {
        const navbarHeight = navbar.offsetHeight;
        document.body.style.paddingTop = navbarHeight + 'px';
    }
    
    // Update padding when window is resized
    if (!window.navbarResizeListenerAdded) {
        window.addEventListener('resize', function() {
            const navbar = document.querySelector('.main-navigation');
            if (navbar) {
                const navbarHeight = navbar.offsetHeight;
                document.body.style.paddingTop = navbarHeight + 'px';
            }
        });
        window.navbarResizeListenerAdded = true;
    }
} 