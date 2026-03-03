const multer = require('multer');
const { paymentProofStorage } = require('../config/cloudinary');

// Filtro de archivos (solo imágenes y PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPG, PNG o PDF'));
  }
};

// Configuración de multer
const upload = multer({
  storage: paymentProofStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Máximo 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
