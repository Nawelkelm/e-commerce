const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/uploadPaymentProof');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('billingAddress').optional().isObject().withMessage('Billing address must be an object'),
  body('customerNotes').optional().isString().withMessage('Customer notes must be a string')
];

const updateOrderStatusValidation = [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid order status'),
  body('trackingNumber').optional().isString().withMessage('Tracking number must be a string'),
  body('adminNotes').optional().isString().withMessage('Admin notes must be a string')
];

// Optional auth middleware for guest checkout
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next();
  }
  
  auth(req, res, (err) => {
    next();
  });
};

// User routes
router.get('/my-orders', auth, orderController.getUserOrders);
router.get('/:id', auth, orderController.getOrder);
router.post('/', optionalAuth, createOrderValidation, orderController.createOrder);
router.post('/:id/payment-proof', auth, upload.single('proof'), orderController.uploadPaymentProof);
router.patch('/:id/cancel', auth, orderController.cancelOrder);

// Admin routes
router.get('/', adminAuth, orderController.getAllOrders);
router.patch('/:id/status', adminAuth, updateOrderStatusValidation, orderController.updateOrderStatus);

module.exports = router;