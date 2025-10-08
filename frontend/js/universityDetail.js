document.addEventListener('DOMContentLoaded', function() {
    // Get the university ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const universityId = urlParams.get('id');
    
    if (!universityId) {
        showError("No university ID found in the URL. Redirecting to universities page...");
        setTimeout(() => {
            window.location.href = 'university.html';
        }, 3000);
        return;
    }
    
    // Load university data
    loadUniversityData(universityId);
    
    // Setup UI enhancements
    setupUIEnhancements();
});

/**
 * Load university data from API
 * @param {string} universityId - The ID of the university to load
 */
async function loadUniversityData(universityId) {
    try {
        // Show loading state
        document.getElementById('university-name').textContent = 'Loading university...';
        
        console.log(`Attempting to fetch university with ID: ${universityId}`);
        
        // Fetch university data from API
        const apiUrl = `http://localhost:5000/api/universities/${universityId}`;
        console.log(`API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        console.log(`API Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.error(`University with ID ${universityId} not found in database`);
                showError("University not found. Redirecting to universities page...");
                setTimeout(() => {
                    window.location.href = 'university.html';
                }, 3000);
                return;
            }
            throw new Error(`API error: ${response.status}`);
        }
        
        // Clone the response to log it without consuming it
        const responseClone = response.clone();
        const universityData = await response.json();
        
        // Log raw response for debugging
        responseClone.text().then(text => {
            console.log('Raw API response:', text);
        }).catch(e => console.error('Error logging raw response:', e));
        
        console.log('University data from API:', universityData);
        
        // If API returns no data, fall back to mock data
        if (!universityData) {
            console.warn('No data returned from API, falling back to mock data');
            // Fallback to mock data for demo purposes
            const mockUniversities = [
                {
                    id: "1",
                    name: "Harvard University",
                    location: "Cambridge, Massachusetts",
                    rank: "#1 National University",
                    established: "1636",
                    overview: "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636 and named for its first benefactor, clergyman John Harvard, Harvard is the oldest institution of higher learning in the United States and among the most prestigious in the world. The university's history, influence, wealth, and academic reputation have made it one of the most prestigious universities in the world.",
                    logo: "../assets/images/university-placeholder.svg",
                    website: "https://www.harvard.edu",
                    email: "admissions@harvard.edu",
                    phone: "+1 (617) 495-1000",
                    departments: [
                        "Faculty of Arts and Sciences",
                        "Business School",
                        "Law School",
                        "Medical School",
                        "School of Engineering and Applied Sciences",
                        "Graduate School of Education"
                    ],
                    courses: [
                        {
                            name: "Computer Science (CS50)",
                            credits: 4,
                            duration: "14 weeks",
                            instructor: "David J. Malan",
                            syllabus: [
                                "Introduction to Computer Science",
                                "C Programming",
                                "Arrays and Data Structures",
                                "Algorithms",
                                "Memory Management",
                                "Python Programming",
                                "SQL and Databases",
                                "Web Development",
                                "Final Project"
                            ]
                        },
                        {
                            name: "Introduction to Economics",
                            credits: 3,
                            duration: "12 weeks",
                            instructor: "Gregory Mankiw",
                            syllabus: [
                                "Principles of Microeconomics",
                                "Principles of Macroeconomics",
                                "Supply and Demand Analysis",
                                "Market Structures",
                                "Monetary Policy",
                                "Fiscal Policy",
                                "International Trade",
                                "Economic Growth"
                            ]
                        },
                        {
                            name: "Molecular and Cellular Biology",
                            credits: 4,
                            duration: "15 weeks",
                            instructor: "Dr. Sarah Johnson",
                            syllabus: [
                                "Cell Structure and Function",
                                "Molecular Biology of the Gene",
                                "DNA Replication and Repair",
                                "Gene Expression",
                                "Membrane Structure and Function",
                                "Cellular Energetics",
                                "Cell Communication",
                                "Cell Cycle",
                                "Laboratory Techniques"
                            ]
                        }
                    ],
                    resources: [
                        {
                            name: "Introduction to Algorithms",
                            type: "book",
                            author: "Thomas H. Cormen",
                            year: 2009,
                            size: "4.2 MB"
                        },
                        {
                            name: "Lecture Notes: Quantum Physics",
                            type: "pdf",
                            author: "Prof. Richard Feynman",
                            year: 2021,
                            size: "2.1 MB"
                        },
                        {
                            name: "Harvard Business Case Studies",
                            type: "pdf",
                            author: "Harvard Business Review",
                            year: 2022,
                            size: "8.7 MB"
                        },
                        {
                            name: "Advanced Machine Learning",
                            type: "video",
                            author: "Dr. Andrew Ng",
                            year: 2020,
                            duration: "8:24:15"
                        },
                        {
                            name: "Principles of Biochemistry",
                            type: "book",
                            author: "David L. Nelson",
                            year: 2017,
                            size: "6.8 MB"
                        }
                    ]
                },
                {
                    id: "2",
                    name: "Stanford University",
                    location: "Stanford, California",
                    rank: "#2 National University",
                    established: "1885",
                    overview: "Stanford University, officially Leland Stanford Junior University, is a private research university in Stanford, California. The university was founded in 1885 by Leland and Jane Stanford in memory of their only child, Leland Stanford Jr., who had died of typhoid fever at age 15 the previous year. Stanford is consistently ranked among the most prestigious universities in the world.",
                    logo: "../assets/images/university-placeholder.svg",
                    website: "https://www.stanford.edu",
                    email: "admissions@stanford.edu",
                    phone: "+1 (650) 723-2300",
                    departments: [
                        "School of Humanities and Sciences",
                        "School of Engineering",
                        "School of Medicine",
                        "Graduate School of Business",
                        "School of Earth, Energy & Environmental Sciences",
                        "School of Education"
                    ],
                    courses: [
                        {
                            name: "Artificial Intelligence",
                            credits: 4,
                            duration: "14 weeks",
                            instructor: "Dr. Fei-Fei Li",
                            syllabus: [
                                "Introduction to AI",
                                "Problem Solving by Search",
                                "Machine Learning Fundamentals",
                                "Neural Networks",
                                "Computer Vision",
                                "Natural Language Processing",
                                "Robotics",
                                "AI Ethics",
                                "Final Project"
                            ]
                        },
                        {
                            name: "Entrepreneurship and Innovation",
                            credits: 3,
                            duration: "10 weeks",
                            instructor: "Dr. Charles Eesley",
                            syllabus: [
                                "Introduction to Entrepreneurship",
                                "Opportunity Identification",
                                "Business Models",
                                "Market Analysis",
                                "Startup Financing",
                                "Intellectual Property",
                                "Growth Strategies",
                                "Pitching to Investors"
                            ]
                        },
                        {
                            name: "Environmental Science and Conservation",
                            credits: 4,
                            duration: "15 weeks",
                            instructor: "Dr. Terry Root",
                            syllabus: [
                                "Principles of Ecology",
                                "Biodiversity and Conservation",
                                "Climate Change Science",
                                "Environmental Policy",
                                "Ecosystem Services",
                                "Sustainable Development",
                                "Research Methods",
                                "Field Studies",
                                "Conservation Technologies"
                            ]
                        }
                    ],
                    resources: [
                        {
                            name: "Fundamentals of Computer Graphics",
                            type: "book",
                            author: "Peter Shirley",
                            year: 2016,
                            size: "5.1 MB"
                        },
                        {
                            name: "Deep Learning",
                            type: "book",
                            author: "Ian Goodfellow",
                            year: 2020,
                            size: "7.2 MB"
                        },
                        {
                            name: "Renewable Energy Technology",
                            type: "pdf",
                            author: "Stanford Energy Institute",
                            year: 2022,
                            size: "3.8 MB"
                        },
                        {
                            name: "Stanford Entrepreneurship Lecture Series",
                            type: "video",
                            author: "Various Faculty",
                            year: 2021,
                            duration: "12:45:30"
                        },
                        {
                            name: "Human-Computer Interaction Research Papers",
                            type: "pdf",
                            author: "Stanford HCI Group",
                            year: 2019,
                            size: "5.4 MB"
                        }
                    ]
                }
            ];
            
            // Find the university by ID
            const mockUniversity = mockUniversities.find(uni => uni.id === universityId);
            
            if (!mockUniversity) {
                showError("University not found. Redirecting to universities page...");
                setTimeout(() => {
                    window.location.href = 'university.html';
                }, 3000);
                return;
            }
            
            // Update the page with university data
            updateUniversityInfo(mockUniversity);
            renderDepartments(mockUniversity.departments);
            renderCourses(mockUniversity.courses);
            renderResources(mockUniversity.resources);
        } else {
            console.log('Processing API data for UI display');
            
            // Create a properly formatted university object from the API response
            const university = {
                id: universityData.id,
                name: universityData.name || 'Unknown University',
                location: universityData.location || 'Location unavailable',
                rank: universityData.rank || 'Rank unavailable',
                established: universityData.established || 'Year unavailable',
                overview: universityData.overview || 'No overview available',
                logo: '../assets/images/university-placeholder.svg', // Default logo
                website: universityData.website || '',
                email: universityData.email || '',
                phone: universityData.phone || ''
            };
            
            console.log('Formatted university object:', university);
            
            // Format departments
            let departments = [];
            if (universityData.departments && Array.isArray(universityData.departments)) {
                console.log('Processing departments:', universityData.departments);
                departments = universityData.departments.map(dept => {
                    // Check if dept is an object or string
                    return (typeof dept === 'object' && dept !== null) ? dept.name || 'Unnamed Department' : dept;
                });
            } else {
                console.warn('No departments found or not in expected format:', universityData.departments);
            }
            
            // Format courses
            let courses = [];
            if (universityData.courses && Array.isArray(universityData.courses)) {
                console.log('Processing courses:', universityData.courses);
                courses = universityData.courses.map(course => ({
                    name: course.name || 'Unnamed Course',
                    credits: course.credits || 3,
                    duration: course.duration || "1 semester",
                    instructor: course.instructor || "TBD",
                    syllabus: course.syllabus && Array.isArray(course.syllabus) ? course.syllabus : ["Course content to be announced"]
                }));
            } else {
                console.warn('No courses found or not in expected format:', universityData.courses);
            }
            
            // Format resources
            let resources = [];
            if (universityData.resources && Array.isArray(universityData.resources)) {
                console.log('Processing resources:', universityData.resources);
                resources = universityData.resources.map(resource => ({
                    name: resource.name || 'Unnamed Resource',
                    type: resource.type || "pdf",
                    author: resource.author || "University Faculty",
                    year: resource.year || new Date().getFullYear(),
                    size: resource.size || "N/A",
                    duration: resource.duration || null
                }));
            } else {
                console.warn('No resources found or not in expected format:', universityData.resources);
            }
            
            // Update the UI with the university data
            console.log('Updating UI with university data');
            updateUniversityInfo(university);
            renderDepartments(departments);
            renderCourses(courses);
            renderResources(resources);
        }
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error("Error loading university data:", error);
        showError(`An error occurred while loading university data: ${error.message}`);
    }
}

