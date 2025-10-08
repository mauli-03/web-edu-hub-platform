// Connect to the server
const socket = io('http://localhost:5000', {
    withCredentials: true, // Enable CORS credentials
    transports: ['websocket'], // Force WebSocket transport instead of polling
    upgrade: false // Prevent transport upgrade to avoid polling issues
});

// Get user data from localStorage
let username = localStorage.getItem('username');
let token = localStorage.getItem('token');
let userId = localStorage.getItem('userId');
let isNewUser = false;
let isGuestUser = false;

// Add connection status indicator
socket.on('connect', () => {
    document.getElementById('connection-status').textContent = 'Server connection: Connected';
    document.getElementById('connection-status').style.color = 'green';
    document.getElementById('socket-id').textContent = socket.id;
    document.getElementById('last-event').textContent = 'connect';
});

socket.on('disconnect', () => {
    document.getElementById('connection-status').textContent = 'Server connection: Disconnected';
    document.getElementById('connection-status').style.color = 'red';
    document.getElementById('last-event').textContent = 'disconnect';
});

socket.on('connect_error', (error) => {
    document.getElementById('connection-status').textContent = 'Server connection: Failed to connect';
    document.getElementById('connection-status').style.color = 'red';
    document.getElementById('last-event').textContent = 'connect_error: ' + error;
});

// If user is not logged in or missing required data, set up as guest
if (!username || !token || !userId) {
    console.log('No user data found, setting up as guest user');
    // Generate a random guest username
    username = 'Guest_' + Math.floor(Math.random() * 10000);
    userId = 'guest_' + Date.now();
    localStorage.setItem('username', username);
    localStorage.setItem('userId', userId);
    isGuestUser = true;
    isNewUser = true;
    
    // Socket connection without token for guest
    socket.connect();
} else {
    // Check if this is the first time user is visiting after login
    isNewUser = sessionStorage.getItem('chatSessionStarted') ? false : true;
    sessionStorage.setItem('chatSessionStarted', 'true');
    
    // Authenticate socket connection with token
    socket.auth = { token };
    socket.connect();
}

// Update online users count
socket.on('userJoined', (data) => {
    if (data.users) {
        document.getElementById('online-users').textContent = 'Online users: ' + data.users.length;
        document.getElementById('last-event').textContent = 'userJoined: ' + data.user;
    }
});

socket.on('userLeft', (data) => {
    if (data.users) {
        document.getElementById('online-users').textContent = 'Online users: ' + data.users.length;
        document.getElementById('last-event').textContent = 'userLeft: ' + data.user;
    }
});

// Current active room
let currentRoom = 'general';
let rooms = [];
let emojis = ['😊', '😂', '😍', '👍', '👋', '🎉', '❤️', '🔥', '👏', '🙏', '😎', '🤔', '😢', '😡', '🥳', '🤩', '😴', '🤑', '🤯', '🥺'];
let stickers = [];
let chatMode = 'normal'; // 'normal' or 'room'

// API URL
const API_URL = 'http://localhost:5000/api';

// DOM elements
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const fileButton = document.getElementById('file-button');
const fileInput = document.getElementById('file-input');
const typingIndicator = document.getElementById('typing-indicator');
const emojiButton = document.getElementById('emoji-button');
const emojiPicker = document.getElementById('emoji-picker');
const stickerButton = document.getElementById('sticker-button');
const stickerPicker = document.getElementById('sticker-picker');
const roomList = document.getElementById('room-list');
const createRoomBtn = document.getElementById('create-room-btn');
const createRoomModal = document.getElementById('create-room-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelRoomBtn = document.getElementById('cancel-room');
const saveRoomBtn = document.getElementById('save-room');
const roomNameInput = document.getElementById('room-name');
const roomDescInput = document.getElementById('room-description');
const roomPrivateCheck = document.getElementById('room-private');
const currentRoomDisplay = document.getElementById('current-room');
const roomMembersDisplay = document.getElementById('room-members');
const normalChatTab = document.getElementById('normal-chat-tab');
const roomChatTab = document.getElementById('room-chat-tab');
const chatContainer = document.querySelector('.chat-container');
const onlineUsersList = document.getElementById('online-users-list');
const logoutButton = document.getElementById('logout-button');

// Initialize logout functionality
if (logoutButton) {
    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('username');
        localStorage.removeItem('fullname');
        localStorage.removeItem('email');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        sessionStorage.removeItem('chatSessionStarted');
        window.location.href = 'login.html';
    });
}

