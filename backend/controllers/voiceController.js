const voiceService = require('../services/voiceService');
const db = require('../config/db');

/**
 * Controller to handle Voice-to-Text Meal logging and Progress calculation.
 * POST /api/meals/voice
 */
const logVoiceMeal = async (req, res) => {
  const { text, type } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Voice text transcript is required'
    });
  }

  try {
    // 1. Analyze voice text and calculate nutrition
    const analyzedMeal = await voiceService.analyzeVoiceMeal(text.trim(), type);

    // 2. Save meal to MySQL database
    const savedMeal = await db.saveMealToDB({
      name: analyzedMeal.name,
      type: analyzedMeal.type,
      calories: analyzedMeal.calories,
      protein: analyzedMeal.protein,
      carbs: analyzedMeal.carbs,
      fat: analyzedMeal.fat,
      fiber: analyzedMeal.fiber
    });

    // 3. Backend calculates comprehensive Progress
    const progress = voiceService.calculateProgress(analyzedMeal);

    // 4. Return response with meal details, detected items, and progress
    return res.status(200).json({
      success: true,
      message: 'Voice meal logged and progress calculated successfully',
      meal: {
        ...savedMeal,
        items: analyzedMeal.items
      },
      progress
    });
  } catch (error) {
    console.error('Voice meal controller error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process voice meal'
    });
  }
};

/**
 * Controller to fetch latest calculated progress on demand.
 * GET /api/meals/progress
 */
const getProgress = async (req, res) => {
  try {
    const progress = voiceService.calculateProgress(null);
    return res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Get progress error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch progress'
    });
  }
};

module.exports = {
  logVoiceMeal,
  getProgress
};
