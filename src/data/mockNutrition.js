export const WEEKLY_ANALYTICS = [
  { day: 'Mon', calories: 2150, target: 2200, protein: 145, carbs: 210, fat: 65, water: 2.8, healthScore: 84 },
  { day: 'Tue', calories: 1980, target: 2200, protein: 152, carbs: 185, fat: 58, water: 3.0, healthScore: 89 },
  { day: 'Wed', calories: 2250, target: 2200, protein: 160, carbs: 230, fat: 70, water: 2.5, healthScore: 86 },
  { day: 'Thu', calories: 2100, target: 2200, protein: 148, carbs: 195, fat: 62, water: 3.2, healthScore: 88 },
  { day: 'Fri', calories: 2300, target: 2200, protein: 155, carbs: 240, fat: 75, water: 2.7, healthScore: 82 },
  { day: 'Sat', calories: 2050, target: 2200, protein: 140, carbs: 190, fat: 60, water: 3.5, healthScore: 91 },
  { day: 'Sun', calories: 1140, target: 2200, protein: 82, carbs: 110, fat: 38, water: 2.2, healthScore: 87 },
];

export const MOCK_USER_TARGETS = {
  dailyCalories: 2000,
  proteinGrams: 80,
  carbsGrams: 220,
  fatGrams: 60,
  waterGlasses: 8,
  waterLiters: 2.0,
  activityMinutes: 60,
  weightKg: 68,
  heightCm: 175,
  age: 24,
  goal: "Eat Healthier",
  activityLevel: "Moderate (3-4 workouts/wk)"
};

export const MOCK_HEALTH_SCORE_BREAKDOWN = {
  overall: 87,
  categories: [
    { name: "Nutrition Balance", score: 90, max: 100, color: "bg-emerald-500", text: "Optimal macro ratio achieved" },
    { name: "Protein Target", score: 85, max: 100, color: "bg-blue-500", text: "82g of 160g consumed today" },
    { name: "Hydration Level", score: 88, max: 100, color: "bg-cyan-500", text: "2.2L of 3.0L goal logged" },
    { name: "Meal Consistency", score: 92, max: 100, color: "bg-violet-500", text: "Logged 3 meals on schedule" },
    { name: "Healthy Food Quality", score: 80, max: 100, color: "bg-amber-500", text: "High whole food density" }
  ]
};
