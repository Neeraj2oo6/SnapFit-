const axios = require('axios');

// Number words mapping for English and Hindi / Hinglish
const NUMBER_WORDS = {
  // English
  'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
  'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'half': 0.5, 'quarter': 0.25,
  // Hindi / Hinglish
  'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'panch': 5,
  'chhe': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
  'adha': 0.5, 'adhaa': 0.5, 'dedh': 1.5, 'dhai': 2.5
};

// Comprehensive Indian and International food nutrition dictionary
const VOICE_FOOD_KNOWLEDGE = [
  // Rotis & Breads
  { keys: ['roti', 'rotis', 'chapati', 'chapatis', 'phulka', 'fulka'], name: 'Roti / Chapati', baseCalories: 85, baseProtein: 3, baseCarbs: 18, baseFat: 0.5, baseFiber: 2.5, defaultUnit: 'piece' },
  { keys: ['paratha', 'parathe', 'parantha'], name: 'Plain Paratha', baseCalories: 180, baseProtein: 4, baseCarbs: 26, baseFat: 7, baseFiber: 2, defaultUnit: 'piece' },
  { keys: ['naan', 'butter naan'], name: 'Naan', baseCalories: 260, baseProtein: 8, baseCarbs: 45, baseFat: 5, baseFiber: 2, defaultUnit: 'piece' },
  { keys: ['puri', 'poori'], name: 'Puri', baseCalories: 105, baseProtein: 1.8, baseCarbs: 13, baseFat: 5.5, baseFiber: 1, defaultUnit: 'piece' },
  { keys: ['toast', 'bread', 'slice of bread', 'bread toast'], name: 'Bread Toast', baseCalories: 80, baseProtein: 3.5, baseCarbs: 15, baseFat: 1, baseFiber: 1.5, defaultUnit: 'slice' },

  // Rice & Grains
  { keys: ['rice', 'chawal', 'steamed rice', 'white rice'], name: 'Steamed Rice', baseCalories: 200, baseProtein: 4, baseCarbs: 45, baseFat: 0.8, baseFiber: 1, defaultUnit: 'bowl' },
  { keys: ['brown rice'], name: 'Brown Rice', baseCalories: 215, baseProtein: 5, baseCarbs: 45, baseFat: 1.5, baseFiber: 3.5, defaultUnit: 'bowl' },
  { keys: ['biryani', 'chicken biryani', 'veg biryani'], name: 'Biryani', baseCalories: 380, baseProtein: 15, baseCarbs: 48, baseFat: 14, baseFiber: 2, defaultUnit: 'plate' },
  { keys: ['khichdi', 'dal khichdi'], name: 'Dal Khichdi', baseCalories: 240, baseProtein: 8, baseCarbs: 42, baseFat: 4, baseFiber: 3, defaultUnit: 'bowl' },
  { keys: ['poha', 'pohaa', 'flattened rice'], name: 'Poha', baseCalories: 220, baseProtein: 4, baseCarbs: 40, baseFat: 5, baseFiber: 2.5, defaultUnit: 'plate' },
  { keys: ['oat', 'oatmeal', 'oats', 'porridge'], name: 'Oatmeal', baseCalories: 240, baseProtein: 9, baseCarbs: 42, baseFat: 4, baseFiber: 5, defaultUnit: 'bowl' },

  // Dals & Legumes
  { keys: ['dal', 'daal', 'lentil', 'lentils', 'yellow dal', 'toor dal', 'moong dal'], name: 'Dal', baseCalories: 160, baseProtein: 10, baseCarbs: 22, baseFat: 3, baseFiber: 4, defaultUnit: 'bowl' },
  { keys: ['rajma', 'rajma chawal', 'kidney beans'], name: 'Rajma (Kidney Beans)', baseCalories: 210, baseProtein: 12, baseCarbs: 32, baseFat: 4, baseFiber: 7, defaultUnit: 'bowl' },
  { keys: ['chole', 'chana', 'chickpeas', 'chana masala'], name: 'Chole (Chickpeas)', baseCalories: 230, baseProtein: 11, baseCarbs: 34, baseFat: 6, baseFiber: 8, defaultUnit: 'bowl' },

  // Vegetables & Curries
  { keys: ['paneer', 'cottage cheese'], name: 'Paneer', baseCalories: 260, baseProtein: 18, baseCarbs: 4, baseFat: 20, baseFiber: 0, defaultUnit: 'serving' },
  { keys: ['paneer bhurji', 'paneer butter masala', 'matar paneer'], name: 'Paneer Curry', baseCalories: 320, baseProtein: 16, baseCarbs: 10, baseFat: 24, baseFiber: 2, defaultUnit: 'bowl' },
  { keys: ['bhindi', 'okra', 'bhindi fry', 'lady finger'], name: 'Bhindi (Okra)', baseCalories: 120, baseProtein: 3, baseCarbs: 12, baseFat: 6, baseFiber: 4, defaultUnit: 'bowl' },
  { keys: ['baingan', 'brinjal', 'eggplant', 'baingan bharta'], name: 'Baingan (Eggplant)', baseCalories: 130, baseProtein: 2, baseCarbs: 14, baseFat: 7, baseFiber: 4, defaultUnit: 'bowl' },
  { keys: ['lauki', 'bottle gourd', 'ghiya', 'doodhi'], name: 'Lauki (Bottle Gourd)', baseCalories: 90, baseProtein: 2, baseCarbs: 10, baseFat: 4, baseFiber: 3, defaultUnit: 'bowl' },
  { keys: ['aloo', 'potato', 'aloo gobi', 'aloo sabzi'], name: 'Aloo Gobi / Sabzi', baseCalories: 170, baseProtein: 4, baseCarbs: 28, baseFat: 5, baseFiber: 4, defaultUnit: 'bowl' },

  // South Indian
  { keys: ['dosa', 'masala dosa'], name: 'Dosa', baseCalories: 170, baseProtein: 4, baseCarbs: 30, baseFat: 4, baseFiber: 2, defaultUnit: 'piece' },
  { keys: ['idli', 'idlis'], name: 'Idli', baseCalories: 60, baseProtein: 2, baseCarbs: 12, baseFat: 0.3, baseFiber: 1, defaultUnit: 'piece' },
  { keys: ['sambar', 'sambhar'], name: 'Sambar', baseCalories: 110, baseProtein: 4, baseCarbs: 18, baseFat: 2, baseFiber: 3, defaultUnit: 'bowl' },

  // Eggs & Meats
  { keys: ['egg', 'eggs', 'anda', 'boiled egg', 'boiled eggs', 'ande'], name: 'Boiled Egg', baseCalories: 72, baseProtein: 6.3, baseCarbs: 0.4, baseFat: 4.8, baseFiber: 0, defaultUnit: 'piece' },
  { keys: ['omelette', 'omlet', 'egg bhurji'], name: 'Egg Omelette', baseCalories: 155, baseProtein: 12, baseCarbs: 1.5, baseFat: 11, baseFiber: 0, defaultUnit: 'serving' },
  { keys: ['chicken', 'chicken breast', 'grilled chicken', 'murgh'], name: 'Grilled Chicken Breast', baseCalories: 280, baseProtein: 35, baseCarbs: 0, baseFat: 6, baseFiber: 0, defaultUnit: 'serving' },
  { keys: ['chicken curry', 'butter chicken'], name: 'Chicken Curry', baseCalories: 340, baseProtein: 28, baseCarbs: 8, baseFat: 22, baseFiber: 1, defaultUnit: 'bowl' },
  { keys: ['fish', 'machli', 'grilled fish'], name: 'Fish', baseCalories: 210, baseProtein: 26, baseCarbs: 0, baseFat: 11, baseFiber: 0, defaultUnit: 'serving' },

  // Fruits
  { keys: ['banana', 'bananas', 'kela', 'kele'], name: 'Banana', baseCalories: 105, baseProtein: 1.3, baseCarbs: 27, baseFat: 0.3, baseFiber: 3.1, defaultUnit: 'piece' },
  { keys: ['apple', 'apples', 'seb'], name: 'Apple', baseCalories: 95, baseProtein: 0.5, baseCarbs: 25, baseFat: 0.3, baseFiber: 4.4, defaultUnit: 'piece' },
  { keys: ['mango', 'aam'], name: 'Mango', baseCalories: 150, baseProtein: 1.5, baseCarbs: 38, baseFat: 0.6, baseFiber: 3, defaultUnit: 'piece' },
  { keys: ['orange', 'santra', 'mosambi'], name: 'Orange', baseCalories: 62, baseProtein: 1.2, baseCarbs: 15, baseFat: 0.2, baseFiber: 3.1, defaultUnit: 'piece' },
  { keys: ['papaya', 'papita'], name: 'Papaya', baseCalories: 75, baseProtein: 1, baseCarbs: 18, baseFat: 0.4, baseFiber: 2.8, defaultUnit: 'bowl' },

  // Dairy & Drinks
  { keys: ['milk', 'doodh', 'glass of milk'], name: 'Milk', baseCalories: 130, baseProtein: 8, baseCarbs: 12, baseFat: 6, baseFiber: 0, defaultUnit: 'glass' },
  { keys: ['curd', 'dahi', 'yogurt'], name: 'Dahi / Curd', baseCalories: 110, baseProtein: 6, baseCarbs: 8, baseFat: 5, baseFiber: 0, defaultUnit: 'bowl' },
  { keys: ['chaas', 'buttermilk', 'chach'], name: 'Chaas (Buttermilk)', baseCalories: 50, baseProtein: 3, baseCarbs: 5, baseFat: 2, baseFiber: 0, defaultUnit: 'glass' },
  { keys: ['whey', 'whey protein', 'protein shake'], name: 'Whey Protein Shake', baseCalories: 140, baseProtein: 25, baseCarbs: 3, baseFat: 2, baseFiber: 0, defaultUnit: 'scoop' },
  { keys: ['tea', 'chai', 'cup of tea'], name: 'Milk Tea / Chai', baseCalories: 85, baseProtein: 2, baseCarbs: 12, baseFat: 3, baseFiber: 0, defaultUnit: 'cup' },
  { keys: ['coffee', 'cup of coffee'], name: 'Coffee', baseCalories: 60, baseProtein: 2, baseCarbs: 8, baseFat: 2, baseFiber: 0, defaultUnit: 'cup' }
];

