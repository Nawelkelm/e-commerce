const express = require('express');
const { body } = require('express-validator');
const contentPageController = require('../controllers/contentPageController');
const { adminAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

const router = express.Router();

const pageValidation = [
  body('slug')
    .trim()
    .notEmpty().withMessage('El slug es obligatorio')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('El slug solo admite minusculas, numeros y guiones'),
  body('title').trim().notEmpty().withMessage('El titulo es obligatorio'),
  body('content').optional().isString(),
  body('excerpt').optional().isString(),
  body('metaTitle').optional().isString(),
  body('metaDescription').optional().isString(),
  body('isPublished').optional().isBoolean(),
  body('sortOrder').optional().isInt()
];

// En la edicion el slug puede no venir (no se cambia), pero si viene debe ser valido.
const pageUpdateValidation = [
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('El slug solo admite minusculas, numeros y guiones'),
  body('title').optional().trim().notEmpty().withMessage('El titulo no puede quedar vacio'),
  body('content').optional().isString(),
  body('excerpt').optional().isString(),
  body('metaTitle').optional().isString(),
  body('metaDescription').optional().isString(),
  body('isPublished').optional().isBoolean(),
  body('sortOrder').optional().isInt()
];

// Rutas publicas
router.get('/', contentPageController.getPublishedPages);

// Rutas de administracion. Van antes de /:slug para que "admin" no se
// interprete como el slug de una pagina.
router.get('/admin/all', adminAuth, requirePermission('settings.read'), contentPageController.getAllPages);
router.get('/admin/:id', adminAuth, requirePermission('settings.read'), contentPageController.getPageById);
router.post('/admin', adminAuth, requirePermission('settings.update'), pageValidation, contentPageController.createPage);
router.put('/admin/:id', adminAuth, requirePermission('settings.update'), pageUpdateValidation, contentPageController.updatePage);
router.delete('/admin/:id', adminAuth, requirePermission('settings.update'), contentPageController.deletePage);

router.get('/:slug', contentPageController.getPageBySlug);

module.exports = router;
