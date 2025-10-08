// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const courseGrid = document.getElementById('course-grid');
    const paginationControls = document.getElementById('pagination-controls');
    
    // Store all courses for filtering
    let allCourses = [];
    let currentPage = 1;
    const coursesPerPage = 6; // Show 6 courses per page
    
    // Fetch courses from the backend
    async function fetchCourses() {
        try {
            const response = await fetch('http://localhost:5000/api/courses');
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            
            const data = await response.json();
            allCourses = data;
            
            // Display courses and set up pagination
            displayCourses(allCourses, currentPage);
            updatePaginationControls();
        } catch (error) {
            console.error("Error fetching courses:", error);
            if (courseGrid) {
                courseGrid.innerHTML = "<p>Failed to load courses</p>";
            }
        }
    }

    // Display courses dynamically with pagination
    function displayCourses(courses, page = 1) {
        if (!courseGrid) {
            console.error("Course grid element not found");
            return;
        }
        
        courseGrid.innerHTML = ""; // Clear existing content

        if (courses.length === 0) {
            courseGrid.innerHTML = "<p>No courses found.</p>";
            if (paginationControls) {
                paginationControls.style.display = "none";
            }
            return;
        }
        
        // Calculate pagination
        const startIndex = (page - 1) * coursesPerPage;
        const endIndex = startIndex + coursesPerPage;
        const coursesToDisplay = courses.slice(startIndex, endIndex);

        // Display current page courses
        coursesToDisplay.forEach(course => {
            const courseCard = document.createElement("div");
            courseCard.classList.add("course-card");

            // Handle image paths correctly
            let imageUrl;
            if (course.image) {
                // If the image path starts with http, use it directly
                if (course.image.startsWith('http')) {
                    imageUrl = course.image;
                } else {
                    // Otherwise, prepend the backend URL
                    imageUrl = `http://localhost:5000${course.image}`;
                }
            } else {
                // Use the fallback image
                imageUrl = "../assets/images/default-course-thumbnail.jpg";
            }

            const title = course.title || "Untitled Course";
            const description = course.description || "No description available.";
            const category = course.category || "Uncategorized";
            const duration = course.duration || "N/A";

            courseCard.innerHTML = `
                <img src="${imageUrl}" alt="${title}" class="course-thumbnail">
                <h2 class="course-title">${title}</h2>
                <p class="course-description">${description}</p>
                <p class="course-tags">Category: ${category}</p>
                <p class="course-duration">Duration: ${duration}</p>
                <a href="course-detail.html?id=${course._id}" class="course-link">View Course</a>
            `;

            courseGrid.appendChild(courseCard);
        });
    }

    // Update pagination controls
    function updatePaginationControls() {
        if (!paginationControls) {
            console.error("Pagination controls element not found");
            return;
        }
        
        const totalPages = Math.ceil(allCourses.length / coursesPerPage);
        paginationControls.innerHTML = "";
        
        if (totalPages <= 1) {
            paginationControls.style.display = "none";
            return;
        }

        paginationControls.style.display = "flex";

        // Add page indicator
        const pageIndicator = document.createElement("div");
        pageIndicator.className = "page-indicator";
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        paginationControls.appendChild(pageIndicator);

        // Add previous button if not on first page
        if (currentPage > 1) {
            const prevButton = document.createElement("button");
            prevButton.className = "pagination-btn prev-btn";
            prevButton.textContent = "Previous";
            prevButton.addEventListener("click", () => {
                currentPage--;
                displayCourses(allCourses, currentPage);
                updatePaginationControls();
                // Scroll to top of course section
                courseGrid.scrollIntoView({ behavior: "smooth" });
            });
            paginationControls.appendChild(prevButton);
        }

        // Add next button if not on last page
        if (currentPage < totalPages) {
            const nextButton = document.createElement("button");
            nextButton.className = "pagination-btn next-btn";
            nextButton.textContent = "Next";
            nextButton.addEventListener("click", () => {
                currentPage++;
                displayCourses(allCourses, currentPage);
                updatePaginationControls();
                // Scroll to top of course section
                courseGrid.scrollIntoView({ behavior: "smooth" });
            });
            paginationControls.appendChild(nextButton);
        }
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const searchText = searchInput.value.toLowerCase();
            const filteredCourses = allCourses.filter(course =>
                course.title.toLowerCase().includes(searchText)
            );
            currentPage = 1; // Reset to first page when searching
            displayCourses(filteredCourses, currentPage);
            updatePaginationControls();
        });
    }

    // Load courses on page load
    fetchCourses();
});
