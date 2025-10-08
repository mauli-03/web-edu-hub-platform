/**
 * Authentication service for frontend
 * Handles user login, registration, and session management
 */

const API_URL = 'http://localhost:5000/api';

const authService = {
    // Register a new user
    register(name, email, password) {
        try {
            // In a real app, this would make an API call to register the user
            // For now, we'll store the user in localStorage
            const user = {
                id: Date.now().toString(),
                name,
                email,
                password, // In real app, never store passwords in localStorage
                createdAt: new Date().toISOString()
            };
            
            // Check if user already exists
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const existingUser = existingUsers.find(u => u.email === email);
            
            if (existingUser) {
                return { success: false, message: 'User with this email already exists' };
            }
            
            // Save user to localStorage
            existingUsers.push(user);
            localStorage.setItem('users', JSON.stringify(existingUsers));
            
            // Automatically log the user in
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                isLoggedIn: true
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            return { success: true, message: 'Registration successful', user: userData };
        } catch (error) {
            return { success: false, message: error.message || 'Registration failed' };
        }
    },
    
    // Login a user
    login(email, password) {
        try {
            // In a real app, this would make an API call to authenticate the user
            // For now, we'll check localStorage
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const user = existingUsers.find(u => u.email === email && u.password === password);
            
            if (!user) {
                return { success: false, message: 'Invalid email or password' };
            }
            
            // Save current user to localStorage (as logged in)
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                isLoggedIn: true
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.message || 'Login failed' };
        }
    },
    
    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('token') !== null;
    },
    
    // Get current user details
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || '{}');
    },
    
    // Log out a user
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
        // Redirect to login page after logout
        window.location.href = 'login.html';
    },
    
    // Check auth state and redirect if needed
    checkAuthState() {
        const currentPath = window.location.pathname;
        const token = localStorage.getItem('token');
        
        // If we're on the login or register page, don't redirect
        // More specific path checking using endsWith rather than includes
        const isLoginPage = currentPath.endsWith('/login.html');
        const isRegisterPage = currentPath.endsWith('/register.html');
        
        // If user is already logged in and tries to access login or register page
        if (token && (isLoginPage || isRegisterPage)) {
            // Check if there's a redirect after login stored in localStorage
            const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
            if (redirectAfterLogin) {
                // Clear the redirect path
                localStorage.removeItem('redirectAfterLogin');
                // Redirect to the stored path instead of home
                window.location.href = redirectAfterLogin;
            } else {
                // Normal redirect to home page
                window.location.href = 'home.html';
            }
            return;
        }
        
        // Allow public pages to be accessed without login
        const publicPages = ['login.html', 'register.html', 'index.html', 'home.html', 'blogs.html', 'blog-detail.html'];
        
        // Check if current page is in the public pages list - more specific using endsWith
        const isPublicPage = publicPages.some(page => currentPath.endsWith('/' + page));
        
        // If user is not logged in and tries to access protected pages
        if (!token && !isPublicPage) {
            // Store the current page to redirect back after login
            localStorage.setItem('redirectAfterLogin', currentPath);
            window.location.href = 'login.html';
            return;
        }
    },
    
    // Update navbar based on auth state
    updateNavbar() {
        const loggedOutButtons = document.getElementById('logged-out-buttons');
        const loggedInButtons = document.getElementById('logged-in-buttons');
        const userGreeting = document.getElementById('user-greeting');
        const userAvatar = document.getElementById('user-avatar');
        
        if (!loggedOutButtons || !loggedInButtons) return;
        
        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            
            // Update user greeting
            if (userGreeting) {
                userGreeting.textContent = `Hi, ${user.name}`;
            }
            
            // Update user avatar if we have one
            if (userAvatar && user.avatarUrl) {
                userAvatar.src = user.avatarUrl;
            }
            
            // Show logged in buttons, hide logged out buttons
            loggedOutButtons.style.display = 'none';
            loggedInButtons.style.display = 'flex';
            
            // Recreate the mobile menu to reflect login state
            const generateMobileMenu = window.generateMobileMenu;
            if (typeof generateMobileMenu === 'function') {
                generateMobileMenu();
            }
        } else {
            // Show logged out buttons, hide logged in buttons
            loggedOutButtons.style.display = 'flex';
            loggedInButtons.style.display = 'none';
            
            // Recreate the mobile menu to reflect logout state
            const generateMobileMenu = window.generateMobileMenu;
            if (typeof generateMobileMenu === 'function') {
                generateMobileMenu();
            }
        }
    }
};

// Create global auth object
window.auth = {
    isLoggedIn: authService.isLoggedIn,
    checkAuthState: authService.checkAuthState,
    logout: authService.logout,
    register: authService.register,
    login: authService.login,
    getCurrentUser: authService.getCurrentUser,
    updateNavbar: authService.updateNavbar
};