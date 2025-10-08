/**
 * Utility functions for the EduHub frontend
 */

// Define global API URL for use across all files
window.API_URL = "http://localhost:5000/api";

// Function to check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Function to get authentication token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Function to redirect to login page
function redirectToLogin() {
    // Save current page with query parameters to redirect back after login
    const currentPath = window.location.pathname;
    const queryParams = window.location.search;
    
    // Save the full path including query parameters
    localStorage.setItem('redirectAfterLogin', currentPath + queryParams);
    
    console.log('Saved redirect path:', localStorage.getItem('redirectAfterLogin'));
    window.location.href = '../pages/login.html';
}

// Function to include HTML components like navbar and footer
function includeHTML() {
    // Load navbar
    fetch('../components/navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
            
            // Update navbar authentication state after it's loaded
            // Give it a small delay to ensure the DOM is updated
            setTimeout(() => {
                if (typeof updateNavbarAuthState === 'function') {
                    updateNavbarAuthState();
                } else if (window.updateNavbarAuthState) {
                    window.updateNavbarAuthState();
                } else {
                    // Try to find the function in the navbar's script
                    const navbarScript = document.querySelector('#navbar-placeholder script');
                    if (navbarScript && navbarScript.textContent.includes('updateNavbarAuthState')) {
                        eval('updateNavbarAuthState()');
                    }
                }
            }, 100);
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
            document.getElementById('navbar-placeholder').innerHTML = `
                <div class="alert alert-warning">
                    <p>Failed to load navigation. Please refresh the page.</p>
                </div>
            `;
        });

    // Load footer
    fetch('../components/footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            document.getElementById('footer-placeholder').innerHTML = `
                <div class="alert alert-warning">
                    <p>Failed to load footer. Please refresh the page.</p>
                </div>
            `;
        });
}

// Format date to a readable string
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Show a toast notification
function showToast(message, bgColor = '#FF6B35', duration = 3000) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast-notification');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'fixed bottom-4 right-4 py-2 px-4 rounded-lg shadow-lg opacity-0 transition-opacity duration-300 z-50 animate__animated animate__fadeInUp';
        document.body.appendChild(toast);
    }
    
    // Set style and message
    toast.style.backgroundColor = bgColor;
    toast.style.color = '#ffffff';
    toast.textContent = message;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
    
    // Hide toast after the specified duration
    setTimeout(() => {
        toast.classList.add('animate__fadeOutDown');
        setTimeout(() => {
            toast.classList.remove('opacity-100', 'animate__fadeOutDown');
            toast.classList.add('opacity-0');
        }, 500);
    }, duration);
}

// Create skeleton loading effect
function createSkeletonLoading(container, type = 'blog') {
    const skeletonHTML = {
        blog: `
            <div class="animate-pulse">
                <div class="h-4 bg-orange-100 rounded w-3/4 mb-4"></div>
                <div class="h-4 bg-orange-100 rounded w-full mb-4"></div>
                <div class="h-4 bg-orange-100 rounded w-5/6 mb-4"></div>
                <div class="h-4 bg-orange-100 rounded w-full mb-4"></div>
                <div class="h-4 bg-orange-100 rounded w-3/4 mb-4"></div>
            </div>
        `,
        card: `
            <div class="animate-pulse">
                <div class="h-24 bg-orange-100 rounded-lg mb-4"></div>
                <div class="h-4 bg-orange-100 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-orange-100 rounded w-1/2 mb-4"></div>
            </div>
        `,
        list: `
            <div class="animate-pulse">
                <div class="h-4 bg-orange-100 rounded w-full mb-4"></div>
                <div class="h-4 bg-orange-100 rounded w-full mb-4"></div>
                <div class="h-4 bg-orange-100 rounded w-full mb-4"></div>
            </div>
        `
    };
    
    if (container) {
        container.innerHTML = skeletonHTML[type] || skeletonHTML.blog;
    }
    
    return skeletonHTML[type] || skeletonHTML.blog;
}

// Handle API errors consistently
function handleApiError(error, fallbackMessage = "Something went wrong. Please try again later.") {
    console.error("API Error:", error);
    
    let errorMessage = fallbackMessage;
    
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data.message || fallbackMessage;
    } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your internet connection.";
    } else {
        // Something happened in setting up the request
        errorMessage = error.message || fallbackMessage;
    }
    
    return errorMessage;
}

// Function to load footer component
function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('../components/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;
            })
            .catch(error => {
                console.error('Error loading footer:', error);
                footerPlaceholder.innerHTML = `
                    <div class="alert alert-warning">
                        <p>Failed to load footer. Please refresh the page.</p>
                    </div>
                `;
            });
    }
}

// Create a debounce function for search inputs
function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
} 