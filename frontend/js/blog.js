let currentPage = 1;
const blogsPerPage = 6; // Set to only show 6 blogs per page
// Use window.API_URL if it exists, otherwise default to this value
const apiUrl = window.API_URL || "http://localhost:5000/api";

// Make these functions globally accessible for the button onclick handlers
window.changePage = changePage;
window.editBlog = editBlog;
window.deleteBlog = deleteBlog;

// Let's add a global variable to track loading state
let isLoading = false;

// Define fallback image data URLs at the top of the file
const fallbackImageDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjBweCIgdGV4dD0iTm8gSW1hZ2UiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
const errorImageDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2ZkZWNlYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjBweCIgdGV4dD0iSW1hZ2UgTm90IEZvdW5kIiBmaWxsPSIjZTc0YzNjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+";

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
    // Save current page to redirect back after login
    const currentPath = window.location.pathname;
    
    // Save query parameters if there are any
    if (window.location.search) {
        localStorage.setItem('redirectAfterLogin', currentPath + window.location.search);
    } else {
        localStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    console.log('Saved redirect path:', localStorage.getItem('redirectAfterLogin'));
    window.location.href = '../pages/login.html';
}

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

document.addEventListener("DOMContentLoaded", () => {
    // Load navbar first
    loadNavbar();
    
    // Load footer
    if (typeof loadFooter === 'function') {
        loadFooter();
    }
    
    // Check if user is authenticated before allowing blog operations
    if (!isAuthenticated()) {
        const blogForm = document.getElementById("blogForm");
        if (blogForm) {
            // Replace form with login message
            const formParent = blogForm.parentNode;
            const loginMessage = document.createElement('div');
            loginMessage.className = 'bg-yellow-50 p-4 rounded-lg border border-yellow-200';
            loginMessage.innerHTML = `
                <div class="flex items-center">
                    <svg class="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 class="text-lg font-medium text-yellow-800">Authentication Required</h3>
                </div>
                <p class="mt-2 text-yellow-700">You need to be logged in to create or manage blogs.</p>
                <div class="mt-4">
                    <button id="loginRedirect" class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                        Login Now
                    </button>
                </div>
            `;
            formParent.replaceChild(loginMessage, blogForm);
            
            document.getElementById('loginRedirect').addEventListener('click', redirectToLogin);
        }
    } else {
        // User is authenticated, proceed with blog form setup
    const blogForm = document.getElementById("blogForm");
    if (blogForm) {
        blogForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Prevent page reload

            const blogId = document.getElementById("blogId").value;
            const title = document.getElementById("title").value;
            const content = document.getElementById("content").value;
            const imageFile = document.getElementById("image").files[0];

            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            if (imageFile) {
                formData.append("image", imageFile);
            }

            if (blogId) {
                await updateBlog(blogId, formData);
            } else {
                await addBlog(formData);
            }

            document.getElementById("blogForm").reset(); // Clear form
            document.getElementById("submitButton").innerText = "Add Blog";
            fetchBlogs(1); // Reset to first page after adding/updating
        });
    }
    }
    
    // Always fetch blogs to display (even for unauthenticated users)
    fetchBlogs(currentPage);
});

