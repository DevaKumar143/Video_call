const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String, // Optional field for profile picture
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


// Create the model
const User = mongoose.model('User', userSchema);

// Export or use the model
module.exports = User;