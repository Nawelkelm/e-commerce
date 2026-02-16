const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { auth, adminAuth } = require('../middleware/auth');

// Admin routes for email templates
router.get('/templates', adminAuth, emailController.getAllTemplates);
router.get('/templates/:id', adminAuth, emailController.getTemplateById);
router.post('/templates', adminAuth, emailController.createTemplate);
router.put('/templates/:id', adminAuth, emailController.updateTemplate);
router.delete('/templates/:id', adminAuth, emailController.deleteTemplate);
router.patch('/templates/:id/toggle', adminAuth, emailController.toggleTemplateStatus);

// Send test email
router.post('/test', adminAuth, emailController.sendTestEmail);

// Email logs and stats
router.get('/logs', adminAuth, emailController.getEmailLogs);
router.get('/stats', adminAuth, emailController.getEmailStats);

module.exports = router;
