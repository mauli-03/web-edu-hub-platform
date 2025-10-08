// Blog detail page - with real API data
document.addEventListener("DOMContentLoaded", () => {
    // Load navbar first
    loadNavbar();
    
    // Load footer
    if (typeof loadFooter === 'function') {
        loadFooter();
    }
    
    // Add event listeners for interactive elements
    setupEventListeners();
    
    // Get blog ID from URL or show error
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');

    if (blogId) {
        // Show loading state
        showLoadingState();
        // Load blog details
        fetchBlogDetails(blogId);
    } else {
        displayError("Blog ID is missing from the URL. Please try accessing from the blogs page.");
    }

    // Set up animation observers
    setupAnimations();
});

// Use window.API_URL if it exists, otherwise default to this value
const apiUrl = window.API_URL || "http://localhost:5000/api";

// Function to check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
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

// Define fallback image data URLs for error handling
const fallbackImageDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjBweCIgdGV4dD0iTm8gSW1hZ2UiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
const errorImageDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2ZkZWNlYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjBweCIgdGV4dD0iSW1hZ2UgTm90IEZvdW5kIiBmaWxsPSIjZTc0YzNjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+";
const avatarImageDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjMwIiByPSIxMiIgZmlsbD0iIzk5OTk5OSIvPjxwYXRoIGQ9Ik02NSw2MiBDNjUsNDkgNTMsNTAgNDAsNTAgQzI3LDUwIDE1LDQ5IDE1LDYyIEMxNSw3MiA0MCw3NiA0MCw3NiBDNDAsNzYgNjUsNzIgNjUsNjIgWiIgZmlsbD0iIzk5OTk5OSIvPjwvc3ZnPg==";

// Sample blog data to use as fallback
const sampleBlog = {
    _id: 'sample123',
    title: 'Modern Web Development: A Comprehensive Guide',
    content: `
        <h2>Introduction to Web Development</h2>
        <p>Web development has evolved dramatically over the past decade. What used to be simple HTML pages are now complex applications with rich user interfaces and powerful backend systems.</p>
        
        <p>In this comprehensive guide, we'll explore the full stack of web development, from frontend technologies to backend systems and everything in between.</p>
        
        <h2>Frontend Development</h2>
        <p>Modern frontend development revolves around three core technologies:</p>
        <ul>
            <li>HTML5 - Providing structure</li>
            <li>CSS3 - For styling and animations</li>
            <li>JavaScript - Adding interactivity and behavior</li>
        </ul>
        
        <p>Frameworks like React, Angular, and Vue.js have become essential tools for creating complex user interfaces. They offer component-based architecture that improves code reusability and maintainability.</p>
        
        <blockquote>The best frontend code is not just about what users see, but also about creating maintainable systems that can evolve over time.</blockquote>
        
        <h2>Backend Development</h2>
        <p>Backend development focuses on server-side logic, database management, and API development. Popular technologies include:</p>
        <ul>
            <li>Node.js - JavaScript runtime for server-side development</li>
            <li>Express - Minimal framework for building web applications</li>
            <li>MongoDB - NoSQL database solution</li>
            <li>PostgreSQL - Powerful relational database</li>
        </ul>
        
        <p>RESTful APIs and GraphQL have transformed how frontend and backend systems communicate, enabling more efficient data exchange and better user experiences.</p>
        
        <h2>Future Trends</h2>
        <p>The web development landscape continues to evolve rapidly. Some emerging trends to watch include:</p>
        <ul>
            <li>Serverless architectures</li>
            <li>JAMstack development</li>
            <li>Progressive Web Apps (PWAs)</li>
            <li>AI-powered development tools</li>
        </ul>
        
        <p>By staying informed about these trends and continuously learning, developers can build more efficient, scalable, and user-friendly web applications.</p>
    `,
    image: fallbackImageDataUrl,
    createdAt: new Date(Date.now() - 7*24*60*60*1000).toISOString(), // 7 days ago
    tags: ['Web Development', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
    author: {
        name: 'John Doe',
        role: 'Senior Developer',
        bio: 'Full-stack developer with 10+ years of experience in web technologies. Speaker, writer, and open source contributor.',
        avatar: avatarImageDataUrl
    },
    comments: [
        {
            id: 'comment1',
            name: 'Sarah Williams',
            email: 'sarah@example.com',
            content: 'Great article! I especially liked the section about frontend frameworks.',
            createdAt: new Date(Date.now() - 4*24*60*60*1000).toISOString()
        },
        {
            id: 'comment2',
            name: 'Michael Chen',
            email: 'michael@example.com',
            content: 'Would love to see more examples about GraphQL implementation. Do you have any tutorials on that?',
            createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString()
        },
        {
            id: 'comment3',
            name: 'Lisa Johnson',
            email: 'lisa@example.com',
            content: 'This was exactly what I needed as I start my journey into web development. Thank you!',
            createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString()
        }
    ]
};

// Setup event listeners for interactive components
function setupEventListeners() {
    // Comment form submission
    const commentForm = document.getElementById("comment-form");
    if (commentForm) {
        commentForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const blogId = new URLSearchParams(window.location.search).get('id');
            submitComment(blogId);
        });
    }

    // Share buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = e.currentTarget.querySelector('i').className.split(' ')[1].split('-')[1];
            shareBlog(platform);
        });
    });

    // Back to top button
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
        window.addEventListener("scroll", () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add("opacity-100", "visible");
                backToTopBtn.classList.remove("opacity-0", "invisible");
            } else {
                backToTopBtn.classList.remove("opacity-100", "visible");
                backToTopBtn.classList.add("opacity-0", "invisible");
            }
        });

        backToTopBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

