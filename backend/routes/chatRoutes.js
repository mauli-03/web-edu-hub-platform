const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatControllers');
const Message = require('../models/Message');

// GET /api/chats - Get all messages
router.get('/', chatController.getMessages);

// POST /api/chats - Save a new message
router.post('/', chatController.saveMessage);

// PUT /api/chats/status - Update message seen status
router.put('/status', chatController.updateMessageStatus);

// GET /api/chats/users - Get all users
router.get('/users', chatController.getUsers);

// POST /api/chats/users - Register a new user
router.post('/users', chatController.registerUser);

// GET /api/chats - Get all general chat messages
router.get('/general', async (req, res) => {
    try {
        const messages = await Message.find({ room: 'general' })
            .sort({ createdAt: 1 })
            .limit(100);
        
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching general chat messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/chats - Save a new general chat message
router.post('/general', async (req, res) => {
    try {
        const { messageId, username, text, isFile, fileUrl, fileType, isEmoji, isSticker, stickerUrl } = req.body;
        
        if (!messageId || !username || !text) {
            return res.status(400).json({ message: 'Message ID, username and text are required' });
        }
        
        const newMessage = new Message({
            messageId,
            username,
            text,
            room: 'general',
            isFile: isFile || false,
            fileUrl: fileUrl || null,
            fileType: fileType || null,
            isEmoji: isEmoji || false,
            isSticker: isSticker || false,
            stickerUrl: stickerUrl || null
        });
        
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('Error saving general chat message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/chats/:messageId/seen - Mark a message as seen
router.put('/:messageId/seen', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }
        
        const message = await Message.findOne({ messageId });
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        
        // Add user to seen list if not already there
        if (!message.seenBy.includes(username)) {
            message.seenBy.push(username);
            await message.save();
        }
        
        res.status(200).json({ messageId, seenBy: message.seenBy });
    } catch (error) {
        console.error('Error marking message as seen:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 