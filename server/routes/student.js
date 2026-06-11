// server/routes/student.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Controllers
const { register, login, getMe, updateSkills } = require('../controllers/authController');
const { syncStreak } = require('../controllers/streakController');
const { exploreTests, bookTest, submitTest, createTest, getMyTests } = require('../controllers/barterController');
const { getSmartMatches } = require('../controllers/smartMatchController');
const { aiChat, saveResumeData } = require('../controllers/aiController');

// ─────────────────────────────────────────────
//  AUTH ROUTES  →  /student/auth
// ─────────────────────────────────────────────
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.put('/auth/skills', protect, updateSkills);

// ─────────────────────────────────────────────
//  STREAK ROUTES  →  /student/streak
// ─────────────────────────────────────────────
router.get('/streak/sync', protect, syncStreak);

// ─────────────────────────────────────────────
//  BARTER ROUTES  →  /student/barter
// ─────────────────────────────────────────────
router.get('/barter/explore', protect, exploreTests);
router.get('/barter/my-tests', protect, getMyTests);
router.post('/barter/book', protect, bookTest);
router.post('/barter/submit', protect, submitTest);
router.post('/barter/create', protect, createTest);

// ─────────────────────────────────────────────
//  SMART MATCH ROUTES  →  /student/smartmatch
// ─────────────────────────────────────────────
router.get('/smartmatch', protect, getSmartMatches);

// ─────────────────────────────────────────────
//  AI ROUTES  →  /student/ai
// ─────────────────────────────────────────────
router.post('/ai/chat', protect, aiChat);
router.post('/ai/save-resume', protect, saveResumeData);

module.exports = router;
