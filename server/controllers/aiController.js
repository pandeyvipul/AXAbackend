const OpenAI = require("openai");

<<<<<<< HEAD
const hf = new HfInference(process.env.HF_TOKEN);
const MODEL = 'HuggingFaceH4/zephyr-7b-beta';
=======
const client = new OpenAI({
  apiKey: "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",
  baseURL: "https://api.groq.com/openai/v1",
});
>>>>>>> 00cdcce (Added dotenv setup and fixed server issue)

const MODEL = "llama-3.3-70b-versatile";

// Helper function
const callAI = async (systemPrompt, userContent) => {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userContent,
      },
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  return response.choices[0].message.content.trim();
};

// Unified AI Chat
const aiChat = async (req, res, next) => {
  try {
    const { mode, payload } = req.body;

    if (!mode || !payload) {
      return res.status(400).json({
        success: false,
        message: "mode and payload are required",
      });
    }

    let result = "";

    if (mode === "evaluator") {
      const {
        questionText,
        userOptionIndex,
        correctOptionIndex,
        options,
        explanation,
      } = payload;

      const systemPrompt = `
You are an encouraging academic tutor.

Respond in EXACTLY 3 sentences.

Sentence 1:
Explain what concept was tested and why the student's answer is a common mistake.

Sentence 2:
Explain why the correct answer is correct.

Sentence 3:
Give one memory tip for future exams.
`;

      const userContent = `
Question:
${questionText}

Student Answer:
${options[userOptionIndex]}

Correct Answer:
${options[correctOptionIndex]}

Official Explanation:
${explanation || "Not provided"}
`;

      result = await callAI(systemPrompt, userContent);
    }

    else if (mode === "career_coach") {
      const {
        rawText,
        verifiedSkills,
        context,
      } = payload;

      const systemPrompt = `
You are an expert ATS Resume Optimizer.

Transform weak resume text into strong ATS-friendly resume bullets.

Rules:

- Start with an action verb.
- Include measurable impact whenever possible.
- Include relevant technical keywords naturally.
- Keep every bullet one sentence.
- Return ONLY optimized bullet points.
`;

      const userContent = `
Verified Skills:

${verifiedSkills?.join(", ") || "None"}

Role:

${context || "Software Engineer"}

Resume Text:

${rawText}
`;

      result = await callAI(systemPrompt, userContent);
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Unknown mode",
      });
    }

    res.json({
      success: true,
      mode,
      result,
    });

  } catch (err) {
    console.error("Groq Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Save Resume

const saveResumeData = async (req, res, next) => {
  try {
    const User = require("../models/User");

    const { resumeData } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        resumeData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Resume saved successfully",
      resumeData: user.resumeData,
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  aiChat,
  saveResumeData,
};