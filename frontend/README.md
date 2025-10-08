# EduHub Frontend

A comprehensive educational platform connecting learners with resources, communities, and educational institutions.

## Features

- **Authentication System**
  - Login/Signup with token-based authentication
  - Profile management
  - Role-based access control

- **Blogging Platform**
  - Create, edit, and delete blog posts
  - Image upload functionality
  - Commenting system
  - Pagination and filtering

- **University Directory**
  - Browse university listings
  - Detailed university profiles
  - Search and filter capabilities
  - University comparison

- **Forums & Discussion**
  - Topic-based discussion boards
  - Real-time comment threads
  - User reputation system
  - Moderation tools

- **Interactive Components**
  - 3D flip cards with animations
  - Responsive design that works on all devices
  - Touch support for mobile devices
  - Animation effects on scroll

## Technology Stack

- **Frontend Framework**: Vanilla JavaScript with modular architecture
- **Styling**: Tailwind CSS, Bootstrap components
- **API Communication**: Fetch API with async/await
- **Authentication**: JWT token-based auth system
- **Media Handling**: File upload with preview
- **UI Components**: Custom built interactive elements

## Project Structure

```
frontend/
├── components/      # Reusable UI components
├── css/             # Stylesheets
├── images/          # Static images and assets
├── js/              # JavaScript modules
│   ├── auth.js      # Authentication functions
│   ├── blog.js      # Blog functionality
│   ├── utils.js     # Helper functions
│   └── ...
└── pages/           # HTML pages
    ├── home.html    # Home page
    ├── blogs.html   # Blog listing
    ├── login.html   # Authentication
    └── ...
```

## Navigation System

The platform uses a dynamic navbar system that:
- Updates based on authentication state (logged in/out)
- Shows user profile info when logged in
- Provides appropriate navigation options based on user role
- Maintains responsive design across devices

## Authentication Flow

1. Users register or login through dedicated forms
2. Authentication tokens are stored in localStorage
3. Navbar updates to reflect authenticated state
4. Protected routes check for valid tokens
5. Authentication persists across page refreshes
6. Logout removes tokens and redirects to login

## Blog System

The blog system supports:
- Creating new blog posts with rich text
- Uploading feature images for posts
- Viewing blogs with pagination
- Commenting on blog posts
- Editing and deleting user's own posts
- Fallback mechanisms for network errors

## Getting Started

1. Clone the repository
2. Open any HTML page in the browser or use a local server
3. For full functionality, ensure the backend server is running

## Backend Integration

This frontend is designed to work with the EduHub backend API:
- Default API endpoint: http://localhost:5000/api
- Configure in js/utils.js to change the endpoint
- All API calls include proper error handling
- Fallback content is provided when API is unavailable

## Browser Support

The platform supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 