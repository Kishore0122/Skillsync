const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Technology',
      'Education',
      'Healthcare',
      'Environment',
      'Social Impact',
      'Business',
      'Agriculture',
      'Infrastructure',
      'Arts & Culture',
      'Other'
    ]
  },
  tags: [String],
  skillsNeeded: [String],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  estimatedTime: {
    type: String,
    enum: ['1-2 hours', '1-3 days', '1-2 weeks', '1+ months'],
    default: '1-3 days'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supporters: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    supportedAt: { type: Date, default: Date.now }
  }],
  solutions: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    url: String,
    submittedAt: { type: Date, default: Date.now },
    votes: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    joinedAt: { type: Date, default: Date.now },
    isAcknowledged: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Solved', 'Closed', 'Completed'],
    default: 'Open'
  },
  // Completion-related fields
  completedAt: {
    type: Date
  },
  completionNotes: {
    type: String,
    maxlength: 1000
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  budget: {
    amount: Number,
    currency: { type: String, default: 'INR' },
    type: { type: String, enum: ['Fixed', 'Hourly', 'Equity', 'Volunteer'], default: 'Volunteer' }
  },
  deadline: Date,
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  // Project-related fields
  githubRepo: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty/null values
        return /^https?:\/\/(www\.)?github\.com\/[\w\-._]+\/[\w\-._]+\/?$/.test(v);
      },
      message: 'Please enter a valid GitHub repository URL'
    }
  },
  projectLinks: [{
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  }],
  additionalResources: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  projectType: {
    type: String,
    enum: ['New Project', 'Existing Project', 'Open Source', 'Research', 'Prototype'],
    default: 'New Project'
  },
  views: { type: Number, default: 0 },
  isPromoted: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for better performance
problemSchema.index({ category: 1, status: 1 });
problemSchema.index({ author: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ skillsNeeded: 1 });
problemSchema.index({ title: 'text', description: 'text', tags: 'text' });
problemSchema.index({ createdAt: -1 });
problemSchema.index({ 'supporters.user': 1 });

module.exports = mongoose.model('Problem', problemSchema);
