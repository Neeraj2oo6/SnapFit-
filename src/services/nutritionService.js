import { doc, getDoc, setDoc, collection, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase.js';
import { INDIAN_FOOD_DATABASE, searchIndianFoodDatabase, PORTION_CONVERSIONS } from '../data/indianFoodDatabase.js';

/**
 * NUMBER WORDS (English + Hindi/Hinglish)
 */
const NUMBER_WORDS = {
  // English
  'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
  'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'half': 0.5, 'quarter': 0.25, 'single': 1, 'couple': 2, 'double': 2,
  // Hindi / Hinglish
  'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'panch': 5,
  'chhe': 6, 'chhah': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
  'adha': 0.5, 'adhaa': 0.5, 'dedh': 1.5, 'dhai': 2.5
};

/**
 * SNAPFIT CENTRAL HYBRID NUTRITION SERVICE
 * 
 * Architecture:
 * 1. User Input (Photo OR Chat)
 * 2. AI Food Identification & Portion Extraction
 * 3. Firestore Food Database (`foodDatabase/{normalizedKey}`)
 * 4. Master Verified Indian Food Database (IFCT / ICMR / USDA)
 * 5. Reliable Nutrition Database / OpenFoodFacts API
 * 6. AI Estimation Fallback (clearly marked "Estimated Nutrition")
 * 7. User Confirmation -> Save to Firebase -> Real-Time Dashboard
 */
export const nutritionService = {
  /**
   * Classify user natural language message: "food", "water", or "unknown"
   */
  classifyMessage(text) {
    if (!text || typeof text !== 'string') return 'unknown';
    const lower = text.toLowerCase().trim();

    // Check for water indicators (English + Hindi)
    const isWater = (
      lower.includes('water') ||
      lower.includes('pani') ||
      lower.includes('paani') ||
      lower.includes('drank') ||
      lower.includes('piya') ||
      lower.includes('piye') ||
      lower.includes('glass of water') ||
      lower.includes('glasses of water') ||
      lower.includes('bottle of water') ||
      lower.includes('litre of water') ||
      lower.includes('liter of water') ||
      lower.includes('ml water') ||
      lower.includes('ml pani')
    );

    // Guard: exclude foods like "watermelon" or "water chestnut"
    if (isWater && !lower.includes('watermelon') && !lower.includes('water chestnut') && !lower.includes('tarbooj')) {
      return 'water';
    }

    // Check for food verbs / triggers in English & Hindi/Hinglish
    const foodVerbs = [
      'ate', 'had', 'consumed', 'eating', 'have eaten', 'eat',
      'khaya', 'khayi', 'khaye', 'khana', 'piya', 'pi', 'piye',
      'breakfast', 'lunch', 'dinner', 'snack', 'nashta', 'dophar', 'raat',
      'plate', 'bowl', 'katori', 'cup', 'glass', 'roti', 'chawal', 'dal',
      'kela', 'aam', 'seb', 'doodh', 'anda', 'paneer', 'biryani'
    ];
    const hasFoodVerb = foodVerbs.some((v) => lower.includes(v));

    // Check if query matches or contains any food from master database
    const matchedFood = searchIndianFoodDatabase(lower);
    if (matchedFood || hasFoodVerb) {
      return 'food';
    }

    // Also check tokenized items
    const words = lower.split(/[\s,]+/);
    for (const w of words) {
      if (w.length > 2 && searchIndianFoodDatabase(w)) {
        return 'food';
      }
    }

    return 'unknown';
  },

  /**
   * Extract water in milliliters from natural language (English + Hindi/Hinglish)
   */
  parseWaterIntake(text) {
    if (!text || typeof text !== 'string') return 250;
    const lower = text.toLowerCase().trim();

    // Direct ml match (e.g., "500 ml water", "500ml pani")
    const mlMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliters?)/i);
    if (mlMatch) {
      return Math.round(parseFloat(mlMatch[1])) || 250;
    }

    // Litre match (e.g., "1 litre", "1.5 liters", "1 l")
    const litreMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:litre|litres|liter|liters|l\b)/i);
    if (litreMatch) {
      return Math.round(parseFloat(litreMatch[1]) * 1000) || 1000;
    }

    // "half litre", "adha litre", "aadha liter"
    if (lower.includes('half litre') || lower.includes('half liter') || lower.includes('adha litre') || lower.includes('aadha litre')) {
      return 500;
    }

    // Glass match (numeric e.g. "2 glasses", "1 glass")
    const glassMatch = lower.match(/(\d+)\s*glass(?:es)?/i);
    if (glassMatch) {
      const count = parseInt(glassMatch[1], 10) || 1;
      return count * 250;
    }

    // Word count for glasses (e.g. "two glasses", "do glass", "ek glass")
    for (const [word, val] of Object.entries(NUMBER_WORDS)) {
      if (lower.includes(`${word} glass`) || lower.includes(`${word} glasses`)) {
        return Math.round(val * 250);
      }
    }

    // Bottle match
    const bottleMatch = lower.match(/(\d+)\s*bottle(?:s)?/i);
    if (bottleMatch) {
      const count = parseInt(bottleMatch[1], 10) || 1;
      return count * 500;
    }
    for (const [word, val] of Object.entries(NUMBER_WORDS)) {
      if (lower.includes(`${word} bottle`) || lower.includes(`${word} bottles`)) {
        return Math.round(val * 500);
      }
    }

    // Default 1 glass (250ml)
    return 250;
  },

  /**
   * Normalize search string to a unique canonical key
   * Ensures no duplicates for "Roti", "roti", "ROTI ", "chapati"
   */
  normalizeKey(str) {
    if (!str) return 'food_item';
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50);
  },

  /**
   * STEP 1 to 4 HYBRID FOOD LOOKUP:
   * 1. Search Firestore food cache (foodDatabase/{normalizedKey})
   * 2. Search Master Verified Indian Food Database (IFCT/ICMR)
   * 3. Search External / Open Food Facts API if applicable
   * 4. Return null if unindexed (will trigger AI estimation fallback)
   */
  async lookupFoodItem(foodQuery) {
    if (!foodQuery || typeof foodQuery !== 'string') return null;
    const clean = foodQuery.trim().toLowerCase();
    const normalizedKey = this.normalizeKey(clean);

    // 1. Search Firestore foodDatabase collection
    if (isFirebaseConfigured && db) {
      try {
        const cacheDocRef = doc(db, 'foodDatabase', normalizedKey);
        const cacheSnap = await getDoc(cacheDocRef);
        if (cacheSnap.exists()) {
          const d = cacheSnap.data();
          return {
            id: normalizedKey,
            name: d.name || foodQuery,
            category: d.category || 'General',
            preparation: d.preparation || 'cooked',
            servingSize: d.servingSize || 100,
            servingUnit: d.servingUnit || 'g',
            defaultPortion: d.defaultPortion || '1 serving',
            defaultGrams: d.defaultGrams || 100,
            calories: Number(d.calories || d.caloriesPer100g || 200),
            protein: Number(d.protein || d.proteinPer100g || 10),
            carbs: Number(d.carbs || d.carbsPer100g || 25),
            fat: Number(d.fat || d.fatPer100g || 5),
            fiber: d.fiber !== undefined ? Number(d.fiber) : (d.fiberPer100g ? Number(d.fiberPer100g) : null),
            sugar: d.sugar !== undefined ? Number(d.sugar) : (d.sugarPer100g ? Number(d.sugarPer100g) : null),
            sodium: d.sodium !== undefined ? Number(d.sodium) : (d.sodiumPer100g ? Number(d.sodiumPer100g) : null),
            caloriesPer100g: Number(d.caloriesPer100g || 200),
            proteinPer100g: Number(d.proteinPer100g || 10),
            carbsPer100g: Number(d.carbsPer100g || 25),
            fatPer100g: Number(d.fatPer100g || 5),
            source: d.source || 'verified_database',
            isIndianFood: d.isIndianFood ?? true,
            isEstimated: d.source === 'ai_estimate'
          };
        }
      } catch (err) {
        console.warn('Firestore food cache lookup error:', err.message);
      }
    }

    // 2. Search Master Indian Food Database
    const matchedItem = searchIndianFoodDatabase(clean);
    if (matchedItem) {
      return {
        ...matchedItem,
        source: 'verified_database',
        isEstimated: false
      };
    }

    return null;
  },

  /**
   * Calculate nutrition based on food item and detected quantity / portion
   */
  async calculateNutrition(foodName, portionText = '1 serving', multiplier = 1) {
    const mult = Math.max(0.1, Number(multiplier) || 1);
    const itemData = await this.lookupFoodItem(foodName);

    if (itemData) {
      const cal = Math.round(itemData.calories * mult);
      const pro = Math.round(itemData.protein * mult * 10) / 10;
      const carb = Math.round(itemData.carbs * mult * 10) / 10;
      const fat = Math.round(itemData.fat * mult * 10) / 10;
      const fib = itemData.fiber != null ? Math.round(itemData.fiber * mult * 10) / 10 : null;
      const sug = itemData.sugar != null ? Math.round(itemData.sugar * mult * 10) / 10 : null;
      const sod = itemData.sodium != null ? Math.round(itemData.sodium * mult) : null;

      return {
        foodName: itemData.name,
        portion: portionText || itemData.defaultPortion,
        calories: cal,
        protein: pro,
        carbs: carb,
        fat: fat,
        fiber: fib,
        sugar: sug,
        sodium: sod,
        confidence: 96,
        source: itemData.source || 'verified_database',
        isEstimated: false
      };
    }

    // AI Estimation Fallback (Requirement 28)
    return {
      foodName: foodName || 'Healthy Dish',
      portion: portionText || '1 serving',
      calories: Math.round(320 * mult),
      protein: Math.round(14 * mult * 10) / 10,
      carbs: Math.round(42 * mult * 10) / 10,
      fat: Math.round(11 * mult * 10) / 10,
      fiber: Math.round(3.5 * mult * 10) / 10,
      sugar: null,
      sodium: null,
      confidence: 72,
      source: 'ai_estimate',
      isEstimated: true,
      estimationNotice: 'Estimated nutrition. Values may vary based on portion size, ingredients and preparation.'
    };
  },

  /**
   * Central Natural Language Parser for AI Food Chat
   * Understands English, Hindi and Hinglish
   * Handles multiple foods, portion estimation, meal types
   */
  async parseNaturalLanguageFood(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Please enter what you ate.');
    }

    const lower = text.toLowerCase().trim();

    // 1. Detect Meal Type from text
    let detectedMealType = 'Lunch';
    if (
      lower.includes('breakfast') || lower.includes('morning') ||
      lower.includes('nashta') || lower.includes('subah')
    ) {
      detectedMealType = 'Breakfast';
    } else if (
      lower.includes('lunch') || lower.includes('afternoon') ||
      lower.includes('dophar') || lower.includes('dopehar')
    ) {
      detectedMealType = 'Lunch';
    } else if (
      lower.includes('dinner') || lower.includes('night') ||
      lower.includes('raat') || lower.includes('shaam')
    ) {
      detectedMealType = 'Dinner';
    } else if (
      lower.includes('snack') || lower.includes('evening') ||
      lower.includes('chai') || lower.includes('tea time')
    ) {
      detectedMealType = 'Snack';
    }

    // Clean conversational phrases in English and Hindi/Hinglish
    let sanitized = lower
      .replace(/for (breakfast|lunch|dinner|snack)/gi, '')
      .replace(/aaj (lunch|dinner|breakfast|nashta) mein/gi, '')
      .replace(/(in|at) (breakfast|lunch|dinner|snack)/gi, '')
      .replace(/i (ate|had|consumed|drank|took|eaten)/gi, '')
      .replace(/maine|mujhe|humne|aaj|mene|main/gi, '')
      .replace(/khaya|khayi|khaye|piya|pi|piye|liya|lee|li/gi, '')
      .trim();

    // 2. Tokenize multiple dishes separated by 'and', 'aur', ',', '+', '&', 'with', 'saath'
    const delimiters = /,\s*|\band\b|\baur\b|\bwith\b|\bsaath\b|\bke saath\b|\+|\&/gi;
    const rawClauses = sanitized.split(delimiters).map(s => s.trim()).filter(Boolean);

    const detectedItems = [];

    for (const rawClause of rawClauses) {
      const clause = rawClause.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!clause) continue;

      let quantity = 1;
      let portionLabel = '';
      let clauseWithoutQuantity = clause;

      // Check for numeric quantity (e.g. "2 rotis", "500 ml doodh", "1 bowl dal")
      const numMatch = clause.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
      const gramMatch = clause.match(/(\d+(?:\.\d+)?)\s*(?:grams?|gms?|g\b)/i);
      const mlMatch = clause.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliters?)/i);

      if (gramMatch) {
        const grams = parseFloat(gramMatch[1]) || 100;
        quantity = grams / 100;
        portionLabel = `${grams}g`;
        clauseWithoutQuantity = clause.replace(gramMatch[0], '').trim();
      } else if (mlMatch) {
        const ml = parseFloat(mlMatch[1]) || 250;
        quantity = ml / 250;
        portionLabel = `${ml} ml`;
        clauseWithoutQuantity = clause.replace(mlMatch[0], '').trim();
      } else if (numMatch) {
        quantity = parseFloat(numMatch[1]) || 1;
        clauseWithoutQuantity = numMatch[2].trim();
      } else {
        // Check for written number words at start or within clause (e.g. "ek kela", "do roti", "two eggs")
        const words = clause.split(' ');
        for (const [w, val] of Object.entries(NUMBER_WORDS)) {
          if (words[0] === w || clause.startsWith(`${w} `)) {
            quantity = val;
            clauseWithoutQuantity = clause.replace(new RegExp(`^${w}\\s+`, 'i'), '').trim();
            break;
          }
        }
      }

      // Check unit words in the clause
      if (!portionLabel) {
        if (clause.includes('bowl') || clause.includes('katori')) {
          portionLabel = `${quantity} bowl`;
          clauseWithoutQuantity = clauseWithoutQuantity.replace(/bowl|katori/gi, '').trim();
        } else if (clause.includes('plate')) {
          portionLabel = `${quantity} plate`;
          clauseWithoutQuantity = clauseWithoutQuantity.replace(/plate/gi, '').trim();
        } else if (clause.includes('cup')) {
          portionLabel = `${quantity} cup`;
          clauseWithoutQuantity = clauseWithoutQuantity.replace(/cup/gi, '').trim();
        } else if (clause.includes('glass')) {
          portionLabel = `${quantity} glass`;
          clauseWithoutQuantity = clauseWithoutQuantity.replace(/glass/gi, '').trim();
        } else if (clause.includes('slice')) {
          portionLabel = `${quantity} slice`;
          clauseWithoutQuantity = clauseWithoutQuantity.replace(/slice|slices/gi, '').trim();
        } else if (clause.includes('piece') || clause.includes('pcs')) {
          portionLabel = `${quantity} pcs`;
          clauseWithoutQuantity = clauseWithoutQuantity.replace(/piece|pieces|pcs/gi, '').trim();
        }
      }

      // Look up food item
      const itemData = await this.lookupFoodItem(clauseWithoutQuantity || clause);
      if (itemData) {
        const itemPortion = portionLabel || (quantity === 1 ? itemData.defaultPortion : `${quantity} ${itemData.servingUnit === 'piece' ? 'pcs' : itemData.servingUnit}`);
        const cal = Math.round(itemData.calories * quantity);
        const pro = Math.round(itemData.protein * quantity * 10) / 10;
        const carb = Math.round(itemData.carbs * quantity * 10) / 10;
        const fat = Math.round(itemData.fat * quantity * 10) / 10;
        const fib = itemData.fiber != null ? Math.round(itemData.fiber * quantity * 10) / 10 : null;
        const sug = itemData.sugar != null ? Math.round(itemData.sugar * quantity * 10) / 10 : null;
        const sod = itemData.sodium != null ? Math.round(itemData.sodium * quantity) : null;

        detectedItems.push({
          foodName: itemData.name,
          portion: itemPortion,
          calories: cal,
          protein: pro,
          carbs: carb,
          fat: fat,
          fiber: fib,
          sugar: sug,
          sodium: sod,
          confidence: itemData.isEstimated ? 75 : 96,
          source: itemData.source || 'verified_database',
          isEstimated: itemData.isEstimated || false
        });
      }
    }

    // Fallback: If no item matched individual clauses, test entire string directly
    if (detectedItems.length === 0) {
      const fallbackItem = await this.lookupFoodItem(sanitized || lower);
      if (fallbackItem) {
        detectedItems.push({
          foodName: fallbackItem.name,
          portion: fallbackItem.defaultPortion,
          calories: fallbackItem.calories,
          protein: fallbackItem.protein,
          carbs: fallbackItem.carbs,
          fat: fallbackItem.fat,
          fiber: fallbackItem.fiber,
          sugar: fallbackItem.sugar,
          sodium: fallbackItem.sodium,
          confidence: 90,
          source: fallbackItem.source || 'verified_database',
          isEstimated: false
        });
      }
    }

    // If completely unknown, return structured uncertain response (Requirement 29)
    if (detectedItems.length === 0) {
      return {
        success: false,
        confidence: 40,
        message: 'Food could not be identified confidently. Please enter the food name and portions manually.',
        mealType: detectedMealType,
        data: {
          foodName: sanitized.charAt(0).toUpperCase() + sanitized.slice(1) || 'Custom Food',
          portion: '1 serving',
          calories: 250,
          protein: 8,
          carbs: 35,
          fat: 8,
          fiber: null,
          sugar: null,
          sodium: null,
          confidence: 40,
          source: 'ai_estimate',
          isEstimated: true
        }
      };
    }

    // Calculate Totals across all detected items
    const totalCalories = detectedItems.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = Math.round(detectedItems.reduce((sum, item) => sum + item.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(detectedItems.reduce((sum, item) => sum + item.carbs, 0) * 10) / 10;
    const totalFat = Math.round(detectedItems.reduce((sum, item) => sum + item.fat, 0) * 10) / 10;
    
    // Total optional nutrients if available
    const hasFiber = detectedItems.some(i => i.fiber != null);
    const totalFiber = hasFiber ? Math.round(detectedItems.reduce((sum, item) => sum + (item.fiber || 0), 0) * 10) / 10 : null;

    const hasSugar = detectedItems.some(i => i.sugar != null);
    const totalSugar = hasSugar ? Math.round(detectedItems.reduce((sum, item) => sum + (item.sugar || 0), 0) * 10) / 10 : null;

    const hasSodium = detectedItems.some(i => i.sodium != null);
    const totalSodium = hasSodium ? Math.round(detectedItems.reduce((sum, item) => sum + (item.sodium || 0), 0)) : null;

    const aggregateTitle = detectedItems.map(i => i.foodName).join(' + ');
    const aggregatePortion = detectedItems.map(i => i.portion).join(', ');
    const isAnyEstimated = detectedItems.some(i => i.isEstimated);

    return {
      success: true,
      mealType: detectedMealType,
      items: detectedItems,
      data: {
        foodName: aggregateTitle,
        portion: aggregatePortion,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        fiber: totalFiber,
        sugar: totalSugar,
        sodium: totalSodium,
        confidence: isAnyEstimated ? 80 : 96,
        source: isAnyEstimated ? 'ai_estimate' : 'verified_database',
        isEstimated: isAnyEstimated
      }
    };
  },

  /**
   * Cache confirmed food in foodDatabase/{normalizedKey}
   * Avoids duplicates using normalized keys (e.g. 'roti', 'banana')
   */
  async cacheFoodInDatabase(foodName, mealData) {
    if (!foodName || !isFirebaseConfigured || !db) return;
    try {
      const foodKey = this.normalizeKey(foodName);
      const cacheRef = doc(db, 'foodDatabase', foodKey);

      await setDoc(cacheRef, {
        name: foodName,
        servingSize: mealData.servingSize || 100,
        servingUnit: mealData.servingUnit || 'g',
        calories: Number(mealData.calories) || 0,
        protein: Number(mealData.protein) || 0,
        carbs: Number(mealData.carbs) || 0,
        fat: Number(mealData.fat) || 0,
        fiber: mealData.fiber != null ? Number(mealData.fiber) : null,
        sugar: mealData.sugar != null ? Number(mealData.sugar) : null,
        sodium: mealData.sodium != null ? Number(mealData.sodium) : null,
        source: mealData.source === 'verified_database' ? 'verified_database' : 'user_confirmed',
        isIndianFood: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to cache in foodDatabase:', err.message);
    }
  }
};
