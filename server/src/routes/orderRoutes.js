const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');
const uploadPaymentProof = require('../middleware/uploadPaymentProof');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  // Solo validar campos de dirección si el método de envío lo requiere
  body('shippingAddress.street').custom((value, { req }) => {
    const method = req.body.shippingMethod;
    // Si el método no requiere dirección o es pickup/agreement, permitir vacío
    if (method && (method.type === 'pickup' || method.type === 'agreement' || method.requiresAddress === false)) {
      return true;
    }
    // Si requiere dirección, validar que no esté vacío
    if (!value || value.trim() === '') {
      throw new Error('Street address is required');
    }
    return true;
  }),
  body('shippingAddress.city').custom((value, { req }) => {
    const method = req.body.shippingMethod;
    if (method && (method.type === 'pickup' || method.type === 'agreement' || method.requiresAddress === false)) {
      return true;
    }
    if (!value || value.trim() === '') {
      throw new Error('City is required');
    }
    return true;
  }),
  body('shippingAddress.state').custom((value, { req }) => {
    const method = req.body.shippingMethod;
    if (method && (method.type === 'pickup' || method.type === 'agreement' || method.requiresAddress === false)) {
      return true;
    }
    if (!value || value.trim() === '') {
      throw new Error('State is required');
    }
    return true;
  }),
  body('shippingAddress.postalCode').custom((value, { req }) => {
    const method = req.body.shippingMethod;
    if (method && (method.type === 'pickup' || method.type === 'agreement' || method.requiresAddress === false)) {
      return true;
    }
    if (!value || value.trim() === '') {
      throw new Error('Postal code is required');
    }
    return true;
  }),
  body('shippingAddress.country').custom((value, { req }) => {
    const method = req.body.shippingMethod;
    if (method && (method.type === 'pickup' || method.type === 'agreement' || method.requiresAddress === false)) {
      return true;
    }
    if (!value || value.trim() === '') {
      throw new Error('Country is required');
    }
    return true;
  }),
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

// Admin routes (specific routes before parameterized ones)
router.get('/shipping/pending', adminAuth, orderController.getOrdersPendingShipping);
router.get('/', adminAuth, orderController.getAllOrders);

// User routes
router.get('/my-orders', auth, orderController.getUserOrders);
router.post('/', optionalAuth, createOrderValidation, orderController.createOrder);

// Routes with :id parameter (must come after specific routes)
router.get('/:id', auth, orderController.getOrder);
router.patch('/:id/cancel', auth, orderController.cancelOrder);
router.post('/:id/payment-proof', auth, uploadPaymentProof.single('proof'), orderController.uploadPaymentProof);
router.patch('/:id/status', adminAuth, updateOrderStatusValidation, orderController.updateOrderStatus);
router.patch('/:id/shipping-address', adminAuth, orderController.updateShippingAddress);

module.exports = router;