// server/models/Test.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: (arr) => arr.length === 4,
      message: 'Each question must have exactly 4 options',
    },
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required for learning'],
    trim: true,
  },
});

const TestSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skillCategory: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: (arr) => arr.length >= 3 && arr.length <= 20,
        message: 'A test must have between 3 and 20 questions',
      },
    },
    status: {
      type: String,
      enum: ['beta', 'live', 'flagged'],
      default: 'beta',
      index: true,
    },
    betaTestersCount: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    userRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', TestSchema);
