// server/models/BarterMatch.js
const mongoose = require('mongoose');

const BarterMatchSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    status: {
      type: String,
      enum: ['booked', 'completed', 'failed'],
      default: 'booked',
    },
    scoreAchieved: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    // Track if creator has been rewarded on completion
    creatorRewarded: {
      type: Boolean,
      default: false,
    },
    // Store answers for result analysis
    answers: [
      {
        questionIndex: Number,
        selectedOptionIndex: Number,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('BarterMatch', BarterMatchSchema);
