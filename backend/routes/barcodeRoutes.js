const express = require('express');
const router = express.Router();
const barcodeController = require('../controllers/barcodeController');

/**
 * Route: POST /api/barcode & POST /api/barcode/scan
 * Accepts: { barcode: "890123456789", type: "Snack" }
 */
router.post('/', barcodeController.scanBarcode);
router.post('/scan', barcodeController.scanBarcode);
router.get('/:code', barcodeController.scanBarcode);

module.exports = router;