// Update username display when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('current-username').textContent = username || 'Not set';
        document.getElementById('user-display-name').textContent = username || 'User';
    }, 1000);
});

// Helper function for API requests with authentication
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
        'x-auth-token': token
    };
    
    const config = {
        method,
        headers
    };
    
    if (body) {
        config.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        showNotification('Error connecting to server', 'error');
        throw error;
    }
}

// Initialize the app
function init() {
    // Update welcome message with username
    const userDisplayName = document.getElementById('user-display-name');
    if (userDisplayName) {
        userDisplayName.textContent = username;
    }
    
    // Load previous messages first
    fetchMessages();
    
    // Join the general room by default
    socket.emit('join', { username, userId });
    socket.emit('joinRoom', { username, userId, roomId: 'general' });
    
    // Request current online users
    socket.emit('getOnlineUsers');
    
    // Load rooms
    fetchRooms();
    
    // Load stickers
    fetchStickers();
    
    // Initialize emoji picker
    initEmojiPicker();
    
    // Setup event listeners
    setupEventListeners();
    
    // Set initial chat mode
    setChatMode('normal');
    
    // Show welcome message for new users
    if (isNewUser) {
        showNotification(`Welcome to ChatZone, ${username}!`, 'success');
        
        // Add system message
        const welcomeMessage = {
            _id: 'welcome_' + Date.now(),
            text: `Welcome to ChatZone! You are now chatting as ${username}.`,
            sender: 'System',
            createdAt: new Date(),
            isSystem: true
        };
        
        displayMessage(welcomeMessage);
    }

    // Early in the file, after the guest user setup
    if (isGuestUser) {
        // Display login promotion for guest users
        setTimeout(() => {
            const loginMessage = {
                _id: 'login_promo_' + Date.now(),
                text: 'You are currently using chat as a guest. <a href="/frontend/pages/login.html">Login</a> or <a href="/frontend/pages/register.html">Register</a> to save your chat history and access all features!',
                sender: 'System',
                createdAt: new Date(),
                isSystem: true
            };
            displayMessage(loginMessage);
        }, 2000);
    }
}

// Set chat mode (normal or room)
function setChatMode(mode) {
    chatMode = mode;
    
    // Update UI based on mode
    if (mode === 'normal') {
        chatContainer.classList.add('normal-chat-mode');
        chatContainer.classList.remove('room-chat-mode');
        normalChatTab.classList.add('active');
        roomChatTab.classList.remove('active');
        currentRoomDisplay.textContent = 'General Chat';
        
        // Switch to general chat
        currentRoom = 'general';
        socket.emit('joinRoom', { username, userId, roomId: 'general' });
        
        // Clear messages and load general chat messages
        messageContainer.innerHTML = '';
        fetchMessages();
    } else {
        chatContainer.classList.remove('normal-chat-mode');
        chatContainer.classList.add('room-chat-mode');
        normalChatTab.classList.remove('active');
        roomChatTab.classList.add('active');
        
        // Update room list
        updateRoomList();
    }
}

// Fetch all chat rooms from the server
function fetchRooms() {
    apiRequest('/rooms')
        .then(data => {
            rooms = data;
            updateRoomList();
        })
        .catch(error => {
            console.error('Error fetching rooms:', error);
            showNotification('Failed to load chat rooms', 'error');
        });
}

// Fetch general chat messages
function fetchMessages() {
    apiRequest('/chats/general')
        .then(data => {
            messageContainer.innerHTML = '';
            data.forEach(message => {
                displayMessage(message);
            });
            // Scroll to bottom
            messageContainer.scrollTop = messageContainer.scrollHeight;
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            showNotification('Failed to load messages', 'error');
        });
}

