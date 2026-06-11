// server/seed.js
// ─────────────────────────────────────────────────────────────────
//  One-time database seeder for Project Samarthya
//  Run with:  npm run seed
//  (Reads MONGO_URI from .env, connects, wipes existing data in
//   these collections, then inserts a fresh demo dataset.)
// ─────────────────────────────────────────────────────────────────
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Test = require('./models/Test');
const BarterMatch = require('./models/BarterMatch');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...\n');

  // ─── Wipe existing data ─────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Test.deleteMany({}),
    BarterMatch.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing Users, Tests, and BarterMatches');

  // ─── 1. Admin account ───────────────────────────────────────────
  const admin = await User.create({
    name: 'Vipul Admin',
    email: 'admin@samarthya.in',
    password: 'Admin@123', // hashed automatically by the User model
    role: 'admin',
    credits: 0,
    points: 0,
  });
  console.log(`👑 Admin created       → ${admin.email} / Admin@123`);

  // ─── 2. Sample students ─────────────────────────────────────────
  const studentsData = [
    {
      name: 'Aarav Sharma',
      email: 'aarav@samarthya.in',
      password: 'Student@123',
      credits: 5,
      points: 120,
      dailyStreak: 4,
      badges: ['Early Bird', 'Quiz Master'],
      skillsVerified: ['React', 'Node.js', 'MongoDB'],
      skillsWanted: ['Python', 'Machine Learning'],
    },
    {
      name: 'Diya Patel',
      email: 'diya@samarthya.in',
      password: 'Student@123',
      credits: 8,
      points: 260,
      dailyStreak: 12,
      badges: ['Streak Champion'],
      skillsVerified: ['Python', 'Machine Learning', 'SQL'],
      skillsWanted: ['React', 'UI/UX Design'],
    },
    {
      name: 'Kabir Mehta',
      email: 'kabir@samarthya.in',
      password: 'Student@123',
      credits: 3,
      points: 40,
      dailyStreak: 1,
      badges: [],
      skillsVerified: ['Java', 'DSA'],
      skillsWanted: ['React', 'Git'],
    },
    {
      name: 'Ishita Rao',
      email: 'ishita@samarthya.in',
      password: 'Student@123',
      credits: 6,
      points: 180,
      dailyStreak: 7,
      badges: ['Quiz Master'],
      skillsVerified: ['UI/UX Design', 'Communication'],
      skillsWanted: ['React', 'Node.js'],
    },
    {
      name: 'Rohan Verma',
      email: 'rohan@samarthya.in',
      password: 'Student@123',
      credits: 2,
      points: 15,
      dailyStreak: 0,
      badges: [],
      skillsVerified: ['DevOps', 'Docker', 'Git'],
      skillsWanted: ['Python', 'SQL'],
      isBlocked: true, // sample blocked account, useful for testing the admin panel
    },
  ];

  const students = await Promise.all(
    studentsData.map(async (s) => {
      const u = new User(s);
      await u.save(); // triggers password-hash pre-save hook
      return u.toObject();
    })
  );

  console.log(`🧑‍🎓 ${students.length} sample students created (password for all: Student@123)`);

  const [aarav, diya, kabir, ishita, rohan] = students;

  // ─── 3. Sample tests ─────────────────────────────────────────────
  const testsData = [
    {
      creatorId: aarav._id,
      skillCategory: 'React',
      title: 'React Fundamentals: Hooks & State',
      difficulty: 'Beginner',
      status: 'live',
      betaTestersCount: 12,
      successRate: 78,
      userRating: 4.5,
      totalAttempts: 30,
      questions: [
        {
          questionText: 'Which hook is used to manage state in a functional component?',
          options: ['useEffect', 'useState', 'useRef', 'useMemo'],
          correctOptionIndex: 1,
          explanation: 'useState lets you add local state to a functional component.',
        },
        {
          questionText: 'What does useEffect run after by default?',
          options: ['Every render', 'Only on unmount', 'Only once ever', 'Never'],
          correctOptionIndex: 0,
          explanation: 'By default, useEffect runs after every render unless a dependency array is provided.',
        },
        {
          questionText: 'How do you pass data from a parent to a child component?',
          options: ['State', 'Props', 'Context only', 'Refs'],
          correctOptionIndex: 1,
          explanation: 'Props are used to pass data from parent components to child components.',
        },
        {
          questionText: 'Which array tells useEffect to run only once on mount?',
          options: ['undefined', '[]', '[state]', 'null'],
          correctOptionIndex: 1,
          explanation: 'An empty dependency array [] means the effect runs only once, after the initial render.',
        },
      ],
    },
    {
      creatorId: diya._id,
      skillCategory: 'Python',
      title: 'Python Basics: Data Types & Loops',
      difficulty: 'Beginner',
      status: 'live',
      betaTestersCount: 20,
      successRate: 85,
      userRating: 4.8,
      totalAttempts: 45,
      questions: [
        {
          questionText: 'Which of these is a mutable data type in Python?',
          options: ['tuple', 'string', 'list', 'int'],
          correctOptionIndex: 2,
          explanation: 'Lists are mutable, meaning their contents can be changed after creation.',
        },
        {
          questionText: 'What does the range(5) function generate?',
          options: ['1 to 5', '0 to 4', '0 to 5', '1 to 4'],
          correctOptionIndex: 1,
          explanation: 'range(5) generates numbers from 0 up to (but not including) 5.',
        },
        {
          questionText: 'Which keyword is used to define a function in Python?',
          options: ['function', 'def', 'func', 'lambda'],
          correctOptionIndex: 1,
          explanation: 'The "def" keyword is used to define a function in Python.',
        },
      ],
    },
    {
      creatorId: diya._id,
      skillCategory: 'Machine Learning',
      title: 'Intro to Machine Learning Concepts',
      difficulty: 'Intermediate',
      status: 'live',
      betaTestersCount: 8,
      successRate: 60,
      userRating: 4.2,
      totalAttempts: 14,
      questions: [
        {
          questionText: 'What type of learning uses labeled data?',
          options: ['Unsupervised learning', 'Supervised learning', 'Reinforcement learning', 'Clustering'],
          correctOptionIndex: 1,
          explanation: 'Supervised learning algorithms are trained on labeled data.',
        },
        {
          questionText: 'Which metric is commonly used for classification accuracy?',
          options: ['Mean Squared Error', 'F1 Score', 'R-squared', 'Standard Deviation'],
          correctOptionIndex: 1,
          explanation: 'F1 Score balances precision and recall and is widely used for classification tasks.',
        },
        {
          questionText: 'Overfitting occurs when a model:',
          options: [
            'Performs poorly on training data',
            'Performs well on training but poorly on new data',
            'Performs equally on all data',
            'Cannot be trained at all',
          ],
          correctOptionIndex: 1,
          explanation: 'Overfitting means the model has memorized the training data and fails to generalize.',
        },
      ],
    },
    {
      creatorId: kabir._id,
      skillCategory: 'DSA',
      title: 'Data Structures: Arrays & Linked Lists',
      difficulty: 'Intermediate',
      status: 'beta',
      betaTestersCount: 2,
      successRate: 50,
      userRating: 0,
      totalAttempts: 2,
      questions: [
        {
          questionText: 'What is the time complexity of accessing an element in an array by index?',
          options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
          correctOptionIndex: 2,
          explanation: 'Arrays provide constant time O(1) access via index.',
        },
        {
          questionText: 'In a singly linked list, each node contains:',
          options: [
            'Data and a pointer to the previous node',
            'Data and a pointer to the next node',
            'Only data',
            'Two pointers and no data',
          ],
          correctOptionIndex: 1,
          explanation: 'A singly linked list node stores data plus a reference (pointer) to the next node.',
        },
        {
          questionText: 'Which operation is generally faster on a linked list than an array?',
          options: ['Random access', 'Insertion at the beginning', 'Binary search', 'Sorting'],
          correctOptionIndex: 1,
          explanation: 'Inserting at the beginning of a linked list is O(1), while arrays require shifting elements.',
        },
      ],
    },
    {
      creatorId: ishita._id,
      skillCategory: 'UI/UX Design',
      title: 'UI/UX Design Principles',
      difficulty: 'Beginner',
      status: 'beta',
      betaTestersCount: 1,
      successRate: 0,
      userRating: 0,
      totalAttempts: 1,
      questions: [
        {
          questionText: 'What does "UX" stand for?',
          options: ['User Experience', 'User Extension', 'Universal Exchange', 'Unified Xperience'],
          correctOptionIndex: 0,
          explanation: 'UX stands for User Experience, focusing on how a user feels using a product.',
        },
        {
          questionText: 'Which principle suggests keeping similar elements visually consistent?',
          options: ['Contrast', 'Consistency', 'Isolation', 'Randomness'],
          correctOptionIndex: 1,
          explanation: 'Consistency helps users predict how interface elements behave across a product.',
        },
        {
          questionText: 'A wireframe is best described as:',
          options: [
            'A finished, polished design',
            'A low-fidelity layout blueprint of a screen',
            'A marketing document',
            'A type of programming language',
          ],
          correctOptionIndex: 1,
          explanation: 'Wireframes are simple, low-fidelity layouts used to plan structure before visual design.',
        },
      ],
    },
    {
      creatorId: rohan._id,
      skillCategory: 'Docker',
      title: 'Docker & Containers Basics',
      difficulty: 'Intermediate',
      status: 'flagged',
      betaTestersCount: 3,
      successRate: 33,
      userRating: 2.1,
      totalAttempts: 5,
      questions: [
        {
          questionText: 'What is a Docker image?',
          options: [
            'A running instance of a container',
            'A read-only template used to create containers',
            'A virtual machine',
            'A network configuration file',
          ],
          correctOptionIndex: 1,
          explanation: 'A Docker image is a read-only template that contains instructions for creating a container.',
        },
        {
          questionText: 'Which command is used to list running containers?',
          options: ['docker ps', 'docker list', 'docker show', 'docker run'],
          correctOptionIndex: 0,
          explanation: '"docker ps" lists currently running containers.',
        },
        {
          questionText: 'What file is commonly used to define a Docker image build process?',
          options: ['docker.yml', 'Dockerfile', 'image.config', 'container.json'],
          correctOptionIndex: 1,
          explanation: 'A Dockerfile contains the step-by-step instructions to build a Docker image.',
        },
      ],
    },
  ];

  const tests = await Test.insertMany(testsData);
  console.log(`📝 ${tests.length} sample tests created (live / beta / flagged)`);

  const [reactTest, pythonTest, mlTest] = tests;

  // ─── 4. Sample barter matches (bookings) ─────────────────────────
  const matchesData = [
    {
      studentId: diya._id,
      testId: reactTest._id,
      status: 'completed',
      scoreAchieved: 75,
      creatorRewarded: true,
      answers: [
        { questionIndex: 0, selectedOptionIndex: 1, isCorrect: true },
        { questionIndex: 1, selectedOptionIndex: 0, isCorrect: true },
        { questionIndex: 2, selectedOptionIndex: 1, isCorrect: true },
        { questionIndex: 3, selectedOptionIndex: 2, isCorrect: false },
      ],
    },
    {
      studentId: kabir._id,
      testId: pythonTest._id,
      status: 'completed',
      scoreAchieved: 100,
      creatorRewarded: true,
      answers: [
        { questionIndex: 0, selectedOptionIndex: 2, isCorrect: true },
        { questionIndex: 1, selectedOptionIndex: 1, isCorrect: true },
        { questionIndex: 2, selectedOptionIndex: 1, isCorrect: true },
      ],
    },
    {
      studentId: ishita._id,
      testId: mlTest._id,
      status: 'booked',
      scoreAchieved: null,
      creatorRewarded: false,
      answers: [],
    },
    {
      studentId: aarav._id,
      testId: pythonTest._id,
      status: 'failed',
      scoreAchieved: 33,
      creatorRewarded: false,
      answers: [
        { questionIndex: 0, selectedOptionIndex: 0, isCorrect: false },
        { questionIndex: 1, selectedOptionIndex: 1, isCorrect: true },
        { questionIndex: 2, selectedOptionIndex: 0, isCorrect: false },
      ],
    },
  ];

  const matches = await BarterMatch.insertMany(matchesData);
  console.log(`🔄 ${matches.length} sample barter matches created`);

  console.log('\n✅ Seeding complete!\n');
  console.log('────────────────────────────────────────────');
  console.log('🔐 Admin login   →  /adminvipul755/login');
  console.log('   Email:    admin@samarthya.in');
  console.log('   Password: Admin@123');
  console.log('────────────────────────────────────────────');
  console.log('🧑‍🎓 Student login (any of the 5)  →  /login');
  console.log('   Email:    aarav@samarthya.in / diya@samarthya.in / ...');
  console.log('   Password: Student@123');
  console.log('────────────────────────────────────────────\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
