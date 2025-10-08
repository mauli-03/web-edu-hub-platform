import { authService } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    authService.checkAuthState();
    
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
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
        registerForm.parentNode.insertBefore(errorDiv, registerForm);
        
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate form
            if (!name || !email || !password || !confirmPassword) {
                showError('Please fill out all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showError('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showError('Password must be at least 6 characters', 'error');
                return;
            }
            
            // Register the user
            const result = authService.register(name, email, password);
            
            if (result.success) {
                showError('Registration successful! Redirecting to home page...', 'success');
                // Redirect to home page after successful registration
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

// Password validation function
function validatePassword(password) {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!/\d/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number.' };
    }
    return { isValid: true, message: '' };
}
