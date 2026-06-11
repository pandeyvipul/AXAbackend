// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// ─── Connect to MongoDB ───────────────────────────────────────────
connectDB();

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '✅ Samarthya API is running', timestamp: new Date() });
});

// ─── Student Routes  →  /student/* ───────────────────────────────
app.use('/student', require('./routes/student'));

// ─── Admin Routes   →  /adminvipul755/* ──────────────────────────
app.use('/adminvipul755', require('./routes/admin'));

// ─── Serve React Frontend in Production ──────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  // All non-API routes go to React
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// ─── Global Error Handler (must be last middleware) ───────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Samarthya Server running on port ${PORT}`);
  console.log(`📡 Student API  →  http://localhost:${PORT}/student`);
  console.log(`🔐 Admin Panel  →  http://localhost:${PORT}/adminvipul755`);
  console.log(`🌐 Environment  →  ${process.env.NODE_ENV || 'development'}\n`);
});
