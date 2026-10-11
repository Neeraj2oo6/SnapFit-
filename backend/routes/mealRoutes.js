const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const voiceController = require('../controllers/voiceController');
const upload = require('../middleware/uploadMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// Voice logging endpoints
router.post('/voice', authenticateToken, voiceController.logVoiceMeal);
router.get('/progress', authenticateToken, voiceController.getProgress);

// Standard CRUD endpoints
router.post('/', authenticateToken, upload.optional, mealController.createMeal);
router.get('/', authenticateToken, mealController.getMeals);
router.get('/:id', authenticateToken, mealController.getMealById);
router.put('/:id', authenticateToken, mealController.updateMeal);
router.delete('/:id', authenticateToken, mealController.deleteMeal);

module.exports = router;
