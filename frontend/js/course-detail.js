// Course Detail Page JavaScript

document.addEventListener("DOMContentLoaded", function() {
    // Load navbar first
    loadNavbar();
    
    // Load footer
    if (typeof loadFooter === 'function') {
        loadFooter();
    }
    
    // Get course ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    
    if (courseId) {
        // Load course details from API
        fetchCourseDetails(courseId);
    } else {
        // Display demo data if no course ID provided
        displayDemoCourse();
    }
    
    // Set up click event for enroll button
    setupEnrollButton();
    
    // Set up animation observers
    setupAnimations();
    
    // Update instructor section loading state styles
    const style = document.createElement('style');
    style.textContent = `
        .instructor-section.loading {
            position: relative;
            min-height: 200px;
        }
        .instructor-section.loading::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            z-index: 5;
        }
        .instructor-section.loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-top-color: var(--primary-color, #4CAF50);
            border-radius: 50%;
            z-index: 6;
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);
});

// Function to load navbar from pages/navbar.html
function loadNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        fetch('../pages/navbar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                navbarPlaceholder.innerHTML = data;
                
                // Load navbar script
                const script = document.createElement('script');
                script.src = '../js/navbar.js';
                document.body.appendChild(script);
                
                // Update auth state after loading navbar
                setTimeout(() => {
                    try {
                        const token = localStorage.getItem('token');
                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        
                        // Try to find auth related elements
                        const loggedOutButtons = document.getElementById('logged-out-buttons');
                        const loggedInButtons = document.getElementById('logged-in-buttons');
                        
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
                        } else {
                            // User is logged out
                            if (loggedInButtons) loggedInButtons.classList.add('hidden');
                            if (loggedOutButtons) loggedOutButtons.classList.remove('hidden');
                        }
                    } catch (e) {
                        console.warn("Could not update navbar auth state:", e);
                    }
                }, 500);
            })
            .catch(error => {
                console.error('Error loading navbar:', error);
                navbarPlaceholder.innerHTML = `
                    <div class="alert alert-warning">
                        <p>Failed to load navigation. Please refresh the page.</p>
                    </div>
                `;
            });
    }
}

// Function to fetch course details from API
async function fetchCourseDetails(courseId, retryCount = 0) {
    // Show loading overlay
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    try {
        // Use API_URL from utils.js if available, otherwise use default
        const apiUrl = window.API_URL || "http://localhost:5000/api";
        
        console.log(`Fetching course data from: ${apiUrl}/courses/${courseId} (Attempt ${retryCount + 1})`);
        
        const response = await fetch(`${apiUrl}/courses/${courseId}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);
            
            if (response.status === 404) {
                showToast('Course not found', 'error');
                throw new Error("Course not found. Please check the course ID and try again.");
            } else if (response.status === 401 || response.status === 403) {
                showToast('You do not have access to this course', 'warning');
                throw new Error("You don't have permission to access this course.");
            } else {
                throw new Error(`Failed to fetch course data: ${response.status} ${response.statusText}`);
            }
        }
        
        const data = await response.json();
        console.log("Course API response:", data);
        
        // Handle different API response formats
        if (data.success && data.course) {
            // Standard format: { success: true, course: {...} }
            displayCourseDetails(data.course);
            
            // Fetch additional course data if needed
            fetchCourseStats(courseId);
            fetchInstructorDetails(data.course.instructorId);
        } else if (data.data && data.data.course) {
            // Alternative format: { data: { course: {...} } }
            displayCourseDetails(data.data.course);
            
            // Fetch additional course data if needed
            fetchCourseStats(courseId);
            fetchInstructorDetails(data.data.course.instructorId);
        } else if (data.course) {
            // Simple format: { course: {...} }
            displayCourseDetails(data.course);
            
            // Fetch additional course data if needed
            fetchCourseStats(courseId);
            fetchInstructorDetails(data.course.instructorId);
        } else if (Object.keys(data).length > 0 && data.title) {
            // The response itself is the course object
            displayCourseDetails(data);
            
            // Fetch additional course data if needed
            fetchCourseStats(courseId);
            fetchInstructorDetails(data.instructorId);
        } else {
            console.error("Invalid API response format:", data);
            throw new Error("Course data is in an unexpected format");
        }
        
        // Hide loading state
        hideLoadingState();
        
        // Show success toast
        showToast("Course details loaded successfully", "success");
    } catch (error) {
        console.error("Error fetching course details:", error);
        
        // Implement retry logic
        const maxRetries = 2;
        if (retryCount < maxRetries) {
            console.log(`Retrying fetch (${retryCount + 1}/${maxRetries})...`);
            showToast(`Network error - Retrying (${retryCount + 1}/${maxRetries + 1})`, "warning");
            
            // Wait 2 seconds before retrying
            setTimeout(() => {
                fetchCourseDetails(courseId, retryCount + 1);
            }, 2000);
            return;
        }
        
        // All retries failed
        displayError(error.message || "Failed to load course details. Please try again later.");
        
        // Hide loading state
        hideLoadingState();
        
        // Fallback to demo content after a short delay
        setTimeout(() => {
            displayDemoCourse();
        }, 1000);
    }
}

