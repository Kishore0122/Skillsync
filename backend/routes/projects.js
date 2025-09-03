const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Socket.IO instance will be passed from server.js
let io;

// Function to set the Socket.IO instance
const setSocketIO = (socketIO) => {
  io = socketIO;
};

// @route   GET /api/projects
// @desc    Get all projects with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      status, 
      skills, 
      search,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    let query = { visibility: { $in: ['Public'] } };

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

    const projects = await Project.find(query)
      .populate('owner', 'name avatar reputation')
      .populate('members.user', 'name avatar')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Public/Private (depends on visibility)
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar reputation bio')
      .populate('members.user', 'name avatar skills reputation')
      .populate('joinRequests.user', 'name avatar skills')
      .populate('tasks.assignedTo', 'name avatar')
      .populate('tasks.createdBy', 'name avatar')
      .populate('messages.author', 'name avatar')
      .populate('likes', 'name avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to private project
    if (project.visibility === 'Private') {
      // Implementation depends on authentication middleware
      // For now, we'll allow access to all
    }

    // Increment view count
    project.views += 1;
    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('category').isIn([
    'Web Development', 'Mobile App', 'AI/ML', 'Data Science', 'Design', 
    'Game Development', 'Blockchain', 'IoT', 'Research', 'Open Source', 'Startup', 'Other'
  ]).withMessage('Invalid category'),
  body('skillsNeeded').isArray().withMessage('Skills needed must be an array'),
  body('maxMembers').optional().isInt({ min: 1, max: 50 }).withMessage('Max members must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = new Project({
      ...req.body,
      owner: req.user.id,
      members: [{
        user: req.user.id,
        role: 'Owner',
        skills: []
      }]
    });

    await project.save();
    
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name avatar reputation')
      .populate('members.user', 'name avatar');

    // Update user reputation
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'reputation.score': 10 }
    });

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Only project owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('owner', 'name avatar reputation')
     .populate('members.user', 'name avatar');

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/join
// @desc    Request to join project
// @access  Private
router.post('/:id/join', auth, [
  body('message').optional().trim(),
  body('skills').optional().isArray().withMessage('Skills must be an array')
], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is already a member
    const isMember = project.members.some(
      member => member.user.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    // Check if user already has a pending request
    const existingRequest = project.joinRequests.find(
      request => request.user.toString() === req.user.id && request.status === 'Pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending join request' });
    }

    // Check if project has reached max members
    if (project.members.length >= project.maxMembers) {
      return res.status(400).json({ message: 'Project has reached maximum member limit' });
    }

    const joinRequest = {
      user: req.user.id,
      message: req.body.message || '',
      skills: req.body.skills || []
    };

    project.joinRequests.push(joinRequest);
    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate('joinRequests.user', 'name avatar skills');

    res.json(updatedProject);
  } catch (error) {
    console.error('Join project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id/join-requests/:requestId
// @desc    Accept or reject join request
// @access  Private (Only project owner or admins)
router.put('/:id/join-requests/:requestId', auth, [
  body('action').isIn(['accept', 'reject']).withMessage('Action must be accept or reject')
], async (req, res) => {
  try {
    const { action } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userMember = project.members.find(
      member => member.user.toString() === req.user.id
    );

    // Check if user is project owner OR has admin/owner role in members
    const isProjectOwner = project.owner.toString() === req.user.id;
    const hasAdminRole = userMember && ['Owner', 'Admin'].includes(userMember.role);

    if (!isProjectOwner && !hasAdminRole) {
      return res.status(403).json({ message: 'Not authorized to manage join requests' });
    }

    const joinRequest = project.joinRequests.id(req.params.requestId);
    
    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    if (action === 'accept') {
      // Add user to members
      project.members.push({
        user: joinRequest.user,
        role: 'Member',
        skills: joinRequest.skills
      });

      // Update user reputation
      await User.findByIdAndUpdate(joinRequest.user, {
        $inc: { 'reputation.projectContributions': 1 }
      });
    }

    joinRequest.status = action === 'accept' ? 'Accepted' : 'Rejected';
    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate('members.user', 'name avatar skills')
      .populate('joinRequests.user', 'name avatar skills');

    res.json(updatedProject);
  } catch (error) {
    console.error('Manage join request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/join-requests/received
// @desc    Get all join requests for projects owned by the current user
// @access  Private
router.get('/join-requests/received', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .populate('joinRequests.user', 'name avatar skills email')
      .select('title joinRequests createdAt');

    // Flatten all join requests with project info
    const allJoinRequests = [];
    projects.forEach(project => {
      project.joinRequests.forEach(request => {
        allJoinRequests.push({
          _id: request._id,
          user: request.user,
          message: request.message,
          skills: request.skills,
          status: request.status,
          createdAt: request.createdAt,
          project: {
            _id: project._id,
            title: project.title
          }
        });
      });
    });

    // Sort by creation date (newest first)
    allJoinRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ requests: allJoinRequests });
  } catch (error) {
    console.error('Get join requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/join-requests/sent
// @desc    Get all join requests sent by the current user
// @access  Private
router.get('/join-requests/sent', auth, async (req, res) => {
  try {
    const projects = await Project.find({ 'joinRequests.user': req.user.id })
      .populate('owner', 'name avatar')
      .select('title owner joinRequests createdAt');

    // Filter and flatten join requests sent by current user
    const sentJoinRequests = [];
    projects.forEach(project => {
      const userRequests = project.joinRequests.filter(
        request => request.user.toString() === req.user.id
      );
      userRequests.forEach(request => {
        sentJoinRequests.push({
          _id: request._id,
          message: request.message,
          skills: request.skills,
          status: request.status,
          createdAt: request.createdAt,
          project: {
            _id: project._id,
            title: project.title,
            owner: project.owner
          }
        });
      });
    });

    // Sort by creation date (newest first)
    sentJoinRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ requests: sentJoinRequests });
  } catch (error) {
    console.error('Get sent join requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/tasks
// @desc    Create a new task
// @access  Private (Project members only)
router.post('/:id/tasks', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Task title is required'),
  body('description').optional().trim(),
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Only project members can create tasks' });
    }

    const task = {
      title: req.body.title,
      description: req.body.description || '',
      assignedTo: req.body.assignedTo,
      priority: req.body.priority || 'Medium',
      dueDate: req.body.dueDate,
      createdBy: req.user.id
    };

    project.tasks.push(task);
    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate('tasks.assignedTo', 'name avatar')
      .populate('tasks.createdBy', 'name avatar');

    res.json(updatedProject);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id/tasks/:taskId
// @desc    Update task
// @access  Private (Project members only)
router.put('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Only project members can update tasks' });
    }

    const task = project.tasks.id(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    Object.assign(task, req.body);
    task.updatedAt = new Date();
    
    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate('tasks.assignedTo', 'name avatar')
      .populate('tasks.createdBy', 'name avatar');

    res.json(updatedProject);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/messages
// @desc    Send message to project chat
// @access  Private (Project members only)
router.post('/:id/messages', auth, [
  body('content').trim().isLength({ min: 1 }).withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      member => member.user.toString() === req.user.id
    );
    const isOwner = project.owner.toString() === req.user.id;

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Only project members and owner can send messages' });
    }

    const message = {
      author: req.user.id,
      content: req.body.content,
      type: req.body.type || 'text',
      attachments: req.body.attachments || []
    };

    project.messages.push(message);
    await project.save();

    // Get the newly created message with populated author
    const updatedProject = await Project.findById(req.params.id)
      .populate('messages.author', 'name avatar');
    
    const newMessage = updatedProject.messages[updatedProject.messages.length - 1];

    // Emit real-time message to all users in the project room
    if (io) {
      io.to(`project-${req.params.id}`).emit('new-message', {
        projectId: req.params.id,
        message: newMessage
      });
    }

    res.json({ message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/like
// @desc    Like/Unlike project
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasLiked = project.likes.includes(req.user.id);

    if (hasLiked) {
      // Unlike
      project.likes = project.likes.filter(
        like => like.toString() !== req.user.id
      );
    } else {
      // Like
      project.likes.push(req.user.id);
    }

    await project.save();
    
    const updatedProject = await Project.findById(req.params.id)
      .populate('likes', 'name avatar');

    res.json(updatedProject);
  } catch (error) {
    console.error('Like project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Only project owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id/messages
// @desc    Get project chat messages
// @access  Private (Project members and owner only)
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('messages.author', 'name avatar')
      .select('messages owner members');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project owner or member
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = project.members.some(member => member.user.toString() === req.user.id);
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Not authorized to view project messages' });
    }

    res.json({ messages: project.messages || [] });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
module.exports.setSocketIO = setSocketIO;
