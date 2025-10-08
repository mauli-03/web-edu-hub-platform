require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const { pool, mongoose } = require("./config/db.js"); // Remove .js extension
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

// Import models
const Message = require("./models/Message");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

// Define allowed origins
const allowedOrigins = [
  "http://localhost:5500", 
  "http://127.0.0.1:5500",
  "http://localhost:5501", 
  "http://127.0.0.1:5501",
  "http://localhost:5502", 
  "http://127.0.0.1:5502",
  "http://localhost:3000"
];

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins, // Allow all development origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-auth-token", "Authorization"],
    credentials: true
  }
});

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
        console.log(msg);
        console.log('Allowed origins are:', allowedOrigins);
        // For debugging purposes, we'll allow all origins during development
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-auth-token']
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use(express.json()); // Enable JSON body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.static("frontend")); // Serve static frontend files

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

// Also serve from public/uploads for blog images
app.use("/uploads", express.static(path.join(__dirname, 'public/uploads')));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Additionally serve frontend for development
app.use(express.static(path.join(__dirname, '../frontend')));

// Add proper CORS headers for image requests
app.use((req, res, next) => {
  // Add CORS headers specifically for image files
  if (req.path.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  }
  next();
});

app.use("/public/uploads", express.static("public/uploads")); // Serve images from public/uploads folder
app.use("/stickers", express.static(path.join(__dirname, 'stickers'))); // Serve stickers

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ 
    message: 'File uploaded successfully',
    fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype
  });
});

const authRoute = require('./routes/authRoutes'); // Declare authRoute here
app.use('/api/auth', authRoute); // Use authRoute after declaration

