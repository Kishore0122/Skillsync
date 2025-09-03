const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 3000
  },
  instructions: {
    type: String,
    required: true,
    maxlength: 5000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Frontend Development',
      'Backend Development',
      'Full Stack',
      'Mobile Development',
      'UI/UX Design',
      'Data Science',
      'Machine Learning',
      'DevOps',
      'Problem Solving',
      'Algorithm',
      'Database Design',
      'Other'
    ]
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  skillsRequired: [String],
  tags: [String],
  estimatedTime: {
    type: String,
    enum: ['1-2 hours', '3-5 hours', '1-2 days', '3-7 days'],
    default: '3-5 hours'
  },
  points: {
    type: Number,
    default: 100,
    min: 50,
    max: 1000
  },
  badge: {
    name: String,
    icon: String,
    color: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['Link', 'Video', 'Document', 'Tutorial'] }
  }],
  requirements: {
    submissionType: {
      type: String,
      enum: ['GitHub Repository', 'Live Demo', 'File Upload', 'Text Submission'],
      default: 'GitHub Repository'
    },
    requiredFiles: [String],
    maxFileSize: { type: Number, default: 10 }, // in MB
    allowedFormats: [String]
  },
  submissions: [{
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submissionUrl: String,
    demoUrl: String,
    description: String,
    files: [{
      filename: String,
      url: String,
      type: String
    }],
    submittedAt: { type: Date, default: Date.now },
    score: Number,
    feedback: String,
    isWinner: { type: Boolean, default: false },
    votes: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  winners: [{
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rank: Number,
    prize: String,
    announcedAt: { type: Date, default: Date.now }
  }],
  sponsors: [{
    name: String,
    logo: String,
    url: String,
    contribution: String
  }],
  judges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  evaluationCriteria: [{
    criterion: String,
    weight: Number, // percentage
    description: String
  }],
  totalParticipants: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
challengeSchema.index({ category: 1, difficulty: 1 });
challengeSchema.index({ startDate: 1, endDate: 1 });
challengeSchema.index({ isActive: 1 });
challengeSchema.index({ participants: 1 });
challengeSchema.index({ title: 'text', description: 'text', tags: 'text' });
challengeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Challenge', challengeSchema);
