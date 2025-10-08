document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("universitySearch");
    const searchButton = document.getElementById("searchButton");
    const universitiesContainer = document.getElementById("universitiesContainer");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const paginationContainer = document.getElementById("universityPagination");

    let currentPage = 1;
    const limit = 6; // Number of universities per page
    
    // Use window.API_URL if available, otherwise fallback to localhost
    const apiBaseUrl = window.API_URL || "http://localhost:5000/api";
    console.log("Using API base URL:", apiBaseUrl);

    async function fetchUniversities() {
        try {
            const searchInput = document.getElementById("universitySearch");
            const searchQuery = searchInput.value.trim() || "";
            const locationFilterElement = document.getElementById("locationFilter");
            const rankFilterElement = document.getElementById("rankFilter");

            const locationFilter = locationFilterElement ? locationFilterElement.value || "" : "";
            const rankFilter = rankFilterElement ? rankFilterElement.value || "" : "";

            let queryParams = new URLSearchParams();
            if (searchQuery) queryParams.append("search", searchQuery);
            if (locationFilter) queryParams.append("location", locationFilter);
            if (rankFilter) queryParams.append("rank", rankFilter);
            
            // Add pagination parameters
            queryParams.append("page", currentPage);
            queryParams.append("limit", limit);

            // Log the query parameters
            console.log("Query Parameters:", queryParams.toString());
            
            // Show loading indicator
            if (loadingIndicator) loadingIndicator.style.display = "block";
            
            const apiUrl = `${apiBaseUrl}/universities?${queryParams}`;
            console.log("Fetching from:", apiUrl);

            const response = await fetch(apiUrl);
            
            console.log("Response status:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text().catch(e => "Could not get error details");
                console.error("Error response:", errorText);
                throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Raw API response:", data);
            
            // Handle different response formats
            let universities;
            let totalItems = 0;
            
            if (Array.isArray(data)) {
                // If the response is directly an array of universities
                universities = data;
                totalItems = data.length;
            } else if (data && typeof data === 'object') {
                // If the response is an object that contains a universities array
                // Check common property names in API responses
                if (Array.isArray(data.universities)) {
                    universities = data.universities;
                    totalItems = data.total || data.totalItems || data.count || universities.length;
                } else if (Array.isArray(data.data)) {
                    universities = data.data;
                    totalItems = data.total || data.totalItems || data.count || universities.length;
                } else if (Array.isArray(data.results)) {
                    universities = data.results;
                    totalItems = data.total || data.totalItems || data.count || universities.length;
                } else if (data.success && Array.isArray(data.data)) {
                    universities = data.data;
                    totalItems = data.total || data.totalItems || data.count || universities.length;
                } else {
                    // If we can't find a universities array, look for any array property
                    const arrayProps = Object.keys(data).filter(key => Array.isArray(data[key]));
                    if (arrayProps.length > 0) {
                        universities = data[arrayProps[0]];
                        totalItems = data.total || data.totalItems || data.count || universities.length;
                    } else {
                        throw new Error("Invalid data format from API: No university data found. Received: " + JSON.stringify(data).substring(0, 100) + "...");
                    }
                }
            } else {
                throw new Error("Invalid data format from API: Expected object or array, got " + (typeof data));
            }

            // Log what we found
            console.log("Universities data:", universities);
            console.log("Total items:", totalItems);
            
            if (!Array.isArray(universities)) {
                throw new Error("Invalid data format from API: Universities is not an array");
            }

            displayUniversities(universities);
            updatePagination(totalItems, currentPage);
        } catch (error) {
            console.error("Error fetching universities:", error);
            document.getElementById("universitiesContainer").innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error loading universities</h4>
                    <p>${error.message}</p>
                    <hr>
                    <p class="mb-0">Please try again later or contact support if the problem persists.</p>
                </div>
            `;
            
            // Clear pagination if there was an error
            if (paginationContainer) {
                paginationContainer.innerHTML = "";
            }
        } finally {
            // Hide loading indicator
            if (loadingIndicator) loadingIndicator.style.display = "none";
        }
    }

    function displayUniversities(universities) {
        let container = document.getElementById("universitiesContainer");
        container.innerHTML = "";
    
        if (universities.length === 0) {
            container.innerHTML = "<div class='col-12 text-center'><p>No universities found. Try adjusting your search criteria.</p></div>";
            return;
        }
    
        universities.forEach(university => {
            container.appendChild(createUniversityCard(university));
        });
    }
    

    function updatePagination(total, currentPage) {
        const totalPages = Math.ceil(total / limit);
        paginationContainer.innerHTML = "";

        if (totalPages <= 1) return;

        for (let page = 1; page <= totalPages; page++) {
            const activeClass = page === currentPage ? "active" : "";
            paginationContainer.innerHTML += `
                <li class="page-item ${activeClass}">
                    <button class="page-link" data-page="${page}">${page}</button>
                </li>
            `;
        }

        document.querySelectorAll(".page-link").forEach(button => {
            button.addEventListener("click", function () {
                currentPage = parseInt(this.dataset.page);
                fetchUniversities();
            });
        });
    }

    // Search event listener
    searchButton.addEventListener("click", () => {
        currentPage = 1;
        fetchUniversities();
    });

    // Fetch universities on page load
    fetchUniversities();

    // Setup UI enhancements
    setupUIEnhancements();
});

function setupUIEnhancements() {
    // Add back to top button
    addBackToTopButton();
    
    // Add scroll effects to navbar
    addNavbarScrollEffects();
    
    // Add smooth scrolling for anchor links
    addSmoothScrolling();
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
    // For auto-navbar, wait for the navbar to be loaded
    setTimeout(() => {
        const navbar = document.querySelector('.main-navigation');
        const scrollToTopBtn = document.querySelector('.scroll-to-top');
        
        if (!navbar) return;
        
        // Initial check for page already scrolled
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
            if (scrollToTopBtn) scrollToTopBtn.classList.add('visible');
        }
        
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 50) {
                navbar.classList.add('scrolled');
                if (scrollToTopBtn) scrollToTopBtn.classList.add('visible');
            } else {
                navbar.classList.remove('scrolled');
                if (scrollToTopBtn) scrollToTopBtn.classList.remove('visible');
            }
        });
    }, 300); // Allow time for the navbar to load
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

function setupUniversitySearch() {
    // Get the search button and input field
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('universitySearch');
    const universitiesContainer = document.getElementById('universitiesContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Add event listener to the search button
    searchButton.addEventListener('click', function() {
        performSearch(searchInput.value);
    });
    
    // Add event listener for pressing Enter in search input
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
    
    // Setup filters change event
    setupFilters();
    
    // Load initial universities
    loadUniversities();
}

function performSearch(query) {
    // Show loading indicator
    showLoadingIndicator();
    
    // Simulate search delay
    setTimeout(() => {
        // In a real application, you would fetch data from an API
        // For now, we'll just filter our mock data
        const filteredUniversities = filterUniversities(mockUniversities, query);
        
        // Display the filtered universities
        displayUniversities(filteredUniversities);
        
        // Hide loading indicator
        hideLoadingIndicator();
    }, 800);
}

function setupFilters() {
    const locationFilter = document.getElementById('locationFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const courseFilter = document.getElementById('courseFilter');
    const rankFilter = document.getElementById('rankFilter');
    const advancedFilterBtn = document.getElementById('advancedFilterBtn');
    
    // Populate filter options
    populateFilterOptions();
    
    // Add event listeners to filters
    const filters = [locationFilter, departmentFilter, courseFilter, rankFilter];
    
    filters.forEach(filter => {
        if (filter) {
            filter.addEventListener('change', function() {
                applyFilters();
            });
        }
    });
    
    // Advanced filter button (for future implementation)
    if (advancedFilterBtn) {
        advancedFilterBtn.addEventListener('click', function() {
            alert('Advanced filtering will be implemented in a future update.');
        });
    }
}

function populateFilterOptions() {
    // In a real application, you would fetch this data from an API
    // For now, we'll just use mock data
    
    const locationFilter = document.getElementById('locationFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const courseFilter = document.getElementById('courseFilter');
    
    // Sample locations
    const locations = ['Boston, MA', 'New York, NY', 'Stanford, CA', 'Chicago, IL', 'Cambridge, MA'];
    
    // Sample departments
    const departments = ['Computer Science', 'Business', 'Engineering', 'Medicine', 'Law', 'Arts'];
    
    // Sample courses
    const courses = ['Artificial Intelligence', 'Data Structures', 'Entrepreneurship', 'Molecular Biology', 'Constitutional Law'];
    
    // Populate location filter
    if (locationFilter) {
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    }
    
    // Populate department filter
    if (departmentFilter) {
        departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department;
            option.textContent = department;
            departmentFilter.appendChild(option);
        });
    }
    
    // Populate course filter
    if (courseFilter) {
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            courseFilter.appendChild(option);
        });
    }
}

function applyFilters() {
    showLoadingIndicator();
    
    // Get filter values
    const locationFilter = document.getElementById('locationFilter')?.value || '';
    const departmentFilter = document.getElementById('departmentFilter')?.value || '';
    const courseFilter = document.getElementById('courseFilter')?.value || '';
    const rankFilter = document.getElementById('rankFilter')?.value || '';
    
    // Apply filters to mock data
    setTimeout(() => {
        let filteredUniversities = [...mockUniversities];
        
        // Filter by location
        if (locationFilter) {
            filteredUniversities = filteredUniversities.filter(uni => 
                uni.location.includes(locationFilter)
            );
        }
        
        // Filter by department (in a real app this would be more complex)
        if (departmentFilter) {
            filteredUniversities = filteredUniversities.filter(uni => 
                uni.departments.some(dept => dept.includes(departmentFilter))
            );
        }
        
        // Filter by course (in a real app this would be more complex)
        if (courseFilter) {
            filteredUniversities = filteredUniversities.filter(uni => 
                uni.courses.some(course => course.name.includes(courseFilter))
            );
        }
        
        // Filter by rank
        if (rankFilter) {
            filteredUniversities = filteredUniversities.filter(uni => 
                uni.rank.includes(rankFilter)
            );
        }
        
        // Display filtered universities
        displayUniversities(filteredUniversities);
        
        // Hide loading indicator
        hideLoadingIndicator();
    }, 800);
}

function loadUniversities() {
    // Show loading indicator
    showLoadingIndicator();
    
    // In a real application, you would fetch this data from an API
    // For now, we'll just use mock data
    setTimeout(() => {
        displayUniversities(mockUniversities);
        hideLoadingIndicator();
    }, 800);
}

function createUniversityCard(university) {
    // Create the card element
    const cardElement = document.createElement('div');
    cardElement.className = 'university-card';
    
    // Generate random stats for demo purposes
    const students = Math.floor(Math.random() * 30000) + 5000;
    const courses = Math.floor(Math.random() * 200) + 50;
    const faculty = Math.floor(Math.random() * 1000) + 200;
    
    // Create tags for the university
    const tags = ['Research', 'International', 'Scholarship'];
    const tagsHTML = tags.map(tag => `<span class="university-tag">${tag}</span>`).join('');
    
    // Check if image exists or use placeholder
    const imageSrc = university.image_url || '../assets/images/logo.svg';
    
    // Build the HTML content
    cardElement.innerHTML = `
        <div class="university-header">
            <img src="${imageSrc}" alt="${university.name}" class="university-logo" onerror="this.src='../assets/images/logo.svg'">
            <h3 class="university-name">${university.name}</h3>
            <div class="university-location">
                <i class="fas fa-map-marker-alt"></i> ${university.location || 'N/A'}
            </div>
            <div class="university-rank">
                <i class="fas fa-award"></i> Rank: ${university.rank || 'N/A'}
            </div>
        </div>
        <div class="university-body">
            <p class="university-description">
                ${university.description || 'This university offers a wide range of programs and opportunities for students looking to pursue higher education.'}
            </p>
            <div class="university-stats">
                <div class="stat-item">
                    <div class="stat-value">${students.toLocaleString()}</div>
                    <div class="stat-label">Students</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${courses}</div>
                    <div class="stat-label">Courses</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${faculty}</div>
                    <div class="stat-label">Faculty</div>
                </div>
            </div>
            <div class="university-tags">
                ${tagsHTML}
            </div>
        </div>
        <div class="university-footer">
            <span>Est. ${university.established || 'N/A'}</span>
            <div class="university-actions">
                <a href="universityDetail.html?id=${university.id}" class="btn btn-primary action-btn">View Details</a>
            </div>
        </div>
    `;
    
    // Add event listeners for card interactions
    cardElement.addEventListener('click', (e) => {
        // If the click was on a link or button, don't redirect
        if (e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button') {
            return;
        }
        
        // Otherwise navigate to university detail page
        window.location.href = `universityDetail.html?id=${university.id}`;
    });
    
    return cardElement;
}

function setupPagination(totalItems) {
    const paginationContainer = document.getElementById('universityPagination');
    if (!paginationContainer) return;
    
    // Clear current pagination
    paginationContainer.innerHTML = '';
    
    // For simplicity, just display static pagination
    paginationContainer.innerHTML = `
        <li class="page-item active" aria-current="page">
            <span class="page-link">1</span>
        </li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
        <li class="page-item"><a class="page-link" href="#">3</a></li>
        <li class="page-item">
            <a class="page-link" href="#"><i class="fas fa-chevron-right"></i></a>
        </li>
    `;
    
    // Add event listeners (just for UI demonstration)
    const pageLinks = paginationContainer.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.parentElement.classList.contains('active')) {
                e.preventDefault();
                alert('Pagination will be implemented in a future update.');
            }
        });
    });
}

function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function filterUniversities(universities, query) {
    if (!query) return universities;
    
    query = query.toLowerCase();
    return universities.filter(uni => 
        uni.name.toLowerCase().includes(query) || 
        uni.location.toLowerCase().includes(query) || 
        uni.departments.some(dept => dept.toLowerCase().includes(query)) ||
        uni.courses.some(course => course.name.toLowerCase().includes(query))
    );
}

// Mock data for demonstration
const mockUniversities = [
    {
        id: "1",
        name: "Harvard University",
        location: "Cambridge, Massachusetts",
        rank: "#1 National University",
        established: "1636",
        overview: "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636 and named for its first benefactor, clergyman John Harvard.",
        logo: "../assets/images/university-placeholder.svg",
        departments: [
            "Faculty of Arts and Sciences",
            "Business School",
            "Law School",
            "Medical School",
            "School of Engineering and Applied Sciences",
            "Graduate School of Education"
        ],
        courses: [
            { name: "Computer Science (CS50)" },
            { name: "Introduction to Economics" },
            { name: "Molecular and Cellular Biology" }
        ]
    },
    {
        id: "2",
        name: "Stanford University",
        location: "Stanford, California",
        rank: "#2 National University",
        established: "1885",
        overview: "Stanford University, officially Leland Stanford Junior University, is a private research university in Stanford, California. The university was founded in 1885 by Leland and Jane Stanford.",
        logo: "../assets/images/university-placeholder.svg",
        departments: [
            "School of Humanities and Sciences",
            "School of Engineering",
            "School of Medicine",
            "Graduate School of Business",
            "School of Earth, Energy & Environmental Sciences",
            "School of Education"
        ],
        courses: [
            { name: "Artificial Intelligence" },
            { name: "Entrepreneurship and Innovation" },
            { name: "Environmental Science and Conservation" }
        ]
    },
    {
        id: "3",
        name: "MIT",
        location: "Cambridge, Massachusetts",
        rank: "#3 National University",
        established: "1861",
        overview: "The Massachusetts Institute of Technology (MIT) is a private land-grant research university in Cambridge, Massachusetts. Established in 1861, MIT has played a key role in the development of modern technology and science.",
        logo: "../assets/images/university-placeholder.svg",
        departments: [
            "School of Engineering",
            "School of Science",
            "Sloan School of Management",
            "School of Architecture and Planning",
            "School of Humanities, Arts, and Social Sciences"
        ],
        courses: [
            { name: "Quantum Computing" },
            { name: "Robotic Systems" },
            { name: "Data Science and Machine Learning" }
        ]
    },
    {
        id: "4",
        name: "Yale University",
        location: "New Haven, Connecticut",
        rank: "#4 National University",
        established: "1701",
        overview: "Yale University is a private Ivy League research university in New Haven, Connecticut. Founded in 1701, Yale is the third-oldest institution of higher education in the United States.",
        logo: "../assets/images/university-placeholder.svg",
        departments: [
            "Yale College",
            "Graduate School of Arts and Sciences",
            "School of Medicine",
            "Law School",
            "School of Management",
            "School of Art"
        ],
        courses: [
            { name: "Political Science and International Relations" },
            { name: "History of Art" },
            { name: "Environmental Studies" }
        ]
    },
    {
        id: "5",
        name: "Princeton University",
        location: "Princeton, New Jersey",
        rank: "#5 National University",
        established: "1746",
        overview: "Princeton University is a private Ivy League research university in Princeton, New Jersey. Founded in 1746, Princeton is one of the oldest and most prestigious universities in the United States.",
        logo: "../assets/images/university-placeholder.svg",
        departments: [
            "School of Public and International Affairs",
            "School of Engineering and Applied Science",
            "School of Architecture",
            "Department of Economics",
            "Department of Mathematics"
        ],
        courses: [
            { name: "Mathematical Finance" },
            { name: "Public Policy and International Affairs" },
            { name: "Theoretical Physics" }
        ]
    },
    {
        id: "6",
        name: "Columbia University",
        location: "New York City, New York",
        rank: "#6 National University",
        established: "1754",
        overview: "Columbia University is a private Ivy League research university in New York City. Established in 1754, Columbia is the oldest institution of higher education in New York and the fifth-oldest in the United States.",
        logo: "../assets/images/university-placeholder.svg",
        departments: [
            "Columbia College",
            "Fu Foundation School of Engineering and Applied Science",
            "School of General Studies",
            "Columbia Business School",
            "Columbia Law School",
            "Vagelos College of Physicians and Surgeons"
        ],
        courses: [
            { name: "Journalism and Mass Communication" },
            { name: "Financial Engineering" },
            { name: "Sustainable Development" }
        ]
    }
];