// Set up animation observers for elements
function setupAnimations() {
    // Add visibility observer for sections
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    
                    // Add staggered animations for children
                    if (entry.target.classList.contains('stagger-children')) {
                        const children = entry.target.querySelectorAll('.stagger-item');
                        children.forEach((child, index) => {
                            setTimeout(() => {
                                child.classList.add('visible');
                            }, 100 * index);
                        });
                    }
                }
            });
        },
        { threshold: 0.1 }
    );

    // Observe all page sections
    document.querySelectorAll(".page-section").forEach((section) => {
        observer.observe(section);
    });
}

// Show loading state for blog content
function showLoadingState() {
    // Hero section loading
    const heroSection = document.getElementById("blog-hero");
    if (heroSection) {
        heroSection.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))`;
        document.getElementById("blog-title").innerHTML = `
            <div class="animate-pulse bg-gray-200 h-8 w-3/4 rounded"></div>
        `;
        document.getElementById("blog-date").innerHTML = `
            <div class="animate-pulse bg-gray-200 h-4 w-1/4 rounded"></div>
        `;
        document.getElementById("blog-author").innerHTML = `
            <div class="animate-pulse bg-gray-200 h-4 w-1/4 rounded"></div>
        `;
    }

    // Content section loading
    const contentContainer = document.getElementById("blog-content");
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div class="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div class="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div class="h-20 bg-gray-200 rounded w-full mb-6"></div>
                
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div class="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div class="h-4 bg-gray-200 rounded w-full mb-4"></div>
            </div>
        `;
    }

    // Sidebar loading
    const authorInfoSection = document.getElementById("author-info");
    if (authorInfoSection) {
        authorInfoSection.innerHTML = `
            <div class="animate-pulse flex items-center mb-4">
                <div class="rounded-full bg-gray-200 h-12 w-12 mr-3"></div>
                <div>
                    <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
            <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        `;
    }
    
    // Related blogs loading
    const relatedBlogsContainer = document.getElementById("related-blogs");
    if (relatedBlogsContainer) {
        relatedBlogsContainer.innerHTML = `
            <div class="animate-pulse mb-4">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div class="animate-pulse mb-4">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div class="animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
        `;
    }
}

