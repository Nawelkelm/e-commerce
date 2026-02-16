const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const updateUserValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

// All routes require admin authentication
router.get('/', adminAuth, userController.getUsers);
router.get('/dashboard-stats', adminAuth, userController.getDashboardStats);
router.get('/:id', adminAuth, userController.getUser);
router.post('/', adminAuth, createUserValidation, userController.createUser);
router.put('/:id', adminAuth, updateUserValidation, userController.updateUser);
router.delete('/:id', adminAuth, userController.deleteUser);

module.exports = router;