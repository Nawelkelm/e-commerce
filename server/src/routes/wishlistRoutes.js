const express = require('express');
const { body } = require('express-validator');
const wishlistController = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const addToWishlistValidation = [
  body('productId').isUUID().withMessage('ID de producto inválido')
];

const moveToCartValidation = [
  body('productIds').isArray({ min: 1 }).withMessage('Se requiere un array de IDs de productos'),
  body('productIds.*').isUUID().withMessage('ID de producto inválido')
];

// All routes require authentication
router.use(auth);

// Routes
router.get('/', wishlistController.getWishlist);
router.get('/count', wishlistController.getWishlistCount);
router.get('/check/:productId', wishlistController.isInWishlist);
router.post('/add', addToWishlistValidation, wishlistController.addToWishlist);
router.delete('/remove/:productId', wishlistController.removeFromWishlist);
router.delete('/clear', wishlistController.clearWishlist);
router.post('/move-to-cart', moveToCartValidation, wishlistController.moveToCart);

module.exports = router;