// Function to show loading state
function showLoadingState() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.classList.add('animate__animated', 'animate__fadeIn');
    }
}

// Function to hide loading state
function hideLoadingState() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('animate__fadeOut');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            loadingOverlay.classList.remove('animate__fadeIn', 'animate__fadeOut');
        }, 500);
    }
}

// Function to fetch course statistics
async function fetchCourseStats(courseId) {
    try {
        const apiUrl = window.API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/courses/${courseId}/stats`);
        
        if (!response.ok) {
            console.warn("Could not fetch course stats");
            showToast("Could not load course statistics", "warning");
            return;
        }
        
        const data = await response.json();
        console.log("Course stats response:", data);
        
        // Handle different API response formats
        let stats;
        if (data.success && data.stats) {
            // Standard format: { success: true, stats: {...} }
            stats = data.stats;
        } else if (data.data && data.data.stats) {
            // Alternative format: { data: { stats: {...} } }
            stats = data.data.stats;
        } else if (data.stats) {
            // Simple format: { stats: {...} }
            stats = data.stats;
        } else if (Object.keys(data).length > 0 && (data.students || data.lessons || data.duration || data.rating)) {
            // The response itself is the stats object
            stats = data;
        } else {
            console.warn("Invalid stats format", data);
            showToast("Invalid course statistics format", "error");
            return;
        }
        
        // Update the UI with stats
        updateCourseStats(stats);
        showToast("Course statistics loaded", "success");
    } catch (error) {
        console.warn("Error fetching course stats:", error);
        showToast("Failed to load course statistics", "error");
    }
}

// Function to fetch instructor details
async function fetchInstructorDetails(instructorId) {
    if (!instructorId) return;
    
    try {
        // Show loading state for instructor section
        document.querySelector('.instructor-section').classList.add('loading');
        
        const apiUrl = window.API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/instructors/${instructorId}`);
        
        // Remove loading state
        document.querySelector('.instructor-section').classList.remove('loading');
        
        if (!response.ok) {
            console.warn("Could not fetch instructor details");
            showToast("Could not load instructor details", "warning");
            return;
        }
        
        const data = await response.json();
        console.log("Instructor data response:", data);
        
        // Handle different API response formats
        let instructor;
        if (data.success && data.instructor) {
            // Standard format: { success: true, instructor: {...} }
            instructor = data.instructor;
        } else if (data.data && data.data.instructor) {
            // Alternative format: { data: { instructor: {...} } }
            instructor = data.data.instructor;
        } else if (data.instructor) {
            // Simple format: { instructor: {...} }
            instructor = data.instructor;
        } else if (Object.keys(data).length > 0 && (data.name || data.title || data.bio)) {
            // The response itself is the instructor object
            instructor = data;
        } else {
            console.warn("Invalid instructor data format", data);
            showToast("Invalid instructor data format", "error");
            return;
        }
        
        // Update the UI with instructor details
        updateInstructorSection(instructor);
        showToast("Instructor details loaded", "success");
    } catch (error) {
        // Remove loading state on error
        document.querySelector('.instructor-section').classList.remove('loading');
        console.warn("Error fetching instructor details:", error);
        showToast("Failed to load instructor details", "error");
    }
}