/**
 * Checks if transcript is talking about water intake.
 * Returns { isWater: boolean, amountMl: number }
 */
function parseWater(text) {
  if (!text || typeof text !== 'string') return { isWater: false, amountMl: 0 };
  const lower = text.toLowerCase().trim();

  const isWaterWord = (
    lower.includes('water') ||
    lower.includes('pani') ||
    lower.includes('paani') ||
    lower.includes('glass of water') ||
    lower.includes('glasses of water') ||
    lower.includes('bottle of water') ||
    lower.includes('ml water') ||
    lower.includes('ml pani') ||
    (lower.includes('drank') && (lower.includes('glass') || lower.includes('litre') || lower.includes('ml')))
  );

  // Guard against watermelon / tarbooj
  if (!isWaterWord || lower.includes('watermelon') || lower.includes('tarbooj')) {
    return { isWater: false, amountMl: 0 };
  }

  // Exact ml match
  const mlMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliters?)/i);
  if (mlMatch) {
    return { isWater: true, amountMl: Math.round(parseFloat(mlMatch[1])) || 250 };
  }

  // Litre match
  const litreMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:litre|litres|liter|liters|l\b)/i);
  if (litreMatch) {
    return { isWater: true, amountMl: Math.round(parseFloat(litreMatch[1]) * 1000) || 1000 };
  }

  if (lower.includes('half litre') || lower.includes('adha litre') || lower.includes('aadha liter')) {
    return { isWater: true, amountMl: 500 };
  }

  // Glasses count
  const glassMatch = lower.match(/(\d+)\s*glass(?:es)?/i);
  if (glassMatch) {
    return { isWater: true, amountMl: (parseInt(glassMatch[1], 10) || 1) * 250 };
  }

  for (const [word, val] of Object.entries(NUMBER_WORDS)) {
    if (lower.includes(`${word} glass`) || lower.includes(`${word} glasses`)) {
      return { isWater: true, amountMl: Math.round(val * 250) };
    }
  }

  return { isWater: true, amountMl: 250 };
}

