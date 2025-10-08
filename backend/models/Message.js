const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  room: {
    type: String,
    default: 'general'
  },
  isFile: {
    type: Boolean,
    default: false
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileType: {
    type: String,
    default: null
  },
  isEmoji: {
    type: Boolean,
    default: false
  },
  isSticker: {
    type: Boolean,
    default: false
  },
  stickerUrl: {
    type: String,
    default: null
  },
  seenBy: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema); 