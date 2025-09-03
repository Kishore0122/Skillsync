const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const CollaborationMessage = require('../models/CollaborationMessage');
const auth = require('../middleware/auth');

// Socket.IO instance will be passed from server.js
let io;

// Function to set the Socket.IO instance
const setSocketIO = (socketIO) => {
  io = socketIO;
};

// @route   GET /api/users/:userId/collaborations
// @desc    Get all collaborations for a user
// @access  Private
router.get('/:userId/collaborations', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('=== FETCHING USER COLLABORATIONS ===');
    console.log('User ID:', userId);
    console.log('Requesting user:', req.user._id);
    
    // Find problems where the user is a collaborator
    const collaborations = await Problem.find({
      'collaborators.user': userId
    })
    .populate('author', 'name email avatar')
    .populate('collaborators.user', 'name email avatar')
    .sort({ 'collaborators.joinedAt': -1 });
    
    // Transform the data to include collaboration details
    const userCollaborations = [];
    
    collaborations.forEach(problem => {
      const userCollaboration = problem.collaborators.find(
        collab => collab.user._id.toString() === userId
      );
      
      if (userCollaboration) {
        userCollaborations.push({
          _id: `${problem._id}_${userId}`,
          problem: {
            _id: problem._id,
            title: problem.title,
            description: problem.description,
            category: problem.category,
            difficulty: problem.difficulty,
            status: problem.status,
            author: problem.author,
            collaborators: problem.collaborators
          },
          role: userCollaboration.role,
          joinedAt: userCollaboration.joinedAt,
          isActive: userCollaboration.isActive
        });
      }
    });
    
    console.log('Found collaborations:', userCollaborations.length);
    
    res.json({ collaborations: userCollaborations });
    
  } catch (error) {
    console.error('Error fetching user collaborations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/collaborations/:collaborationId/messages
// @desc    Get chat messages for a collaboration
// @access  Private
router.get('/:collaborationId/messages', auth, async (req, res) => {
  try {
    const { collaborationId } = req.params;
    
    // Extract problemId from collaborationId (format: problemId_userId)
    const problemId = collaborationId.split('_')[0];
    
    console.log('=== FETCHING COLLABORATION MESSAGES ===');
    console.log('Collaboration ID:', collaborationId);
    console.log('Problem ID:', problemId);
    console.log('Requesting user:', req.user._id);
    
    // Verify user is part of this collaboration
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    const isAuthor = problem.author.toString() === req.user._id.toString();
    const isCollaborator = problem.collaborators.some(
      collab => collab.user.toString() === req.user._id.toString()
    );
    
    if (!isAuthor && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Fetch messages for this problem
    const messages = await CollaborationMessage.find({
      problem: problemId
    })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: 1 });
    
    console.log('Found messages:', messages.length);
    
    res.json({ messages });
    
  } catch (error) {
    console.error('Error fetching collaboration messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/collaborations/:collaborationId/messages
// @desc    Send a message in collaboration chat
// @access  Private
router.post('/:collaborationId/messages', auth, async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Extract problemId from collaborationId
    const problemId = collaborationId.split('_')[0];
    
    console.log('=== SENDING COLLABORATION MESSAGE ===');
    console.log('Collaboration ID:', collaborationId);
    console.log('Problem ID:', problemId);
    console.log('Sender:', req.user._id);
    console.log('Message:', message);
    
    // Verify user is part of this collaboration
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    const isAuthor = problem.author.toString() === req.user._id.toString();
    const isCollaborator = problem.collaborators.some(
      collab => collab.user.toString() === req.user._id.toString()
    );
    
    if (!isAuthor && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Create new message
    const newMessage = new CollaborationMessage({
      problem: problemId,
      sender: req.user._id,
      content: message.trim()
    });
    
    await newMessage.save();
    
    // Populate sender details
    await newMessage.populate('sender', 'name email avatar');
    
    console.log('Message saved successfully');
    
    // Emit real-time message to all users in the collaboration room
    if (io) {
      io.to(`collaboration-${collaborationId}`).emit('new-collaboration-message', {
        collaborationId: collaborationId,
        message: newMessage
      });
    }
    
    res.status(201).json({ message: newMessage });
    
  } catch (error) {
    console.error('Error sending collaboration message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
module.exports.setSocketIO = setSocketIO;
