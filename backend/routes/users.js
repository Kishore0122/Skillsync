const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('location').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateFields = {};
    const allowedFields = [
      'name', 'bio', 'location', 'avatar', 'socialLinks', 
      'education', 'experience', 'preferences'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/skills
// @desc    Add or update skills
// @access  Private
router.post('/skills', auth, [
  body('skills').isArray().withMessage('Skills must be an array'),
  body('skills.*.name').trim().isLength({ min: 1 }).withMessage('Skill name is required'),
  body('skills.*.level').isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert']).withMessage('Invalid skill level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skills } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { skills } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/portfolio
// @desc    Add portfolio item
// @access  Private
router.post('/portfolio', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('url').optional().isURL().withMessage('Invalid URL'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const portfolioItem = {
      title: req.body.title,
      description: req.body.description || '',
      url: req.body.url || '',
      image: req.body.image || '',
      tags: req.body.tags || []
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { portfolio: portfolioItem } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Add portfolio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/portfolio/:portfolioId
// @desc    Delete portfolio item
// @access  Private
router.delete('/portfolio/:portfolioId', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { portfolio: { _id: req.params.portfolioId } } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/follow/:id
// @desc    Follow/Unfollow user
// @access  Private
router.post('/follow/:id', auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { following: req.params.id }
      });
      await User.findByIdAndUpdate(req.params.id, {
        $pull: { followers: req.user.id }
      });
      res.json({ message: 'User unfollowed successfully', following: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { following: req.params.id }
      });
      await User.findByIdAndUpdate(req.params.id, {
        $addToSet: { followers: req.user.id }
      });
      res.json({ message: 'User followed successfully', following: true });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, skills, location, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { 'skills.name': { $regex: q, $options: 'i' } }
      ];
    }
    
    if (skills) {
      const skillsArray = skills.split(',');
      query['skills.name'] = { $in: skillsArray };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ 'reputation.score': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/recommendations
// @desc    Get user recommendations for collaboration
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const userSkills = currentUser.skills.map(skill => skill.name);
    const userInterests = currentUser.preferences.interests || [];

    // Find users with complementary skills or similar interests
    const recommendations = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { 'skills.name': { $in: userSkills } },
        { 'preferences.interests': { $in: userInterests } },
        { 'preferences.lookingForCollaboration': true }
      ]
    })
    .select('-password')
    .sort({ 'reputation.score': -1 })
    .limit(10);

    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/endorse/:userId/skill/:skillName
// @desc    Endorse a user's skill
// @access  Private
router.post('/endorse/:userId/skill/:skillName', auth, async (req, res) => {
  try {
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot endorse yourself' });
    }

    const user = await User.findOneAndUpdate(
      { 
        _id: req.params.userId,
        'skills.name': req.params.skillName
      },
      { 
        $inc: { 'skills.$.endorsements': 1 }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User or skill not found' });
    }

    res.json({ message: 'Skill endorsed successfully', user });
  } catch (error) {
    console.error('Endorse skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId/collaborations
// @desc    Get all collaborations for a user
// @access  Private
router.get('/:userId/collaborations', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const Problem = require('../models/Problem');
    
    console.log('=== FETCHING USER COLLABORATIONS ===');
    console.log('User ID:', userId);
    console.log('Requesting user:', req.user._id);
    
    // Find problems where the user is either the author OR a collaborator
    const [authoredProblems, collaboratedProblems] = await Promise.all([
      // Problems authored by the user (include all statuses)
      Problem.find({
        author: userId,
        'collaborators.0': { $exists: true } // Has at least one collaborator
      })
      .populate('author', 'name email avatar')
      .populate('collaborators.user', 'name email avatar')
      .sort({ createdAt: -1 }),
      
      // Problems where user is a collaborator (include all statuses)
      Problem.find({
        'collaborators.user': userId
      })
      .populate('author', 'name email avatar')
      .populate('collaborators.user', 'name email avatar')
      .sort({ 'collaborators.joinedAt': -1 })
    ]);
    
    console.log('Authored problems:', authoredProblems.length);
    console.log('Collaborated problems:', collaboratedProblems.length);
    
    // Transform the data to include collaboration details
    const userCollaborations = [];
    
    // Add authored problems (user is the project owner)
    authoredProblems.forEach(problem => {
      userCollaborations.push({
        _id: `${problem._id}_${userId}_author`,
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
        role: 'Project Owner',
        joinedAt: problem.createdAt,
        isActive: true,
        isOwner: true
      });
    });
    
    // Add collaborated problems (user is a collaborator)
    collaboratedProblems.forEach(problem => {
      const userCollaboration = problem.collaborators.find(
        collab => collab.user._id.toString() === userId
      );
      
      if (userCollaboration) {
        userCollaborations.push({
          _id: `${problem._id}_${userId}_collaborator`,
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
          isActive: userCollaboration.isActive !== false,
          isOwner: false
        });
      }
    });
    
    // Sort by most recent joined/created date
    userCollaborations.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
    
    console.log('Total collaborations (including owned):', userCollaborations.length);
    
    res.json({ collaborations: userCollaborations });
    
  } catch (error) {
    console.error('Error fetching user collaborations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
