const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
      'Web Development',
      'Mobile App',
      'AI/ML',
      'Data Science',
      'Design',
      'Game Development',
      'Blockchain',
      'IoT',
      'Research',
      'Open Source',
      'Startup',
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
  duration: {
    type: String,
    enum: ['1-2 weeks', '1-2 months', '3-6 months', '6+ months'],
    default: '1-2 months'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Owner', 'Admin', 'Member'], default: 'Member' },
    skills: [String],
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],
  joinRequests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    skills: [String],
    requestedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
  }],
  tasks: [{
    title: { type: String, required: true },
    description: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Todo', 'In Progress', 'Review', 'Done'], default: 'Todo' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    dueDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  milestones: [{
    title: { type: String, required: true },
    description: String,
    dueDate: Date,
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    completedAt: Date
  }],
  status: {
    type: String,
    enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  visibility: {
    type: String,
    enum: ['Public', 'Private', 'Invite Only'],
    default: 'Public'
  },
  maxMembers: {
    type: Number,
    default: 10,
    min: 1,
    max: 50
  },
  repository: {
    url: String,
    platform: { type: String, enum: ['GitHub', 'GitLab', 'Bitbucket'], default: 'GitHub' }
  },
  demoUrl: String,
  documentation: String,
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['Link', 'File', 'Video', 'Document'] }
  }],
  updates: [{
    title: String,
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  messages: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    type: { type: String, enum: ['text', 'file', 'image'], default: 'text' },
    attachments: [{
      filename: String,
      url: String,
      type: String
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  startDate: Date,
  endDate: Date
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ skillsNeeded: 1 });
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Project', projectSchema);
