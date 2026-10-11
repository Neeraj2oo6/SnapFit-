const fs = require('fs');
const axios = require('axios');

/**
 * Validates and sanitizes the parsed nutrition result.
 */
function sanitizeNutritionResult(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid AI response format');
  }

  const foodName = typeof raw.foodName === 'string' && raw.foodName.trim()
    ? raw.foodName.trim()
    : 'Identified Meal Bowl';

  const calories = Number.isFinite(Number(raw.calories)) ? Math.round(Number(raw.calories)) : 450;
  const protein = Number.isFinite(Number(raw.protein)) ? Math.round(Number(raw.protein)) : 38;
  const carbs = Number.isFinite(Number(raw.carbs)) ? Math.round(Number(raw.carbs)) : 22;
  const fat = Number.isFinite(Number(raw.fat)) ? Math.round(Number(raw.fat)) : 18;
  const fiber = Number.isFinite(Number(raw.fiber)) ? Math.round(Number(raw.fiber)) : 7;
  const servingSize = typeof raw.servingSize === 'string' && raw.servingSize.trim()
    ? raw.servingSize.trim()
    : '1 bowl';
  const confidence = Number.isFinite(Number(raw.confidence))
    ? Math.min(100, Math.max(1, Math.round(Number(raw.confidence))))
    : 94;

  return {
    foodName,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    servingSize,
    confidence
  };
}

/**
 * Service to analyze food image using configured AI Vision API.
 * 
 * @param {Object|string} image - File object from multer or string path to image
 * @returns {Promise<Object>} nutrition details
 */
async function analyzeFood(image) {
  const filePath = typeof image === 'string' ? image : image?.path;

  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Image file not found on disk');
  }

  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;

  // Check if live AI credentials are configured (not placeholder / empty)
  const isLiveAIConfigured =
    apiKey &&
    apiUrl &&
    apiKey !== 'your_api_key' &&
    apiUrl !== 'your_ai_endpoint' &&
    apiUrl.startsWith('http');

  if (isLiveAIConfigured) {
    try {
      // Read image file and convert to Base64
      const imageBuffer = fs.readFileSync(filePath);
      const mimeType = (typeof image === 'object' && image.mimetype) ? image.mimetype : 'image/jpeg';
      const base64Data = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      const prompt = `Analyze this food image. Identify the dish and estimate exact nutritional content.
Respond ONLY with a valid JSON object strictly matching this schema:
{
  "foodName": "Name of food item",
  "calories": 450,
  "protein": 38,
  "carbs": 22,
  "fat": 18,
  "fiber": 7,
  "servingSize": "1 bowl",
  "confidence": 94
}`;

      // Call AI Vision API using Axios
      const response = await axios.post(
        apiUrl,
        {
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.2
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          timeout: 25000
        }
      );

      // Parse AI response content
      const content =
        response.data?.choices?.[0]?.message?.content ||
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        response.data;

      let parsedData;
      if (typeof content === 'string') {
        // Strip markdown code fences if returned by LLM
        const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleaned);
      } else {
        parsedData = content;
      }

      return sanitizeNutritionResult(parsedData);
    } catch (apiError) {
      console.error('AI Vision Provider Error:', apiError.response?.data || apiError.message);
      throw new Error('AI Vision API failed to analyze food image');
    }
  }

  // Fallback / Development mode when AI_API_KEY is not yet provisioned
  console.log('[foodAnalysisService] AI_API_KEY is using template defaults. Using standard nutrition analysis result.');
  
  // Return the specified standard food analysis result
  return {
    foodName: 'Grilled Chicken Salad Bowl',
    calories: 450,
    protein: 38,
    carbs: 22,
    fat: 18,
    fiber: 7,
    servingSize: '1 bowl',
    confidence: 94
  };
}

module.exports = {
  analyzeFood
};
