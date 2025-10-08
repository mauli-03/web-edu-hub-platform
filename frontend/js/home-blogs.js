// home-blogs.js - Handles the display of blog posts on the home page
const API_URL = "http://localhost:5000/api";
const HOME_BLOG_LIMIT = 3; // Force display of exactly 3 blogs

// Fallback image data URLs
const fallbackImageDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjBweCIgdGV4dD0iTm8gSW1hZ2UiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
const errorImageDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2ZkZWNlYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjBweCIgdGV4dD0iSW1hZ2UgTm90IEZvdW5kIiBmaWxsPSIjZTc0YzNjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+";

// Sample blogs for fallback when API is not available
const sampleBlogs = [
    {
        _id: 'sample1',
        title: 'Getting Started with Web Development',
        content: 'Web development is an exciting field that combines creativity with technical skills. Learn the basics of HTML, CSS, and JavaScript to begin your journey.',
        image: null,
        createdAt: new Date().toISOString(),
        author: { name: 'Sample Author' }
    },
    {
        _id: 'sample2',
        title: 'The Power of Modern JavaScript',
        content: 'JavaScript has evolved significantly over the years. Discover how modern features like arrow functions, destructuring, and async/await can improve your code.',
        image: null,
        createdAt: new Date().toISOString(),
        author: { name: 'Sample Author' }
    },
    {
        _id: 'sample3',
        title: 'Responsive Design Principles',
        content: 'Creating websites that look great on all devices is essential. Learn key responsive design principles and techniques to enhance user experience.',
        image: null,
        createdAt: new Date().toISOString(),
        author: { name: 'Sample Author' }
    }
];

// Global loading state
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
    fetchHomePageBlogs();
});

// Function to fetch blogs for the homepage
async function fetchHomePageBlogs() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) loadingElement.style.display = 'block';
    
    if (isLoading) return;
    isLoading = true;

    try {
        const response = await fetch(`${API_URL}/blogs?page=1&limit=${HOME_BLOG_LIMIT}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !Array.isArray(data.blogs)) {
            console.error('Invalid data received from server:', data);
            throw new Error('Invalid data format received from server');
        }

        displayHomeBlogs(data.blogs);
    } catch (error) {
        console.error('Error fetching home page blogs:', error);
        displayNetworkError();
    } finally {
        isLoading = false;
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

// Display network error message with fallback options
function displayNetworkError() {
    const blogContainer = document.getElementById("blog-container") || document.getElementById("featured-blogs-container");
    if (!blogContainer) return;

    blogContainer.innerHTML = `
        <div class="col-span-full p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 class="text-lg font-medium text-red-800 mb-2">Unable to connect to the server</h3>
            <p class="text-red-700 mb-4">We couldn't fetch the latest blogs. This could be due to:</p>
            <ul class="list-disc pl-5 text-red-700 mb-4">
                <li>The backend server is not running</li>
                <li>Network connectivity issues</li>
                <li>CORS policy restrictions</li>
            </ul>
            <div class="flex flex-wrap gap-3">
                <button id="retry-fetch" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    <i class="fas fa-redo mr-2"></i>Retry
                </button>
                <button id="use-sample-data" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                    <i class="fas fa-database mr-2"></i>Use Sample Data
                </button>
            </div>
        </div>
    `;

    // Set up event listeners for buttons
    document.getElementById('retry-fetch').addEventListener('click', fetchHomePageBlogs);
    document.getElementById('use-sample-data').addEventListener('click', () => displayHomeBlogs(sampleBlogs));
}

// Function to display blogs on the home page
function displayHomeBlogs(blogs) {
    const blogContainer = document.getElementById("blog-container") || document.getElementById("featured-blogs-container");
    if (!blogContainer) return;

    blogContainer.innerHTML = "";

    if (!Array.isArray(blogs) || blogs.length === 0) {
        blogContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500">No blogs found.</p>
            </div>
        `;
        return;
    }

    // Ensure we only display up to 3 blogs
    const limitedBlogs = blogs.slice(0, HOME_BLOG_LIMIT);
    
    limitedBlogs.forEach((blog) => {
        // Handle image source correctly
        let imageUrl = fallbackImageDataUrl; // Use data URL as fallback
        
        if (blog.image) {
            // Check if the image URL is already absolute
            if (blog.image.startsWith('http')) {
                imageUrl = blog.image;
            } 
            // Handle server uploads - ensure proper path resolution
            else if (blog.image.startsWith('/uploads')) {
                // API_URL without the /api part to get server root
                const serverRoot = API_URL.replace(/\/api$/, '');
                imageUrl = `${serverRoot}${blog.image}`;
                
                // Log image URL for debugging
                console.log('Home blog image path resolved to:', imageUrl);
            }
            // Fallback to data URL if we can't determine the format
            else {
                console.warn('Unknown image path format in home blog:', blog.image);
                imageUrl = fallbackImageDataUrl;
            }
        }

        // Escape content for safe HTML display
        const safeTitle = blog.title ? escapeHTML(blog.title) : '';
        const safeContent = blog.content ? escapeHTML(blog.content.substring(0, 100) + '...') : '';
        const safeAuthorName = blog.author && blog.author.name ? escapeHTML(blog.author.name) : 'Anonymous';

        const blogHTML = `
            <div class="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div class="relative">
                    <img src="${imageUrl}" alt="${safeTitle}" class="w-full h-48 object-cover" 
                         onerror="this.onerror=null; this.src='${errorImageDataUrl}'">
                    <div class="absolute top-0 right-0 bg-indigo-600 text-white px-2 py-1 text-xs rounded-bl-lg">
                        Latest
                    </div>
                </div>
                <div class="p-4">
                    <div class="flex items-center text-gray-500 text-xs mb-2">
                        <span><i class="far fa-calendar-alt mr-1"></i>${new Date(blog.createdAt).toLocaleDateString()}</span>
                        <span class="mx-2">•</span>
                        <span><i class="far fa-user mr-1"></i>${safeAuthorName}</span>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800">${safeTitle}</h3>
                    <p class="text-sm text-gray-600 mt-2">${safeContent}</p>
                    <a href="blog-detail.html?id=${blog._id}" class="inline-block mt-3 text-indigo-600 hover:text-indigo-800 font-medium">
                        Read More <span class="ml-1">→</span>
                    </a>
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

// Add an alias for displayHomePageBlogs function to make both function names work
const displayHomePageBlogs = displayHomeBlogs;

// Home blog pagination is removed since we're only showing the latest 3 blogs 