const express = require('express');
const router = express.Router();
const waterController = require('../controllers/waterController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, waterController.addWater);
router.get('/', authenticateToken, waterController.getWater);

module.exports = router;