/**
 * Parses spoken text into structured food items and calculates aggregate nutrition.
 */
async function analyzeVoiceMeal(text, preferredType) {
  const rawText = String(text || '').trim();
  const lower = rawText.toLowerCase();

  // 1. Water check
  const waterCheck = parseWater(rawText);
  if (waterCheck.isWater) {
    return {
      isWater: true,
      amountMl: waterCheck.amountMl,
      name: `Water (${waterCheck.amountMl} ml)`,
      transcript: rawText
    };
  }

  // 2. Determine meal type
  let type = preferredType || 'Lunch';
  if (lower.includes('breakfast') || lower.includes('nashta') || lower.includes('subah')) type = 'Breakfast';
  else if (lower.includes('lunch') || lower.includes('dophar') || lower.includes('dopehar')) type = 'Lunch';
  else if (lower.includes('dinner') || lower.includes('raat') || lower.includes('shaam')) type = 'Dinner';
  else if (lower.includes('snack') || lower.includes('evening') || lower.includes('chai')) type = 'Snack';
  else if (!preferredType) {
    const hour = new Date().getHours();
    if (hour < 11) type = 'Breakfast';
    else if (hour < 16) type = 'Lunch';
    else if (hour < 19) type = 'Snack';
    else type = 'Dinner';
  }

  // 3. Try live AI if configured on backend
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;
  const isLiveAI = apiKey && apiUrl && apiKey !== 'your_api_key' && apiUrl !== 'your_ai_endpoint' && apiUrl.startsWith('http');

  if (isLiveAI) {
    try {
      const prompt = `You are a nutrition expert specializing in Indian and global diets.
Analyze this spoken meal transcript: "${rawText}".
Support English, Hindi and Hinglish phrases (e.g. "Maine do roti aur dal khayi").
Extract individual food items, their quantities, portion units (piece, bowl, plate, cup, etc.), and calculate accurate nutritional macros.
Return ONLY valid JSON with this schema:
{
  "name": "Summary Meal Title",
  "type": "${type}",
  "items": [
    {
      "foodName": "Roti",
      "quantity": 2,
      "portionUnit": "piece",
      "portion": "2 pieces",
      "calories": 170,
      "protein": 6,
      "carbs": 36,
      "fat": 1,
      "fiber": 5
    }
  ],
  "totalNutrition": {
    "calories": 170,
    "protein": 6,
    "carbs": 36,
    "fat": 1,
    "fiber": 5
  }
}`;

      const aiRes = await axios.post(
        apiUrl,
        {
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1
        },
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          timeout: 15000
        }
      );

      const content = aiRes.data?.choices?.[0]?.message?.content || aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const clean = content.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          const items = parsed.items.map(it => ({
            foodName: it.foodName || it.name,
            name: it.foodName || it.name,
            quantity: Number(it.quantity) || 1,
            portionUnit: it.portionUnit || 'serving',
            portion: it.portion || `${it.quantity || 1} ${it.portionUnit || 'serving'}`,
            calories: Math.round(Number(it.calories) || 0),
            protein: Math.round((Number(it.protein) || 0) * 10) / 10,
            carbs: Math.round((Number(it.carbs) || 0) * 10) / 10,
            fat: Math.round((Number(it.fat) || 0) * 10) / 10,
            fiber: it.fiber != null ? Math.round((Number(it.fiber) || 0) * 10) / 10 : null
          }));

          const totalCalories = items.reduce((s, i) => s + i.calories, 0);
          const totalProtein = Math.round(items.reduce((s, i) => s + i.protein, 0) * 10) / 10;
          const totalCarbs = Math.round(items.reduce((s, i) => s + i.carbs, 0) * 10) / 10;
          const totalFat = Math.round(items.reduce((s, i) => s + i.fat, 0) * 10) / 10;
          const totalFiber = Math.round(items.reduce((s, i) => s + (i.fiber || 0), 0) * 10) / 10;

          return {
            isWater: false,
            name: parsed.name || items.map(i => i.foodName).join(' + '),
            type,
            transcript: rawText,
            items,
            calories: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat,
            fiber: totalFiber,
            totalNutrition: {
              calories: totalCalories,
              protein: totalProtein,
              carbs: totalCarbs,
              fat: totalFat,
              fiber: totalFiber
            },
            source: 'ai'
          };
        }
      }
    } catch (err) {
      console.warn('[voiceService] AI call error, falling back to local NLP dictionary:', err.message);
    }
  }

  // 4. Robust Local NLP & Indian Food Dictionary Engine
  // Tokenize multiple dishes separated by 'and', 'aur', ',', '+', '&', 'with', 'saath'
  let cleanTranscript = lower
    .replace(/for (breakfast|lunch|dinner|snack)/gi, '')
    .replace(/aaj (lunch|dinner|breakfast|nashta) mein/gi, '')
    .replace(/(in|at) (breakfast|lunch|dinner|snack)/gi, '')
    .replace(/i (ate|had|consumed|drank|took|eaten)/gi, '')
    .replace(/maine|mujhe|humne|aaj|mene|main/gi, '')
    .replace(/khaya|khayi|khaye|piya|pi|piye|liya|lee|li/gi, '')
    .trim();

  const delimiters = /,\s*|\band\b|\baur\b|\bwith\b|\bsaath\b|\bke saath\b|\+|\&/gi;
  const rawClauses = cleanTranscript.split(delimiters).map(s => s.trim()).filter(Boolean);

  const detectedItems = [];

  for (const rawClause of (rawClauses.length > 0 ? rawClauses : [lower])) {
    const clause = rawClause.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clause) continue;

    let matchedItem = null;
    let qty = 1;
    let unit = 'serving';

    // 1. Detect quantity (digits or number words)
    const digitMatch = clause.match(/^(\d+(?:\.\d+)?)/);
    if (digitMatch) {
      qty = parseFloat(digitMatch[1]) || 1;
    } else {
      const words = clause.split(' ');
      for (const [w, val] of Object.entries(NUMBER_WORDS)) {
        if (words[0] === w || clause.startsWith(`${w} `)) {
          qty = val;
          break;
        }
      }
    }

    // 2. Detect unit in clause
    if (clause.includes('bowl') || clause.includes('katori')) unit = 'bowl';
    else if (clause.includes('plate')) unit = 'plate';
    else if (clause.includes('cup')) unit = 'cup';
    else if (clause.includes('glass')) unit = 'glass';
    else if (clause.includes('slice')) unit = 'slice';
    else if (clause.includes('piece') || clause.includes('pcs')) unit = 'piece';

    // 3. Match against food dictionary
    for (const food of VOICE_FOOD_KNOWLEDGE) {
      for (const key of food.keys) {
        if (clause.includes(key)) {
          matchedItem = food;
          if (unit === 'serving') unit = food.defaultUnit;
          break;
        }
      }
      if (matchedItem) break;
    }

    if (matchedItem) {
      const cals = Math.round(matchedItem.baseCalories * qty);
      const pro = Math.round(matchedItem.baseProtein * qty * 10) / 10;
      const carbs = Math.round(matchedItem.baseCarbs * qty * 10) / 10;
      const fat = Math.round(matchedItem.baseFat * qty * 10) / 10;
      const fib = Math.round(matchedItem.baseFiber * qty * 10) / 10;

      detectedItems.push({
        foodName: matchedItem.name,
        name: `${qty > 1 ? qty + ' ' : ''}${matchedItem.name}`,
        quantity: qty,
        portionUnit: unit,
        portion: `${qty} ${unit}${qty > 1 && !['glass', 'fish', 'rice', 'dal'].includes(unit) ? 's' : ''}`,
        calories: cals,
        protein: pro,
        carbs,
        fat,
        fiber: fib
      });
    }
  }

  // Fallback if no specific food dictionary item was matched
  if (detectedItems.length === 0) {
    const fallbackName = rawText.replace(/(i ate|i had|i drank|logged|log|for breakfast|for lunch|for dinner|for snack|maine|khaya|khayi)/gi, '').trim() || 'Custom Meal';
    detectedItems.push({
      foodName: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
      name: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
      quantity: 1,
      portionUnit: 'serving',
      portion: '1 serving',
      calories: 320,
      protein: 12,
      carbs: 45,
      fat: 10,
      fiber: 3
    });
  }

  const totalCalories = detectedItems.reduce((sum, i) => sum + i.calories, 0);
  const totalProtein = Math.round(detectedItems.reduce((sum, i) => sum + i.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(detectedItems.reduce((sum, i) => sum + i.carbs, 0) * 10) / 10;
  const totalFat = Math.round(detectedItems.reduce((sum, i) => sum + i.fat, 0) * 10) / 10;
  const totalFiber = Math.round(detectedItems.reduce((sum, i) => sum + (i.fiber || 0), 0) * 10) / 10;
  const mealName = detectedItems.map(i => i.foodName).join(' + ');

  return {
    isWater: false,
    name: mealName,
    type,
    transcript: rawText,
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    fiber: totalFiber,
    items: detectedItems,
    totalNutrition: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      fiber: totalFiber
    },
    source: 'dictionary'
  };
}

module.exports = {
  analyzeVoiceMeal,
  parseWater
};