// Function to update course stats
function updateCourseStats(stats) {
    // Students count
    const studentsElement = document.querySelector('.stat-item:nth-child(1) .stat-value');
    if (studentsElement && stats.students) {
        studentsElement.textContent = stats.students + (stats.students >= 1000 ? '+' : '');
    }
    
    // Lessons count
    const lessonsElement = document.querySelector('.stat-item:nth-child(2) .stat-value');
    if (lessonsElement && stats.lessons) {
        lessonsElement.textContent = stats.lessons;
    }
    
    // Duration
    const durationElement = document.querySelector('.stat-item:nth-child(3) .stat-value');
    if (durationElement && stats.duration) {
        durationElement.textContent = stats.duration;
    }
    
    // Rating
    const ratingElement = document.querySelector('.stat-item:nth-child(4) .stat-value');
    if (ratingElement && stats.rating) {
        ratingElement.textContent = stats.rating;
    }
}

// Function to update instructor section
function updateInstructorSection(instructor) {
    const instructorSection = document.querySelector('.instructor-section');
    if (!instructorSection) return;
    
    // Update instructor name
    const nameElement = instructorSection.querySelector('.instructor-name');
    if (nameElement && instructor.name) {
        nameElement.textContent = instructor.name;
    }
    
    // Update instructor title
    const titleElement = instructorSection.querySelector('.instructor-title');
    if (titleElement && instructor.title) {
        titleElement.textContent = instructor.title;
    }
    
    // Update instructor bio
    const bioElement = instructorSection.querySelector('p:not(.instructor-title)');
    if (bioElement && instructor.bio) {
        bioElement.textContent = instructor.bio;
    }
    
    // Update instructor avatar
    const avatarElement = instructorSection.querySelector('.instructor-avatar');
    if (avatarElement && instructor.avatar) {
        avatarElement.src = instructor.avatar;
        
        // Add fallback on error
        avatarElement.onerror = function() {
            this.onerror = null;
            this.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzk5OTk5OSIvPjxwYXRoIGQ9Ik0xNjAsMTYwIEMxNjAsMTIwIDEzMCwxMzAgMTAwLDEzMCBDNzAsMTMwIDQwLDEyMCA0MCwxNjAgQzQwLDE4MCAxMDAsMTkwIDEwMCwxOTAgQzEwMCwxOTAgMTYwLDE4MCAxNjAsMTYwIFoiIGZpbGw9IiM5OTk5OTkiLz48L3N2Zz4=";
        };
    }
    
    // Update social links if available
    if (instructor.socialLinks) {
        const socialLinksContainer = instructorSection.querySelector('.social-links');
        if (socialLinksContainer) {
            // Clear existing links
            socialLinksContainer.innerHTML = '';
            
            // Add each social link
            Object.entries(instructor.socialLinks).forEach(([platform, url]) => {
                if (!url) return;
                
                let icon = 'fa-globe';
                if (platform === 'twitter') icon = 'fa-twitter';
                else if (platform === 'linkedin') icon = 'fa-linkedin-in';
                else if (platform === 'github') icon = 'fa-github';
                else if (platform === 'facebook') icon = 'fa-facebook-f';
                
                const link = document.createElement('a');
                link.href = url;
                link.className = 'social-link';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.innerHTML = `<i class="fab ${icon}"></i>`;
                
                socialLinksContainer.appendChild(link);
            });
        }
    }
}

