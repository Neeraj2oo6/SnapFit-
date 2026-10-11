const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, activityController.addActivity);
router.get('/', authenticateToken, activityController.getActivity);

module.exports = router;
