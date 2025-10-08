const mentorList = document.getElementById('mentor-list');

// Fetch mentors data from the backend
fetch('http://localhost:5000/api/mentors')
    .then((response) => response.json())
    .then((data) => {
        mentorList.innerHTML = data
            .map((mentor) => `<div class="card mt-3"><div class="card-body"><h5>${mentor.name}</h5><p>${mentor.expertise}</p></div></div>`)
            .join('');
    })
    .catch((err) => console.error('Error fetching mentors:', err));