// Fetch blog details from the API
async function fetchBlogDetails(blogId) {
    try {
        // Check if the blog ID looks like a valid MongoDB ObjectId (24 hex characters)
        const validObjectIdPattern = /^[0-9a-fA-F]{24}$/;
        if (!validObjectIdPattern.test(blogId)) {
            throw new Error("Invalid blog ID format. Please check the URL.");
        }

        const response = await fetch(`${apiUrl}/blogs/${blogId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include'
        }).catch(error => {
            // This specifically catches network errors like when server is down
            console.error("Network error:", error);
            throw new Error("Server connection failed. Please check if the backend server is running.");
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `HTTP error! Status: ${response.status}${errorData.error ? ` - ${errorData.error}` : ''}`
            );
        }

        const data = await response.json();
        
        if (data.success && data.blog) {
            displayBlogDetails(data.blog);
            
            // Display related blogs if available
            if (data.relatedBlogs && data.relatedBlogs.length > 0) {
                displayRelatedBlogs(data.relatedBlogs);
            } else {
                // If no related blogs, try to fetch popular blogs instead
                fetchPopularBlogs();
            }
        } else {
            displayError(data.error || "Failed to load blog details.", blogId);
        }
    } catch (error) {
        console.error("Error fetching blog details:", error);
        displayError(error.message || "Failed to load blog. Please check your connection and try again.", blogId);
    }
}

// Fetch popular blogs if no related blogs are available
async function fetchPopularBlogs() {
    try {
        const response = await fetch(`${apiUrl}/blogs?sort=popular&limit=3`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.blogs && data.blogs.length > 0) {
            // Filter out current blog if present
            const currentBlogId = new URLSearchParams(window.location.search).get('id');
            const otherBlogs = data.blogs.filter(blog => blog._id !== currentBlogId);
            
            if (otherBlogs.length > 0) {
                displayRelatedBlogs(otherBlogs.slice(0, 3));
            }
        }
    } catch (error) {
        console.error("Error fetching popular blogs:", error);
        // Show fallback blogs
        displayRelatedBlogs([
            {
                _id: 'sample1',
                title: 'Getting Started with Web Development',
                image: null,
                createdAt: new Date().toISOString(),
            },
            {
                _id: 'sample2',
                title: 'The Power of Modern JavaScript',
                image: null,
                createdAt: new Date().toISOString(),
            },
            {
                _id: 'sample3',
                title: 'Responsive Design Principles',
                image: null,
                createdAt: new Date().toISOString(),
            }
        ]);
    }
}

// Display blog details in the UI
function displayBlogDetails(blog) {
    // Update hero section
    const heroSection = document.getElementById("blog-hero");
    if (heroSection) {
        let heroBackground = '';
        
        if (blog.image) {
            // The backend already provides absolute URLs, so we can use them directly
            heroBackground = `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4)), url('${blog.image}')`;
        } else {
            heroBackground = `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)), url('${fallbackImageDataUrl}')`;
        }
        
        heroSection.style.backgroundImage = heroBackground;
        
        // Set hero content
        document.getElementById("blog-title").textContent = blog.title;
        document.getElementById("blog-date").textContent = new Date(blog.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById("blog-author").textContent = blog.author ? blog.author.name : 'Anonymous';
        
        // Update meta tags for SEO and sharing
        document.title = `${blog.title} - EduHub`;
        
        // Set meta tags for SEO and social sharing
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', blog.content.substring(0, 160).replace(/<[^>]*>/g, '') + '...');
        }
        
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', blog.title);
        }
        
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.setAttribute('content', blog.content.substring(0, 160).replace(/<[^>]*>/g, '') + '...');
        }
        
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
            ogImage.setAttribute('content', blog.image || fallbackImageDataUrl);
        }
    }
    
    // Update content section
    const contentContainer = document.getElementById("blog-content");
    if (contentContainer) {
        // Process content to add styling to elements
        let processedContent = blog.content;
        
        // Add styling to blockquotes
        processedContent = processedContent.replace(
            /<blockquote>(.*?)<\/blockquote>/gs, 
            '<blockquote class="border-l-4 border-primary pl-4 italic my-6 text-gray-700">$1</blockquote>'
        );
        
        contentContainer.innerHTML = processedContent;
        
        // Add classes to content elements
        contentContainer.querySelectorAll('h2').forEach(h2 => {
            h2.classList.add('text-2xl', 'font-bold', 'mt-8', 'mb-4', 'text-gray-800');
        });
        
        contentContainer.querySelectorAll('h3').forEach(h3 => {
            h3.classList.add('text-xl', 'font-bold', 'mt-6', 'mb-3', 'text-gray-800');
        });
        
        contentContainer.querySelectorAll('p').forEach(p => {
            p.classList.add('my-4', 'leading-relaxed', 'text-gray-700');
        });
        
        contentContainer.querySelectorAll('ul, ol').forEach(list => {
            list.classList.add('my-4', 'ml-6');
            list.querySelectorAll('li').forEach(item => {
                item.classList.add('mb-2', 'text-gray-700');
            });
        });
        
        contentContainer.querySelectorAll('img').forEach(img => {
            img.classList.add('my-6', 'rounded-lg', 'shadow-md', 'mx-auto');
            img.loading = 'lazy';
            
            // Add fallback for images
            img.onerror = function() {
                this.onerror = null;
                this.src = errorImageDataUrl;
            };
        });
    }
    
    // Display tags if available
    const tagsContainer = document.getElementById("blog-tags");
    if (tagsContainer && blog.tags && blog.tags.length > 0) {
        tagsContainer.innerHTML = '';
        blog.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-pill';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
    } else if (tagsContainer) {
        tagsContainer.classList.add('hidden');
    }
    
    // Display author info
    const authorInfoSection = document.getElementById("author-info");
    if (authorInfoSection) {
        authorInfoSection.innerHTML = `
            <div class="flex items-center mb-4">
                <img src="${avatarImageDataUrl}" alt="${blog.author?.name || 'Anonymous'}" class="w-12 h-12 rounded-full object-cover border-2 border-primary" onerror="this.onerror=null; this.src='${errorImageDataUrl}'">
                <div class="ml-3">
                    <h3 class="font-bold text-lg">${blog.author?.name || 'Anonymous'}</h3>
                    <p class="text-sm text-gray-600">${blog.author?.role || 'Author'}</p>
                </div>
            </div>
            <p class="text-gray-700">${blog.author?.bio || 'No author bio available.'}</p>
        `;
    }
    
    // Display comments if available
    if (blog.comments && blog.comments.length > 0) {
        displayComments(blog.comments);
    } else {
        // Show no comments message
        const commentsContainer = document.getElementById("comments-container");
        if (commentsContainer) {
            commentsContainer.innerHTML = `
                <div class="bg-gray-50 p-6 rounded-lg text-center">
                    <p class="text-gray-500">No comments yet. Be the first to comment!</p>
                </div>
            `;
        }
    }

    // Update author section
    const authorName = document.getElementById("author-name");
    const authorRole = document.getElementById("author-role");
    const authorBio = document.getElementById("author-bio");
    const authorAvatar = document.getElementById("author-avatar");
    
    if (authorName) authorName.textContent = blog.author?.name || 'Anonymous';
    if (authorRole) authorRole.textContent = blog.author?.role || 'Content Creator';
    if (authorBio) authorBio.textContent = blog.author?.bio || 'Expert in educational content creation and knowledge sharing.';
    
    // Fix author avatar
    if (authorAvatar) {
        // Use data URL as default
        authorAvatar.src = avatarImageDataUrl;
        
        // If author avatar is available from API, try to use it
        if (blog.author?.avatar) {
            authorAvatar.onerror = function() {
                this.onerror = null;
                this.src = avatarImageDataUrl;
            };
            authorAvatar.src = blog.author.avatar;
        }
    }
}

// Display comments
function displayComments(comments) {
    const commentsContainer = document.getElementById("comments-list");
    if (!commentsContainer) return;
    
    commentsContainer.innerHTML = '';
    
    // Update comment count in title
    const commentTitle = document.querySelector('#comments-section h3');
    if (commentTitle) {
        commentTitle.innerHTML = `Comments <span class="text-primary-color">(${comments.length})</span>`;
    }
    
    comments.forEach((comment, index) => {
        const commentElement = document.createElement('div');
        commentElement.classList.add(
            'comment-item', 'bg-white', 'p-6', 'rounded-xl', 'shadow-sm',
            'border', 'border-gray-100', 'animate__animated', 'animate__fadeIn'
        );
        commentElement.style.animationDelay = `${0.1 * index}s`;
        
        const avatarContent = comment.user?.avatar ? 
            `<img src="${comment.user.avatar}" alt="${comment.name}" class="w-10 h-10 rounded-full object-cover">` :
            `<span class="font-bold">${comment.name.charAt(0).toUpperCase()}</span>`;
        
        commentElement.innerHTML = `
            <div class="flex items-start">
                <div class="bg-primary-color text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                    ${avatarContent}
                </div>
                <div class="flex-1">
                    <div class="flex flex-wrap justify-between items-center mb-2">
                        <h5 class="font-semibold text-gray-800">${comment.name}</h5>
                        <span class="text-xs text-gray-500">${formatDate(comment.createdAt)}</span>
                    </div>
                    <p class="text-gray-700">${comment.content}</p>
                </div>
            </div>
        `;
        
        commentsContainer.appendChild(commentElement);
    });
}

// Display related blogs
function displayRelatedBlogs(relatedBlogs) {
    const relatedBlogsContainer = document.getElementById("related-blogs");
    if (!relatedBlogsContainer) return;
    
    relatedBlogsContainer.innerHTML = '';
    
    relatedBlogs.forEach(blog => {
        // Handle image source correctly
        let imageUrl = fallbackImageDataUrl; // Use data URL as fallback
        
        if (blog.image) {
            // The backend already provides absolute URLs, so we can use them directly
            imageUrl = blog.image;
        }
        
        const relatedBlogHTML = `
            <a href="blog-detail.html?id=${blog._id}" class="block mb-4 hover:bg-gray-50 p-2 rounded transition-colors">
                <div class="flex items-center">
                    <img src="${imageUrl}" alt="${blog.title}" class="w-16 h-16 object-cover rounded mr-3" onerror="this.onerror=null; this.src='${errorImageDataUrl}'">
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-1 line-clamp-2">${blog.title}</h4>
                        <span class="text-xs text-gray-500">${new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </a>
        `;
        
        relatedBlogsContainer.innerHTML += relatedBlogHTML;
    });
}

// Submit comment to the API
async function submitComment(blogId) {
    const nameInput = document.getElementById("comment-name");
    const emailInput = document.getElementById("comment-email");
    const contentInput = document.getElementById("comment-content");
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!name || !email || !content) {
        showError('Please fill in all fields');
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('#comment-form button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitButton.disabled = true;
    
    try {
        const response = await fetch(`${apiUrl}/blogs/${blogId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name, email, content }),
            mode: 'cors',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        // Reset button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        
        if (response.ok && data.success) {
            // Show success message
            showSuccess('Your comment has been posted successfully!');
            
            // Clear form
            nameInput.value = '';
            emailInput.value = '';
            contentInput.value = '';
            
            // Refresh blog details to show the new comment
            fetchBlogDetails(blogId);
        } else {
            showError(data.error || 'Failed to post comment. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        showError('Network error. Please check your connection and try again.');
    }
}

