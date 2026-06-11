// server/controllers/smartMatchController.js
const User = require('../models/User');

// @desc    Find reciprocal skill-swap matches for the logged-in student
// @route   GET /student/smartmatch
// @access  Private
const getSmartMatches = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser.skillsVerified.length || !currentUser.skillsWanted.length) {
      return res.status(200).json({
        success: true,
        message: 'Add skills you have (verified) and skills you want to learn to find matches.',
        matches: [],
      });
    }

    // MongoDB aggregation pipeline to find RECIPROCAL matches:
    // User A (me) has a verified skill that User B wants,
    // AND User B has a verified skill that User A wants.
    const matches = await User.aggregate([
      {
        // Exclude the current user and blocked users
        $match: {
          _id: { $ne: currentUserId },
          isBlocked: false,
          role: 'student',
        },
      },
      {
        // Add computed fields for matching logic
        $addFields: {
          // Skills that this candidate has, that I want
          theyHaveWhatIWant: {
            $filter: {
              input: '$skillsVerified',
              as: 'skill',
              cond: { $in: ['$$skill', currentUser.skillsWanted] },
            },
          },
          // Skills that I have (verified), that this candidate wants
          iHaveWhatTheyWant: {
            $filter: {
              input: '$skillsWanted',
              as: 'skill',
              cond: { $in: ['$$skill', currentUser.skillsVerified] },
            },
          },
        },
      },
      {
        // Only keep users where BOTH arrays are non-empty (true reciprocal match)
        $match: {
          $expr: {
            $and: [
              { $gt: [{ $size: '$theyHaveWhatIWant' }, 0] },
              { $gt: [{ $size: '$iHaveWhatTheyWant' }, 0] },
            ],
          },
        },
      },
      {
        // Score matches by number of overlapping skills (more overlap = better match)
        $addFields: {
          matchScore: {
            $add: [
              { $size: '$theyHaveWhatIWant' },
              { $size: '$iHaveWhatTheyWant' },
            ],
          },
        },
      },
      {
        $sort: { matchScore: -1 },
      },
      {
        $limit: 20,
      },
      {
        // Return only safe public fields
        $project: {
          _id: 1,
          name: 1,
          skillsVerified: 1,
          skillsWanted: 1,
          points: 1,
          badges: 1,
          theyHaveWhatIWant: 1,
          iHaveWhatTheyWant: 1,
          matchScore: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      totalMatches: matches.length,
      mySkills: currentUser.skillsVerified,
      myWantedSkills: currentUser.skillsWanted,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSmartMatches };
