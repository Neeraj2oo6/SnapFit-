const barcodeService = require('../services/barcodeService');
const db = require('../config/db');

/**
 * Controller to handle Barcode scanning, product details lookup, and AI nutrition analysis.
 * POST /api/barcode/scan
 */
const scanBarcode = async (req, res) => {
  const barcode = req.body?.barcode || req.query?.barcode || req.params?.code;
  const mealType = req.body?.type || 'Snack';
  const shouldSave = req.body?.saveToDb !== false; // defaults to true

  if (!barcode || typeof barcode !== 'string' || !barcode.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Barcode is required'
    });
  }

  try {
    // 1. Fetch product details and run AI nutrition analysis
    const productData = await barcodeService.lookupAndAnalyze(barcode.trim());

    let savedMeal = null;

    // 2. Persist to MySQL database (meals table)
    if (shouldSave && productData) {
      savedMeal = await db.saveMealToDB({
        name: `${productData.brand} - ${productData.name}`,
        type: mealType,
        calories: productData.calories,
        protein: productData.protein,
        carbs: productData.carbs,
        fat: productData.fat,
        fiber: productData.fiber
      });
    }

    // 3. Return full product details + nutrition analysis
    return res.status(200).json({
      success: true,
      message: 'Product identified and analyzed successfully',
      data: productData,
      savedMeal
    });
  } catch (error) {
    console.error('Barcode scan controller error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to analyze barcode product'
    });
  }
};

module.exports = {
  scanBarcode
};
