const express = require('express');
const router = express.Router();
const chatRoomController = require('../controllers/chatRoomController');

// GET /api/rooms - Get all chat rooms
router.get('/', chatRoomController.getAllRooms);

// GET /api/rooms/:id - Get a specific chat room
router.get('/:id', chatRoomController.getRoomById);

// POST /api/rooms - Create a new chat room
router.post('/', chatRoomController.createRoom);

// POST /api/rooms/join - Join a chat room
router.post('/join', chatRoomController.joinRoom);

// POST /api/rooms/leave - Leave a chat room
router.post('/leave', chatRoomController.leaveRoom);

// GET /api/rooms/:id/messages - Get messages for a specific room
router.get('/:id/messages', chatRoomController.getRoomMessages);

module.exports = router; 