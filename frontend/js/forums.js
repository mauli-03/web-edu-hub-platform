// Forums page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const forumSearch = document.getElementById('forum-search-box');
    const categorySelect = document.getElementById('forum-category');
    const sortSelect = document.getElementById('forum-sort');
    const forumThreads = document.querySelectorAll('.forum-thread');
    const quickFilterButtons = document.querySelectorAll('.filter-btn');
    const paginationItems = document.querySelectorAll('.pagination-item');
    const likeBtns = document.querySelectorAll('.like-btn');
    const shareBtns = document.querySelectorAll('.share-btn');
    
    // Initialize forum threads with animation
    forumThreads.forEach((thread, index) => {
        // Add initial invisible state
        thread.style.opacity = '0';
        thread.style.transform = 'translateY(20px)';
        
        // Set animation delay based on index for staggered effect
        setTimeout(() => {
            thread.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            thread.style.opacity = '1';
            thread.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    // Search and filtering functionality
    function filterForums() {
        const searchQuery = forumSearch.value.toLowerCase();
        const categoryFilter = categorySelect.value;
        const sortOption = sortSelect.value;
        
        let visibleCount = 0;
        
        forumThreads.forEach(thread => {
            const threadTitle = thread.querySelector('h3').textContent.toLowerCase();
            const threadContent = thread.querySelector('p').textContent.toLowerCase();
            const threadCategory = thread.dataset.category;
            
            // Check if thread matches search query and category filter
            const matchesSearch = threadTitle.includes(searchQuery) || threadContent.includes(searchQuery);
            const matchesCategory = categoryFilter === 'all' || threadCategory === categoryFilter;
            
            if (matchesSearch && matchesCategory) {
                thread.style.display = 'block';
                visibleCount++;
            } else {
                thread.style.display = 'none';
            }
        });
        
        // Show message if no results found
        const noResultsElement = document.querySelector('.no-results');
        if (visibleCount === 0) {
            if (!noResultsElement) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try adjusting your search or filter to find what you're looking for.</p>
                `;
                document.querySelector('.forum-list').appendChild(noResults);
            }
        } else {
            if (noResultsElement) {
                noResultsElement.remove();
            }
        }
        
        // Sort threads based on selected option
        sortThreads(sortOption);
    }
    
    // Sort threads based on selected option
    function sortThreads(sortOption) {
        const threadList = document.querySelector('.forum-list');
        const threads = Array.from(forumThreads);
        
        // Only sort visible threads
        const visibleThreads = threads.filter(thread => thread.style.display !== 'none');
        
        switch (sortOption) {
            case 'recent':
                visibleThreads.sort((a, b) => {
                    const dateA = new Date(a.querySelector('.thread-date span').textContent);
                    const dateB = new Date(b.querySelector('.thread-date span').textContent);
                    return dateB - dateA;
                });
                break;
            case 'popular':
                visibleThreads.sort((a, b) => {
                    const likesA = parseInt(a.querySelector('.like-btn').textContent.match(/\d+/)[0]);
                    const likesB = parseInt(b.querySelector('.like-btn').textContent.match(/\d+/)[0]);
                    return likesB - likesA;
                });
                break;
            case 'active':
                visibleThreads.sort((a, b) => {
                    const commentsA = parseInt(a.querySelector('.replies').textContent.match(/\d+/)[0]);
                    const commentsB = parseInt(b.querySelector('.replies').textContent.match(/\d+/)[0]);
                    return commentsB - commentsA;
                });
                break;
        }
        
        // Re-append threads in the new order
        visibleThreads.forEach(thread => {
            threadList.appendChild(thread);
        });
    }
    
    // Quick filters functionality
    quickFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            quickFilterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            // Special case for trending filter
            if (filter === 'trending') {
                forumThreads.forEach(thread => {
                    const likes = parseInt(thread.querySelector('.like-btn').textContent.match(/\d+/)[0]);
                    const views = parseInt(thread.querySelector('.views').textContent.match(/\d+/)[0]);
                    
                    // Show thread if it has more than 30 likes or 200 views
                    if (likes > 30 || views > 200) {
                        thread.style.display = 'block';
                    } else {
                        thread.style.display = 'none';
                    }
                });
            } else {
                // Apply regular category filter
                forumThreads.forEach(thread => {
                    if (filter === 'all' || thread.dataset.category === filter) {
                        thread.style.display = 'block';
                    } else {
                        thread.style.display = 'none';
                    }
                });
            }
            
            // Reset search box and category select
            forumSearch.value = '';
            categorySelect.value = 'all';
        });
    });
    
    // Pagination functionality
    paginationItems.forEach(item => {
        item.addEventListener('click', function() {
            // Skip if it's the ellipsis or already active
            if (this.innerHTML.includes('ellipsis') || this.classList.contains('active')) {
                return;
            }
            
            // Remove active class from all pagination items
            paginationItems.forEach(pItem => pItem.classList.remove('active'));
            
            // Add active class to clicked pagination item
            this.classList.add('active');
            
            // In a real application, this would load the next page of results
            // For demonstration, we'll just scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Like button functionality
    likeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const likesText = this.textContent;
            const likesCount = parseInt(likesText.match(/\d+/)[0]);
            
            if (!this.classList.contains('active')) {
                // Like the post
                this.classList.add('active');
                this.innerHTML = `<i class="fas fa-thumbs-up"></i> Like (${likesCount + 1})`;
            } else {
                // Unlike the post
                this.classList.remove('active');
                this.innerHTML = `<i class="far fa-thumbs-up"></i> Like (${likesCount - 1})`;
            }
        });
    });
    
    // Share button functionality
    shareBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const thread = this.closest('.forum-thread');
            const threadTitle = thread.querySelector('h3').textContent;
            
            // Create a share dialog
            const shareDialog = document.createElement('div');
            shareDialog.className = 'share-dialog';
            shareDialog.innerHTML = `
                <div class="share-dialog-content">
                    <div class="share-dialog-header">
                        <h3>Share this discussion</h3>
                        <button class="close-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="share-options">
                        <button class="share-option facebook"><i class="fab fa-facebook-f"></i> Facebook</button>
                        <button class="share-option twitter"><i class="fab fa-twitter"></i> Twitter</button>
                        <button class="share-option linkedin"><i class="fab fa-linkedin-in"></i> LinkedIn</button>
                        <button class="share-option whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</button>
                    </div>
                    <div class="copy-link">
                        <input type="text" value="https://education-hub.com/forums/discussion/${thread.id}" readonly>
                        <button>Copy</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(shareDialog);
            
            // Add event listeners for share dialog
            shareDialog.querySelector('.close-btn').addEventListener('click', () => {
                shareDialog.remove();
            });
            
            shareDialog.querySelector('.copy-link button').addEventListener('click', function() {
                const input = shareDialog.querySelector('.copy-link input');
                input.select();
                document.execCommand('copy');
                
                // Change button text temporarily
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy';
                }, 2000);
            });
            
            // Close dialog when clicking outside
            shareDialog.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.remove();
                }
            });
        });
    });
    
    // New post submission
    function submitPost() {
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const category = document.getElementById('post-category').value;
        const anonymous = document.getElementById('post-anonymous').checked;
        
        if (!title || !content || !category) {
            alert('Please fill in all required fields!');
            return;
        }
        
        // In a real application, this would submit the post to the server
        alert('Your post has been submitted and is awaiting moderation!');
        
        // Clear the form
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-category').value = '';
        document.getElementById('post-anonymous').checked = false;
    }
    
    // Add event listeners
    document.getElementById('forum-search-box').addEventListener('input', filterForums);
    document.getElementById('forum-category').addEventListener('change', filterForums);
    document.getElementById('forum-sort').addEventListener('change', filterForums);
    
    // Expose global functions
    window.filterForums = filterForums;
    window.submitPost = submitPost;
    
    // Add styles for share dialog
    const style = document.createElement('style');
    style.textContent = `
        .share-dialog {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .share-dialog-content {
            background-color: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            padding: 1.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .share-dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        .share-dialog-header h3 {
            margin: 0;
            font-size: 1.25rem;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: #6b7280;
        }
        
        .share-options {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .share-option {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 0.75rem;
            border: none;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            color: white;
            transition: all 0.2s ease;
        }
        
        .share-option:hover {
            opacity: 0.9;
            transform: translateY(-2px);
        }
        
        .share-option.facebook {
            background-color: #1877f2;
        }
        
        .share-option.twitter {
            background-color: #1da1f2;
        }
        
        .share-option.linkedin {
            background-color: #0077b5;
        }
        
        .share-option.whatsapp {
            background-color: #25d366;
        }
        
        .copy-link {
            display: flex;
            gap: 0.5rem;
        }
        
        .copy-link input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            font-size: 0.9rem;
            background-color: #f8fafc;
        }
        
        .copy-link button {
            padding: 0.75rem 1rem;
            background-color: #4f46e5;
            color: white;
            border: none;
            border-radius: 0.375rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .copy-link button:hover {
            background-color: #3730a3;
        }
        
        .quick-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        
        .filter-btn {
            padding: 0.5rem 1rem;
            background-color: #f1f5f9;
            border: none;
            border-radius: 50px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
            background-color: #e2e8f0;
        }
        
        .filter-btn.active {
            background-color: #4f46e5;
            color: white;
        }
        
        .no-results {
            text-align: center;
            padding: 3rem 0;
            color: #6b7280;
        }
        
        .no-results i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #cbd5e1;
        }
    `;
    document.head.appendChild(style);
}); 