const express = require('express');
const router = express.Router();
const rewardsController = require('../controllers/rewardsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, rewardsController.getRewards);
router.post('/redeem', authenticateToken, rewardsController.redeemReward);
router.get('/history', authenticateToken, rewardsController.getRewardsHistory);

module.exports = router;
