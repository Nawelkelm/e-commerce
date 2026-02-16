const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getAllShippingMethods,
  getShippingQuote,
  adminGetAllMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  toggleMethodActive
} = require('../controllers/shippingMethodController');

// Public routes (for customers in checkout)
router.get('/public', getAllShippingMethods);
router.post('/quote', getShippingQuote);

// Admin routes
router.get('/', adminAuth, adminGetAllMethods);
router.post('/', adminAuth, createShippingMethod);
router.put('/:id', adminAuth, updateShippingMethod);
router.delete('/:id', adminAuth, deleteShippingMethod);
router.patch('/:id/toggle', adminAuth, toggleMethodActive);

module.exports = router;
