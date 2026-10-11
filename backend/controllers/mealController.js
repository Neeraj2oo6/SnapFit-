const {
  saveMealToDB,
  getMealsFromDB,
  getMealByIdFromDB,
  updateMealInDB,
  deleteMealFromDB
} = require('../config/db');

/**
 * POST /api/meals
 * Creates a new meal record. Handles both JSON body and multipart image upload.
 */
async function createMeal(req, res) {
  try {
    const userId = req.user?.id || 1;
    const body = req.body || {};

    let imageUrl = body.image || body.image_url || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const mealData = {
      name: body.foodName || body.name || 'Logged Meal',
      type: body.mealType || body.type || 'Breakfast',
      calories: Number(body.calories) || 0,
      protein: Number(body.protein) || 0,
      carbs: Number(body.carbs) || 0,
      fat: Number(body.fat) || 0,
      fiber: Number(body.fiber) || 0,
      quantity: Number(body.quantity) || 1,
      serving_size: body.servingSize || body.serving_size || '1 serving',
      image_url: imageUrl,
      meal_date: body.date || new Date().toISOString().split('T')[0],
      meal_time: body.time || new Date().toTimeString().split(' ')[0]
    };

    const savedMeal = await saveMealToDB(mealData, userId);

    res.status(201).json({
      success: true,
      message: `Successfully logged ${savedMeal.name}`,
      meal: savedMeal
    });
  } catch (error) {
    console.error('Error creating meal:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/meals
 * Retrieves all meals for the user. Supports query params: type, date.
 */
async function getMeals(req, res) {
  try {
    const userId = req.user?.id || 1;
    const { type, date } = req.query;

    const meals = await getMealsFromDB(userId, { type, date });

    // Calculate daily totals
    const totals = meals.reduce(
      (acc, m) => {
        acc.calories += Number(m.calories) || 0;
        acc.protein += Number(m.protein) || 0;
        acc.carbs += Number(m.carbs) || 0;
        acc.fat += Number(m.fat) || 0;
        acc.fiber += Number(m.fiber) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    res.json({
      success: true,
      count: meals.length,
      totals,
      meals
    });
  } catch (error) {
    console.error('Error fetching meals:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/meals/:id
 * Retrieves a single meal by ID.
 */
async function getMealById(req, res) {
  try {
    const { id } = req.params;
    const meal = await getMealByIdFromDB(id);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.json({ success: true, meal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PUT /api/meals/:id
 * Updates an existing meal.
 */
async function updateMeal(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await updateMealInDB(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Meal not found or not updated' });
    }
    res.json({
      success: true,
      message: 'Meal updated successfully',
      meal: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * DELETE /api/meals/:id
 * Deletes a meal.
 */
async function deleteMeal(req, res) {
  try {
    const { id } = req.params;
    const success = await deleteMealFromDB(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Meal not found or already deleted' });
    }
    res.json({
      success: true,
      message: 'Meal removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal
};