// Fetch stickers from the server
function fetchStickers() {
    apiRequest('/stickers/packs')
        .then(data => {
            stickers = data;
            updateStickerPicker();
        })
        .catch(error => {
            console.error('Error fetching stickers:', error);
            showNotification('Failed to load stickers', 'error');
            // Set empty stickers array to prevent errors
            stickers = [];
        });
}

// Initialize emoji picker
function initEmojiPicker() {
    const emojiGrid = emojiPicker.querySelector('.emoji-grid');
    emojiGrid.innerHTML = '';
    
    emojis.forEach(emoji => {
        const emojiElement = document.createElement('div');
        emojiElement.classList.add('emoji-item');
        emojiElement.textContent = emoji;
        emojiElement.addEventListener('click', () => {
            sendEmoji(emoji);
            emojiPicker.style.display = 'none';
        });
        emojiGrid.appendChild(emojiElement);
    });
}

// Update sticker picker with stickers from server
function updateStickerPicker() {
    const stickerGrid = stickerPicker.querySelector('.sticker-grid');
    stickerGrid.innerHTML = '';
    
    stickers.forEach(sticker => {
        const stickerElement = document.createElement('div');
        stickerElement.classList.add('sticker-item');
        const img = document.createElement('img');
        img.src = sticker.url;
        img.alt = sticker.name;
        stickerElement.appendChild(img);
        stickerElement.addEventListener('click', () => {
            sendSticker(sticker);
            stickerPicker.style.display = 'none';
        });
        stickerGrid.appendChild(stickerElement);
    });
}

// Update room list in the UI
function updateRoomList() {
    // Keep the general room and create button
    roomList.innerHTML = '<div class="room-item active" data-room-id="general">General Chat</div>';
    
    rooms.forEach(room => {
        if (room._id !== 'general') {
            const roomElement = document.createElement('div');
            roomElement.classList.add('room-item');
            if (room._id === currentRoom) {
                roomElement.classList.add('active');
            }
            roomElement.setAttribute('data-room-id', room._id);
            roomElement.textContent = room.name;
            roomList.appendChild(roomElement);
        }
    });
    
    // Add create room button
    const createBtn = document.createElement('button');
    createBtn.classList.add('create-room-btn');
    createBtn.id = 'create-room-btn';
    createBtn.textContent = 'Create Room';
    createBtn.addEventListener('click', showCreateRoomModal);
    roomList.appendChild(createBtn);
    
    // Add event listeners to room items
    document.querySelectorAll('.room-item').forEach(item => {
        item.addEventListener('click', () => {
            const roomId = item.getAttribute('data-room-id');
            switchRoom(roomId);
        });
    });
}

// Switch to a different room
function switchRoom(roomId) {
    if (roomId === currentRoom) return;
    
    // Leave current room
    socket.emit('leaveRoom', { username, userId, roomId: currentRoom });
    
    // Join new room
    socket.emit('joinRoom', { username, userId, roomId });
    
    // Update UI
    currentRoom = roomId;
    messageContainer.innerHTML = '';
    document.querySelectorAll('.room-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-room-id') === roomId) {
            item.classList.add('active');
        }
    });
    
    // Update room display
    const room = rooms.find(r => r._id === roomId) || { name: 'General Chat' };
    currentRoomDisplay.textContent = room.name;
    
    // Load messages for this room
    fetchRoomMessages(roomId);
    
    showNotification(`Switched to ${room.name}`, 'info');
}

// Fetch messages for a specific room
function fetchRoomMessages(roomId) {
    apiRequest(`/rooms/${roomId}/messages`)
        .then(data => {
            messageContainer.innerHTML = '';
            data.forEach(message => {
                displayMessage(message);
            });
            // Scroll to bottom
            messageContainer.scrollTop = messageContainer.scrollHeight;
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            showNotification('Failed to load messages', 'error');
        });
}

