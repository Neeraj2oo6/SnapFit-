const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

/**
 * Route: POST /api/meals/voice
 * Accepts: { text: "I ate two eggs, one banana and a glass of milk", type: "Breakfast" }
 */
router.post('/voice', voiceController.logVoiceMeal);

/**
 * Route: GET /api/meals/progress
 * Returns calculated progress metrics (Calories, Protein, Water, Activity, Health Score, Weekly Progress)
 */
router.get('/progress', voiceController.getProgress);

module.exports = router;
