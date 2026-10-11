const axios = require('axios');

/**
 * Intelligent local natural language meal parser for development / fallback.
 */
function parseMealFromText(text) {
  const lower = text.toLowerCase();

  // Detect meal type
  let type = 'Breakfast';
  if (lower.includes('lunch')) type = 'Lunch';
  else if (lower.includes('dinner')) type = 'Dinner';
  else if (lower.includes('snack')) type = 'Snack';
  else if (lower.includes('breakfast')) type = 'Breakfast';
  else {
    const hour = new Date().getHours();
    if (hour < 11) type = 'Breakfast';
    else if (hour < 16) type = 'Lunch';
    else if (hour < 19) type = 'Snack';
    else type = 'Dinner';
  }

  // Common food database with macro estimations
  const FOOD_DATABASE = [
    { keys: ['egg', 'eggs', 'anda'], name: 'Boiled Eggs', calories: 75, protein: 6.5, carbs: 0.6, fat: 5, fiber: 0 },
    { keys: ['toast', 'bread', 'slice of bread'], name: 'Whole Wheat Toast', calories: 80, protein: 3.5, carbs: 15, fat: 1, fiber: 2 },
    { keys: ['chicken', 'grilled chicken', 'murgh'], name: 'Grilled Chicken', calories: 220, protein: 32, carbs: 0, fat: 5, fiber: 0 },
    { keys: ['rice', 'brown rice', 'chawal'], name: 'Rice', calories: 160, protein: 3.5, carbs: 36, fat: 1, fiber: 1.5 },
    { keys: ['oatmeal', 'oats'], name: 'Oatmeal Bowl', calories: 180, protein: 6, carbs: 32, fat: 3.5, fiber: 4 },
    { keys: ['milk', 'doodh'], name: 'Milk (1 Glass)', calories: 140, protein: 8, carbs: 12, fat: 5, fiber: 0 },
    { keys: ['paneer', 'cottage cheese'], name: 'Paneer', calories: 260, protein: 18, carbs: 4, fat: 20, fiber: 0 },
    { keys: ['salad', 'salad bowl'], name: 'Garden Salad', calories: 70, protein: 2, carbs: 12, fat: 1.5, fiber: 3.5 },
    { keys: ['dal', 'lentil', 'daal'], name: 'Yellow Dal', calories: 150, protein: 10, carbs: 22, fat: 3, fiber: 4 },
    { keys: ['roti', 'chapati', 'phulka'], name: 'Roti', calories: 90, protein: 3, carbs: 18, fat: 0.5, fiber: 2.5 },
    { keys: ['banana', 'kela'], name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3 },
    { keys: ['apple', 'seb'], name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
    { keys: ['shake', 'whey', 'protein shake'], name: 'Protein Shake', calories: 160, protein: 28, carbs: 4, fat: 2, fiber: 1 },
    { keys: ['dosa', 'dosas'], name: 'Crispy Dosa', calories: 170, protein: 4, carbs: 30, fat: 3.5, fiber: 2 },
    { keys: ['sambar'], name: 'Veg Sambar', calories: 90, protein: 4.5, carbs: 14, fat: 2, fiber: 3 }
  ];

  // Look for food indicators
  const foodTriggers = ['ate', 'had', 'eat', 'eating', 'having', 'logged', 'log', 'drank', 'drink', 'consumed', 'for breakfast', 'for lunch', 'for dinner', 'for snack', 'food', 'meal'];
  const hasFoodTrigger = foodTriggers.some(trigger => lower.includes(trigger));

  let matchedItems = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const item of FOOD_DATABASE) {
    for (const key of item.keys) {
      if (lower.includes(key)) {
        // Check for numeric multiplier right before keyword (e.g. "2 eggs", "3 slices")
        const regex = new RegExp(`(\\d+)\\s*(?:piece|pieces|slice|slices|bowl|bowls)?\\s*${key}`, 'i');
        const match = lower.match(regex);
        const qty = match ? parseInt(match[1], 10) : 1;

        matchedItems.push(qty > 1 ? `${qty}x ${item.name}` : item.name);
        totalCalories += item.calories * qty;
        totalProtein += item.protein * qty;
        totalCarbs += item.carbs * qty;
        totalFat += item.fat * qty;
        totalFiber += item.fiber * qty;
        break;
      }
    }
  }

  // If items matched, or if message strongly indicates a food log
  if (matchedItems.length > 0) {
    const mealName = matchedItems.join(' + ');
    return {
      name: mealName,
      type,
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      fiber: Math.round(totalFiber)
    };
  }

  if (hasFoodTrigger && lower.length > 5) {
    // General food mention fallback
    const cleanName = text.replace(/(i ate|i had|i drank|logged|log|for breakfast|for lunch|for dinner|for snack)/gi, '').trim();
    return {
      name: cleanName.length > 0 ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : 'Healthy Meal',
      type,
      calories: 350,
      protein: 24,
      carbs: 38,
      fat: 10,
      fiber: 4
    };
  }

  return null;
}