// Function to display error message
function displayError(message) {
    const container = document.querySelector('.container');
    const header = container.querySelector('.header-container');
    
    if (header) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger animate__animated animate__fadeIn';
        errorDiv.role = 'alert';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        header.insertAdjacentElement('afterend', errorDiv);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            errorDiv.classList.add('animate__fadeOut');
            setTimeout(() => errorDiv.remove(), 1000);
        }, 5000);
        
        // Also show as toast
        showToast(message, 'error');
    }
}

// Function to show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span>${message}</span>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Function to display course details
function displayCourseDetails(course) {
    console.log("Displaying course details:", course);
    
    // Update course title
    const titleElement = document.getElementById('courseTitle');
    if (titleElement) {
        titleElement.textContent = course.title || "Advanced Web Development Masterclass";
    }
    
    // Update course description
    const descriptionElement = document.getElementById('courseDescription');
    if (descriptionElement) {
        descriptionElement.textContent = course.description || 
            "Master modern web development with this comprehensive course covering front-end and back-end technologies, responsive design, performance optimization, and deployment strategies.";
    }
    
    // Update course badges
    if (course.badges && course.badges.length > 0) {
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            // Remove existing badges
            headerContent.querySelectorAll('.course-badge').forEach(badge => badge.remove());
            
            // Add new badges before the title
            course.badges.forEach(badge => {
                const badgeElement = document.createElement('span');
                badgeElement.className = `course-badge ${badge.color || ''}`;
                badgeElement.textContent = badge.text;
                headerContent.insertBefore(badgeElement, titleElement);
            });
        }
    }
    
    // Update course features
    if (course.features && course.features.length > 0) {
        const featuresContainer = document.getElementById('courseFeatures');
        if (featuresContainer) {
            featuresContainer.innerHTML = '';
            
            course.features.forEach(feature => {
                const li = document.createElement('li');
                li.className = 'feature-item';
                li.innerHTML = `
                    <i class="fas fa-check-circle feature-icon"></i>
                    ${feature.text || feature}
                `;
                featuresContainer.appendChild(li);
            });
        }
    }
    
    // Update success path
    if (course.successPath && course.successPath.length > 0) {
        const successPathContainer = document.getElementById('courseSuccessPath');
        if (successPathContainer) {
            successPathContainer.innerHTML = '';
            
            course.successPath.forEach((step, index) => {
                const div = document.createElement('div');
                div.className = 'path-step';
                div.innerHTML = `
                    <h4 class="step-title">Step ${index + 1}: ${step.title}</h4>
                    <p>${step.description}</p>
                `;
                successPathContainer.appendChild(div);
            });
        }
    }
    
    // Update materials
    if (course.materials && course.materials.length > 0) {
        const materialsContainer = document.getElementById('courseMaterials');
        if (materialsContainer) {
            materialsContainer.innerHTML = '';
            
            course.materials.forEach(material => {
                const li = document.createElement('li');
                li.className = 'material-item';
                
                // Determine icon based on material type
                let icon = 'fa-file';
                if (material.type === 'video') icon = 'fa-video';
                else if (material.type === 'pdf') icon = 'fa-file-pdf';
                else if (material.type === 'code') icon = 'fa-file-code';
                else if (material.type === 'quiz') icon = 'fa-tasks';
                else if (material.type === 'project') icon = 'fa-project-diagram';
                
                li.innerHTML = `
                    <div class="material-icon"><i class="fas ${icon}"></i></div>
                    <div class="material-info">
                        <div class="material-title">${material.title}</div>
                        <div class="material-desc">${material.description || ''}</div>
                    </div>
                `;
                materialsContainer.appendChild(li);
            });
        }
    }
    
    // Update price information
    if (course.price) {
        const oldPriceElement = document.querySelector('.old-price');
        const currentPriceElement = document.querySelector('.price-tag');
        const discountElement = document.querySelector('.discount');
        
        if (currentPriceElement) {
            // Remove existing content
            currentPriceElement.innerHTML = '';
            
            if (course.price.original && course.price.original > course.price.current) {
                // Show discounted price
                const oldPriceSpan = document.createElement('span');
                oldPriceSpan.className = 'old-price';
                oldPriceSpan.textContent = `$${course.price.original.toFixed(2)}`;
                currentPriceElement.appendChild(oldPriceSpan);
                
                // Calculate discount percentage
                const discountPercentage = Math.round((1 - course.price.current / course.price.original) * 100);
                
                // Add current price
                currentPriceElement.appendChild(document.createTextNode(`$${course.price.current.toFixed(2)}`));
                
                // Add discount badge
                const discountSpan = document.createElement('span');
                discountSpan.className = 'discount';
                discountSpan.textContent = `${discountPercentage}% OFF`;
                currentPriceElement.appendChild(discountSpan);
            } else {
                // Show regular price
                currentPriceElement.textContent = `$${course.price.current.toFixed(2)}`;
            }
        }
    }
    
    // Update page title
    document.title = `${course.title} | EduHub`;
}

