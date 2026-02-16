const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { auth, adminAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter para creación de facturas
const invoiceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 facturas por 15 minutos
  message: 'Demasiadas solicitudes de factura, intenta de nuevo más tarde'
});

// Rutas de administración (deben ir primero para evitar conflictos)
router.get('/stats/summary', adminAuth, invoiceController.getInvoiceStats);
router.get('/all', adminAuth, invoiceController.getAllInvoices);
router.post('/order/:orderId', adminAuth, invoiceLimiter, invoiceController.createInvoiceFromOrder);
router.post('/manual', adminAuth, invoiceLimiter, invoiceController.createManualInvoice);
router.put('/:id/cancel', adminAuth, invoiceController.cancelInvoice);
router.put('/:id/regenerate-pdf', adminAuth, invoiceController.regenerateInvoicePDF);

// Rutas públicas (requieren autenticación)
router.get('/my-invoices', auth, invoiceController.getUserInvoices);
router.get('/number/:invoiceNumber', auth, invoiceController.getInvoiceByNumber);
router.get('/:id', auth, invoiceController.getInvoiceById);
router.get('/:id/pdf', auth, invoiceController.downloadInvoicePDF);
router.get('/:id/view-pdf', auth, invoiceController.viewInvoicePDF);
router.post('/:id/email', auth, invoiceController.emailInvoice);

module.exports = router;
