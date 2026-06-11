// server/routes/admin.js  →  mounted at /adminvipul755
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

const {
  adminLogin,
  seedAdmin,
  getPlatformStats,
  getModerationQueue,
  moderateTest,
  getAllUsers,
  toggleUserBlock,
  adjustUserCredits,
} = require('../controllers/adminController');

// ─────────────────────────────────────────────
//  ADMIN AUTH  →  /adminvipul755/auth
// ─────────────────────────────────────────────
router.post('/auth/login', adminLogin);
router.post('/auth/seed', seedAdmin); // One-time admin creation

// ─────────────────────────────────────────────
//  STATS  →  /adminvipul755/stats
// ─────────────────────────────────────────────
router.get('/stats', protect, adminOnly, getPlatformStats);

// ─────────────────────────────────────────────
//  MODERATION  →  /adminvipul755/moderation
// ─────────────────────────────────────────────
router.get('/moderation/tests', protect, adminOnly, getModerationQueue);
router.patch('/moderation/tests/:testId', protect, adminOnly, moderateTest);

// ─────────────────────────────────────────────
//  USER MANAGEMENT  →  /adminvipul755/users
// ─────────────────────────────────────────────
router.get('/users', protect, adminOnly, getAllUsers);
router.patch('/users/:userId/block', protect, adminOnly, toggleUserBlock);
router.patch('/users/:userId/credits', protect, adminOnly, adjustUserCredits);

module.exports = router;
