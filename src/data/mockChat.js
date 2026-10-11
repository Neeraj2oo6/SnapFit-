export const INITIAL_CHAT_MESSAGES = [
  {
    id: "msg-1",
    sender: "ai",
    text: "Hello Alex! I'm your SnapFit AI Coach. I've analyzed today's meal logs: you've hit 82g of protein out of your 160g target. How can I help optimize your dinner or nutrition plan today?",
    timestamp: "10:14 AM"
  }
];

export const SUGGESTED_PROMPTS = [
  "What should I eat for dinner to reach my protein goal?",
  "How much protein do I need for my weight and activity level?",
  "Is my diet healthy today based on my logs?",
  "Suggest a quick 15-minute high-protein breakfast.",
  "How can I improve my health score from 87 to 95?"
];

export const AI_RESPONSES_KNOWLEDGE = {
  dinner: "Based on your remaining 78g protein target for today, I recommend **Pan-Seared Salmon with Steamed Broccoli and Quinoa** (approx 520 kcal, 45g protein) or a **Tofu & Chicken Breast Stir-Fry** (approx 480 kcal, 42g protein). Both will keep your carbs moderate and max out your daily nutrition score!",
  protein: "For your current goal (*Lose Weight & Build Lean Muscle*) at 74kg weight, your target is 160g daily (approx 2.1g per kg body weight). You've completed 82g today across Breakfast, Lunch, and your Afternoon Snack.",
  healthy: "Your diet today is overall very solid! You're at an **87/100 Health Score**. You have great micronutrient density from berries and avocado. To reach 95+, aim to drink 800ml more water before 8 PM and choose a lean protein dinner.",
  breakfast: "A fast, 15-minute high-protein idea: **3 Scrambled Eggs with 50g Cottage Cheese & Spinach** wrapped in a Whole Wheat Tortilla. Total: 390 kcal, 32g Protein, 22g Carbs, 14g Fat.",
  score: "To boost your Health Score from 87 to 95:\n1. Hit 100% of your daily protein target (160g).\n2. Reach 3.0L water hydration.\n3. Add a fiber-rich leafy green to dinner.\n4. Log your final meal before 8:00 PM."
};
