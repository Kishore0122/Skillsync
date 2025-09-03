const express = require('express');
const router = express.Router();
const CollaborationRequest = require('../models/CollaborationRequest');
const Problem = require('../models/Problem');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/collaboration-requests
// @desc    Send a collaboration request
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { problemId, message, proposedRole } = req.body;
    
    console.log('=== COLLABORATION REQUEST DEBUG ===');
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);
    console.log('Problem ID:', problemId);
    
    // Check if problem exists
    const problem = await Problem.findById(problemId).populate('author');
    console.log('Found problem:', problem ? 'YES' : 'NO');
    if (problem) {
      console.log('Problem author:', problem.author);
    }
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Check if user is trying to collaborate on their own problem
    if (problem.author._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send a collaboration request to yourself' });
    }
    
    // Check if request already exists
    const existingRequest = await CollaborationRequest.findOne({
      problem: problemId,
      requester: req.user._id
    });
    
    console.log('Existing request check:', existingRequest ? 'EXISTS' : 'NEW');
    
    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You have already sent a collaboration request for this problem',
        existingRequest: existingRequest
      });
    }
    
    // Check if user is already a collaborator
    const isAlreadyCollaborator = problem.collaborators.some(
      collab => collab.user.toString() === req.user._id.toString()
    );
    
    console.log('Already collaborator check:', isAlreadyCollaborator ? 'YES' : 'NO');
    
    if (isAlreadyCollaborator) {
      return res.status(400).json({ message: 'You are already a collaborator on this problem' });
    }
    
    // Create collaboration request
    const collaborationRequest = new CollaborationRequest({
      problem: problemId,
      requester: req.user._id,
      problemAuthor: problem.author._id,
      message: message || 'I would like to collaborate on this problem.',
      proposedRole: proposedRole || 'Collaborator'
    });
    
    console.log('Creating collaboration request:', collaborationRequest);
    
    await collaborationRequest.save();
    console.log('Collaboration request saved successfully');
    
    // Populate the request with user details for response
    await collaborationRequest.populate(['requester', 'problemAuthor', 'problem']);
    
    res.status(201).json({
      message: 'Collaboration request sent successfully',
      collaborationRequest
    });
    
  } catch (error) {
    console.error('Error sending collaboration request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/collaboration-requests/received
// @desc    Get collaboration requests received by the user
// @access  Private
router.get('/received', auth, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    console.log('=== RECEIVED REQUESTS DEBUG ===');
    console.log('Request user:', req.user);
    console.log('User ID:', req.user._id);
    console.log('Status filter:', status);
    
    // Check total requests for this user first
    const totalRequests = await CollaborationRequest.countDocuments({
      problemAuthor: req.user._id
    });
    console.log('Total requests for this user (any status):', totalRequests);
    
    const requests = await CollaborationRequest.find({
      problemAuthor: req.user._id,
      ...(status !== 'all' && { status })
    })
    .populate('requester', 'name email')
    .populate('problem', 'title description category difficulty')
    .sort({ requestedAt: -1 });
    
    console.log('Found requests with status filter:', requests.length);
    console.log('Requests:', requests);
    
    res.json({ requests });
    
  } catch (error) {
    console.error('Error fetching received requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/collaboration-requests/sent
// @desc    Get collaboration requests sent by the user
// @access  Private
router.get('/sent', auth, async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    const requests = await CollaborationRequest.find({
      requester: req.user._id,
      ...(status !== 'all' && { status })
    })
    .populate('problemAuthor', 'name email')
    .populate('problem', 'title description category difficulty')
    .sort({ requestedAt: -1 });
    
    res.json({ requests });
    
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/collaboration-requests/:id/respond
// @desc    Accept or reject a collaboration request
// @access  Private
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { status, responseMessage } = req.body;
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either "accepted" or "rejected"' });
    }
    
    const collaborationRequest = await CollaborationRequest.findById(req.params.id)
      .populate('requester')
      .populate('problem');
    
    if (!collaborationRequest) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }
    
    // Check if the current user is the problem author
    if (collaborationRequest.problemAuthor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only respond to requests for your own problems' });
    }
    
    // Check if request is still pending
    if (collaborationRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been responded to' });
    }
    
    // Update the collaboration request
    collaborationRequest.status = status;
    collaborationRequest.respondedAt = new Date();
    collaborationRequest.responseMessage = responseMessage || '';
    
    await collaborationRequest.save();
    
    // If accepted, add user as collaborator to the problem
    if (status === 'accepted') {
      const problem = await Problem.findById(collaborationRequest.problem._id);
      
      // Check if user is not already a collaborator (double-check)
      const isAlreadyCollaborator = problem.collaborators.some(
        collab => collab.user.toString() === collaborationRequest.requester._id.toString()
      );
      
      if (!isAlreadyCollaborator) {
        problem.collaborators.push({
          user: collaborationRequest.requester._id,
          role: collaborationRequest.proposedRole,
          joinedAt: new Date()
        });
        
        await problem.save();
      }
    }
    
    res.json({
      message: `Collaboration request ${status} successfully`,
      collaborationRequest
    });
    
  } catch (error) {
    console.error('Error responding to collaboration request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/collaboration-requests/:id
// @desc    Cancel/delete a collaboration request
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const collaborationRequest = await CollaborationRequest.findById(req.params.id);
    
    if (!collaborationRequest) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }
    
    // Check if the current user is the requester
    if (collaborationRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own requests' });
    }
    
    // Only allow cancellation of pending requests
    if (collaborationRequest.status !== 'pending') {
      return res.status(400).json({ message: 'You can only cancel pending requests' });
    }
    
    await CollaborationRequest.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Collaboration request cancelled successfully' });
    
  } catch (error) {
    console.error('Error cancelling collaboration request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/collaboration-requests/stats
// @desc    Get collaboration request statistics for the user
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const [receivedStats, sentStats] = await Promise.all([
      CollaborationRequest.aggregate([
        { $match: { problemAuthor: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      CollaborationRequest.aggregate([
        { $match: { requester: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);
    
    const formatStats = (stats) => {
      const result = { pending: 0, accepted: 0, rejected: 0 };
      stats.forEach(stat => {
        result[stat._id] = stat.count;
      });
      return result;
    };
    
    res.json({
      received: formatStats(receivedStats),
      sent: formatStats(sentStats)
    });
    
  } catch (error) {
    console.error('Error fetching collaboration stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
