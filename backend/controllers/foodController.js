const fs = require('fs');
const foodAnalysisService = require('../services/foodAnalysisService');

/**
 * Controller to handle food image analysis.
 * POST /api/food/analyze
 */
const analyzeFood = async (req, res) => {
  const uploadedFile = req.file;

  // 1. Check uploaded image
  if (!uploadedFile) {
    return res.status(400).json({
      success: false,
      message: 'Food image is required'
    });
  }

  try {
    // 2. Validate image path exists
    if (!uploadedFile.path || !fs.existsSync(uploadedFile.path)) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file is invalid or missing'
      });
    }

    // 3. Send image to foodAnalysisService & 4. Receive nutrition result
    const nutritionData = await foodAnalysisService.analyzeFood(uploadedFile);

    // 5. Return JSON response
    return res.status(200).json({
      success: true,
      message: 'Food analyzed successfully',
      data: nutritionData
    });
  } catch (error) {
    console.error('Error analyzing food image:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to analyze food image'
    });
  } finally {
    // 6. Delete temporary uploaded image after processing
    if (uploadedFile && uploadedFile.path) {
      fs.unlink(uploadedFile.path, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Failed to remove temp upload file:', err.message);
        }
      });
    }
  }
};

module.exports = {
  analyzeFood
};