// Setup all event listeners
function setupEventListeners() {
    // Chat mode tabs
    normalChatTab.addEventListener('click', () => setChatMode('normal'));
    roomChatTab.addEventListener('click', () => setChatMode('room'));
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Typing indicator
    let typingTimeout;
    messageInput.addEventListener('input', () => {
        socket.emit('typing', { isTyping: true, roomId: currentRoom });
        
        // Clear typing status after 3 seconds of inactivity
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('typing', { isTyping: false, roomId: currentRoom });
        }, 3000);
    });
    
    // File upload
    fileButton.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', uploadFile);
    
    // Emoji picker
    emojiButton.addEventListener('click', () => {
        if (emojiPicker.style.display === 'block') {
            emojiPicker.style.display = 'none';
        } else {
            emojiPicker.style.display = 'block';
            stickerPicker.style.display = 'none';
        }
    });
    
    // Sticker picker
    stickerButton.addEventListener('click', () => {
        if (stickerPicker.style.display === 'block') {
            stickerPicker.style.display = 'none';
        } else {
            stickerPicker.style.display = 'block';
            emojiPicker.style.display = 'none';
        }
    });
    
    // Close pickers when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiButton.contains(e.target) && !emojiPicker.contains(e.target)) {
            emojiPicker.style.display = 'none';
        }
        if (!stickerButton.contains(e.target) && !stickerPicker.contains(e.target)) {
            stickerPicker.style.display = 'none';
        }
    });
    
    // Room modal
    createRoomBtn.addEventListener('click', showCreateRoomModal);
    closeModalBtn.addEventListener('click', hideCreateRoomModal);
    cancelRoomBtn.addEventListener('click', hideCreateRoomModal);
    saveRoomBtn.addEventListener('click', createRoom);
    
    // Socket events
    socket.on('message', displayMessage);
    
    socket.on('typing', handleTyping);
    socket.on('messageSeen', updateMessageSeen);
    socket.on('roomJoined', handleRoomJoined);
    socket.on('roomLeft', handleRoomLeft);
    socket.on('roomCreated', handleRoomCreated);
}

// Send a text message
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        if (chatMode === 'normal') {
            // Send to general chat
            socket.emit('sendMessage', {
                text: message,
                sender: username,
                userId: userId
            });
        } else {
            // Send to current room
            socket.emit('sendMessage', {
                text: message,
                sender: username,
                userId: userId,
                roomId: currentRoom
            });
        }
        messageInput.value = '';
    }
}

// Send an emoji
function sendEmoji(emoji) {
    if (chatMode === 'normal') {
        // Send to general chat
        socket.emit('sendMessage', {
            text: emoji,
            sender: username,
            userId: userId,
            isEmoji: true
        });
    } else {
        // Send to current room
        socket.emit('sendMessage', {
            text: emoji,
            sender: username,
            userId: userId,
            isEmoji: true,
            roomId: currentRoom
        });
    }
}

// Send a sticker
function sendSticker(sticker) {
    if (chatMode === 'normal') {
        // Send to general chat
        socket.emit('sendMessage', {
            text: sticker.name,
            sender: username,
            userId: userId,
            isSticker: true,
            stickerUrl: sticker.url
        });
    } else {
        // Send to current room
        socket.emit('sendMessage', {
            text: sticker.name,
            sender: username,
            userId: userId,
            isSticker: true,
            stickerUrl: sticker.url,
            roomId: currentRoom
        });
    }
}

// Upload and send a file
function uploadFile() {
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    // Add token to form data
    formData.append('token', token);
    
    fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            'x-auth-token': token
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.fileUrl) {
            if (chatMode === 'normal') {
                // Send to general chat
                socket.emit('sendMessage', {
                    text: file.name,
                    sender: username,
                    userId: userId,
                    fileUrl: data.fileUrl,
                    fileType: file.type
                });
            } else {
                // Send to current room
                socket.emit('sendMessage', {
                    text: file.name,
                    sender: username,
                    userId: userId,
                    fileUrl: data.fileUrl,
                    fileType: file.type,
                    roomId: currentRoom
                });
            }
        }
    })
    .catch(error => {
        console.error('Error uploading file:', error);
        showNotification('Failed to upload file', 'error');
    });
    
    // Clear the input
    fileInput.value = '';
}

