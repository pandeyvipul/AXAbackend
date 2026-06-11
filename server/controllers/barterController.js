// server/controllers/barterController.js
const Test = require('../models/Test');
const BarterMatch = require('../models/BarterMatch');
const User = require('../models/User');

// @desc    Explore all live tests (with optional category/difficulty filters)
// @route   GET /student/barter/explore
// @access  Private
const exploreTests = async (req, res, next) => {
  try {
    const { category, difficulty, page = 1, limit = 10 } = req.query;

    const query = { status: 'live' };
    if (category) query.skillCategory = { $regex: category, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;

    const tests = await Test.find(query)
      .populate('creatorId', 'name skillsVerified')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Test.countDocuments(query);

    res.status(200).json({
      success: true,
      tests,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a test (deduct 1 credit from borrower)
// @route   POST /student/barter/book
// @access  Private
const bookTest = async (req, res, next) => {
  try {
    const { testId } = req.body;

    if (!testId) {
      res.status(400);
      throw new Error('testId is required');
    }

    const test = await Test.findById(testId);
    if (!test) {
      res.status(404);
      throw new Error('Test not found');
    }

    if (test.status !== 'live') {
      res.status(400);
      throw new Error('This test is not available for booking');
    }

    // Prevent creator from booking their own test
    if (test.creatorId.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot book your own test');
    }

    // Check if already booked this test
    const existingBooking = await BarterMatch.findOne({
      studentId: req.user._id,
      testId,
      status: 'booked',
    });
    if (existingBooking) {
      res.status(400);
      throw new Error('You have already booked this test');
    }

    // Check credit balance
    const student = await User.findById(req.user._id);
    if (student.credits < 1) {
      res.status(400);
      throw new Error('Insufficient credits. You need at least 1 credit to book a test.');
    }

    // Deduct 1 credit from student
    student.credits -= 1;
    await student.save();

    // Create barter match record
    const barterMatch = await BarterMatch.create({
      studentId: req.user._id,
      testId,
      status: 'booked',
    });

    // Increment beta tester count if test is beta (shouldn't happen for live, but safe check)
    test.totalAttempts += 1;
    await test.save();

    res.status(201).json({
      success: true,
      message: 'Test booked successfully! 1 credit deducted.',
      barterMatch,
      remainingCredits: student.credits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit test answers and process result
// @route   POST /student/barter/submit
// @access  Private
const submitTest = async (req, res, next) => {
  try {
    const { barterMatchId, answers } = req.body;
    // answers: [{ questionIndex: 0, selectedOptionIndex: 2 }, ...]

    if (!barterMatchId || !answers) {
      res.status(400);
      throw new Error('barterMatchId and answers are required');
    }

    const barterMatch = await BarterMatch.findById(barterMatchId).populate('testId');
    if (!barterMatch) {
      res.status(404);
      throw new Error('Barter booking not found');
    }

    if (barterMatch.studentId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to submit this test');
    }

    if (barterMatch.status !== 'booked') {
      res.status(400);
      throw new Error('This test has already been submitted');
    }

    const test = barterMatch.testId;
    const questions = test.questions;
    let correctCount = 0;
    const processedAnswers = [];

    // Grade each answer
    answers.forEach((answer) => {
      const question = questions[answer.questionIndex];
      const isCorrect = question && answer.selectedOptionIndex === question.correctOptionIndex;
      if (isCorrect) correctCount++;
      processedAnswers.push({
        questionIndex: answer.questionIndex,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect: isCorrect || false,
      });
    });

    const scoreAchieved = Math.round((correctCount / questions.length) * 100);
    const passed = scoreAchieved >= 70; // 70% passing threshold

    barterMatch.answers = processedAnswers;
    barterMatch.scoreAchieved = scoreAchieved;
    barterMatch.status = passed ? 'completed' : 'failed';

    await barterMatch.save();

    // Update test success rate
    const allAttempts = await BarterMatch.find({ testId: test._id, status: { $in: ['completed', 'failed'] } });
    const passedAttempts = allAttempts.filter((m) => m.status === 'completed').length;
    test.successRate = Math.round((passedAttempts / allAttempts.length) * 100);
    await test.save();

    const student = await User.findById(req.user._id);
    let responseMessage = '';

    if (passed) {
      // Award skill to student
      if (!student.skillsVerified.includes(test.skillCategory)) {
        student.skillsVerified.push(test.skillCategory);
      }
      // Bonus points for passing
      student.points += 10;
      await student.save();

      // Reward the test creator: +1 barter credit
      if (!barterMatch.creatorRewarded) {
        await User.findByIdAndUpdate(test.creatorId, { $inc: { credits: 1, points: 5 } });
        barterMatch.creatorRewarded = true;
        await barterMatch.save();
      }

      responseMessage = `🎉 Passed with ${scoreAchieved}%! Skill "${test.skillCategory}" added to your profile. +10 points earned!`;
    } else {
      responseMessage = `Score: ${scoreAchieved}%. You need 70% to pass. Review the explanations and try again!`;
    }

    res.status(200).json({
      success: true,
      message: responseMessage,
      passed,
      scoreAchieved,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      processedAnswers,
      // Return questions with explanations for review
      questionsWithExplanations: questions.map((q, i) => ({
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
        userAnswer: processedAnswers[i]?.selectedOptionIndex,
        isCorrect: processedAnswers[i]?.isCorrect,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new test
// @route   POST /student/barter/create
// @access  Private
const createTest = async (req, res, next) => {
  try {
    const { title, skillCategory, difficulty, questions } = req.body;

    if (!title || !skillCategory || !difficulty || !questions) {
      res.status(400);
      throw new Error('All fields are required: title, skillCategory, difficulty, questions');
    }

    const test = await Test.create({
      creatorId: req.user._id,
      title,
      skillCategory,
      difficulty,
      questions,
      status: 'beta', // New tests start as beta
    });

    // Award creator 2 points for contributing
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 2 } });

    res.status(201).json({
      success: true,
      message: 'Test created successfully! It will be reviewed before going live.',
      test,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's booked and completed tests
// @route   GET /student/barter/my-tests
// @access  Private
const getMyTests = async (req, res, next) => {
  try {
    const bookings = await BarterMatch.find({ studentId: req.user._id })
      .populate('testId', 'title skillCategory difficulty successRate')
      .sort({ createdAt: -1 });

    const createdTests = await Test.find({ creatorId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
      createdTests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { exploreTests, bookTest, submitTest, createTest, getMyTests };
