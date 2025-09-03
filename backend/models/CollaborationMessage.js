const mongoose = require('mongoose');

const collaborationMessageSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  editedAt: {
    type: Date
  },
  isEdited: {
    type: Boolean,
    default: false
  }
});

// Index for efficient queries
collaborationMessageSchema.index({ problem: 1, createdAt: 1 });
collaborationMessageSchema.index({ sender: 1 });

module.exports = mongoose.model('CollaborationMessage', collaborationMessageSchema);
