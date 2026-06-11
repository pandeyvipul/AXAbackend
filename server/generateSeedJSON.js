// server/generateSeedJSON.js
// ─────────────────────────────────────────────────────────────────
//  Generates raw JSON files (users.json, tests.json, barterMatches.json)
//  that can be imported directly into MongoDB Atlas using mongoimport
//  or MongoDB Compass — no server connection needed.
//
//  Run with:  node server/generateSeedJSON.js
//  Output:    server/seed-data/*.json
// ─────────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('bson');

const outDir = path.join(__dirname, 'seed-data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const hash = (pwd) => bcrypt.hashSync(pwd, 12);
const now = new Date().toISOString();

// ─── Fixed IDs so collections can reference each other ────────────
const ids = {
  admin: new ObjectId(),
  aarav: new ObjectId(),
  diya: new ObjectId(),
  kabir: new ObjectId(),
  ishita: new ObjectId(),
  rohan: new ObjectId(),
  reactTest: new ObjectId(),
  pythonTest: new ObjectId(),
  mlTest: new ObjectId(),
  dsaTest: new ObjectId(),
  uiuxTest: new ObjectId(),
  dockerTest: new ObjectId(),
};

const oid = (id) => ({ $oid: id.toString() });
const date = () => ({ $date: now });

// ─── USERS ──────────────────────────────────────────────────────
const users = [
  {
    _id: oid(ids.admin),
    name: 'Vipul Admin',
    email: 'admin@samarthya.in',
    password: hash('Admin@123'),
    role: 'admin',
    isBlocked: false,
    credits: 0,
    points: 0,
    dailyStreak: 0,
    lastLogin: null,
    badges: [],
    skillsVerified: [],
    skillsWanted: [],
    resumeData: { summary: '', experience: [], education: [] },
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(ids.aarav),
    name: 'Aarav Sharma',
    email: 'aarav@samarthya.in',
    password: hash('Student@123'),
    role: 'student',
    isBlocked: false,
    credits: 5,
    points: 120,
    dailyStreak: 4,
    lastLogin: null,
    badges: ['Early Bird', 'Quiz Master'],
    skillsVerified: ['React', 'Node.js', 'MongoDB'],
    skillsWanted: ['Python', 'Machine Learning'],
    resumeData: { summary: '', experience: [], education: [] },
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(ids.diya),
    name: 'Diya Patel',
    email: 'diya@samarthya.in',
    password: hash('Student@123'),
    role: 'student',
    isBlocked: false,
    credits: 8,
    points: 260,
    dailyStreak: 12,
    lastLogin: null,
    badges: ['Streak Champion'],
    skillsVerified: ['Python', 'Machine Learning', 'SQL'],
    skillsWanted: ['React', 'UI/UX Design'],
    resumeData: { summary: '', experience: [], education: [] },
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(ids.kabir),
    name: 'Kabir Mehta',
    email: 'kabir@samarthya.in',
    password: hash('Student@123'),
    role: 'student',
    isBlocked: false,
    credits: 3,
    points: 40,
    dailyStreak: 1,
    lastLogin: null,
    badges: [],
    skillsVerified: ['Java', 'DSA'],
    skillsWanted: ['React', 'Git'],
    resumeData: { summary: '', experience: [], education: [] },
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(ids.ishita),
    name: 'Ishita Rao',
    email: 'ishita@samarthya.in',
    password: hash('Student@123'),
    role: 'student',
    isBlocked: false,
    credits: 6,
    points: 180,
    dailyStreak: 7,
    lastLogin: null,
    badges: ['Quiz Master'],
    skillsVerified: ['UI/UX Design', 'Communication'],
    skillsWanted: ['React', 'Node.js'],
    resumeData: { summary: '', experience: [], education: [] },
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(ids.rohan),
    name: 'Rohan Verma',
    email: 'rohan@samarthya.in',
    password: hash('Student@123'),
    role: 'student',
    isBlocked: true,
    credits: 2,
    points: 15,
    dailyStreak: 0,
    lastLogin: null,
    badges: [],
    skillsVerified: ['DevOps', 'Docker', 'Git'],
    skillsWanted: ['Python', 'SQL'],
    resumeData: { summary: '', experience: [], education: [] },
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
];

// ─── TESTS ──────────────────────────────────────────────────────
const tests = [
  {
    _id: oid(ids.reactTest),
    creatorId: oid(ids.aarav),
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
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(ids.pythonTest),
    creatorId: oid(ids.diya),
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
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(ids.mlTest),
    creatorId: oid(ids.diya),
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
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(ids.dsaTest),
    creatorId: oid(ids.kabir),
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
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(ids.uiuxTest),
    creatorId: oid(ids.ishita),
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
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(ids.dockerTest),
    creatorId: oid(ids.rohan),
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
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
];

// ─── BARTER MATCHES ─────────────────────────────────────────────
const barterMatches = [
  {
    _id: oid(new ObjectId()),
    studentId: oid(ids.diya),
    testId: oid(ids.reactTest),
    status: 'completed',
    scoreAchieved: 75,
    creatorRewarded: true,
    answers: [
      { questionIndex: 0, selectedOptionIndex: 1, isCorrect: true },
      { questionIndex: 1, selectedOptionIndex: 0, isCorrect: true },
      { questionIndex: 2, selectedOptionIndex: 1, isCorrect: true },
      { questionIndex: 3, selectedOptionIndex: 2, isCorrect: false },
    ],
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(new ObjectId()),
    studentId: oid(ids.kabir),
    testId: oid(ids.pythonTest),
    status: 'completed',
    scoreAchieved: 100,
    creatorRewarded: true,
    answers: [
      { questionIndex: 0, selectedOptionIndex: 2, isCorrect: true },
      { questionIndex: 1, selectedOptionIndex: 1, isCorrect: true },
      { questionIndex: 2, selectedOptionIndex: 1, isCorrect: true },
    ],
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(new ObjectId()),
    studentId: oid(ids.ishita),
    testId: oid(ids.mlTest),
    status: 'booked',
    scoreAchieved: null,
    creatorRewarded: false,
    answers: [],
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
  {
    _id: oid(new ObjectId()),
    studentId: oid(ids.aarav),
    testId: oid(ids.pythonTest),
    status: 'failed',
    scoreAchieved: 33,
    creatorRewarded: false,
    answers: [
      { questionIndex: 0, selectedOptionIndex: 0, isCorrect: false },
      { questionIndex: 1, selectedOptionIndex: 1, isCorrect: true },
      { questionIndex: 2, selectedOptionIndex: 0, isCorrect: false },
    ],
    createdAt: date(),
    updatedAt: date(),
    __v: 0,
  },
];

fs.writeFileSync(path.join(outDir, 'users.json'), JSON.stringify(users, null, 2));
fs.writeFileSync(path.join(outDir, 'tests.json'), JSON.stringify(tests, null, 2));
fs.writeFileSync(path.join(outDir, 'barterMatches.json'), JSON.stringify(barterMatches, null, 2));

console.log('Seed JSON files written to server/seed-data/');
console.log('users.json    -> admin@samarthya.in / Admin@123, students use Student@123');
console.log('tests.json');
console.log('barterMatches.json');
console.log('');
console.log('Import with mongoimport, e.g.:');
console.log('mongoimport --uri "<MONGO_URI>" --collection users --file server/seed-data/users.json --jsonArray');
console.log('mongoimport --uri "<MONGO_URI>" --collection tests --file server/seed-data/tests.json --jsonArray');
console.log('mongoimport --uri "<MONGO_URI>" --collection barterMatches --file server/seed-data/barterMatches.json --jsonArray');
