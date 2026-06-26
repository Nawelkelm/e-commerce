const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const categoryController = require('../controllers/categoryController');
const roleController = require('../controllers/roleController');
const settingController = require('../controllers/settingController');
const { requirePermission } = require('../middleware/permissions');
const uploadLogo = require('../middleware/uploadLogo');

// User validation rules
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

// Role validation rules
const createRoleValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Role name must be at least 2 characters'),
  body('displayName').trim().isLength({ min: 2 }).withMessage('Display name must be at least 2 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array')
];

const updateRoleValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Role name must be at least 2 characters'),
  body('displayName').optional().trim().isLength({ min: 2 }).withMessage('Display name must be at least 2 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array')
];

const createPermissionValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Permission name must be at least 2 characters'),
  body('resource').trim().isLength({ min: 2 }).withMessage('Resource must be specified'),
  body('action').trim().isLength({ min: 2 }).withMessage('Action must be specified'),
  body('displayName').trim().isLength({ min: 2 }).withMessage('Display name must be at least 2 characters'),
  body('category').trim().isLength({ min: 2 }).withMessage('Category must be specified')
];

// Dashboard stats
router.get('/dashboard/stats', adminAuth, userController.getDashboardStats);

// User management
router.get('/users', adminAuth, requirePermission('users.read'), userController.getUsers);
router.get('/users/:id', adminAuth, requirePermission('users.read'), userController.getUser);
router.post('/users', adminAuth, requirePermission('users.create'), createUserValidation, userController.createUser);
router.put('/users/:id', adminAuth, requirePermission('users.update'), updateUserValidation, userController.updateUser);
router.delete('/users/:id', adminAuth, requirePermission('users.delete'), userController.deleteUser);

// Product management
router.get('/products', adminAuth, requirePermission('products.read'), productController.getProducts);
router.get('/products/:id', adminAuth, requirePermission('products.read'), productController.getProductBySlug);
router.post('/products', adminAuth, requirePermission('products.create'), productController.upload.array('images', 10), productController.createProduct);
router.put('/products/:id', adminAuth, requirePermission('products.update'), productController.upload.array('images', 10), productController.updateProduct);
router.delete('/products/:id', adminAuth, requirePermission('products.delete'), productController.deleteProduct);
router.patch('/products/:id/stock', adminAuth, requirePermission('products.stock'), productController.updateStock);

// Category management
router.get('/categories', adminAuth, requirePermission('categories.read'), categoryController.getCategories);
router.get('/categories/:id', adminAuth, requirePermission('categories.read'), categoryController.getCategoryBySlug);
router.post('/categories', adminAuth, requirePermission('categories.create'), categoryController.createCategory);
router.put('/categories/:id', adminAuth, requirePermission('categories.update'), categoryController.updateCategory);
router.delete('/categories/:id', adminAuth, requirePermission('categories.delete'), categoryController.deleteCategory);

// Order management
router.get('/orders', adminAuth, orderController.getAllOrders);
router.get('/orders/:id', adminAuth, orderController.getOrder);
router.patch('/orders/:id/status', adminAuth, orderController.updateOrderStatus);
router.patch('/orders/:id/approve-payment', adminAuth, orderController.approvePayment);
router.patch('/orders/:id/reject-payment', adminAuth, orderController.rejectPayment);

// Analytics
const analyticsController = require('../controllers/analyticsController');
router.get('/analytics/sales', adminAuth, requirePermission('analytics.read'), analyticsController.getSalesAnalytics);
router.get('/inventory/alerts', adminAuth, requirePermission('products.read'), analyticsController.getInventoryAlerts);

// Role and Permission Management
router.get('/roles', adminAuth, requirePermission('roles.read'), roleController.getRoles);
router.get('/roles/:id', adminAuth, requirePermission('roles.read'), roleController.getRole);
router.post('/roles', adminAuth, requirePermission('roles.create'), createRoleValidation, roleController.createRole);
router.put('/roles/:id', adminAuth, requirePermission('roles.update'), updateRoleValidation, roleController.updateRole);
router.delete('/roles/:id', adminAuth, requirePermission('roles.delete'), roleController.deleteRole);

// Permission Management
router.get('/permissions', adminAuth, requirePermission('roles.read'), roleController.getPermissions);
router.post('/permissions', adminAuth, requirePermission('roles.create'), createPermissionValidation, roleController.createPermission);

// User Role Assignment
router.post('/users/assign-role', adminAuth, requirePermission('roles.assign'), roleController.assignUserRole);
router.get('/users/:userId/permissions', adminAuth, requirePermission('users.read'), roleController.getUserPermissions);

// Settings Management
router.get('/settings', adminAuth, settingController.getSettings);
router.get('/settings/:key', adminAuth, settingController.getSetting);
router.put('/settings/:key', adminAuth, settingController.updateSetting);
router.post('/settings/upload-logo', adminAuth, uploadLogo.single('logo'), settingController.uploadLogo);
router.post('/settings/upload-favicon', adminAuth, uploadLogo.single('favicon'), settingController.uploadFavicon);

module.exports = router;