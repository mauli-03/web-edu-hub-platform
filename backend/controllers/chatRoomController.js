const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// Get all chat rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find().sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific chat room
exports.getRoomById = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    res.status(200).json(room);
  } catch (error) {
    console.error('Error fetching chat room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new chat room
exports.createRoom = async (req, res) => {
  try {
    const { name, description, isPrivate, creator, creatorId } = req.body;
    
    if (!name || !creator || !creatorId) {
      return res.status(400).json({ message: 'Room name, creator, and creatorId are required' });
    }
    
    // Check if room with same name already exists
    const existingRoom = await ChatRoom.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'A room with this name already exists' });
    }
    
    // Convert string IDs to MongoDB ObjectIds
    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
    
    const newRoom = new ChatRoom({
      name,
      description: description || '',
      isPrivate: isPrivate || false,
      creator,
      creatorId: creatorObjectId,
      members: [creator], // Creator is automatically a member
      memberIds: [creatorObjectId] // Creator is automatically a member
    });
    
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join a chat room
exports.joinRoom = async (req, res) => {
  try {
    const { roomId, username } = req.body;
    
    if (!roomId || !username) {
      return res.status(400).json({ message: 'Room ID and username are required' });
    }
    
    const room = await ChatRoom.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    // Check if user is already a member
    if (room.members.includes(username)) {
      return res.status(400).json({ message: 'User is already a member of this room' });
    }
    
    // Add user to members
    room.members.push(username);
    await room.save();
    
    res.status(200).json(room);
  } catch (error) {
    console.error('Error joining chat room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Leave a chat room
exports.leaveRoom = async (req, res) => {
  try {
    const { roomId, username } = req.body;
    
    if (!roomId || !username) {
      return res.status(400).json({ message: 'Room ID and username are required' });
    }
    
    const room = await ChatRoom.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    // Check if user is a member
    if (!room.members.includes(username)) {
      return res.status(400).json({ message: 'User is not a member of this room' });
    }
    
    // Remove user from members
    room.members = room.members.filter(member => member !== username);
    await room.save();
    
    res.status(200).json(room);
  } catch (error) {
    console.error('Error leaving chat room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a specific room
exports.getRoomMessages = async (req, res) => {
  try {
    const roomId = req.params.id;
    
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: 1 })
      .limit(100);
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching room messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 