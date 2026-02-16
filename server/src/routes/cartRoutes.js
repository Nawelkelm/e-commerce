const express = require('express');
const { body } = require('express-validator');
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body('productId').isUUID().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('attributes').optional().isObject().withMessage('Attributes must be an object')
];

const updateCartValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const mergeCartValidation = [
  body('guestSessionId').notEmpty().withMessage('Guest session ID is required')
];

// Optional auth middleware - allows both authenticated and guest users
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next();
  }
  
  // If token exists, verify it
  auth(req, res, (err) => {
    // Continue even if auth fails for cart operations
    next();
  });
};

// Routes
router.get('/', optionalAuth, cartController.getCart);
router.post('/add', optionalAuth, addToCartValidation, cartController.addToCart);
router.put('/item/:itemId', optionalAuth, updateCartValidation, cartController.updateCartItem);
router.delete('/item/:itemId', optionalAuth, cartController.removeFromCart);
router.delete('/clear', optionalAuth, cartController.clearCart);
router.post('/merge', auth, mergeCartValidation, cartController.mergeCart);

module.exports = router;