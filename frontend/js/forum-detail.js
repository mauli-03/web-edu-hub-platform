// Forum Detail Page Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Get forum ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const forumId = urlParams.get('id') || '1'; // Default to 1 if no ID is provided

    // Elements
    const forumTitle = document.getElementById('forum-title');
    const forumDescription = document.getElementById('forum-description');
    const forumCategory = document.getElementById('forum-category');
    const forumContent = document.getElementById('forum-content');
    const authorName = document.getElementById('author-name');
    const authorAvatar = document.getElementById('author-avatar');
    const sidebarAuthorName = document.getElementById('sidebar-author-name');
    const sidebarAuthorAvatar = document.getElementById('sidebar-author-avatar');
    const authorTitle = document.getElementById('author-title');
    const authorPosts = document.getElementById('author-posts');
    const authorComments = document.getElementById('author-comments');
    const authorLikes = document.getElementById('author-likes');
    const postDate = document.getElementById('post-date');
    const viewsCount = document.getElementById('views-count');
    const commentsCount = document.getElementById('comments-count');
    const commentsCountDisplay = document.getElementById('comments-count-display');
    const likesCount = document.getElementById('likes-count');
    const likeBtn = document.getElementById('like-btn');
    const shareBtn = document.getElementById('share-btn');
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const reportBtn = document.getElementById('report-btn');
    const commentsContainer = document.getElementById('comments-container');
    const noCommentsMessage = document.getElementById('no-comments-message');
    const commentSortSelect = document.getElementById('comment-sort-select');
    const submitCommentBtn = document.getElementById('submit-comment');
    const commentInput = document.getElementById('comment-input');
    const followAuthorBtn = document.getElementById('follow-author-btn');
    const forumAttachments = document.getElementById('forum-attachments');
    const tagsContainer = document.getElementById('tags-container');

    // Mock data for demonstration purposes
    // In a real application, this would be fetched from a server
    const forumData = {
        '1': {
            title: 'Best Programming Languages for 2025',
            category: 'Technology',
            description: 'Discuss the most in-demand programming languages for the future, considering trends in AI, cloud computing, and new emerging technologies.',
            content: `<p>As we look toward 2025, the programming landscape continues to evolve rapidly with emerging technologies like AI, quantum computing, and expanded cloud services reshaping developer priorities.</p>
            
            <p>Based on industry trends, here are the programming languages that will likely dominate in 2025:</p>
            
            <h3>1. Python</h3>
            <p>Python continues its reign as the most versatile language. Its dominance in data science, AI, and machine learning makes it indispensable. The language's readability and extensive libraries (TensorFlow, PyTorch, etc.) ensure its relevance will only grow as AI becomes more mainstream.</p>
            
            <h3>2. Rust</h3>
            <p>Rust has been gaining significant momentum for systems programming. Its memory safety without garbage collection makes it ideal for performance-critical applications. Microsoft, Google, and Amazon are increasingly adopting Rust for infrastructure projects.</p>
            
            <h3>3. TypeScript</h3>
            <p>As JavaScript applications grow in complexity, TypeScript's static typing has become essential for maintainable codebases. It's now standard in enterprise front-end development and increasingly used in back-end Node.js applications.</p>
            
            <h3>4. Go</h3>
            <p>Go's simplicity, efficient concurrency model, and performance make it perfect for cloud infrastructure and microservices. It's become the language of choice for distributed systems and DevOps tools.</p>
            
            <h3>5. Kotlin</h3>
            <p>For Android development, Kotlin has effectively replaced Java as Google's preferred language. Its interoperability with Java, concise syntax, and null safety features have driven wide adoption.</p>
            
            <p>Of course, specialized fields will have their own requirements - WebAssembly, Swift for iOS, and R for statistical computing will maintain their niches.</p>
            
            <p>What programming languages are you focusing on learning for the next few years? Has anyone here started working with quantum computing languages yet?</p>`,
            author: {
                name: 'Alex Johnson',
                avatar: '../assets/images/avatars/user1.jpg',
                title: 'Senior Software Engineer',
                posts: 24,
                comments: 158,
                likes: '1.2K'
            },
            stats: {
                views: 245,
                comments: 15,
                likes: 48
            },
            date: '2023-10-15T14:30:00',
            attachments: [
                {
                    name: 'programming_trends_2025.pdf',
                    type: 'pdf',
                    size: '2.4 MB'
                }
            ],
            tags: ['programming', 'technology', 'future tech', 'career', 'web development']
        },
        '2': {
            title: 'How to Prepare for University Exams?',
            category: 'Education',
            description: 'Share study techniques and strategies to ace exams. Looking for effective methods to improve retention and understanding complex topics.',
            content: `<p>University exams can be challenging, but with the right preparation strategies, you can significantly improve your performance. Here are some evidence-based techniques I've found effective:</p>
            
            <h3>1. Spaced Repetition</h3>
            <p>Instead of cramming, space out your study sessions over days or weeks. Research shows this significantly improves long-term retention. I use the Anki app to create flashcards with a spaced repetition algorithm.</p>
            
            <h3>2. Active Recall</h3>
            <p>Don't just reread your notes passively. Test yourself by actively trying to recall information without looking at your notes. Create practice questions or explain concepts aloud as if teaching someone else.</p>
            
            <h3>3. Concept Mapping</h3>
            <p>For complex topics, create visual maps that connect related concepts. This helps you understand relationships between ideas rather than memorizing isolated facts.</p>
            
            <h3>4. The Pomodoro Technique</h3>
            <p>Work in focused 25-minute sessions with 5-minute breaks. After four sessions, take a longer break. This keeps your brain fresh and prevents burnout.</p>
            
            <h3>5. Study Environment</h3>
            <p>Find a consistent, distraction-free environment. Research shows that studying in the same type of environment as where you'll take the exam can improve recall through environmental context effects.</p>
            
            <p>One week before the exam, start doing full practice tests under exam conditions. This builds mental stamina and identifies weak spots that need more attention.</p>
            
            <p>I'm particularly interested in hearing techniques for subjects requiring mathematical problem-solving versus those needing more conceptual understanding. What strategies have worked for you?</p>`,
            author: {
                name: 'Sophia Chen',
                avatar: '../assets/images/avatars/user2.jpg',
                title: 'Graduate Student',
                posts: 12,
                comments: 87,
                likes: '420'
            },
            stats: {
                views: 312,
                comments: 22,
                likes: 67
            },
            date: '2023-10-14T09:15:00',
            attachments: [
                {
                    name: 'effective_study_methods.pdf',
                    type: 'pdf',
                    size: '1.8 MB'
                }
            ],
            tags: ['education', 'study tips', 'exams', 'university', 'learning']
        },
        '3': {
            title: 'Career Advice: Tech vs Business',
            category: 'Career',
            description: 'Which career path is more promising? Share your thoughts and personal experiences on making this important decision. Looking at long-term growth and satisfaction.',
            content: `<p>I'm at a crossroads in my career planning and would appreciate insights from people who have experience in either the tech or business worlds.</p>
            
            <p>Currently completing my undergraduate degree with majors in both Computer Science and Business Administration, I have internship experience in both software development (at a mid-size tech company) and business analysis (at a consulting firm).</p>
            
            <h3>Tech Path Considerations:</h3>
            <ul>
                <li>Higher starting salaries (software engineering roles are offering $20-30K more than business analyst positions)</li>
                <li>More straightforward career progression in the early years</li>
                <li>I enjoy coding and problem-solving</li>
                <li>Concerns about ageism later in career</li>
                <li>Constant need to update technical skills</li>
            </ul>
            
            <h3>Business Path Considerations:</h3>
            <ul>
                <li>Potentially higher ceiling for advancement to executive roles</li>
                <li>Broader skill development</li>
                <li>More people-oriented work (which I also enjoy)</li>
                <li>More transferable skills between industries</li>
                <li>Potentially better work-life balance (though this varies greatly)</li>
            </ul>
            
            <p>I'm particularly interested in hearing from people who:</p>
            <ul>
                <li>Started in tech and moved to business roles</li>
                <li>Have successfully combined both skill sets</li>
                <li>Have 10+ years experience in either path</li>
            </ul>
            
            <p>How did you make your decision? What do you wish you had known earlier? Has your field provided the growth and satisfaction you expected?</p>`,
            author: {
                name: 'Marcus Williams',
                avatar: '../assets/images/avatars/user3.jpg',
                title: 'Undergraduate Student',
                posts: 5,
                comments: 31,
                likes: '124'
            },
            stats: {
                views: 178,
                comments: 9,
                likes: 32
            },
            date: '2023-10-13T16:45:00',
            attachments: [],
            tags: ['career', 'technology', 'business', 'professional development', 'decision making']
        },
        '4': {
            title: 'AI Tools for Students: Pros and Cons',
            category: 'Technology',
            description: 'Discussing the ethical implications and practical benefits of using AI tools like ChatGPT for academic work. How should students responsibly use these tools?',
            content: `<p>The emergence of sophisticated AI tools like ChatGPT, Claude, and Bard has created both opportunities and challenges for students. I'd like to discuss how we can approach these tools responsibly in academic settings.</p>
            
            <h3>Potential Benefits:</h3>
            <ul>
                <li><strong>Learning Enhancement:</strong> AI can explain complex concepts in simple terms and provide multiple perspectives</li>
                <li><strong>Writing Assistance:</strong> Help with structure, grammar, and style improvement</li>
                <li><strong>Research Efficiency:</strong> Summarizing articles and generating literature review frameworks</li>
                <li><strong>Personalized Learning:</strong> Adapting explanations to your specific questions</li>
                <li><strong>Real-world Relevance:</strong> Learning to work with AI is increasingly an essential workplace skill</li>
            </ul>
            
            <h3>Legitimate Concerns:</h3>
            <ul>
                <li><strong>Intellectual Development:</strong> Over-reliance may impair critical thinking skills</li>
                <li><strong>Academic Integrity:</strong> Boundaries between assistance and plagiarism can blur</li>
                <li><strong>Factual Reliability:</strong> AI can confidently present incorrect information</li>
                <li><strong>Equity Issues:</strong> Unequal access to premium AI tools could disadvantage some students</li>
                <li><strong>Assessment Challenges:</strong> Traditional assignments may become less effective</li>
            </ul>
            
            <p>I believe the most effective approach is treating AI as a collaborative tool rather than a replacement for thinking. For example:</p>
            
            <h3>Responsible Usage Guidelines:</h3>
            <ol>
                <li>Use AI to brainstorm ideas, then critically evaluate them yourself</li>
                <li>When using AI for research, verify information from authoritative sources</li>
                <li>For writing assistance, start with your own draft, then use AI for improvement suggestions</li>
                <li>Always disclose AI usage according to instructor guidelines</li>
                <li>Focus on using AI to enhance understanding rather than simply completing assignments</li>
            </ol>
            
            <p>I'm interested in hearing how others are integrating these tools into their academic work. What boundaries have you established? Have instructors provided clear guidelines at your institution?</p>`,
            author: {
                name: 'Jamie Rivera',
                avatar: '../assets/images/avatars/user4.jpg',
                title: 'EdTech Researcher',
                posts: 18,
                comments: 124,
                likes: '890'
            },
            stats: {
                views: 523,
                comments: 38,
                likes: 94
            },
            date: '2023-10-08T11:20:00',
            attachments: [
                {
                    name: 'ai_ethics_in_education.pdf',
                    type: 'pdf',
                    size: '3.2 MB'
                },
                {
                    name: 'student_ai_guide.docx',
                    type: 'doc',
                    size: '845 KB'
                }
            ],
            tags: ['AI', 'education technology', 'academic ethics', 'student resources', 'ChatGPT']
        }
    };

    // Mock comments data
    const commentsData = {
        '1': [
            {
                id: 1,
                author: {
                    name: 'Sophia Chen',
                    avatar: '../assets/images/avatars/user2.jpg'
                },
                content: "I've been focusing on Rust lately and can confirm it's gaining serious traction in systems programming. The learning curve is steep but the benefits are substantial once you get past the initial hurdles. Memory safety without garbage collection is a game-changer for performance-critical applications.",
                date: '2023-10-15T15:45:00',
                likes: 12
            },
            {
                id: 2,
                author: {
                    name: 'Marcus Williams',
                    avatar: '../assets/images/avatars/user3.jpg'
                },
                content: "Great analysis! I'd add that for data engineering specifically, Scala is still very relevant due to its use in Spark. Also, I think Julia deserves a mention for scientific computing and numerical analysis - it's growing quickly in that niche.",
                date: '2023-10-15T16:30:00',
                likes: 8
            },
            {
                id: 3,
                author: {
                    name: 'Jamie Rivera',
                    avatar: '../assets/images/avatars/user4.jpg'
                },
                content: "What about low-code platforms? They're not traditional programming languages, but tools like Mendix and OutSystems are changing how business applications are developed. Do you think traditional programming might become more specialized as low-code takes over common business applications?",
                date: '2023-10-15T17:15:00',
                likes: 5
            }
        ],
        '2': [
            {
                id: 1,
                author: {
                    name: 'Alex Johnson',
                    avatar: '../assets/images/avatars/user1.jpg'
                },
                content: "I've found that teaching concepts to others (even imaginary students) is incredibly effective. The Feynman Technique - trying to explain complex topics in simple language - forces you to truly understand the material rather than just memorize it.",
                date: '2023-10-14T10:30:00',
                likes: 15
            },
            {
                id: 2,
                author: {
                    name: 'Jamie Rivera',
                    avatar: '../assets/images/avatars/user4.jpg'
                },
                content: "For mathematical subjects, I've had success with incrementally difficult practice problems. Start with the basics and gradually move to more complex problems. Also, understanding derivations rather than memorizing formulas makes a huge difference in both retention and application ability.",
                date: '2023-10-14T12:45:00',
                likes: 10
            }
        ],
        '3': [
            {
                id: 1,
                author: {
                    name: 'Sophia Chen',
                    avatar: '../assets/images/avatars/user2.jpg'
                },
                content: "I started in software engineering and moved to product management after 5 years. Having the technical background has been invaluable in my business role - I can communicate effectively with engineering teams and make more informed decisions about product feasibility.",
                date: '2023-10-13T18:20:00',
                likes: 7
            }
        ],
        '4': [
            {
                id: 1,
                author: {
                    name: 'Alex Johnson',
                    avatar: '../assets/images/avatars/user1.jpg'
                },
                content: "I've been using AI as a 'first draft' tool - getting it to create an outline or structure, then substantially revising and adding my own analysis. This maintains academic integrity while saving time on the mechanical aspects of writing.",
                date: '2023-10-08T13:10:00',
                likes: 19
            },
            {
                id: 2,
                author: {
                    name: 'Marcus Williams',
                    avatar: '../assets/images/avatars/user3.jpg'
                },
                content: "My university recently updated their academic integrity policy to specifically address AI tools. They require disclosure when AI is used and emphasize that the student must be the primary author making substantial intellectual contributions. This clear guidance has been really helpful.",
                date: '2023-10-08T15:40:00',
                likes: 12
            }
        ]
    };

    // Load forum data
    function loadForumData() {
        const data = forumData[forumId];
        
        if (!data) {
            forumTitle.textContent = 'Forum Not Found';
            forumDescription.textContent = 'The requested forum could not be found.';
            return;
        }
        
        // Set basic forum info
        document.title = `${data.title} | Education Hub`;
        forumTitle.textContent = data.title;
        forumDescription.textContent = data.description;
        forumCategory.textContent = data.category;
        forumContent.innerHTML = data.content;
        
        // Update category styling based on category
        if (data.category === 'Technology') {
            forumCategory.classList.add('category-technology');
        } else if (data.category === 'Education') {
            forumCategory.classList.add('category-education');
        } else if (data.category === 'Career') {
            forumCategory.classList.add('category-career');
        }
        
        // Set author info
        authorName.textContent = data.author.name;
        authorAvatar.src = data.author.avatar;
        sidebarAuthorName.textContent = data.author.name;
        sidebarAuthorAvatar.src = data.author.avatar;
        authorTitle.textContent = data.author.title;
        authorPosts.textContent = data.author.posts;
        authorComments.textContent = data.author.comments;
        authorLikes.textContent = data.author.likes;
        
        // Set post date and format it
        const date = new Date(data.date);
        postDate.textContent = `Posted on: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        
        // Set stats
        viewsCount.textContent = data.stats.views;
        commentsCount.textContent = data.stats.comments;
        commentsCountDisplay.textContent = data.stats.comments;
        likesCount.textContent = data.stats.likes;
        
        // Load attachments if any
        if (data.attachments && data.attachments.length > 0) {
            const attachmentsHTML = data.attachments.map(attachment => {
                let iconClass = 'fas fa-file';
                if (attachment.type === 'pdf') {
                    iconClass = 'fas fa-file-pdf';
                } else if (attachment.type === 'doc' || attachment.type === 'docx') {
                    iconClass = 'fas fa-file-word';
                } else if (attachment.type === 'xls' || attachment.type === 'xlsx') {
                    iconClass = 'fas fa-file-excel';
                } else if (attachment.type === 'ppt' || attachment.type === 'pptx') {
                    iconClass = 'fas fa-file-powerpoint';
                } else if (attachment.type === 'jpg' || attachment.type === 'png' || attachment.type === 'gif') {
                    iconClass = 'fas fa-file-image';
                }
                
                return `
                    <div class="attachment">
                        <div class="attachment-icon">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="attachment-details">
                            <div class="attachment-name">${attachment.name}</div>
                            <div class="attachment-meta">${attachment.size}</div>
                        </div>
                        <div class="attachment-download">
                            <i class="fas fa-download"></i> Download
                        </div>
                    </div>
                `;
            }).join('');
            
            forumAttachments.innerHTML = attachmentsHTML;
        }
        
        // Load tags
        if (data.tags && data.tags.length > 0) {
            const tagsHTML = data.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            tagsContainer.innerHTML = tagsHTML;
        }
        
        // Load comments
        loadComments();
    }
    
    // Load comments for the forum
    function loadComments() {
        const comments = commentsData[forumId] || [];
        
        if (comments.length === 0) {
            noCommentsMessage.classList.remove('d-none');
            return;
        }
        
        noCommentsMessage.classList.add('d-none');
        
        // Sort comments based on selected option
        sortComments(comments, commentSortSelect.value);
        
        // Display comments
        displayComments(comments);
    }
    
    // Sort comments based on selected option
    function sortComments(comments, sortOption) {
        switch (sortOption) {
            case 'newest':
                comments.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                comments.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'liked':
                comments.sort((a, b) => b.likes - a.likes);
                break;
        }
    }
    
    // Display comments in the container
    function displayComments(comments) {
        commentsContainer.innerHTML = '';
        
        comments.forEach(comment => {
            const date = new Date(comment.date);
            const timeAgo = getTimeAgo(date);
            
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <div class="comment-author">
                        <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-author-avatar">
                        <div>
                            <div class="comment-author-name">${comment.author.name}</div>
                            <div class="comment-time">${timeAgo}</div>
                        </div>
                    </div>
                </div>
                <div class="comment-body">
                    <div class="comment-text">${comment.content}</div>
                    <div class="comment-actions">
                        <div class="comment-action comment-like">
                            <i class="far fa-thumbs-up"></i> Like (${comment.likes})
                        </div>
                        <div class="comment-action comment-reply">
                            <i class="far fa-comment"></i> Reply
                        </div>
                        <div class="comment-action comment-report">
                            <i class="far fa-flag"></i> Report
                        </div>
                    </div>
                </div>
            `;
            
            commentsContainer.appendChild(commentElement);
            
            // Add event listeners for comment actions
            const likeBtn = commentElement.querySelector('.comment-like');
            likeBtn.addEventListener('click', function() {
                if (!this.classList.contains('active')) {
                    this.classList.add('active');
                    comment.likes++;
                    this.innerHTML = `<i class="fas fa-thumbs-up"></i> Like (${comment.likes})`;
                } else {
                    this.classList.remove('active');
                    comment.likes--;
                    this.innerHTML = `<i class="far fa-thumbs-up"></i> Like (${comment.likes})`;
                }
            });
        });
    }
    
    // Get time ago string from date
    function getTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            return interval === 1 ? '1 year ago' : `${interval} years ago`;
        }
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval === 1 ? '1 month ago' : `${interval} months ago`;
        }
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval === 1 ? '1 day ago' : `${interval} days ago`;
        }
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
        }
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
        }
        
        return 'Just now';
    }
    
    // Initialize page
    loadForumData();
    
    // Event listeners
    commentSortSelect.addEventListener('change', function() {
        const comments = commentsData[forumId] || [];
        sortComments(comments, this.value);
        displayComments(comments);
    });
    
    likeBtn.addEventListener('click', function() {
        const currentLikes = parseInt(likesCount.textContent);
        
        if (!this.classList.contains('active')) {
            this.classList.add('active');
            likesCount.textContent = currentLikes + 1;
            this.querySelector('i').className = 'fas fa-thumbs-up';
        } else {
            this.classList.remove('active');
            likesCount.textContent = currentLikes - 1;
            this.querySelector('i').className = 'far fa-thumbs-up';
        }
    });
    
    bookmarkBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            this.classList.add('active');
            this.querySelector('i').className = 'fas fa-bookmark';
        } else {
            this.classList.remove('active');
            this.querySelector('i').className = 'far fa-bookmark';
        }
    });
    
    followAuthorBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            this.classList.add('active');
            this.innerHTML = '<i class="fas fa-user-check"></i> Following';
        } else {
            this.classList.remove('active');
            this.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
        }
    });
    
    submitCommentBtn.addEventListener('click', function() {
        const commentText = commentInput.value.trim();
        
        if (!commentText) {
            alert('Please enter a comment');
            return;
        }
        
        // In a real application, this would submit the comment to the server
        alert('Your comment has been submitted!');
        
        // Clear the input
        commentInput.value = '';
    });
    
    // Share button - open modal
    shareBtn.addEventListener('click', function() {
        const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
        shareModal.show();
    });
    
    // Copy link in share modal
    document.getElementById('copy-link-btn').addEventListener('click', function() {
        const input = document.getElementById('share-link');
        input.select();
        document.execCommand('copy');
        
        this.textContent = 'Copied!';
        setTimeout(() => {
            this.textContent = 'Copy';
        }, 2000);
    });
    
    // Report button - open modal
    reportBtn.addEventListener('click', function() {
        const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
        reportModal.show();
    });
    
    // Report form submission
    document.getElementById('report-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const reason = document.getElementById('report-reason').value;
        
        if (!reason) {
            alert('Please select a reason for reporting');
            return;
        }
        
        // In a real application, this would submit the report to the server
        alert('Your report has been submitted and will be reviewed by our team.');
        
        // Close the modal
        const reportModal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
        reportModal.hide();
    });
}); 