// Display a message in the chat
function displayMessage(message) {
    // Skip messages not for current room in room mode
    if (chatMode === 'room' && message.roomId && message.roomId !== currentRoom) {
        return;
    }
    
    // Skip room messages in normal mode
    if (chatMode === 'normal' && message.roomId && message.roomId !== 'general') {
        return;
    }
    
    // Create a message element with proper classes
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.setAttribute('data-id', message._id);
    
    // Check if message is from current user
    const isMyMessage = message.userId === userId || message.sender === username;
    if (isMyMessage) {
        messageElement.classList.add('my-message');
    } else {
        messageElement.classList.add('other-message');
    }
    
    // Create message content based on type
    let messageContent = '';
    
    if (message.isSystem) {
        messageContent = `<div class="system-message">${message.text}</div>`;
        messageElement.classList.remove('my-message', 'other-message');
        messageElement.classList.add('system-message-container');
    } else if (message.isEmoji) {
        messageContent = `<div class="emoji-message">${message.text}</div>`;
    } else if (message.isSticker) {
        messageContent = `<div class="sticker-message"><img src="${message.stickerUrl}" alt="${message.text}"></div>`;
    } else if (message.fileUrl) {
        // Determine file type icon
        let fileIcon = '📄';
        if (message.fileType && message.fileType.startsWith('image/')) {
            fileIcon = '🖼️';
        } else if (message.fileType && message.fileType.startsWith('video/')) {
            fileIcon = '🎬';
        } else if (message.fileType && message.fileType.startsWith('audio/')) {
            fileIcon = '🎵';
        }
        
        messageContent = `
            <div class="file-message">
                <div class="file-icon">${fileIcon}</div>
                <div class="file-info">
                    <div class="file-name">${message.text}</div>
                    <a href="${message.fileUrl}" target="_blank" class="file-download">Download</a>
                </div>
            </div>
        `;
    } else {
        messageContent = `<div class="text-message">${message.text}</div>`;
    }
    
    // Create message header with sender name
    const senderName = isMyMessage ? 'You' : (message.sender || 'Unknown');
    const messageHeader = `<div class="message-header">${senderName}</div>`;
    
    // Create message footer with timestamp and seen status
    const timestamp = message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString();
    const seenStatus = `<div class="seen-status" data-id="${message._id}">Sent</div>`;
    const messageFooter = `<div class="message-footer"><div class="timestamp">${timestamp}</div>${seenStatus}</div>`;
    
    // Combine all parts
    messageElement.innerHTML = `${messageHeader}<div class="message-body">${messageContent}</div>${messageFooter}`;
    
    // Add message to the container
    messageContainer.appendChild(messageElement);
    
    // Add a clearfix div after the message
    const clearfix = document.createElement('div');
    clearfix.style.clear = 'both';
    messageContainer.appendChild(clearfix);
    
    // Scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
    
    // Mark message as seen if it's from someone else
    if (!isMyMessage && !message.isSystem) {
        socket.emit('messageSeen', { messageId: message._id });
    }
}

// Handle typing indicator
function handleTyping(data) {
    // Skip typing indicators not for current room in room mode
    if (chatMode === 'room' && data.roomId && data.roomId !== currentRoom) {
        return;
    }
    
    // Skip room typing indicators in normal mode
    if (chatMode === 'normal' && data.roomId && data.roomId !== 'general') {
        return;
    }
    
    // Get typing users
    const typingUsers = data.users || [];
    
    // Don't show typing indicator if no one is typing or only current user is typing
    if (typingUsers.length === 0 || (typingUsers.length === 1 && typingUsers[0] === username)) {
        typingIndicator.style.display = 'none';
        return;
    }
    
    // Show typing indicator with appropriate message
    if (typingUsers.length === 1) {
        typingIndicator.textContent = `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
        typingIndicator.textContent = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
        typingIndicator.textContent = `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;
    }
    
    typingIndicator.style.display = 'block';
}

