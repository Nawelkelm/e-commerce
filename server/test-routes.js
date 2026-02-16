const express = require('express');
const router = express.Router();
const controller = require('./src/controllers/homeSettingsController');
const middleware = require('./src/middleware/auth');

console.log('Controller exports:', Object.keys(controller));
console.log('Middleware exports:', Object.keys(middleware));
console.log('auth type:', typeof middleware.auth);
console.log('isAdmin type:', typeof middleware.isAdmin);
console.log('updateHomeSettings type:', typeof controller.updateHomeSettings);

try {
  router.put('/', middleware.auth, middleware.isAdmin, controller.updateHomeSettings);
  console.log('SUCCESS: Route registered!');
} catch (e) {
  console.error('ERROR:', e.message);
}