// ✅ Import Routes
const universityRoutes = require("./routes/universityRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const blogRoutes = require('./routes/blogRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatRoomRoutes = require('./routes/chatRoomRoutes');
const stickerRoutes = require('./routes/stickerRoutes');

// ✅ Register Routes
app.use("/api/universities", universityRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/rooms", chatRoomRoutes);
app.use("/api/stickers", stickerRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
    res.send("Education Hub API is running...");
});

const Blog = require("./models/Blog");

// API Route to Fetch Blogs
app.get("/api/blogs", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6; // 6 blogs per page
        const skip = (page - 1) * limit;

        const totalBlogs = await Blog.countDocuments();
        const blogs = await Blog.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        res.json({
            blogs,
            currentPage: page,
            totalPages: Math.ceil(totalBlogs / limit),
            totalBlogs,
            blogsPerPage: limit
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Socket.io connection
const connectedUsers = {};
const typingUsers = {};
const messageStatus = {};
const userRooms = {}; // Track which rooms users are in
const typingTimeouts = {};

// Socket authentication middleware
io.use((socket, next) => {
  // Check for token in socket auth
  const token = socket.handshake.auth.token;
  
  if (!token) {
    // Allow connection without token for guest users
    console.log('Client connecting as guest');
    socket.userId = 'guest_' + Date.now();
    socket.username = 'Guest_' + Math.floor(Math.random() * 10000);
    socket.isGuest = true;
    return next();
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.id;
    socket.username = decoded.username;
    socket.isGuest = false;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    // Allow connection with invalid token as guest
    console.log('Token invalid, connecting as guest');
    socket.userId = 'guest_' + Date.now();
    socket.username = 'Guest_' + Math.floor(Math.random() * 10000);
    socket.isGuest = true;
    next();
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle user joining
  socket.on('join', (userData) => {
    // Use authenticated username from token
    const username = socket.username;
    const userId = socket.userId;
    
    connectedUsers[socket.id] = { username, userId };
    
    // Broadcast to all clients that a new user has joined
    io.emit('userJoined', {
      user: username,
      userId: userId,
      users: Object.values(connectedUsers).map(user => user.username)
    });
    
    console.log(`${username} (${userId}) joined the chat`);
  });
  
  // Handle request for online users
  socket.on('getOnlineUsers', () => {
    const onlineUsers = Object.values(connectedUsers).map(user => user.username);
    socket.emit('onlineUsers', { users: onlineUsers });
  });
  
  // Handle joining a chat room
  socket.on('joinRoom', ({ roomId }) => {
    // Use authenticated username from token
    const username = socket.username;
    const userId = socket.userId;
    
    // Join the socket.io room
    socket.join(roomId);
    
    // Track which room this user is in
    if (!userRooms[socket.id]) {
      userRooms[socket.id] = [];
    }
    
    if (!userRooms[socket.id].includes(roomId)) {
      userRooms[socket.id].push(roomId);
    }
    
    // Notify room members
    io.to(roomId).emit('userJoinedRoom', {
      user: username,
      roomId
    });
    
    console.log(`${username} (${userId}) joined room ${roomId}`);
  });
  
  // Handle leaving a chat room
  socket.on('leaveRoom', ({ roomId }) => {
    // Use authenticated username from token
    const username = socket.username;
    const userId = socket.userId;
    
    // Leave the socket.io room
    socket.leave(roomId);
    
    // Remove room from user's tracked rooms
    if (userRooms[socket.id]) {
      userRooms[socket.id] = userRooms[socket.id].filter(id => id !== roomId);
    }
    
    // Notify room members
    io.to(roomId).emit('userLeftRoom', {
      user: username,
      userId: userId,
      roomId
    });
    
    console.log(`${username} (${userId}) left room ${roomId}`);
  });
  
  // Handle chat messages
  socket.on('sendMessage', (messageData) => {
    // Use authenticated username from token or provided username
    const username = socket.username || messageData.username;
    const userId = socket.userId || messageData.userId || null;
    
    const { text, roomId, isEmoji, isSticker, stickerUrl, fileUrl, fileType } = messageData;
    
    // Generate a unique message ID
    const messageId = uuidv4();
    
    // Create message object
    const message = {
      _id: messageId,
      text,
      sender: username,
      userId: userId,
      createdAt: new Date(),
      isEmoji: isEmoji || false,
      isSticker: isSticker || false,
      stickerUrl: stickerUrl || null,
      fileUrl: fileUrl || null,
      fileType: fileType || null,
      seenBy: []
    };
    
    // If roomId is provided, add it to the message and send to that room
    if (roomId) {
      message.roomId = roomId;
      
      // Save message to database if we have a userId
      if (userId) {
        const newMessage = new Message({
          messageId,
          username: username,
          userId: userId,
          text,
          room: roomId,
          isFile: fileUrl ? true : false,
          fileUrl,
          fileType,
          isEmoji,
          isSticker,
          stickerUrl
        });
        
        newMessage.save()
          .then(() => console.log(`Message saved to room ${roomId}`))
          .catch(err => console.error('Error saving message:', err));
      }
      
      // Send to room
      io.to(roomId).emit('message', message);
      
      console.log(`Message from ${username} to room ${roomId}: ${text}`);
    } else {
      // This is a general chat message
      message.roomId = 'general';
      
      // Save message to database if we have a userId
      if (userId) {
        const newMessage = new Message({
          messageId,
          username: username,
          userId: userId,
          text,
          room: 'general',
          isFile: fileUrl ? true : false,
          fileUrl,
          fileType,
          isEmoji,
          isSticker,
          stickerUrl
        });
        
        newMessage.save()
          .then(() => console.log('Message saved to general chat'))
          .catch(err => console.error('Error saving message:', err));
      }
      
      // Send to all clients
      io.emit('message', message);
      
      console.log(`Message from ${username} to general chat: ${text}`);
    }
    
    // Clear typing indicator when message is sent
    if (typingUsers[socket.id]) {
      delete typingUsers[socket.id];
      
      if (roomId) {
        io.to(roomId).emit('typing', {
          username: null,
          roomId,
          users: Object.values(typingUsers)
            .filter(u => u.roomId === roomId)
            .map(u => u.username)
        });
      } else {
        io.emit('typing', {
          username: null,
          users: Object.values(typingUsers)
            .filter(u => !u.roomId || u.roomId === 'general')
            .map(u => u.username)
        });
      }
    }
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    const { isTyping, roomId } = data;
    const user = connectedUsers[socket.id];
    
    if (user) {
      if (isTyping) {
        typingUsers[socket.id] = {
          username: user.username,
          roomId: roomId || 'general'
        };
      } else if (typingUsers[socket.id]) {
        delete typingUsers[socket.id];
      }
      
      // Broadcast typing users to appropriate recipients
      if (roomId) {
        io.to(roomId).emit('typing', {
          users: Object.values(typingUsers)
            .filter(u => u.roomId === roomId)
            .map(u => u.username),
          roomId
        });
      } else {
        io.emit('typing', {
          users: Object.values(typingUsers)
            .filter(u => u.roomId === 'general')
            .map(u => u.username),
          roomId: 'general'
        });
      }
      
      // Clear typing status after a timeout if user is typing
      if (isTyping) {
        clearTimeout(typingTimeouts[socket.id]);
        typingTimeouts[socket.id] = setTimeout(() => {
          if (typingUsers[socket.id]) {
            delete typingUsers[socket.id];
            
            if (roomId) {
              io.to(roomId).emit('typing', {
                users: Object.values(typingUsers)
                  .filter(u => u.roomId === roomId)
                  .map(u => u.username),
                roomId
              });
            } else {
              io.emit('typing', {
                users: Object.values(typingUsers)
                  .filter(u => u.roomId === 'general')
                  .map(u => u.username),
                roomId: 'general'
              });
            }
          }
        }, 3000);
      }
    }
  });
  
  // Handle message seen
  socket.on('messageSeen', (data) => {
    const { messageId, roomId } = data;
    const user = connectedUsers[socket.id];
    
    if (user && messageStatus[messageId]) {
      // Add user to seen list if not the sender and not already in the list
      if (messageStatus[messageId].sender !== user.username && 
          !messageStatus[messageId].seenBy.includes(user.username)) {
        messageStatus[messageId].seenBy.push(user.username);
        
        // Broadcast message seen status to appropriate recipients
        if (roomId) {
          io.to(roomId).emit('messageStatus', {
            messageId,
            seenBy: messageStatus[messageId].seenBy,
            roomId
          });
        } else {
          io.emit('messageStatus', {
            messageId,
            seenBy: messageStatus[messageId].seenBy
          });
        }
        
        console.log(`Message ${messageId} seen by ${user.username}`);
      }
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers[socket.id];
    if (user) {
      delete connectedUsers[socket.id];
      
      // Remove from typing users if they were typing
      if (typingUsers[socket.id]) {
        delete typingUsers[socket.id];
        io.emit('userTyping', {
          users: Object.values(typingUsers)
            .filter(u => !u.roomId)
            .map(u => u.username)
        });
      }
      
      // Leave all rooms
      if (userRooms[socket.id]) {
        userRooms[socket.id].forEach(roomId => {
          io.to(roomId).emit('userLeftRoom', {
            user: user.username,
            roomId
          });
        });
        
        delete userRooms[socket.id];
      }
      
      // Broadcast to all clients that a user has left
      io.emit('userLeft', {
        user: user.username,
        users: Object.values(connectedUsers).map(user => user.username)
      });
      
      console.log(`${user.username} left the chat`);
    }
    
    console.log('Client disconnected:', socket.id);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`Chat interface available at http://127.0.0.1:5500/frontend/pages/chat.html`);
});