// Show error message with retry options
function displayError(message, blogId) {
    const contentContainer = document.getElementById("blog-content");
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded animate__animated animate__fadeIn">
                <div class="flex items-center mb-3">
                    <i class="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
                    <h3 class="font-semibold">Error Loading Blog</h3>
                </div>
                <p class="mb-4">${message}</p>
                <div class="flex flex-wrap gap-3">
                    <button onclick="window.location.reload()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                        <i class="fas fa-sync-alt mr-2"></i> Try Again
                    </button>
                    ${blogId ? `<button onclick="loadMockBlogData('${blogId}')" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                        <i class="fas fa-file-alt mr-2"></i> Show Sample Blog
                    </button>` : ''}
                    <a href="blogs.html" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i> Back to Blogs
                    </a>
                </div>
            </div>
        `;
    }
    
    // Clear hero section
    const heroSection = document.getElementById("blog-hero");
    if (heroSection) {
        heroSection.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))`;
        document.getElementById("blog-title").textContent = "Error";
        document.getElementById("blog-date").textContent = "";
        document.getElementById("blog-author").textContent = "";
    }
}

// Show error message on form
function showError(message) {
    const form = document.getElementById("comment-form");
    if (!form) return;
    
    // Remove any existing alerts
    const existingAlert = form.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.classList.add(
        'alert', 'bg-red-100', 'border-l-4', 'border-red-500', 'text-red-700', 
        'p-4', 'mb-6', 'rounded', 'animate__animated', 'animate__fadeIn'
    );
    
    alert.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    form.insertBefore(alert, form.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.classList.add('animate__fadeOut');
        setTimeout(() => alert.remove(), 500);
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const form = document.getElementById("comment-form");
    if (!form) return;
    
    // Remove any existing alerts
    const existingAlert = form.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.classList.add(
        'alert', 'rounded', 'p-4', 'mb-6', 'text-white', 'animate__animated', 'animate__fadeIn'
    );
    alert.style.background = 'linear-gradient(135deg, var(--primary-color), var(--accent-color))';
    
    alert.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    form.insertBefore(alert, form.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.classList.add('animate__fadeOut');
        setTimeout(() => alert.remove(), 500);
    }, 5000);
}

