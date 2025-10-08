const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get all messages
exports.getMessages = async (req, res) => {
  try {
    const room = req.query.room || 'general';
    const messages = await Message.find({ room })
      .sort({ createdAt: 1 })
      .limit(50);
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save a new message
exports.saveMessage = async (req, res) => {
  try {
    const { username, text, messageId, room = 'general', isFile = false, fileUrl = null, fileType = null } = req.body;
    
    if (!username || !text || !messageId) {
      return res.status(400).json({ message: 'Username, text, and messageId are required' });
    }
    
    const newMessage = new Message({
      messageId,
      username,
      text,
      room,
      isFile,
      fileUrl,
      fileType,
      seenBy: []
    });
    
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update message seen status
exports.updateMessageStatus = async (req, res) => {
  try {
    const { messageId, username } = req.body;
    
    if (!messageId || !username) {
      return res.status(400).json({ message: 'MessageId and username are required' });
    }
    
    const message = await Message.findOne({ messageId });
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Add username to seenBy array if not already there and not the sender
    if (message.username !== username && !message.seenBy.includes(username)) {
      message.seenBy.push(username);
      await message.save();
    }
    
    res.status(200).json(message);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: 'Username, email, password and name are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this username or email already exists' 
      });
    }
    
    const newUser = new User({
      username,
      email,
      password,
      name
    });
    
    const savedUser = await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Don't send the password back
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 