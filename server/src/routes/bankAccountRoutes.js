const express = require('express');
const { body } = require('express-validator');
const bankAccountController = require('../controllers/bankAccountController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const bankAccountValidation = [
  body('bankName').notEmpty().withMessage('Bank name is required'),
  body('accountType').isIn(['Cuenta Corriente', 'Caja de Ahorro']).withMessage('Invalid account type'),
  body('accountNumber').notEmpty().withMessage('Account number is required'),
  body('cbu').isLength({ min: 22, max: 22 }).withMessage('CBU must be 22 characters'),
  body('holderName').notEmpty().withMessage('Holder name is required'),
  body('holderDocument').notEmpty().withMessage('Holder document is required'),
  body('alias').optional().isString(),
  body('isActive').optional().isBoolean(),
  body('isPrimary').optional().isBoolean()
];

// Public route - Get active bank account for transfers
router.get('/active', auth, bankAccountController.getActiveBankAccount);

// Admin routes
router.get('/', adminAuth, bankAccountController.getAllBankAccounts);
router.post('/', adminAuth, bankAccountValidation, bankAccountController.createBankAccount);
router.put('/:id', adminAuth, bankAccountValidation, bankAccountController.updateBankAccount);
router.patch('/:id/set-primary', adminAuth, bankAccountController.setPrimaryBankAccount);
router.delete('/:id', adminAuth, bankAccountController.deleteBankAccount);

module.exports = router;