/**
 * Main chat handler: processes user message, performs AI conversation and nutrition calculation.
 */
async function processChatMessage(userMessage) {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;

  const isLiveAI =
    apiKey &&
    apiUrl &&
    apiKey !== 'your_api_key' &&
    apiUrl !== 'your_ai_endpoint' &&
    apiUrl.startsWith('http');

  if (isLiveAI) {
    try {
      const systemPrompt = `You are SnapFit AI Health & Nutrition Assistant.
Respond conversationally and warmly to the user.
If the user mentions food they ate, consumed, or want to log, analyze and calculate their nutritional values accurately.
Always return your response in JSON format with this exact structure:
{
  "reply": "Your friendly conversational response to the user here...",
  "mealLogged": {
    "name": "Food Name with portion",
    "type": "Breakfast" | "Lunch" | "Dinner" | "Snack",
    "calories": 400,
    "protein": 30,
    "carbs": 40,
    "fat": 12,
    "fiber": 5
  } (or null if no food was eaten/logged)
}`;

      const response = await axios.post(
        apiUrl,
        {
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.3
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          timeout: 20000
        }
      );

      const content =
        response.data?.choices?.[0]?.message?.content ||
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      let parsed;
      if (typeof content === 'string') {
        const clean = content.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(clean);
      } else {
        parsed = content;
      }

      return {
        reply: parsed.reply || 'Analysis completed.',
        mealLogged: parsed.mealLogged || null
      };
    } catch (err) {
      console.warn('[aiChatService] Live AI call failed, switching to natural language parser:', err.message);
    }
  }

  // Development / Intelligent Natural Language Fallback
  const detectedMeal = parseMealFromText(userMessage);

  if (detectedMeal) {
    return {
      reply: `Got it! I've calculated the nutrition for **${detectedMeal.name}** and logged it directly to your **${detectedMeal.type}**.\n\n📊 **Nutrition Added:**\n• Calories: **${detectedMeal.calories} kcal**\n• Protein: **${detectedMeal.protein}g**\n• Carbs: **${detectedMeal.carbs}g**\n• Fat: **${detectedMeal.fat}g**\n• Dietary Fiber: **${detectedMeal.fiber}g**\n\nYour dashboard Today's Meals and total macros have been updated!`,
      mealLogged: detectedMeal
    };
  }

  // Non-food conversational response
  const lower = userMessage.toLowerCase();
  let reply = "I'm your SnapFit AI Coach! I can help you plan your diet, track your macros, or log meals automatically. Just tell me what you ate (e.g. 'I had 2 boiled eggs and toast for breakfast') and I'll calculate the nutrition and save it to your dashboard!";

  if (lower.includes('dinner')) {
    reply = "For dinner, I suggest keeping it high in protein and moderate in complex carbs. Great options include Grilled Chicken with steamed veggies, Paneer Bhurji with 1-2 Rotis, or Dal with Brown Rice and a big fresh salad!";
  } else if (lower.includes('protein')) {
    reply = "To hit your protein goals, aim for high-quality sources such as chicken breast (31g/100g), eggs (6.5g each), Greek yogurt (10g/100g), paneer/tofu (18g/100g), or whey isolate. Would you like me to log a high-protein snack for you?";
  } else if (lower.includes('water')) {
    reply = "Staying hydrated is crucial for metabolic efficiency! Your target is 8 glasses (2.0L) a day. Try drinking a glass right before each meal.";
  }

  return {
    reply,
    mealLogged: null
  };
}

module.exports = {
  processChatMessage,
  parseMealFromText
};