/**
 * Update university information in the page
 * @param {Object} university - The university data
 */
function updateUniversityInfo(university) {
    console.log('Updating university info with:', university);
    
    try {
        // Update university name
        document.getElementById('university-name').textContent = university.name || 'University Name';
        
        // Update meta information
        document.getElementById('university-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${university.location || 'Location Not Available'}`;
        document.getElementById('university-rank').innerHTML = `<i class="fas fa-award"></i> ${university.rank || 'Rank Not Available'}`;
        document.getElementById('university-established').innerHTML = `<i class="fas fa-calendar-alt"></i> Est. ${university.established || 'Year Not Available'}`;
        
        // Update overview
        document.getElementById('university-overview').innerHTML = `<p class="overview-text">${university.overview || 'Overview not available for this university.'}</p>`;
        
        // Update profile information with null checks
        const logoEl = document.getElementById('university-logo');
        if (logoEl) {
            logoEl.src = university.logo || '../assets/images/university-placeholder.svg';
            logoEl.alt = `${university.name || 'University'} Logo`;
        } else {
            console.warn("Could not find university-logo element");
        }
        
        // Handle website with null check
        const websiteEl = document.getElementById('university-website');
        if (websiteEl) {
            if (university.website) {
                websiteEl.href = university.website.startsWith('http') ? university.website : `https://${university.website}`;
                websiteEl.textContent = university.website.replace(/^https?:\/\//, '');
            } else {
                websiteEl.href = '#';
                websiteEl.textContent = 'Website not available';
            }
        } else {
            console.warn("Could not find university-website element");
        }
        
        // Handle email with null check
        const emailEl = document.getElementById('university-email');
        if (emailEl) {
            if (university.email) {
                emailEl.href = `mailto:${university.email}`;
                emailEl.textContent = university.email;
            } else {
                emailEl.href = '#';
                emailEl.textContent = 'Email not available';
            }
        } else {
            console.warn("Could not find university-email element");
        }
        
        // Handle phone with null check
        const phoneEl = document.getElementById('university-phone');
        if (phoneEl) {
            phoneEl.textContent = university.phone || 'Phone not available';
        } else {
            console.warn("Could not find university-phone element");
        }
        
        // Update document title
        document.title = `${university.name || 'University'} | Education Hub`;
        
        console.log('University info updated successfully');
    } catch (error) {
        console.error('Error updating university info:', error);
        showError(`Error displaying university information: ${error.message}`);
    }
}

/**
 * Render departments and programs
 * @param {Array} departments - List of departments
 */
function renderDepartments(departments) {
    console.log('Rendering departments:', departments);
    
    try {
        const departmentsList = document.getElementById('departments-list');
        if (!departmentsList) {
            console.error('departments-list element not found in the DOM');
            return;
        }
        
        departmentsList.innerHTML = '';
        
        if (!departments || !Array.isArray(departments) || departments.length === 0) {
            console.warn('No departments to render');
            const li = document.createElement('li');
            li.textContent = 'No departments available for this university';
            departmentsList.appendChild(li);
            return;
        }
        
        departments.forEach((department, index) => {
            try {
                const li = document.createElement('li');
                
                // Handle different data structures (string or object)
                if (typeof department === 'string') {
                    li.textContent = department;
                } else if (typeof department === 'object' && department !== null) {
                    li.textContent = department.name || `Department ${index + 1}`;
                } else {
                    li.textContent = `Department ${index + 1}`;
                }
                
                departmentsList.appendChild(li);
            } catch (err) {
                console.error('Error rendering department item:', err, department);
            }
        });
        
        console.log('Departments rendered successfully');
    } catch (error) {
        console.error('Error in renderDepartments:', error);
    }
}

/**
 * Render courses and syllabus
 * @param {Array} courses - List of courses
 */
function renderCourses(courses) {
    console.log('Rendering courses:', courses);
    
    try {
        const coursesList = document.getElementById('courses-list');
        if (!coursesList) {
            console.error('courses-list element not found in the DOM');
            return;
        }
        
        coursesList.innerHTML = '';
        
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            console.warn('No courses to render');
            const emptyItem = document.createElement('div');
            emptyItem.className = 'alert alert-info';
            emptyItem.innerHTML = 'No courses available for this university';
            coursesList.appendChild(emptyItem);
            return;
        }
        
        courses.forEach((course, index) => {
            try {
                const courseId = `course-${index}`;
                const courseItem = document.createElement('div');
                courseItem.className = 'accordion-item';
                
                // Ensure syllabus is an array
                const syllabus = course.syllabus && Array.isArray(course.syllabus) 
                    ? course.syllabus 
                    : ["Course content to be announced"];
                
                courseItem.innerHTML = `
                    <h2 class="accordion-header" id="heading-${courseId}">
                        <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${courseId}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse-${courseId}">
                            ${course.name || `Course ${index+1}`}
                        </button>
                    </h2>
                    <div id="collapse-${courseId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading-${courseId}" data-bs-parent="#courses-list">
                        <div class="accordion-body">
                            <div class="course-details">
                                <div class="course-detail-item">
                                    <span class="detail-label">Credits:</span>
                                    <span>${course.credits || 'N/A'}</span>
                                </div>
                                <div class="course-detail-item">
                                    <span class="detail-label">Duration:</span>
                                    <span>${course.duration || 'N/A'}</span>
                                </div>
                                <div class="course-detail-item">
                                    <span class="detail-label">Instructor:</span>
                                    <span>${course.instructor || 'TBD'}</span>
                                </div>
                            </div>
                            
                            <div class="course-syllabus">
                                <h5>Syllabus</h5>
                                <ul>
                                    ${syllabus.map(item => `<li>${item || 'Course topic'}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
                coursesList.appendChild(courseItem);
            } catch (err) {
                console.error('Error rendering course item:', err, course);
            }
        });
        
        console.log('Courses rendered successfully');
    } catch (error) {
        console.error('Error in renderCourses:', error);
    }
}

/**
 * Render resources like books and PDFs
 * @param {Array} resources - List of resources
 */
function renderResources(resources) {
    console.log('Rendering resources:', resources);
    
    try {
        const resourcesList = document.getElementById('books-list');
        if (!resourcesList) {
            console.error('books-list element not found in the DOM');
            return;
        }
        
        resourcesList.innerHTML = '';
        
        if (!resources || !Array.isArray(resources) || resources.length === 0) {
            console.warn('No resources to render');
            const emptyItem = document.createElement('div');
            emptyItem.className = 'alert alert-info';
            emptyItem.innerHTML = 'No resources available for this university';
            resourcesList.appendChild(emptyItem);
            return;
        }
        
        resources.forEach((resource, index) => {
            try {
                const resourceItem = document.createElement('div');
                resourceItem.className = 'resource-item';
                
                // Determine the icon based on resource type
                let icon = '';
                const type = resource.type || 'file';
                switch (type) {
                    case 'book':
                        icon = '<i class="fas fa-book"></i>';
                        break;
                    case 'pdf':
                        icon = '<i class="fas fa-file-pdf"></i>';
                        break;
                    case 'video':
                        icon = '<i class="fas fa-video"></i>';
                        break;
                    default:
                        icon = '<i class="fas fa-file"></i>';
                }
                
                // Determine the meta info based on resource type
                let metaInfo = '';
                if (type === 'video') {
                    metaInfo = `<span><i class="far fa-clock"></i> ${resource.duration || 'N/A'}</span>`;
                } else {
                    metaInfo = `<span><i class="fas fa-file-alt"></i> ${resource.size || 'N/A'}</span>`;
                }
                
                resourceItem.innerHTML = `
                    <div class="resource-icon">${icon}</div>
                    <div class="resource-info">
                        <h4>${resource.name || `Resource ${index+1}`}</h4>
                        <div class="resource-meta">
                            <span><i class="fas fa-user"></i> ${resource.author || 'Unknown Author'}</span>
                            <span><i class="fas fa-calendar-alt"></i> ${resource.year || new Date().getFullYear()}</span>
                            ${metaInfo}
                        </div>
                    </div>
                    <div class="resource-actions">
                        <button class="btn btn-sm btn-outline-primary"><i class="fas fa-download"></i></button>
                    </div>
                `;
                resourcesList.appendChild(resourceItem);
            } catch (err) {
                console.error('Error rendering resource item:', err, resource);
            }
        });
        
        console.log('Resources rendered successfully');
    } catch (error) {
        console.error('Error in renderResources:', error);
    }
}

/**
 * Set up event listeners for interactive elements
 */
function setupEventListeners() {
    // Save university button
    const saveButton = document.getElementById('save-university');
    saveButton.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
        this.classList.remove('btn-outline-light');
        this.classList.add('btn-light');
        
        // Show a toast or some notification
        alert('University has been saved to your profile!');
    });
    
    // Apply button
    const applyButton = document.getElementById('apply-button');
    applyButton.addEventListener('click', function() {
        window.location.href = 'apply.html?id=' + new URLSearchParams(window.location.search).get('id');
    });
    
    // Load more reviews button
    const loadMoreButton = document.getElementById('load-more-reviews');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', function() {
            alert('Loading more reviews feature will be implemented soon!');
        });
    }
}

