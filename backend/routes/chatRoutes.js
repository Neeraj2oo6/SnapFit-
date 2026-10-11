const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * Routes for AI Chat and Meal Logging:
 * POST /api/chat - Process user message, calculate nutrition, save to MySQL
 * GET /api/chat/history - Retrieve AI chat history
 * GET /api/chat/meals - Retrieve logged meals from MySQL
 */
router.post('/', chatController.handleChat);
router.get('/history', chatController.getChatHistory);
router.get('/meals', chatController.getMeals);

module.exports = router;
