const multer = require('multer');
const { logoStorage } = require('../config/cloudinary');

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, SVG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: logoStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

module.exports = upload;