/**
 * Show error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    const mainContent = document.querySelector('.main-content');
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.innerHTML = `
        <h3><i class="fas fa-exclamation-triangle"></i> Error</h3>
        <p>${message}</p>
        <a href="university.html" class="btn btn-primary mt-3">
            <i class="fas fa-arrow-left"></i> Back to Universities
        </a>
    `;
    
    // Insert at the top of main content
    mainContent.prepend(errorDiv);
    
    // Hide university header
    const universityHeader = document.querySelector('.university-header');
    if (universityHeader) {
        universityHeader.style.display = 'none';
    }
}

// UI Enhancement Functions
function setupUIEnhancements() {
    // Add back to top button
    addBackToTopButton();
    
    // Add scroll effects to navbar
    addNavbarScrollEffects();
    
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Add image error handlers
    setupImageErrorHandlers();
}

function addBackToTopButton() {
    // Create the button
    const backToTopButton = document.createElement('div');
    backToTopButton.className = 'scroll-to-top';
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTopButton);
    
    // Show/hide the button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function addNavbarScrollEffects() {
    const navbar = document.querySelector('.main-navigation');
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function addSmoothScrolling() {
    // Get all links with hash
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip links that don't point to an element
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            if (!targetElement) return;
            
            e.preventDefault();
            
            // Scroll smoothly to the element
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

function setupImageErrorHandlers() {
    // Handle university logo image errors
    const logoImg = document.getElementById('university-logo');
    if (logoImg) {
        logoImg.src = '../assets/images/university-placeholder.svg';
    }
    
    // Handle campus image errors
    const campusImg = document.querySelector('.tour-thumbnail img');
    if (campusImg) {
        campusImg.src = '../assets/images/campus-placeholder.svg';
    }
    
    // Handle all university cards
    const cardImages = document.querySelectorAll('.university-card .card-img-top');
    cardImages.forEach(img => {
        img.src = '../assets/images/university-placeholder.svg';
    });
}
