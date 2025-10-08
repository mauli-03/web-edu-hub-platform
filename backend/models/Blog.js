const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  content: { 
    type: String, 
    required: true, 
    trim: true 
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 200
  },
  image: { 
    type: String, 
    default: "https://source.unsplash.com/400x250/?blog" // Default image
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  readTime: {
    type: Number,
    default: 3 // Default read time in minutes
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, { timestamps: true }); // Adds createdAt & updatedAt automatically

// Virtual for blog URL
BlogSchema.virtual('url').get(function() {
  return `/blogs/${this._id}`;
});

// Calculate read time based on content length (approximately 200 words per minute)
BlogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const words = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(words / 200));
  }
  next();
});

module.exports = mongoose.model("Blog", BlogSchema);
