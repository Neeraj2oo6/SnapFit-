const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/uploadMiddleware');
const foodController = require('../controllers/foodController');

/**
 * Route: POST /api/food/analyze
 * Accepts multipart/form-data with field name 'image'
 */
router.post('/analyze', uploadMiddleware, foodController.analyzeFood);

module.exports = router;
