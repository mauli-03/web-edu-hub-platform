document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');

    loginBtn.addEventListener('click', () => {
        // TODO: Implement login modal/page
        console.log('Login clicked');
    });

    signupBtn.addEventListener('click', () => {
        // TODO: Implement signup modal/page
        console.log('Signup clicked');
    });

    // Socket.IO Chat Integration (placeholder)
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
        console.log('Connected to Education Hub Chat');
    });

    socket.on('receive_message', (data) => {
        // TODO: Implement message display logic
        console.log('New message:', data);
    });
});
