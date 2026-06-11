// server/controllers/adminController.js
const User = require('../models/User');
const Test = require('../models/Test');
const BarterMatch = require('../models/BarterMatch');
const { generateToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// @desc    Admin login (separate from student login)
// @route   POST /adminvipul755/auth/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Invalid admin credentials');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid admin credentials');
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed/create first admin (run once, then disable if needed)
// @route   POST /adminvipul755/auth/seed
// @access  Public (protected by secret body key)
const seedAdmin = async (req, res, next) => {
  try {
    const { seedKey, name, email, password } = req.body;

    // Extra protection: require a secret seed key in the request body
    if (seedKey !== 'SAMARTHYA_SEED_ADMIN_2024') {
      res.status(403);
      throw new Error('Invalid seed key');
    }

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      res.status(400);
      throw new Error('Admin already seeded');
    }

    const admin = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ success: true, message: 'Admin account created', adminId: admin._id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform-wide stats dashboard
// @route   GET /adminvipul755/stats
// @access  Admin
const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTests, totalMatches, liveTests, flaggedTests, betaTests] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Test.countDocuments(),
      BarterMatch.countDocuments(),
      Test.countDocuments({ status: 'live' }),
      Test.countDocuments({ status: 'flagged' }),
      Test.countDocuments({ status: 'beta' }),
    ]);

    const completedMatches = await BarterMatch.countDocuments({ status: 'completed' });
    const recentUsers = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email credits points dailyStreak createdAt');

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, recentSignups: recentUsers },
        tests: { total: totalTests, live: liveTests, beta: betaTests, flagged: flaggedTests },
        barterMatches: { total: totalMatches, completed: completedMatches },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get moderation queue: flagged + beta tests awaiting review
// @route   GET /adminvipul755/moderation/tests
// @access  Admin
const getModerationQueue = async (req, res, next) => {
  try {
    const { status = 'flagged', page = 1, limit = 20 } = req.query;
    const validStatuses = ['flagged', 'beta', 'live'];
    const filterStatus = validStatuses.includes(status) ? status : 'flagged';

    const tests = await Test.find({ status: filterStatus })
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Test.countDocuments({ status: filterStatus });

    res.status(200).json({ success: true, total, tests });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate a test: approve (live), flag, or delete
// @route   PATCH /adminvipul755/moderation/tests/:testId
// @access  Admin
const moderateTest = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const { action } = req.body;
    // action: 'approve' | 'flag' | 'delete'

    const validActions = ['approve', 'flag', 'delete'];
    if (!validActions.includes(action)) {
      res.status(400);
      throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
    }

    const test = await Test.findById(testId);
    if (!test) {
      res.status(404);
      throw new Error('Test not found');
    }

    if (action === 'delete') {
      await Test.findByIdAndDelete(testId);
      // Also remove all associated barter matches
      await BarterMatch.deleteMany({ testId });
      return res.status(200).json({ success: true, message: 'Test and all associated bookings permanently deleted.' });
    }

    test.status = action === 'approve' ? 'live' : 'flagged';
    await test.save();

    res.status(200).json({
      success: true,
      message: `Test status updated to "${test.status}"`,
      test,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students with filters
// @route   GET /adminvipul755/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isBlocked } = req.query;

    const query = { role: 'student' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    res.status(200).json({ success: true, total, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or unblock a student account
// @route   PATCH /adminvipul755/users/:userId/block
// @access  Admin
const toggleUserBlock = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { block } = req.body; // true = block, false = unblock

    if (typeof block !== 'boolean') {
      res.status(400);
      throw new Error('"block" field must be a boolean (true or false)');
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot block an admin account');
    }

    user.isBlocked = block;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been ${block ? 'blocked' : 'unblocked'} successfully.`,
      userId: user._id,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually adjust a user's credits or points
// @route   PATCH /adminvipul755/users/:userId/credits
// @access  Admin
const adjustUserCredits = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { credits, points } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (credits !== undefined) user.credits = Math.max(0, credits);
    if (points !== undefined) user.points = Math.max(0, points);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User balance updated',
      credits: user.credits,
      points: user.points,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  seedAdmin,
  getPlatformStats,
  getModerationQueue,
  moderateTest,
  getAllUsers,
  toggleUserBlock,
  adjustUserCredits,
};
