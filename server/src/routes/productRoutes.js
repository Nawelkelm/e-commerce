const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const stockController = require('../controllers/stockController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),
  body('categoryId').isUUID().withMessage('Valid category ID is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('salePrice').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number')
];

const stockValidation = [
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

const barcodeValidation = [
  body('barcode').trim().notEmpty().withMessage('Barcode is required'),
  body('type').isIn(['EAN13', 'UPC', 'CODE128', 'CODE39', 'QR', 'ISBN', 'GTIN']).withMessage('Invalid barcode type'),
  body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean')
];

const batchValidation = [
  body('batchNumber').trim().notEmpty().withMessage('Batch number is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('manufacturingDate').optional().isISO8601().withMessage('Invalid manufacturing date'),
  body('expirationDate').optional().isISO8601().withMessage('Invalid expiration date')
];

// Public routes
router.get('/', productController.getProducts);
router.get('/search/suggestions', productController.searchSuggestions);
router.get('/search/filters', productController.getFilterOptions);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:slug', productController.getProductBySlug);

// Admin routes
router.post('/', adminAuth, productController.upload.array('images', 10), productValidation, productController.createProduct);
router.put('/:id', adminAuth, productController.upload.array('images', 10), productValidation, productController.updateProduct);
router.delete('/:id', adminAuth, productController.deleteProduct);
router.patch('/:id/stock', adminAuth, stockValidation, productController.updateStock);

// Excel import/export routes
router.get('/excel/template', adminAuth, productController.downloadTemplate);
router.get('/excel/export', adminAuth, productController.exportToExcel);
router.post('/excel/preview', adminAuth, productController.uploadExcel.single('file'), productController.previewImport);
router.post('/excel/import', adminAuth, productController.confirmImport);

// Stock management routes
router.get('/stock/low', adminAuth, productController.getLowStockProducts);

// Barcode routes (Admin only)
router.get('/:id/barcodes', adminAuth, stockController.getProductBarcodes);
router.post('/:id/barcodes', adminAuth, barcodeValidation, stockController.addBarcode);

// Batch routes (Admin only)
router.get('/:id/batches', adminAuth, stockController.getProductBatches);
router.post('/:id/batches', adminAuth, batchValidation, stockController.addBatch);
router.patch('/:id/batches/:batchId', adminAuth, stockController.updateBatchQuantity);

module.exports = router;