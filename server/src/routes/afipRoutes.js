const express = require('express');
const router = express.Router();
const afipController = require('../controllers/afipController');
const { adminAuth } = require('../middleware/auth');

// Todas las rutas requieren autenticación de administrador
router.use(adminAuth);

// Test de conexión con AFIP
router.get('/test-connection', afipController.testConnection);

// Configuración de credenciales
router.get('/credentials', afipController.getActiveCredential);
router.post('/credentials', afipController.saveCredential);

// Operaciones con CAE
router.post('/invoices/:invoiceId/request-cae', afipController.requestCAE);
router.get('/invoices/:invoiceId/cae', afipController.getCAE);
router.post('/invoices/:invoiceId/retry-cae', afipController.retryCAE);

// Consultas
router.get('/last-invoice-number', afipController.getLastInvoiceNumber);
router.post('/validate-cuit', afipController.validateCUIT);

// Estadísticas
router.get('/stats', afipController.getAfipStats);

// Facturas pendientes
router.get('/pending-invoices', afipController.getPendingInvoices);
router.post('/process-pending', afipController.processPendingInvoices);

module.exports = router;
