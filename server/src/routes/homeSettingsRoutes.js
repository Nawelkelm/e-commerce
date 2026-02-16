const express = require('express');
const multer = require('multer');
const homeSettingsController = require('../controllers/homeSettingsController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

router.get('/', homeSettingsController.getHomeSettings);
router.put('/', auth, adminAuth, homeSettingsController.updateHomeSettings);
router.post('/carousel/upload', auth, adminAuth, upload.single('image'), homeSettingsController.uploadCarouselImage);
router.delete('/carousel/image', auth, adminAuth, homeSettingsController.deleteCarouselImage);

module.exports = router;