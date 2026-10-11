/**
 * Calculate total daily macro sums from logged meals
 */
export function calculateTotals(meals = []) {
  return meals.reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories || 0);
      acc.protein += Number(meal.protein || 0);
      acc.carbs += Number(meal.carbs || 0);
      acc.fat += Number(meal.fat || 0);
      acc.fiber += Number(meal.fiber || 0);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

/**
 * Calculate dynamic overall health score (0 - 100) based on goals & current intake
 */
export function calculateHealthScore(totals, targets, waterLiters) {
  if (!targets) return 87;

  const calRatio = Math.min(totals.calories / targets.dailyCalories, 1.2);
  const calScore = calRatio <= 1 ? calRatio * 30 : Math.max(0, 30 - (calRatio - 1) * 30);

  const proteinRatio = Math.min(totals.protein / targets.proteinGrams, 1.0);
  const proteinScore = proteinRatio * 30;

  const waterRatio = Math.min(waterLiters / targets.waterLiters, 1.0);
  const waterScore = waterRatio * 20;

  const consistencyScore = 20; // Default baseline reward for logging meals

  const totalScore = Math.round(calScore + proteinScore + waterScore + consistencyScore);
  return Math.min(Math.max(totalScore, 40), 99);
}

/**
 * Calculate BMR & Recommended Macros based on user profile input
 */
export function calculateTargetMacros(weightKg, heightCm, age, goal, activityLevel) {
  // Mifflin-St Jeor Equation for BMR (default male/neutral baseline)
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  
  let multiplier = 1.375;
  if (activityLevel.includes("Active")) multiplier = 1.55;
  if (activityLevel.includes("Very")) multiplier = 1.725;
  if (activityLevel.includes("Sedentary")) multiplier = 1.2;

  let tdee = bmr * multiplier;

  if (goal.includes("Lose")) tdee -= 400;
  if (goal.includes("Gain")) tdee += 350;

  const dailyCalories = Math.round(tdee);
  const proteinGrams = Math.round((dailyCalories * 0.30) / 4);
  const carbsGrams = Math.round((dailyCalories * 0.45) / 4);
  const fatGrams = Math.round((dailyCalories * 0.25) / 9);

  return {
    dailyCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterLiters: 3.0
  };
}
