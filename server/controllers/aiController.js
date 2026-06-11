// server/controllers/aiController.js
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference("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");
const MODEL = 'meta-llama/Meta-Llama-3-8B-Instruct';

// Helper to call HuggingFace inference with a system + user message
const callHuggingFace = async (systemPrompt, userContent) => {
  const response = await hf.chatCompletion({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: 400,
    temperature: 0.7,
  });
  return response.choices[0].message.content.trim();
};

// @desc    Unified AI chat endpoint with mode-based system prompt dispatch
// @route   POST /student/ai/chat
// @access  Private
const aiChat = async (req, res, next) => {
  try {
    const { mode, payload } = req.body;

    if (!mode || !payload) {
      res.status(400);
      throw new Error('mode and payload are required');
    }

    let result = '';

    if (mode === 'evaluator') {
      // Mode A: Test failure explainer
      // payload: { questionText, userOptionIndex, correctOptionIndex, options, explanation }
      const { questionText, userOptionIndex, correctOptionIndex, options, explanation } = payload;

      if (!questionText || userOptionIndex === undefined || correctOptionIndex === undefined || !options) {
        res.status(400);
        throw new Error('evaluator mode requires: questionText, userOptionIndex, correctOptionIndex, options');
      }

      const systemPrompt = `You are an encouraging and precise academic tutor. When a student answers a question incorrectly, you provide a clear, supportive 3-sentence breakdown. Sentence 1: Acknowledge what concept the question tested and why the student's choice was a common misconception. Sentence 2: Precisely explain why the correct answer is right, using simple logical reasoning. Sentence 3: Give one memorable tip or mental model the student can use to remember the correct approach in future. Keep the tone warm, motivating, and technically accurate. Respond in exactly 3 sentences.`;

      const userContent = `Question: "${questionText}"
The student selected: "${options[userOptionIndex]}" (Option ${userOptionIndex + 1})
Correct answer: "${options[correctOptionIndex]}" (Option ${correctOptionIndex + 1})
Official explanation: "${explanation || 'Not provided'}"
Please explain this failure in 3 encouraging, educational sentences.`;

      result = await callHuggingFace(systemPrompt, userContent);
    } else if (mode === 'career_coach') {
      // Mode B: ATS resume optimizer
      // payload: { rawText, verifiedSkills, context }
      const { rawText, verifiedSkills, context } = payload;

      if (!rawText) {
        res.status(400);
        throw new Error('career_coach mode requires: rawText');
      }

      const systemPrompt = `You are an elite ATS-optimization specialist and career coach with 15 years of experience writing resumes that land interviews at top companies. Your sole job is to transform weak, passive resume bullet points into powerful, ATS-optimized single-sentence bullets. Rules: Always start with a strong action verb (Led, Built, Engineered, Designed, Automated, Reduced, Optimized, Delivered, Spearheaded, Implemented). Include quantifiable impact where possible. Keep each bullet to one impactful sentence. Make it ATS-friendly by naturally including relevant technical keywords. Do not add bullet symbols or numbering.`;

      const userContent = `Transform this resume text into powerful ATS-optimized bullet points.
Student's verified technical skills: ${verifiedSkills ? verifiedSkills.join(', ') : 'Not specified'}
Context/Role: ${context || 'General software engineering role'}

Raw text to optimize:
"${rawText}"

Provide the optimized version only, no explanations.`;

      result = await callHuggingFace(systemPrompt, userContent);
    } else {
      res.status(400);
      throw new Error(`Unknown mode: "${mode}". Valid modes are: evaluator, career_coach`);
    }

    res.status(200).json({
      success: true,
      mode,
      result,
    });
  } catch (error) {
    // Handle HuggingFace API errors specifically
    if (error.message && error.message.includes('HfInference')) {
      return next(new Error('AI service is temporarily unavailable. Please try again in a moment.'));
    }
    next(error);
  }
};

// @desc    Save AI-optimized resume bullet to user profile
// @route   POST /student/ai/save-resume
// @access  Private
const saveResumeData = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const { resumeData } = req.body;

    if (!resumeData) {
      res.status(400);
      throw new Error('resumeData is required');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume saved successfully',
      resumeData: user.resumeData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { aiChat, saveResumeData };
