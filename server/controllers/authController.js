// server/controllers/authController.js
const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

// @desc    Register a new student
// @route   POST /student/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, skillsVerified, skillsWanted } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('An account with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      skillsVerified: skillsVerified || [],
      skillsWanted: skillsWanted || [],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Samarthya.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        points: user.points,
        dailyStreak: user.dailyStreak,
        badges: user.badges,
        skillsVerified: user.skillsVerified,
        skillsWanted: user.skillsWanted,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /student/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Explicitly select password since it has select: false
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked. Please contact support.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Update lastLogin for streak tracking
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        points: user.points,
        dailyStreak: user.dailyStreak,
        badges: user.badges,
        skillsVerified: user.skillsVerified,
        skillsWanted: user.skillsWanted,
        resumeData: user.resumeData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /student/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update skills (verified + wanted)
// @route   PUT /student/auth/skills
// @access  Private
const updateSkills = async (req, res, next) => {
  try {
    const { skillsVerified, skillsWanted } = req.body;
    const user = await User.findById(req.user._id);

    if (skillsVerified !== undefined) user.skillsVerified = skillsVerified;
    if (skillsWanted !== undefined) user.skillsWanted = skillsWanted;

    await user.save();
    res.status(200).json({ success: true, message: 'Skills updated', skillsVerified: user.skillsVerified, skillsWanted: user.skillsWanted });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateSkills };
