// Test route to debug admin routes issue
const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { User } = require('../models');

// Simple routes without permissions
router.get('/test', (req, res) => {
  console.log('Test route called');
  res.json({ message: 'Admin routes are working', timestamp: new Date() });
});

router.get('/debug', adminAuth, (req, res) => {
  console.log('Debug route called');
  res.json({ 
    message: 'Debug endpoint working with auth',
    user: req.user ? req.user.email : 'No user',
    env: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

// Test simple users route without permissions
router.get('/simple-users', adminAuth, async (req, res) => {
  console.log('Simple users route called');
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({ users, message: 'Users retrieved successfully' });
  } catch (error) {
    console.error('Error in simple-users route:', error);
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
});

module.exports = router;