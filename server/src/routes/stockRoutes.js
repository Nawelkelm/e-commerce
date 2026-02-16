const express = require('express');
const { body } = require('express-validator');
const stockController = require('../controllers/stockController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const adjustStockValidation = [
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('reason').optional().isString().withMessage('Reason must be a string')
];

const barcodeValidation = [
  body('barcode').notEmpty().withMessage('Barcode is required'),
  body('barcodeType').optional().isIn(['EAN13', 'EAN8', 'UPC', 'CODE128', 'QR', 'CODE39', 'ITF14'])
    .withMessage('Invalid barcode type')
];

const batchValidation = [
  body('batchNumber').notEmpty().withMessage('Batch number is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('manufactureDate').optional().isDate().withMessage('Invalid manufacture date'),
  body('expirationDate').optional().isDate().withMessage('Invalid expiration date'),
  body('purchaseCost').optional().isFloat({ min: 0 }).withMessage('Purchase cost must be a positive number')
];

const locationValidation = [
  body('locationCode').notEmpty().withMessage('Location code is required'),
  body('locationName').notEmpty().withMessage('Location name is required'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
];

// Stock movement routes (Admin only)
router.get('/history', adminAuth, stockController.getStockHistory);
router.get('/history/export', adminAuth, stockController.exportStockHistory);
router.get('/history/:id/summary', adminAuth, stockController.getStockSummary);
router.post('/products/:id/adjust', adminAuth, adjustStockValidation, stockController.adjustStock);
router.get('/products/:id/available', adminAuth, stockController.getAvailableStock);

// Stock alerts routes (Admin only)
router.get('/alerts', adminAuth, stockController.getStockAlerts);
router.patch('/alerts/:id/resolve', adminAuth, stockController.resolveAlert);

// Stock locations routes (Admin only)
router.get('/products/:id/locations', adminAuth, stockController.getStockLocations);
router.post('/products/:id/locations', adminAuth, locationValidation, stockController.updateStockLocation);
router.put('/products/:id/locations/:locationId', adminAuth, locationValidation, stockController.updateStockLocation);

// Barcode search route (Admin only) - mantener solo búsqueda global
router.get('/barcodes/:barcode/search', adminAuth, stockController.searchByBarcode);

module.exports = router;
