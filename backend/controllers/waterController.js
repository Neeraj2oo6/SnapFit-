const { updateWaterIntake, getWaterIntake } = require('../config/db');

async function addWater(req, res) {
  try {
    const userId = req.user?.id || 1;
    const { amount = 1 } = req.body;
    const water = await updateWaterIntake(userId, amount);
    res.json({
      success: true,
      message: `Added ${amount} glass of water! (+15 Fit Points)`,
      water
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getWater(req, res) {
  try {
    const userId = req.user?.id || 1;
    const water = await getWaterIntake(userId);
    res.json({
      success: true,
      water
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  addWater,
  getWater
};
