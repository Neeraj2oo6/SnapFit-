const aiChatService = require('../services/aiChatService');
const db = require('../config/db');

const inMemoryChatHistory = [
  { role: 'assistant', text: "Hello! I'm your SnapFit AI Coach. How can I help optimize your nutrition, workouts, and health goals today?", timestamp: new Date() }
];

/**
 * Controller to handle AI Chat message, nutrition calculation, and MySQL persistence.
 * POST /api/chat
 */
const handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message text is required'
    });
  }

  try {
    inMemoryChatHistory.push({ role: 'user', text: message.trim(), timestamp: new Date() });

    // 1. Process message with AI & calculate nutrition
    const aiResult = await aiChatService.processChatMessage(message.trim());

    let savedMeal = null;

    // 2. If a meal was detected and calculated, save it to MySQL
    if (aiResult.mealLogged) {
      savedMeal = await db.saveMealToDB(aiResult.mealLogged);
    }

    inMemoryChatHistory.push({ role: 'assistant', text: aiResult.reply, timestamp: new Date() });

    // 3. Return response with AI reply and saved meal data
    return res.status(200).json({
      success: true,
      response: aiResult.reply,
      reply: aiResult.reply,
      mealLogged: savedMeal
    });
  } catch (error) {
    console.error('Chat controller error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error processing chat message'
    });
  }
};

/**
 * GET /api/chat/history
 */
const getChatHistory = async (req, res) => {
  return res.json({
    success: true,
    history: inMemoryChatHistory
  });
};

/**
 * Optional endpoint: Get all logged meals from MySQL
 * GET /api/chat/meals
 */
const getMeals = async (req, res) => {
  try {
    const meals = await db.getMealsFromDB();
    return res.status(200).json({
      success: true,
      data: meals
    });
  } catch (error) {
    console.error('Get meals error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve meals'
    });
  }
};

module.exports = {
  handleChat,
  getChatHistory,
  getMeals
};
