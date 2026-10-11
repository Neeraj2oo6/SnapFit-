const { getMealsFromDB, getWaterIntake, getUserActivity } = require('../config/db');

/**
 * Generate synthetic or real timeline metrics for requested timeframe:
 * '7d', '30d', '3m', '6m'
 */
function generateTimelineData(timeframe, baseMeals, waterGlasses, activityMinutes) {
  const days = timeframe === '6m' ? 24 : timeframe === '3m' ? 12 : timeframe === '30d' ? 30 : 7;
  const unit = timeframe === '6m' || timeframe === '3m' ? 'W' : 'D';
  const data = [];

  const baseCal = baseMeals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0) || 1850;
  const basePro = baseMeals.reduce((acc, m) => acc + (Number(m.protein) || 0), 0) || 75;

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < days; i++) {
    const variance = (Math.sin(i * 1.5) * 180);
    const cal = Math.max(1400, Math.round(baseCal + variance));
    const pro = Math.max(50, Math.round(basePro + (Math.cos(i) * 12)));
    const water = Math.max(5, Math.min(10, Math.round((waterGlasses || 7) + (Math.sin(i) * 2))));
    const act = Math.max(20, Math.round((activityMinutes || 40) + (Math.cos(i * 0.8) * 15)));
    const weight = (70.5 - (i * 0.08) + (Math.sin(i) * 0.2)).toFixed(1);
    const score = Math.min(96, Math.max(78, Math.round(85 + (pro > 70 ? 4 : -2) + (water >= 7 ? 4 : 0))));

    let label = `${unit}${i + 1}`;
    if (days === 7) {
      label = dayNames[i % 7];
    }

    data.push({
      label,
      day: label,
      calories: cal,
      protein: pro,
      water: water,
      activity: act,
      weight: parseFloat(weight),
      steps: 4000 + act * 80,
      healthScore: score
    });
  }

  return data;
}

/**
 * GET /api/progress
 * Accepts query param: timeframe = '7d' | '30d' | '3m' | '6m'
 */
async function getProgress(req, res) {
  try {
    const userId = req.user?.id || 1;
    const timeframe = (req.query.timeframe || req.query.range || '7d').toLowerCase();

    const meals = await getMealsFromDB(userId);
    const waterObj = await getWaterIntake(userId);
    const activities = await getUserActivity(userId);

    const waterGlasses = waterObj?.glasses || 6;
    const totalActMinutes = activities.reduce((acc, a) => acc + (Number(a.duration) || 0), 0) || 35;

    const timeline = generateTimelineData(timeframe, meals, waterGlasses, totalActMinutes);

    const avgCalories = Math.round(timeline.reduce((acc, d) => acc + d.calories, 0) / timeline.length);
    const avgProtein = Math.round(timeline.reduce((acc, d) => acc + d.protein, 0) / timeline.length);
    const avgWater = parseFloat((timeline.reduce((acc, d) => acc + d.water, 0) / timeline.length).toFixed(1));
    const avgActivity = Math.round(timeline.reduce((acc, d) => acc + d.activity, 0) / timeline.length);
    const avgHealthScore = Math.round(timeline.reduce((acc, d) => acc + d.healthScore, 0) / timeline.length);
    const currentWeight = timeline[timeline.length - 1].weight;

    res.json({
      success: true,
      timeframe,
      summary: {
        avgCalories,
        avgProtein,
        avgWater,
        avgActivity,
        avgHealthScore,
        currentWeight,
        streakDays: 5,
        targetCalories: 2000,
        targetProtein: 80,
        targetWater: 8,
        targetActivity: 60
      },
      timeline
    });
  } catch (err) {
    console.error('Progress Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getWeeklyProgress(req, res) {
  req.query.timeframe = '7d';
  return getProgress(req, res);
}

async function getMonthlyProgress(req, res) {
  req.query.timeframe = '30d';
  return getProgress(req, res);
}

module.exports = {
  getProgress,
  getWeeklyProgress,
  getMonthlyProgress
};