// Function to add a new blog
async function addBlog(formData) {
    try {
        // Check authentication first
        if (!isAuthenticated()) {
            throw new Error("No authentication token, authorization denied");
        }
        
        const token = getAuthToken();
        
        const response = await fetch(`${apiUrl}/blogs`, {
            method: "POST",
            body: formData,
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            throw new Error("Authentication expired. Please login again.");
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add blog");
        }
        alert("Blog added successfully!");
    } catch (error) {
        console.error("Error adding blog:", error);
        
        if (error.message.includes("No authentication token") || 
            error.message.includes("Authentication expired")) {
            // Show login prompt
            if (confirm("You need to be logged in to add blogs. Go to login page?")) {
                redirectToLogin();
            }
        } else {
            alert(error.message);
        }
    }
}

// Function to fetch and display blogs with pagination
async function fetchBlogs(page = 1, limit = 6) {
    if (isLoading) return; // Prevent multiple simultaneous fetches
    
    isLoading = true;
    currentPage = page;
    
    // Show loading state
    displayLoadingState();
    
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Add authorization header if logged in
        if (isAuthenticated()) {
            headers['Authorization'] = `Bearer ${getAuthToken()}`;
        }
        
        const response = await fetch(`${apiUrl}/blogs?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: headers,
            mode: 'cors',
            credentials: 'include'
        }).catch(error => {
            // This specifically catches network errors like when server is down
            console.error("Network error:", error);
            throw new Error("Server connection failed. Please check if the backend server is running and try again.");
        });

        if (response.status === 401) {
            // Token expired or invalid, but we'll still try to get blogs as public data
            console.warn("Authentication token expired or invalid");
            localStorage.removeItem('token');
        }
        
        if (!response.ok && response.status !== 401) {
            // Handle other errors, but 401 might be ok for public blog viewing
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! Status: ${response.status}${errorData.error ? ` - ${errorData.error}` : ''}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.blogs) {
            console.error("Invalid data received from server");
            displayBlogs([]); // Display empty state
            displayPagination(1, 1); // Show single page
            return;
        }

        displayBlogs(data.blogs);
        displayPagination(data.currentPage, data.totalPages);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        
        // Show specific error based on the type of error
        if (error.message.includes("Server connection failed")) {
            displayNetworkError(error.message);
        } else {
            displayError(error.message || "Failed to load blogs. Please check your connection and try again.");
        }
        
        displayBlogs([]); // Display empty state
        displayPagination(1, 1); // Show single page
    } finally {
        isLoading = false;
    }
}

// Function to display a loading state while fetching blogs
function displayLoadingState() {
    const blogContainer = document.getElementById("blog-container");
    if (!blogContainer) return;
    
    blogContainer.innerHTML = "";
    
    // Create 3 placeholder blog cards
    for (let i = 0; i < 3; i++) {
        blogContainer.innerHTML += `
            <div class="bg-white shadow-md rounded-lg overflow-hidden">
                <div class="h-48 bg-gray-200 animate-pulse"></div>
                <div class="p-4">
                    <div class="h-6 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
                    <div class="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div class="h-4 bg-gray-200 rounded animate-pulse mb-2 w-5/6"></div>
                    <div class="h-4 bg-gray-200 rounded animate-pulse mb-6 w-2/3"></div>
                    
                    <div class="flex gap-2">
                        <div class="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
                        <div class="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
                        <div class="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Function to display error message
function displayError(message) {
    const blogContainer = document.getElementById("blog-container");
    if (!blogContainer) return;
    
    // Clear the container first
    blogContainer.innerHTML = "";
    
    // Add error message with retry button
    blogContainer.innerHTML = `
        <div class="col-span-full bg-red-50 p-6 rounded-lg border border-red-200">
            <div class="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-semibold text-red-700">Error Loading Blogs</h3>
            </div>
            <p class="text-red-600 mb-4">${message}</p>
            <div class="flex">
                <button onclick="retryFetch()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-3">
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try Again
                    </span>
                </button>
                <button onclick="showTestData()" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Use Sample Data
                </button>
            </div>
        </div>
    `;
}

// Function to retry fetching blogs
window.retryFetch = function() {
    fetchBlogs(currentPage);
};

// Function to display sample data when server is unavailable
window.showTestData = function() {
    // Mock data to display when server is down
    const sampleBlogs = [
        {
            _id: 'sample1',
            title: 'Introduction to Web Development',
            content: 'Learn the basics of HTML, CSS, and JavaScript to start your journey in web development. This comprehensive guide will take you through the essential concepts.',
            image: fallbackImageDataUrl,
            createdAt: new Date().toISOString()
        },
        {
            _id: 'sample2',
            title: 'Mastering React.js',
            content: 'Dive deep into React.js concepts like components, state management, hooks, and more. Perfect for intermediate developers looking to enhance their frontend skills.',
            image: fallbackImageDataUrl,
            createdAt: new Date().toISOString()
        },
        {
            _id: 'sample3',
            title: 'Backend Development with Node.js',
            content: 'Explore server-side programming with Node.js and Express. Learn how to create RESTful APIs, handle database operations, and implement authentication.',
            image: fallbackImageDataUrl,
            createdAt: new Date().toISOString()
        }
    ];
    
    displayBlogs(sampleBlogs);
    displayPagination(1, 1);
    
    // Show notification that we're using sample data
    const paginationContainer = document.getElementById("pagination");
    if (paginationContainer) {
        paginationContainer.innerHTML += `
            <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4 rounded">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm">
                            Showing sample data. Connect to a backend server to see actual blogs.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
};

// Function to display blogs
function displayBlogs(blogs) {
    const blogContainer = document.getElementById("blog-container");
    if (!blogContainer) return;

    blogContainer.innerHTML = "";

    if (!Array.isArray(blogs) || blogs.length === 0) {
        blogContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500">No blogs found. Be the first to create one!</p>
            </div>
        `;
        return;
    }

    blogs.forEach((blog) => {
        // Process image URL - handle both absolute and relative paths
        let imageUrl = fallbackImageDataUrl; // Use data URL as fallback
        
        if (blog.image) {
            // Check if the image URL is already absolute
            if (blog.image.startsWith('http')) {
                imageUrl = blog.image;
            } 
            // Handle server uploads - ensure proper path resolution
            else if (blog.image.startsWith('/uploads')) {
                // API_URL without the /api part to get server root
                const serverRoot = apiUrl.replace(/\/api$/, '');
                imageUrl = `${serverRoot}${blog.image}`;
                
                // Log image URL for debugging
                console.log('Image path resolved to:', imageUrl);
            }
            // Fallback to data URL if we can't determine the format
            else {
                console.warn('Unknown image path format:', blog.image);
                imageUrl = fallbackImageDataUrl;
            }
        }
        
        // Escape content for safe HTML display
        const safeTitle = blog.title ? escapeHTML(blog.title) : '';
        const safeContent = blog.content ? escapeHTML(blog.content.substring(0, 100) + '...') : '';
        
        const blogHTML = `
            <div class="bg-white shadow-md rounded-lg overflow-hidden">
                <img src="${imageUrl}" alt="${safeTitle}" class="w-full h-48 object-cover" 
                     onerror="this.onerror=null; this.src='${errorImageDataUrl}';">
                <div class="p-4">
                    <h3 class="text-lg font-semibold">${safeTitle}</h3>
                    <p class="text-sm text-gray-600 mt-2">${safeContent}</p>
                    
                    <div class="mt-4 flex flex-wrap gap-2">
                        <a href="blog-detail.html?id=${blog._id}" class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700">
                            Read More
                        </a>
                        <button onclick="editBlog('${blog._id}', '${encodeURIComponent(blog.title || '')}', '${encodeURIComponent(blog.content || '')}', '${encodeURIComponent(blog.image || '')}')" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700">
                        Edit
                    </button>
                        <button onclick="deleteBlog('${blog._id}')" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">
                        Delete
                    </button>
                    </div>
                </div>
            </div>
        `;
        blogContainer.innerHTML += blogHTML;
    });
}

// Helper function to escape HTML
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Function to display pagination - enhanced with better styling
function displayPagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    // Don't show pagination if there's only 1 page or no blogs
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <div class="flex justify-center items-center space-x-2 mt-4">
            <button onclick="changePage(${currentPage - 1})" 
                    class="px-4 py-2 bg-indigo-600 text-white rounded prev-btn ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}"
                    ${currentPage === 1 ? 'disabled' : ''}>
                <span class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Prev
                </span>
            </button>
    `;

    // Display page numbers - with ellipsis for many pages
    if (totalPages <= 7) {
        // Show all pages if there are 7 or fewer
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button onclick="changePage(${i})" 
                        class="px-4 py-2 page-number ${currentPage === i ? 'bg-indigo-700 text-white' : 'bg-white text-gray-700 border border-gray-300'} rounded hover:bg-indigo-500 hover:text-white">
                    ${i}
                </button>
            `;
        }
    } else {
        // Show ellipsis for many pages
        // Always show first page
        paginationHTML += `
            <button onclick="changePage(1)" 
                    class="px-4 py-2 page-number ${currentPage === 1 ? 'bg-indigo-700 text-white' : 'bg-white text-gray-700 border border-gray-300'} rounded hover:bg-indigo-500 hover:text-white">
                1
            </button>
        `;

        // Start ellipsis logic
        if (currentPage > 4) {
            paginationHTML += `<span class="px-3 py-2">...</span>`;
        }

        // Loop through nearby pages
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="changePage(${i})" 
                        class="px-4 py-2 page-number ${currentPage === i ? 'bg-indigo-700 text-white' : 'bg-white text-gray-700 border border-gray-300'} rounded hover:bg-indigo-500 hover:text-white">
                    ${i}
                </button>
            `;
        }

        // End ellipsis
        if (currentPage < totalPages - 3) {
            paginationHTML += `<span class="px-3 py-2">...</span>`;
        }

        // Always show last page
        paginationHTML += `
            <button onclick="changePage(${totalPages})" 
                    class="px-4 py-2 page-number ${currentPage === totalPages ? 'bg-indigo-700 text-white' : 'bg-white text-gray-700 border border-gray-300'} rounded hover:bg-indigo-500 hover:text-white">
                ${totalPages}
            </button>
        `;
    }

    paginationHTML += `
            <button onclick="changePage(${currentPage + 1})" 
                    class="px-4 py-2 bg-indigo-600 text-white rounded next-btn ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}"
                    ${currentPage === totalPages ? 'disabled' : ''}>
                <span class="flex items-center">
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            </button>
        </div>
        <div class="pagination-info mt-2">
            Page ${currentPage} of ${totalPages}
        </div>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Function to change page
function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    fetchBlogs(currentPage);
    
    // Scroll to the top of the blog container
    const blogContainer = document.getElementById("blog-container");
    if (blogContainer) {
        blogContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Function to edit a blog - updated to handle encoded parameters
function editBlog(id, encodedTitle, encodedContent, encodedImage) {
    const title = decodeURIComponent(encodedTitle || '');
    const content = decodeURIComponent(encodedContent || '');
    const image = decodeURIComponent(encodedImage || '');
    
    document.getElementById("blogId").value = id;
    document.getElementById("title").value = title;
    document.getElementById("content").value = content;
    
    // If we have an image preview element, update it
    const imagePreview = document.getElementById("image-preview");
    const fileName = document.getElementById("file-name");
    
    if (imagePreview && fileName && image) {
        // Extract the filename from the image URL path
        const imageName = image.split('/').pop();
        if (imageName) {
            fileName.textContent = imageName;
            imagePreview.classList.remove('hidden');
        }
    }
    
    document.getElementById("submitButton").innerText = "Update Blog";
    
    // Scroll to form
    document.querySelector(".blog-form-section").scrollIntoView({ behavior: "smooth" });
}

// Function to update a blog
async function updateBlog(id, formData) {
    try {
        // Check authentication first
        if (!isAuthenticated()) {
            throw new Error("No authentication token, authorization denied");
        }
        
        const token = getAuthToken();
        
        const response = await fetch(`${apiUrl}/blogs/${id}`, {
            method: "PUT",
            body: formData,
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            throw new Error("Authentication expired. Please login again.");
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update blog");
        }
        alert("Blog updated successfully!");
    } catch (error) {
        console.error("Error updating blog:", error);
        
        if (error.message.includes("No authentication token") || 
            error.message.includes("Authentication expired")) {
            // Show login prompt
            if (confirm("You need to be logged in to update blogs. Go to login page?")) {
                redirectToLogin();
            }
        } else {
            alert(error.message);
        }
    }
}

// Function to delete a blog
async function deleteBlog(id) {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    
    try {
        // Check authentication first
        if (!isAuthenticated()) {
            throw new Error("No authentication token, authorization denied");
        }
        
        const token = getAuthToken();
        
        const response = await fetch(`${apiUrl}/blogs/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            mode: 'cors',
            credentials: 'include'
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            throw new Error("Authentication expired. Please login again.");
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete blog");
        }
        
            alert("Blog deleted successfully!");
        fetchBlogs(currentPage); // Refresh the blog list
        } catch (error) {
            console.error("Error deleting blog:", error);
        
        if (error.message.includes("No authentication token") || 
            error.message.includes("Authentication expired")) {
            // Show login prompt
            if (confirm("You need to be logged in to delete blogs. Go to login page?")) {
                redirectToLogin();
            }
        } else {
            alert(error.message);
        }
    }
}

// Function to display network-specific error with more user-friendly options
function displayNetworkError(message) {
    const blogContainer = document.getElementById("blog-container");
    if (!blogContainer) return;
    
    // Clear the container first
    blogContainer.innerHTML = "";
    
    // Add error message with retry button and server status check
    blogContainer.innerHTML = `
        <div class="col-span-full bg-red-50 p-6 rounded-lg border border-red-200">
            <div class="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-semibold text-red-700">Server Connection Error</h3>
            </div>
            <p class="text-red-600 mb-4">${message}</p>
            <div class="bg-red-100 p-3 rounded mb-4 text-sm">
                <p><strong>Troubleshooting Steps:</strong></p>
                <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li>Check if the backend server is running on port 5000</li>
                    <li>Make sure MongoDB is running and accessible</li>
                    <li>Check your network connection</li>
                    <li>Ensure CORS is properly configured on the server</li>
                </ul>
            </div>
            <div class="flex flex-wrap gap-3">
                <button onclick="retryFetch()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try Again
                    </span>
                </button>
                <button onclick="showTestData()" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Use Sample Data
                    </span>
                </button>
                <button onclick="window.location.href = 'index.html'" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
                        </svg>
                        Return Home
                    </span>
                </button>
            </div>
        </div>
    `;
}
