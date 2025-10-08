import { authService } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    authService.checkAuthState();
    
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        // Create error message div
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.display = 'none';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.background = '#f8d7da';
        errorDiv.style.padding = '10px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.marginBottom = '15px';
        errorDiv.style.textAlign = 'center';
        
        // Insert error div before the form
        loginForm.parentNode.insertBefore(errorDiv, loginForm);
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Validate form
            if (!email || !password) {
                showError('Please fill out all fields', 'error');
                return;
            }
            
            // Login the user
            const result = authService.login(email, password);
            
            if (result.success) {
                showError('Login successful! Redirecting to home page...', 'success');
                // Redirect to home page after successful login
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            } else {
                showError(result.message, 'error');
            }
        });
        
        // Function to show error or success message
        function showError(message, type) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            if (type === 'success') {
                errorDiv.style.color = '#2ecc71';
                errorDiv.style.background = '#d4edda';
            } else {
                errorDiv.style.color = '#e74c3c';
                errorDiv.style.background = '#f8d7da';
            }
        }
    }
});
