/**
 * Navbar functionality - Optimized version
 * This script handles the interactive behavior of the navbar
 */

// Use a self-executing function to avoid polluting global namespace
(function() {
    // Track initialization to prevent duplicate initialization
    if (window.navbarBehaviorInitialized) return;
    window.navbarBehaviorInitialized = true;
    
    // Define globals
    const mobileNavId = 'mobile-nav-menu';
    
    // Initial setup for navbar behaviors
    initializeNavbar();
    
    /**
     * Initialize all navbar behavior
     */
    function initializeNavbar() {
        // Initialize core behaviors first for fast interaction
        setupMobileToggle();
        
        // Defer non-critical initializations using requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            // Further defer low-priority initializations
            setTimeout(() => {
                setupScrollBehavior();
                setupSearchFunctionality();
                setupActiveNavItems();
                generateMobileMenu(); // Add mobile menu generation
            }, 50);
        });
    }
    
    /**
     * Mobile toggle functionality
     */
    function setupMobileToggle() {
        const toggleButton = document.querySelector('.mobile-toggle');
        const navbar = document.querySelector('.main-navigation');
        const mobileNav = document.getElementById(mobileNavId);
        
        if (!toggleButton || !navbar || !mobileNav) return;
        
        // Use event delegation to improve performance
        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle mobile navigation
            mobileNav.classList.toggle('active');
            
            // Update aria attributes for accessibility
            const isExpanded = mobileNav.classList.contains('active');
            toggleButton.setAttribute('aria-expanded', isExpanded);
            
            // Prevent scrolling when menu is open
            document.body.classList.toggle('mobile-menu-active', isExpanded);
            
            // Update the toggle button icon
            const icon = toggleButton.querySelector('i');
            if (icon) {
                if (isExpanded) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileNav.classList.contains('active') && 
                !e.target.closest('.main-navigation') && 
                !e.target.closest('.mobile-toggle') &&
                !e.target.closest('#' + mobileNavId)) {
                mobileNav.classList.remove('active');
                document.body.classList.remove('mobile-menu-active');
                
                // Reset button state
                if (toggleButton) {
                    toggleButton.setAttribute('aria-expanded', 'false');
                    const icon = toggleButton.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    }
    
    /**
     * Highlight active nav items based on current URL
     */
    function setupActiveNavItems() {
        // Get current path without query string
        const currentPath = window.location.pathname.split('?')[0];
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // Select all navigation links
        const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
        
        navLinks.forEach(link => {
            let linkHref = link.getAttribute('href');
            if (!linkHref) return;
            
            // Remove query string from href for comparison
            linkHref = linkHref.split('?')[0];
            
            // Extract page name from href
            const linkPage = linkHref.split('/').pop();
            
            // Mark as active if paths match
            if (linkPage === currentPage) {
                link.classList.add('active');
                
                // Also add active class to parent li if it exists
                const parentLi = link.closest('li');
                if (parentLi) {
                    parentLi.classList.add('active');
                }
            }
        });
    }
    
    /**
     * Generate the mobile menu items from desktop menu
     */
    function generateMobileMenu() {
        const mobileNav = document.getElementById(mobileNavId);
        const navLinks = document.querySelectorAll('.nav-links > li');
        
        if (!mobileNav) return;
        
        // Clear existing items
        mobileNav.innerHTML = '';
        
        // Create category groups
        const categories = {
            'home': { label: 'Home', items: [] },
            'education': { label: 'Education', items: [] },
            'community': { label: 'Community', items: [] },
            'tools': { label: 'Tools', items: [] }
        };
        
        // Sort items by category
        navLinks.forEach(item => {
            const link = item.querySelector('a');
            if (!link) return;
            
            const category = item.getAttribute('data-category') || 'other';
            if (categories[category]) {
                const clonedLink = link.cloneNode(true);
                
                // Copy active state from original links
                if (link.classList.contains('active')) {
                    clonedLink.classList.add('active');
                }
                
                categories[category].items.push(clonedLink);
            }
        });
        
        // Create category sections in mobile menu
        Object.keys(categories).forEach(catKey => {
            const category = categories[catKey];
            if (category.items.length === 0) return;
            
            // Skip category header for home (single item)
            if (catKey !== 'home' && category.items.length > 0) {
                const header = document.createElement('div');
                header.className = 'mobile-category-header';
                header.textContent = category.label;
                mobileNav.appendChild(header);
            }
            
            // Add category items
            category.items.forEach(link => {
                mobileNav.appendChild(link);
            });
        });
        
        // Add auth buttons for mobile
        addAuthButtonsToMobile(mobileNav);
    }
    
    /**
     * Add authentication buttons to mobile navigation
     */
    function addAuthButtonsToMobile(mobileNav) {
        const loggedOutButtons = document.getElementById('logged-out-buttons');
        const loggedInButtons = document.getElementById('logged-in-buttons');
        
        if (loggedOutButtons && loggedOutButtons.style.display !== 'none') {
            // User is not logged in, add login/register buttons
            const loginBtn = document.querySelector('.btn-login');
            const registerBtn = document.querySelector('.btn-register');
            
            if (loginBtn && registerBtn) {
                const mobileAuthSection = document.createElement('div');
                mobileAuthSection.className = 'mobile-auth-buttons';
                mobileAuthSection.appendChild(loginBtn.cloneNode(true));
                mobileAuthSection.appendChild(registerBtn.cloneNode(true));
                mobileNav.appendChild(mobileAuthSection);
            }
        } else if (loggedInButtons && loggedInButtons.style.display !== 'none') {
            // User is logged in, add profile link and logout
            const header = document.createElement('div');
            header.className = 'mobile-category-header';
            header.textContent = 'Account';
            mobileNav.appendChild(header);
            
            const userDropdownLinks = document.querySelectorAll('.user-dropdown a');
            userDropdownLinks.forEach(link => {
                mobileNav.appendChild(link.cloneNode(true));
            });
        }
    }
    
    /**
     * Scroll behavior (hide/show on scroll)
     */
    function setupScrollBehavior() {
        let lastScrollTop = 0;
        const navbar = document.querySelector('.main-navigation');
        const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
        
        if (!navbar) return;
        
        // Use throttled scroll event for better performance
        window.addEventListener('scroll', throttle(function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Skip if scroll change is minimal
            if (Math.abs(scrollTop - lastScrollTop) <= scrollThreshold) return;
            
            // Don't hide navbar when at top of page
            if (scrollTop <= 50) {
                navbar.classList.remove('scrolled-down');
                navbar.classList.remove('scrolled-up');
                navbar.classList.remove('scrolled');
                return;
            }
            
            // Add scrolled class for styling
            navbar.classList.add('scrolled');
            
            // Hide on scroll down, show on scroll up
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                navbar.classList.add('scrolled-down');
                navbar.classList.remove('scrolled-up');
            } else {
                // Scrolling up
                navbar.classList.remove('scrolled-down');
                navbar.classList.add('scrolled-up');
            }
            
            lastScrollTop = scrollTop;
        }, 100));
    }
    
    /**
     * Setup search functionality 
     */
    function setupSearchFunctionality() {
        const searchButton = document.querySelector('.search-toggle');
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.querySelector('.search-input');
        
        if (!searchButton || !searchForm) return;
        
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            searchForm.classList.toggle('active');
            
            if (searchForm.classList.contains('active')) {
                // Focus search input when opened
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
                
                // Add close handler to document
                setTimeout(() => {
                    document.addEventListener('click', closeSearchOnClickOutside);
                }, 10);
            } else {
                document.removeEventListener('click', closeSearchOnClickOutside);
            }
        });
        
        function closeSearchOnClickOutside(e) {
            if (!e.target.closest('.search-form') && !e.target.closest('.search-toggle')) {
                searchForm.classList.remove('active');
                document.removeEventListener('click', closeSearchOnClickOutside);
            }
        }
    }
    
    /**
     * Throttle function to limit function calls
     */
    function throttle(callback, delay) {
        let last = 0;
        return function() {
            const now = new Date().getTime();
            if (now - last < delay) return;
            last = now;
            return callback.apply(null, arguments);
        };
    }
})();