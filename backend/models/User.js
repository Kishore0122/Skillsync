const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  skills: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Beginner' },
    endorsements: { type: Number, default: 0 }
  }],
  portfolio: [{
    title: { type: String, required: true },
    description: String,
    url: String,
    image: String,
    tags: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  socialLinks: {
    github: String,
    linkedin: String,
    website: String,
    twitter: String
  },
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false }
  }],
  experience: [{
    company: String,
    position: String,
    description: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false }
  }],
  reputation: {
    score: { type: Number, default: 0 },
    badges: [String],
    completedChallenges: { type: Number, default: 0 },
    projectContributions: { type: Number, default: 0 }
  },
  preferences: {
    lookingForCollaboration: { type: Boolean, default: true },
    availableForMentoring: { type: Boolean, default: false },
    interests: [String],
    workStyle: { type: String, enum: ['Remote', 'In-person', 'Hybrid'], default: 'Remote' }
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

// Index for search optimization
userSchema.index({ name: 'text', bio: 'text', 'skills.name': 'text' });
userSchema.index({ email: 1 });
userSchema.index({ 'reputation.score': -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
