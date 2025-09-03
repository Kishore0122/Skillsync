const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Problem = require('../models/Problem');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/problems
// @desc    Get all problems with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      status = 'Open', 
      skills, 
      search,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    let query = {};

    // Filters
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (skills) {
      const skillsArray = skills.split(',');
      query.skillsNeeded = { $in: skillsArray };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const problems = await Problem.find(query)
      .populate('author', 'name avatar reputation')
      .populate('supporters.user', 'name avatar')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Problem.countDocuments(query);

    res.json({
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/problems/:id
// @desc    Get problem by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('author', 'name avatar reputation bio')
      .populate('supporters.user', 'name avatar')
      .populate('collaborators.user', 'name avatar skills')
      .populate('solutions.author', 'name avatar reputation');

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Increment view count
    problem.views += 1;
    await problem.save();

    res.json(problem);
  } catch (error) {
    console.error('Get problem error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/problems
// @desc    Create a new problem
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('category').isIn([
    'Technology', 'Education', 'Healthcare', 'Environment', 'Social Impact', 
    'Business', 'Agriculture', 'Infrastructure', 'Arts & Culture', 'Other'
  ]).withMessage('Invalid category'),
  body('skillsNeeded').isArray().withMessage('Skills needed must be an array'),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty level'),
  body('githubRepo').optional().isURL().withMessage('GitHub repository must be a valid URL'),
  body('projectLinks').optional().isArray().withMessage('Project links must be an array'),
  body('projectLinks.*').optional().isURL().withMessage('Each project link must be a valid URL'),
  body('additionalResources').optional().isLength({ max: 1000 }).withMessage('Additional resources must be less than 1000 characters'),
  body('projectType').optional().isIn(['New Project', 'Existing Project', 'Open Source', 'Research', 'Prototype']).withMessage('Invalid project type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const problem = new Problem({
      ...req.body,
      author: req.user.id
    });

    await problem.save();
    
    const populatedProblem = await Problem.findById(problem._id)
      .populate('author', 'name avatar reputation');

    // Update user reputation
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'reputation.score': 5 }
    });

    res.status(201).json(populatedProblem);
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/problems/:id
// @desc    Update problem
// @access  Private (Only problem author)
router.put('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (problem.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this problem' });
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('author', 'name avatar reputation');

    res.json(updatedProblem);
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/problems/:id/support
// @desc    Support/Unsupport a problem
// @access  Private
router.post('/:id/support', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const existingSupport = problem.supporters.find(
      support => support.user.toString() === req.user.id
    );

    if (existingSupport) {
      // Remove support
      problem.supporters = problem.supporters.filter(
        support => support.user.toString() !== req.user.id
      );
    } else {
      // Add support
      problem.supporters.push({ user: req.user.id });
    }

    await problem.save();
    
    const updatedProblem = await Problem.findById(req.params.id)
      .populate('author', 'name avatar reputation')
      .populate('supporters.user', 'name avatar');

    res.json(updatedProblem);
  } catch (error) {
    console.error('Support problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/problems/:id/solutions
// @desc    Submit a solution to a problem
// @access  Private
router.post('/:id/solutions', auth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Solution title is required'),
  body('description').trim().isLength({ min: 20 }).withMessage('Solution description must be at least 20 characters'),
  body('url').optional().isURL().withMessage('Invalid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const solution = {
      author: req.user.id,
      title: req.body.title,
      description: req.body.description,
      url: req.body.url || ''
    };

    problem.solutions.push(solution);
    await problem.save();

    // Update user reputation
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'reputation.score': 10 }
    });

    const updatedProblem = await Problem.findById(req.params.id)
      .populate('solutions.author', 'name avatar reputation');

    res.json(updatedProblem);
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/problems/:id/solutions/:solutionId/vote
// @desc    Vote for a solution
// @access  Private
router.post('/:id/solutions/:solutionId/vote', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const solution = problem.solutions.id(req.params.solutionId);
    
    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    const hasVoted = solution.voters.includes(req.user.id);

    if (hasVoted) {
      // Remove vote
      solution.voters = solution.voters.filter(
        voter => voter.toString() !== req.user.id
      );
      solution.votes -= 1;
    } else {
      // Add vote
      solution.voters.push(req.user.id);
      solution.votes += 1;
    }

    await problem.save();

    const updatedProblem = await Problem.findById(req.params.id)
      .populate('solutions.author', 'name avatar reputation');

    res.json(updatedProblem);
  } catch (error) {
    console.error('Vote solution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/problems/:id/collaborate
// @desc    Send collaboration request (deprecated - use /api/collaboration-requests)
// @access  Private
router.post('/:id/collaborate', auth, async (req, res) => {
  try {
    const { message, proposedRole } = req.body;
    
    console.log('=== PROBLEMS COLLABORATE ENDPOINT DEBUG ===');
    console.log('Request user:', req.user);
    console.log('User ID:', req.user._id);
    console.log('Problem ID:', req.params.id);
    console.log('Request body:', req.body);
    
    // For internal use, we'll call the collaboration request creation directly
    const CollaborationRequest = require('../models/CollaborationRequest');
    const problem = await Problem.findById(req.params.id).populate('author');
    
    console.log('Found problem:', problem ? problem.title : 'NOT FOUND');
    console.log('Problem author:', problem ? problem.author : 'NO AUTHOR');
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Check if user is trying to collaborate on their own problem
    if (problem.author._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send a collaboration request to yourself' });
    }
    
    // Check if request already exists
    const existingRequest = await CollaborationRequest.findOne({
      problem: req.params.id,
      requester: req.user._id
    });
    
    console.log('Existing request check:', existingRequest ? 'EXISTS' : 'NEW');
    
    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You have already sent a collaboration request for this problem'
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
      problem: req.params.id,
      requester: req.user._id,
      problemAuthor: problem.author._id,
      message: message || 'I would like to collaborate on this problem.',
      proposedRole: proposedRole || 'Collaborator'
    });
    
    console.log('Creating collaboration request:', collaborationRequest);
    
    await collaborationRequest.save();
    console.log('Collaboration request saved successfully');
    
    res.json({ 
      message: 'Collaboration request sent successfully! The problem author will review your request.',
      requestId: collaborationRequest._id
    });
    
  } catch (error) {
    console.error('Collaborate on problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/problems/:id/complete
// @desc    Mark problem as completed (Only problem author)
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { completionNotes, acknowledgedCollaborators } = req.body;
    
    console.log('=== MARK PROBLEM AS COMPLETED ===');
    console.log('Problem ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('Completion notes:', completionNotes);
    
    const problem = await Problem.findById(req.params.id)
      .populate('author', 'name email')
      .populate('collaborators.user', 'name email');
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Check if user is the problem author
    if (problem.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the problem author can mark it as completed' });
    }
    
    // Check if problem is already completed
    if (problem.status === 'Completed') {
      return res.status(400).json({ message: 'Problem is already marked as completed' });
    }
    
    // Update problem status
    problem.status = 'Completed';
    problem.completedAt = new Date();
    problem.completionNotes = completionNotes || '';
    
    // Acknowledge collaborators if provided
    if (acknowledgedCollaborators && Array.isArray(acknowledgedCollaborators)) {
      problem.collaborators.forEach(collab => {
        if (acknowledgedCollaborators.includes(collab.user._id.toString())) {
          collab.isAcknowledged = true;
        }
      });
    }
    
    await problem.save();
    
    // Update author's reputation for completing a project
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        'reputation.score': 15,
        'reputation.projectContributions': 1
      }
    });
    
    // Update collaborators' reputation if acknowledged
    if (acknowledgedCollaborators && acknowledgedCollaborators.length > 0) {
      await User.updateMany(
        { _id: { $in: acknowledgedCollaborators } },
        { 
          $inc: { 
            'reputation.score': 10,
            'reputation.projectContributions': 1
          }
        }
      );
    }
    
    // Populate the updated problem
    const updatedProblem = await Problem.findById(req.params.id)
      .populate('author', 'name avatar reputation bio')
      .populate('collaborators.user', 'name avatar reputation')
      .populate('supporters.user', 'name avatar');
    
    console.log('Problem marked as completed successfully');
    
    res.json({
      message: 'Problem marked as completed successfully',
      problem: updatedProblem
    });
    
  } catch (error) {
    console.error('Mark problem as completed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/problems/:id
// @desc    Delete problem
// @access  Private (Only problem author)
router.delete('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (problem.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this problem' });
    }

    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/problems/user/posted
// @desc    Get problems posted by the authenticated user
// @access  Private
router.get('/user/posted', auth, async (req, res) => {
  try {
    console.log('=== FETCHING USER POSTED PROBLEMS ===');
    console.log('User ID:', req.user._id);
    
    const problems = await Problem.find({ author: req.user._id })
      .populate('author', 'name avatar reputation')
      .populate('collaborators.user', 'name avatar reputation')
      .populate('supporters.user', 'name avatar')
      .sort({ createdAt: -1 });
    
    console.log('Found user problems:', problems.length);
    
    res.json({
      problems,
      total: problems.length
    });
  } catch (error) {
    console.error('Get user posted problems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
