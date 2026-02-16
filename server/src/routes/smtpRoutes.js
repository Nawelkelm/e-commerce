const express = require('express');
const router = express.Router();
const smtpController = require('../controllers/smtpController');
const { adminAuth } = require('../middleware/auth');

// All routes require admin authentication
router.use(adminAuth);

// Get SMTP settings
router.get('/settings', smtpController.getSettings);

// Update SMTP settings
router.put('/settings', smtpController.updateSettings);

// Test SMTP connection
router.post('/test', smtpController.testConnection);

// Get provider presets
router.get('/presets', smtpController.getProviderPresets);

module.exports = router;