// Function to display demo course when API is not available
function displayDemoCourse() {
    console.log("Using demo course data");
    // Demo data is already in the HTML template
}

// Function to set up the enroll button
function setupEnrollButton() {
    const enrollButton = document.getElementById('startCourseButton');
    
    if (enrollButton) {
        enrollButton.addEventListener('click', function() {
            // Check if user is logged in
            const token = localStorage.getItem('token');
            
            if (!token) {
                // Redirect to login page if not logged in
                localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
                window.location.href = '../pages/login.html';
                return;
            }
            
            // Get course ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const courseId = urlParams.get('id') || 'demo';
            
            // Show enrollment animation
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            this.disabled = true;
            
            // Simulate enrollment process
            setTimeout(() => {
                // In a real app, this would be an API call
                console.log(`Enrolling in course ${courseId}`);
                
                // Show success message
                this.innerHTML = '<i class="fas fa-check"></i> Enrolled!';
                this.classList.add('enrolled');
                
                // Create toast notification
                const toast = document.createElement('div');
                toast.className = 'toast-notification animate__animated animate__fadeInUp';
                toast.innerHTML = `
                    <div class="toast-content">
                        <i class="fas fa-check-circle"></i>
                        <p>Successfully enrolled in course! Redirecting to course materials...</p>
                    </div>
                `;
                document.body.appendChild(toast);
                
                // Redirect to course learning page after 2 seconds
                setTimeout(() => {
                    window.location.href = `course-learning.html?id=${courseId}`;
                }, 2000);
            }, 1500);
        });
    }
}

// Function to set up animation observers for elements
function setupAnimations() {
    // Only run if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const animatedElements = document.querySelectorAll('.content-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate__fadeInUp');
                    entry.target.style.opacity = 1;
                    // Stop observing after animation
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Set initial opacity
        animatedElements.forEach(el => {
            // Skip first one which is already animated
            if (!el.classList.contains('animate__fadeInUp')) {
                el.style.opacity = 0;
                observer.observe(el);
            }
        });
    }
}

// Add toast notification styles
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 350px;
        background: white;
        color: #333;
        padding: 12px 15px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s ease;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-content {
        display: flex;
        align-items: center;
    }
    
    .toast-success {
        border-left: 4px solid var(--primary-color, #4CAF50);
    }
    
    .toast-error {
        border-left: 4px solid #f44336;
    }
    
    .toast-warning {
        border-left: 4px solid #ff9800;
    }
    
    .toast-info {
        border-left: 4px solid #2196F3;
    }
`;
document.head.appendChild(toastStyle); 