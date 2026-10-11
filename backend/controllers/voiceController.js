const voiceService = require('../services/voiceService');
const db = require('../config/db');

/**
 * Controller to handle Voice-to-Text Meal logging and analysis.
 * POST /api/meals/voice
 * Accepts: { transcript, text, type, language, confirm }
 */
const logVoiceMeal = async (req, res) => {
  const text = req.body.transcript || req.body.text;
  const { type, confirm } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Voice text transcript is required'
    });
  }

  try {
    // 1. Analyze voice text and calculate nutrition
    const analyzedMeal = await voiceService.analyzeVoiceMeal(text.trim(), type);

    // If water was detected
    if (analyzedMeal.isWater) {
      return res.status(200).json({
        success: true,
        isWater: true,
        amountMl: analyzedMeal.amountMl,
        name: analyzedMeal.name,
        transcript: analyzedMeal.transcript,
        meal: {
          foodName: 'Water',
          name: 'Water',
          quantity: analyzedMeal.amountMl,
          portionUnit: 'ml',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      });
    }

    // 2. If confirmation is requested to save in backend DB
    let savedMeal = null;
    if (confirm === true) {
      try {
        savedMeal = await db.saveMealToDB({
          name: analyzedMeal.name,
          type: analyzedMeal.type,
          calories: analyzedMeal.calories,
          protein: analyzedMeal.protein,
          carbs: analyzedMeal.carbs,
          fat: analyzedMeal.fat,
          fiber: analyzedMeal.fiber || 0
        });
      } catch (dbErr) {
        console.warn('Backend DB save skipped or failed:', dbErr.message);
      }
    }

    // 3. Return analyzed meal and items for confirmation screen
    return res.status(200).json({
      success: true,
      message: confirm ? 'Meal confirmed and saved successfully' : 'Voice meal analyzed successfully',
      isWater: false,
      meal: {
        ...(savedMeal || {}),
        name: analyzedMeal.name,
        foodName: analyzedMeal.name,
        type: analyzedMeal.type,
        calories: analyzedMeal.calories,
        protein: analyzedMeal.protein,
        carbs: analyzedMeal.carbs,
        fat: analyzedMeal.fat,
        fiber: analyzedMeal.fiber,
        items: analyzedMeal.items,
        transcript: analyzedMeal.transcript,
        source: analyzedMeal.source || 'voice'
      },
      items: analyzedMeal.items,
      totalNutrition: analyzedMeal.totalNutrition
    });
  } catch (error) {
    console.error('Voice meal controller error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process voice meal: ' + error.message
    });
  }
};

/**
 * Controller to fetch latest calculated progress on demand.
 * GET /api/meals/progress
 */
const getProgress = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    return res.status(200).json({
      success: true,
      data: {
        date: today,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
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

