const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const regretRequestController = require('../controllers/regretRequestController');
const { adminAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

const router = express.Router();

// El formulario es publico y sin captcha, asi que se limita por IP para que
// no sirva de vector de spam ni de envio masivo de mails.
const regretLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: { message: 'Demasiadas solicitudes. Probá de nuevo en una hora.' },
  standardHeaders: true,
  legacyHeaders: false
});

const createValidation = [
  body('customerName').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('customerEmail').trim().isEmail().withMessage('El email no es valido').normalizeEmail(),
  body('customerPhone').optional().trim().isString(),
  body('customerDocument').optional().trim().isString(),
  body('orderNumber').optional().trim().isString(),
  body('reason').optional().trim().isString()
];

const updateValidation = [
  body('status').optional().isIn(['pending', 'processing', 'resolved', 'rejected'])
    .withMessage('Estado invalido'),
  body('adminNotes').optional().isString()
];

// Ruta publica: la ley exige que cualquiera pueda iniciar el tramite.
router.post('/', regretLimiter, createValidation, regretRequestController.createRegretRequest);

// Administracion
router.get('/', adminAuth, requirePermission('orders.read'), regretRequestController.getRegretRequests);
router.put('/:id', adminAuth, requirePermission('orders.update'), updateValidation, regretRequestController.updateRegretRequest);

module.exports = router;
