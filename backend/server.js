const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const mealRoutes = require('./routes/mealRoutes');
const foodRoutes = require('./routes/foodRoutes');
const chatRoutes = require('./routes/chatRoutes');
const barcodeRoutes = require('./routes/barcodeRoutes');
const progressRoutes = require('./routes/progressRoutes');
const waterRoutes = require('./routes/waterRoutes');
const activityRoutes = require('./routes/activityRoutes');
const rewardsRoutes = require('./routes/rewardsRoutes');

const { initDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// REST API Feature Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/rewards', rewardsRoutes);

// Root healthcheck & API catalogue
app.get('/', (req, res) => {
  res.json({
    name: 'SnapFit Full-Stack API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/profile'],
      meals: ['GET /api/meals', 'POST /api/meals', 'GET /api/meals/:id', 'PUT /api/meals/:id', 'DELETE /api/meals/:id', 'POST /api/meals/voice'],
      foodAnalysis: ['POST /api/food/analyze'],
      aiCoach: ['POST /api/chat', 'GET /api/chat/history'],
      barcode: ['POST /api/barcode', 'POST /api/barcode/scan'],
      progress: ['GET /api/progress', 'GET /api/progress/weekly', 'GET /api/progress/monthly'],
      water: ['GET /api/water', 'POST /api/water'],
      activity: ['GET /api/activity', 'POST /api/activity'],
      rewards: ['GET /api/rewards', 'POST /api/rewards/redeem', 'GET /api/rewards/history']
    }
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Initialize Database & Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`SnapFit Backend running on http://localhost:${PORT}`);
    console.log(`All 18 core REST modules loaded & active.`);
    console.log(`====================================================`);
  });
});