// Share blog on various platforms
function shareBlog(platform) {
    const blogTitle = document.getElementById('blog-title').textContent;
    const blogUrl = window.location.href;
    
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blogTitle)}&url=${encodeURIComponent(blogUrl)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(blogTitle + ' ' + blogUrl)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(blogUrl)}&title=${encodeURIComponent(blogTitle)}`;
            break;
        case 'envelope':
            shareUrl = `mailto:?subject=${encodeURIComponent(blogTitle)}&body=${encodeURIComponent('Check out this article: ' + blogUrl)}`;
            break;
        default:
            console.log('Unknown platform:', platform);
            return;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank');
        showToast(`Shared on ${platform}!`, platform);
    }
}

// Show toast notification
function showToast(message, platform) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.classList.add(
        'toast', 'fixed', 'bottom-6', 'right-6', 'p-4', 'rounded-lg', 'shadow-lg',
        'text-white', 'z-50', 'animate__animated', 'animate__fadeInUp'
    );
    
    // Set background color based on platform
    let bgColor;
    switch (platform) {
        case 'facebook':
            bgColor = '#3b5998';
            break;
        case 'twitter':
            bgColor = '#1da1f2';
            break;
        case 'whatsapp':
            bgColor = '#25D366';
            break;
        case 'linkedin':
            bgColor = '#0077b5';
            break;
        case 'envelope':
            bgColor = '#FF6B35';
            break;
        default:
            bgColor = '#FF6B35';
    }
    
    toast.style.backgroundColor = bgColor;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-share-alt mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        toast.classList.add('animate__fadeOutDown');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Function to load mock blog data as a fallback
window.loadMockBlogData = function(blogId) {
    // Create mock data only if needed (when in showSampleData mode)
    function createMockData() {
        // Mock related blogs
        const mockRelatedBlogs = [
            {
                _id: 'related1',
                title: 'Introduction to GraphQL APIs',
                image: fallbackImageDataUrl,
                createdAt: new Date(Date.now() - 14*24*60*60*1000).toISOString()
            },
            {
                _id: 'related2',
                title: 'Mastering CSS Grid Layout',
                image: fallbackImageDataUrl,
                createdAt: new Date(Date.now() - 21*24*60*60*1000).toISOString()
            },
            {
                _id: 'related3',
                title: 'The Future of JavaScript: What to Expect',
                image: fallbackImageDataUrl,
                createdAt: new Date(Date.now() - 28*24*60*60*1000).toISOString()
            }
        ];
        
        // Display the mock data
        displayBlogDetails(sampleBlog);
        displayRelatedBlogs(mockRelatedBlogs);
        
        // Show notification that we're using sample data
        const notificationDiv = document.createElement('div');
        notificationDiv.classList.add(
            'fixed', 'bottom-4', 'right-4', 'bg-yellow-100', 'border-l-4', 
            'border-yellow-500', 'text-yellow-700', 'p-4', 'rounded', 'shadow-lg',
            'animate__animated', 'animate__fadeIn', 'z-50'
        );
        
        notificationDiv.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                </div>
                <div>
                    <p class="font-semibold">Sample Data</p>
                    <p class="text-sm">Showing sample blog content. Connect to a backend server to see actual blogs.</p>
                    <button class="text-sm text-yellow-800 underline mt-1" onclick="this.parentNode.parentNode.parentNode.remove()">Dismiss</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notificationDiv);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            notificationDiv.classList.add('animate__fadeOut');
            setTimeout(() => notificationDiv.remove(), 1000);
        }, 10000);
    }

    // If in showSampleData mode, create mock data
    if (showSampleData) {
        createMockData();
    } else {
        // If not in showSampleData mode, fetch real data
        fetchBlogDetails(blogId);
    }
};

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
