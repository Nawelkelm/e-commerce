const express = require('express');
const router = express.Router();
const controller = require('./src/controllers/homeSettingsController');
const { auth, adminAuth } = require('./src/middleware/auth');

console.log('Testing with correct middleware name...');
try {
  router.put('/', auth, adminAuth, controller.updateHomeSettings);
  console.log('SUCCESS: Route registered with adminAuth!');
} catch (e) {
  console.error('ERROR:', e.message);
}
