const { logUserActivity, getUserActivity } = require('../config/db');

async function addActivity(req, res) {
  try {
    const userId = req.user?.id || 1;
    const { activity_type, duration, calories, steps } = req.body;
    const item = await logUserActivity(userId, {
      type: activity_type || 'Workout',
      duration: duration || 30,
      calories: calories || 180,
      steps: steps || 3500
    });
    res.status(201).json({
      success: true,
      message: `Logged ${item.duration} min ${item.type}! (+20 Fit Points)`,
      activity: item
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getActivity(req, res) {
  try {
    const userId = req.user?.id || 1;
    const activities = await getUserActivity(userId);
    res.json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  addActivity,
  getActivity
};