// Update message seen status
function updateMessageSeen(data) {
    const seenStatus = document.querySelector(`.seen-status[data-id="${data.messageId}"]`);
    if (seenStatus) {
        if (data.seenBy.length === 0) {
            seenStatus.textContent = 'Sent';
        } else {
            const seenByOthers = data.seenBy.filter(user => user !== username);
            if (seenByOthers.length === 0) {
                seenStatus.textContent = 'Sent';
            } else if (seenByOthers.length === 1) {
                seenStatus.textContent = `Seen by ${seenByOthers[0]}`;
            } else {
                seenStatus.textContent = `Seen by ${seenByOthers.length} users`;
            }
        }
    }
}

// Show create room modal
function showCreateRoomModal() {
    createRoomModal.style.display = 'block';
    roomNameInput.value = '';
    roomDescInput.value = '';
    roomPrivateCheck.checked = false;
}

// Hide create room modal
function hideCreateRoomModal() {
    createRoomModal.style.display = 'none';
}

// Create a new chat room
function createRoom() {
    const name = roomNameInput.value.trim();
    const description = roomDescInput.value.trim();
    const isPrivate = roomPrivateCheck.checked;
    
    if (!name) {
        showNotification('Room name is required', 'error');
        return;
    }
    
    if (!userId) {
        showNotification('User ID not found. Please log in again.', 'error');
        window.location.href = '/frontend/pages/login.html';
        return;
    }
    
    // Show loading notification
    showNotification('Creating room...', 'info');
    
    // Disable save button to prevent multiple submissions
    saveRoomBtn.disabled = true;
    
    apiRequest('/rooms', 'POST', {
        name,
        description,
        isPrivate,
        creator: username,
        creatorId: userId
    })
    .then(data => {
        // Re-enable save button
        saveRoomBtn.disabled = false;
        
        if (data._id) {
            hideCreateRoomModal();
            showNotification(`Room "${name}" created successfully`, 'success');
            // Refresh rooms
            fetchRooms();
        } else {
            showNotification('Failed to create room', 'error');
        }
    })
    .catch(error => {
        // Re-enable save button
        saveRoomBtn.disabled = false;
        
        console.error('Error creating room:', error);
        // Only show one error notification
        showNotification('Failed to create room: ' + (error.message || 'Server error'), 'error');
    });
}

// Handle room joined event
function handleRoomJoined(data) {
    if (data.roomId === currentRoom) {
        // Update room members display
        updateRoomMembers(data.members);
        
        // Show notification if someone else joined
        if (data.username !== username) {
            showNotification(`${data.username} joined the room`, 'info');
        }
    }
}

// Handle room left event
function handleRoomLeft(data) {
    if (data.roomId === currentRoom) {
        // Update room members display
        updateRoomMembers(data.members);
        
        // Show notification
        if (data.username !== username) {
            showNotification(`${data.username} left the room`, 'info');
        }
    }
}

// Handle room created event
function handleRoomCreated(data) {
    // Refresh rooms
    fetchRooms();
    showNotification(`New room "${data.name}" created by ${data.creator}`, 'info');
}

// Update room members display
function updateRoomMembers(members) {
    if (!members) return;
    
    roomMembersDisplay.innerHTML = '';
    members.forEach(member => {
        const memberElement = document.createElement('div');
        memberElement.classList.add('room-member');
        memberElement.textContent = member;
        roomMembersDisplay.appendChild(memberElement);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    // Also show browser notification if permission granted
    if (Notification.permission === 'granted' && type !== 'info') {
        new Notification('ChatZone', {
            body: message
        });
    } else if (Notification.permission !== 'denied' && type !== 'info') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('ChatZone', {
                    body: message
                });
            }
        });
    }
}

// Request notification permission on page load
function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
}

// Update online users list
function updateOnlineUsers(users) {
    if (!users || !Array.isArray(users)) return;
    
    // Clear current list
    onlineUsersList.innerHTML = '';
    
    // Add each user
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.classList.add('online-user');
        
        // Highlight current user
        if (user === username) {
            userElement.classList.add('current-user');
        }
        
        // Add online indicator and username
        userElement.innerHTML = `
            <div class="online-user-indicator"></div>
            <div class="online-user-name">${user}</div>
        `;
        
        onlineUsersList.appendChild(userElement);
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    requestNotificationPermission();
});
