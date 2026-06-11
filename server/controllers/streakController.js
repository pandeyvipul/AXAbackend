// server/controllers/streakController.js
const User = require('../models/User');

// @desc    Sync daily streak on page load / app open
// @route   GET /student/streak/sync
// @access  Private
const syncStreak = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();

    // If no lastLogin recorded yet, initialize streak
    if (!user.lastLogin) {
      user.lastLogin = now;
      user.dailyStreak = 1;
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Streak started! 🔥',
        dailyStreak: user.dailyStreak,
        points: user.points,
        badges: user.badges,
        streakUpdated: true,
      });
    }

    const lastLogin = new Date(user.lastLogin);
    // Calculate difference in hours between now and last login
    const diffHours = (now - lastLogin) / (1000 * 60 * 60);

    let streakMessage = '';
    let streakUpdated = false;

    if (diffHours < 20) {
      // Already logged in today, no change
      streakMessage = `Keep going! Current streak: ${user.dailyStreak} days 🔥`;
    } else if (diffHours >= 20 && diffHours <= 36) {
      // Exactly ~1 day passed → increment streak
      user.dailyStreak += 1;
      user.points += 5; // +5 points for maintaining streak
      user.lastLogin = now;
      streakUpdated = true;
      streakMessage = `Streak extended to ${user.dailyStreak} days! +5 points awarded 🎯`;

      // Badge: 7-day warrior
      if (user.dailyStreak === 7 && !user.badges.includes('Daily Warrior')) {
        user.badges.push('Daily Warrior');
        streakMessage += ' 🏆 Badge Unlocked: Daily Warrior!';
      }

      // Badge: 30-day legend
      if (user.dailyStreak === 30 && !user.badges.includes('Monthly Legend')) {
        user.badges.push('Monthly Legend');
        streakMessage += ' 👑 Badge Unlocked: Monthly Legend!';
      }
    } else {
      // More than 36 hours → streak broken, reset to 1
      user.dailyStreak = 1;
      user.lastLogin = now;
      streakUpdated = true;
      streakMessage = `Streak reset. Starting fresh from Day 1. You got this! 💪`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: streakMessage,
      dailyStreak: user.dailyStreak,
      points: user.points,
      badges: user.badges,
      streakUpdated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { syncStreak };
