const express = require('express');
const router = express.Router();
const { adminAuth, auth } = require('../middleware/auth');
const {
  getAllShipments,
  getShipmentById,
  getShipmentByTracking,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  addTrackingEvent,
  getShipmentStats,
  syncShipmentTracking,
  syncAllShipments,
  getShippingQuote,
  getAllShippingQuotes,
  getAvailableCarriers
} = require('../controllers/shipmentController');

// Public routes
router.get('/track/:trackingNumber', getShipmentByTracking);

// Logistics integration routes
router.get('/carriers/available', adminAuth, getAvailableCarriers);
router.post('/quote/:carrier', adminAuth, getShippingQuote);
router.post('/quotes/all', adminAuth, getAllShippingQuotes);

// Admin routes
router.get('/', adminAuth, getAllShipments);
router.get('/stats', adminAuth, getShipmentStats);
router.post('/sync/all', adminAuth, syncAllShipments);
router.post('/:id/sync', adminAuth, syncShipmentTracking);
router.get('/:id', adminAuth, getShipmentById);
router.post('/', adminAuth, createShipment);
router.put('/:id', adminAuth, updateShipment);
router.patch('/:id/status', adminAuth, updateShipmentStatus);
router.post('/:id/tracking', adminAuth, addTrackingEvent);

module.exports = router;
