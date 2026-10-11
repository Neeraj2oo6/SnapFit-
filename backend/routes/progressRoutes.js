const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, progressController.getProgress);
router.get('/weekly', authenticateToken, progressController.getWeeklyProgress);
router.get('/monthly', authenticateToken, progressController.getMonthlyProgress);

module.exports = router;
