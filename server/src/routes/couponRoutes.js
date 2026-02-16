const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  applyCoupon,
  getPublicCoupons,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponStats
} = require('../controllers/couponController');
const { auth, adminAuth } = require('../middleware/auth');

// Rutas públicas
router.get('/public', getPublicCoupons);

// Rutas autenticadas (usuarios)
router.post('/validate', auth, validateCoupon);
router.post('/apply', auth, applyCoupon);

// Rutas de administración
router.get('/', adminAuth, getAllCoupons);
router.get('/:id', adminAuth, getCouponById);
router.post('/', adminAuth, createCoupon);
router.put('/:id', adminAuth, updateCoupon);
router.delete('/:id', adminAuth, deleteCoupon);
router.patch('/:id/toggle', adminAuth, toggleCouponStatus);
router.get('/:id/stats', adminAuth, getCouponStats);

module.exports = router;
