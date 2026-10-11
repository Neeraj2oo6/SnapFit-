const { getRewardsData, redeemRewardItem } = require('../config/db');

async function getRewards(req, res) {
  try {
    const userId = req.user?.id || 1;
    const data = await getRewardsData(userId);
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function redeemReward(req, res) {
  try {
    const userId = req.user?.id || 1;
    const { rewardId } = req.body;
    if (!rewardId) {
      return res.status(400).json({ success: false, message: 'rewardId is required.' });
    }

    const result = await redeemRewardItem(userId, rewardId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getRewardsHistory(req, res) {
  try {
    const userId = req.user?.id || 1;
    const data = await getRewardsData(userId);
    res.json({
      success: true,
      history: data.redeemedRewards
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getRewards,
  redeemReward,
  getRewardsHistory
};
