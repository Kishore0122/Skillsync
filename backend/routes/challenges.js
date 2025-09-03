const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/challenges
// @desc    Get all challenges with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      status = 'active', 
      search,
      page = 1, 
      limit = 20,
      sortBy = 'startDate',
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
    
    if (status === 'active') {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    } else if (status === 'upcoming') {
      query.startDate = { $gt: new Date() };
    } else if (status === 'ended') {
      query.endDate = { $lt: new Date() };
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

    const challenges = await Challenge.find(query)
      .populate('createdBy', 'name avatar reputation')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Challenge.countDocuments(query);

    res.json({
      challenges,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/challenges/:id
// @desc    Get challenge by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('createdBy', 'name avatar reputation bio')
      .populate('participants', 'name avatar reputation')
      .populate('submissions.participant', 'name avatar reputation')
      .populate('winners.participant', 'name avatar reputation')
      .populate('judges', 'name avatar reputation');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    console.error('Get challenge error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/challenges
// @desc    Create a new challenge
// @access  Private (Admin only - for MVP, any authenticated user)
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 50, max: 3000 }).withMessage('Description must be between 50 and 3000 characters'),
  body('instructions').trim().isLength({ min: 20, max: 5000 }).withMessage('Instructions must be between 20 and 5000 characters'),
  body('category').isIn([
    'Frontend Development', 'Backend Development', 'Full Stack', 'Mobile Development',
    'UI/UX Design', 'Data Science', 'Machine Learning', 'DevOps', 'Problem Solving',
    'Algorithm', 'Database Design', 'Other'
  ]).withMessage('Invalid category'),
  body('difficulty').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty level'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('points').optional().isInt({ min: 50, max: 1000 }).withMessage('Points must be between 50 and 1000')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate date range
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    
    if (endDate <= startDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const challenge = new Challenge({
      ...req.body,
      createdBy: req.user.id
    });

    await challenge.save();
    
    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('createdBy', 'name avatar reputation');

    res.status(201).json(populatedChallenge);
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/challenges/:id/participate
// @desc    Join/Leave challenge
// @access  Private
router.post('/:id/participate', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if challenge is active and not ended
    const now = new Date();
    if (now < challenge.startDate) {
      return res.status(400).json({ message: 'Challenge has not started yet' });
    }
    
    if (now > challenge.endDate) {
      return res.status(400).json({ message: 'Challenge has ended' });
    }

    if (!challenge.isActive) {
      return res.status(400).json({ message: 'Challenge is not active' });
    }

    const isParticipant = challenge.participants.includes(req.user.id);

    if (isParticipant) {
      // Leave challenge (only if no submission made)
      const hasSubmission = challenge.submissions.some(
        submission => submission.participant.toString() === req.user.id
      );

      if (hasSubmission) {
        return res.status(400).json({ message: 'Cannot leave challenge after making a submission' });
      }

      challenge.participants = challenge.participants.filter(
        participant => participant.toString() !== req.user.id
      );
      challenge.totalParticipants -= 1;
    } else {
      // Join challenge
      challenge.participants.push(req.user.id);
      challenge.totalParticipants += 1;
    }

    await challenge.save();
    
    const updatedChallenge = await Challenge.findById(req.params.id)
      .populate('participants', 'name avatar reputation');

    res.json({
      message: isParticipant ? 'Left challenge successfully' : 'Joined challenge successfully',
      challenge: updatedChallenge,
      participating: !isParticipant
    });
  } catch (error) {
    console.error('Participate in challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/challenges/:id/submit
// @desc    Submit solution to challenge
// @access  Private
router.post('/:id/submit', auth, [
  body('submissionUrl').optional().isURL().withMessage('Invalid submission URL'),
  body('demoUrl').optional().isURL().withMessage('Invalid demo URL'),
  body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user is a participant
    if (!challenge.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'You must join the challenge before submitting' });
    }

    // Check if challenge is still active
    const now = new Date();
    if (now > challenge.endDate) {
      return res.status(400).json({ message: 'Challenge submission deadline has passed' });
    }

    // Check if user already submitted
    const existingSubmission = challenge.submissions.find(
      submission => submission.participant.toString() === req.user.id
    );

    if (existingSubmission) {
      // Update existing submission
      Object.assign(existingSubmission, {
        submissionUrl: req.body.submissionUrl || existingSubmission.submissionUrl,
        demoUrl: req.body.demoUrl || existingSubmission.demoUrl,
        description: req.body.description,
        files: req.body.files || existingSubmission.files,
        submittedAt: new Date()
      });
    } else {
      // Create new submission
      const submission = {
        participant: req.user.id,
        submissionUrl: req.body.submissionUrl || '',
        demoUrl: req.body.demoUrl || '',
        description: req.body.description,
        files: req.body.files || []
      };

      challenge.submissions.push(submission);
      challenge.totalSubmissions += 1;
    }

    await challenge.save();

    // Update user reputation
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'reputation.score': challenge.points / 2 }
    });

    const updatedChallenge = await Challenge.findById(req.params.id)
      .populate('submissions.participant', 'name avatar reputation');

    res.json({
      message: existingSubmission ? 'Submission updated successfully' : 'Submission created successfully',
      challenge: updatedChallenge
    });
  } catch (error) {
    console.error('Submit to challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/challenges/:id/submissions/:submissionId/vote
// @desc    Vote for a submission
// @access  Private
router.post('/:id/submissions/:submissionId/vote', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const submission = challenge.submissions.id(req.params.submissionId);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is trying to vote for their own submission
    if (submission.participant.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot vote for your own submission' });
    }

    const hasVoted = submission.voters.includes(req.user.id);

    if (hasVoted) {
      // Remove vote
      submission.voters = submission.voters.filter(
        voter => voter.toString() !== req.user.id
      );
      submission.votes -= 1;
    } else {
      // Add vote
      submission.voters.push(req.user.id);
      submission.votes += 1;
    }

    await challenge.save();

    const updatedChallenge = await Challenge.findById(req.params.id)
      .populate('submissions.participant', 'name avatar reputation');

    res.json(updatedChallenge);
  } catch (error) {
    console.error('Vote submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/challenges/:id/winners
// @desc    Announce winners (Admin only)
// @access  Private
router.post('/:id/winners', auth, [
  body('winners').isArray().withMessage('Winners must be an array'),
  body('winners.*.participant').isMongoId().withMessage('Invalid participant ID'),
  body('winners.*.rank').isInt({ min: 1 }).withMessage('Invalid rank'),
  body('winners.*.prize').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user is challenge creator (in a real app, check for admin role)
    if (challenge.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to announce winners' });
    }

    // Check if challenge has ended
    if (new Date() < challenge.endDate) {
      return res.status(400).json({ message: 'Cannot announce winners before challenge ends' });
    }

    challenge.winners = req.body.winners;
    await challenge.save();

    // Update winner reputations
    for (const winner of req.body.winners) {
      const bonusPoints = winner.rank === 1 ? challenge.points : 
                         winner.rank === 2 ? Math.floor(challenge.points * 0.7) :
                         winner.rank === 3 ? Math.floor(challenge.points * 0.5) :
                         Math.floor(challenge.points * 0.3);

      await User.findByIdAndUpdate(winner.participant, {
        $inc: { 
          'reputation.score': bonusPoints,
          'reputation.completedChallenges': 1
        }
      });
    }

    const updatedChallenge = await Challenge.findById(req.params.id)
      .populate('winners.participant', 'name avatar reputation');

    res.json({
      message: 'Winners announced successfully',
      challenge: updatedChallenge
    });
  } catch (error) {
    console.error('Announce winners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/challenges/my/participated
// @desc    Get user's participated challenges
// @access  Private
router.get('/my/participated', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      participants: req.user.id
    })
    .populate('createdBy', 'name avatar')
    .sort({ createdAt: -1 });

    res.json(challenges);
  } catch (error) {
    console.error('Get participated challenges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/challenges/my/submissions
// @desc    Get user's challenge submissions
// @access  Private
router.get('/my/submissions', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      'submissions.participant': req.user.id
    })
    .populate('createdBy', 'name avatar')
    .sort({ createdAt: -1 });

    // Filter to only include user's submissions
    const userSubmissions = challenges.map(challenge => {
      const userSubmission = challenge.submissions.find(
        sub => sub.participant.toString() === req.user.id
      );
      return {
        challenge: {
          _id: challenge._id,
          title: challenge.title,
          category: challenge.category,
          difficulty: challenge.difficulty,
          points: challenge.points,
          endDate: challenge.endDate
        },
        submission: userSubmission
      };
    });

    res.json(userSubmissions);
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/challenges/:id
// @desc    Delete challenge
// @access  Private (Challenge creator only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this challenge' });
    }

    // Check if challenge has started (prevent deletion of active challenges)
    if (new Date() >= challenge.startDate && challenge.participants.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete challenge that has started and has participants' 
      });
    }

    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
