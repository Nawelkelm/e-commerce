const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
];

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin routes
router.post('/', adminAuth, categoryValidation, categoryController.createCategory);
router.put('/:id', adminAuth, categoryValidation, categoryController.updateCategory);
router.delete('/:id', adminAuth, categoryController.deleteCategory);

module.exports = router;