const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createPaymentValidation = [
  body('orderId').isUUID().withMessage('Valid order ID is required')
];

const refundValidation = [
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('reason').optional().isString().withMessage('Reason must be a string')
];

// Optional auth middleware for guest payments
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next();
  }
  
  auth(req, res, (err) => {
    next();
  });
};

// Routes
router.post('/create', optionalAuth, createPaymentValidation, paymentController.createPayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/status/:orderId', optionalAuth, paymentController.getPaymentStatus);

// Admin routes
router.post('/refund/:orderId', adminAuth, refundValidation, paymentController.processRefund);

module.exports = router;