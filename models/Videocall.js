const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      leftAt: {
        type: Date
      }
    }
  ],
  callStartedAt: {
    type: Date,
    default: Date.now
  },
  joinLink: {
    type: String
  },
  callEndedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ongoing', 'ended', 'scheduled'],
    default: 'ongoing'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VideoCall', videoCallSchema);
