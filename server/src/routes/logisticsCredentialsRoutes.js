const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getAllCredentials,
  getCredentialsByCarrier,
  saveCredentials,
  toggleActive,
  testCredentials,
  deleteCredentials
} = require('../controllers/logisticsCredentialsController');

// Todas las rutas requieren autenticación de administrador
router.use(adminAuth);

// Get all credentials
router.get('/', getAllCredentials);

// Get credentials by carrier
router.get('/:carrier', getCredentialsByCarrier);

// Create or update credentials
router.post('/', saveCredentials);

// Toggle active status
router.patch('/:carrier/toggle', toggleActive);

// Test credentials connection
router.post('/:carrier/test', testCredentials);

// Delete credentials
router.delete('/:carrier', deleteCredentials);

module.exports = router;
