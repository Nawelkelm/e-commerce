const multer = require('multer');
const path = require('path');
const fsSync = require('fs');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

// ═══════════════════════════════════════════════════════════════
// Auto-detect storage mode: Cloudinary (cloud) vs Local (disk)
// If CLOUDINARY_CLOUD_NAME is set → use Cloudinary
// Otherwise → use local disk storage (for self-hosted servers)
// ═══════════════════════════════════════════════════════════════
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let cloudinary = null;
let CloudinaryStorage = null;

if (useCloudinary) {
  cloudinary = require('cloudinary').v2;
  ({ CloudinaryStorage } = require('multer-storage-cloudinary'));

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  logger.info('📦 Image storage: Cloudinary (cloud)');
} else {
  logger.info('📦 Image storage: Local disk');
}

// ─── Helper: ensure local directory exists ───
const ensureDir = (dir) => {
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true });
  }
};

// ─── Build storage for each upload type ───
const buildStorage = (folder, prefix) => {
  if (useCloudinary) {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `ecommerce/${folder}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        transformation: folder === 'products'
          ? [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
          : folder === 'logos'
            ? [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
            : undefined
      }
    });
  }

  // Local disk storage
  const uploadDir = path.join(__dirname, `../../uploads/${folder}`);
  ensureDir(uploadDir);

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${prefix}-${uuidv4()}${ext}`);
    }
  });
};

// Storages
const productStorage = buildStorage('products', 'product');
const logoStorage = buildStorage('logos', 'logo');
const paymentProofStorage = (() => {
  if (useCloudinary) {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'ecommerce/payment-proofs',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        resource_type: 'auto'
      }
    });
  }
  const uploadDir = path.join(__dirname, '../../uploads/payment-proofs');
  ensureDir(uploadDir);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const orderId = req.params.id || 'unknown';
      const ext = path.extname(file.originalname);
      cb(null, `proof-${orderId}-${Date.now()}${ext}`);
    }
  });
})();

// ─── Unified helpers ───

/**
 * Get the URL from an uploaded file (works for both Cloudinary and local)
 * Cloudinary: req.file.path is already the full https URL
 * Local: we build /uploads/folder/filename
 */
const getFileUrl = (file, folder) => {
  if (!file) return null;
  // Cloudinary puts the full URL in file.path
  if (file.path && file.path.startsWith('http')) {
    return file.path;
  }
  // Local: build relative URL
  return `/uploads/${folder}/${file.filename}`;
};

/**
 * Upload a buffer to Cloudinary (for carousel with sharp/stream processing)
 * Falls back to local disk when Cloudinary is not configured
 */
const uploadBuffer = async (buffer, folder, filenameHint) => {
  if (useCloudinary) {
    const streamifier = require('streamifier');
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `ecommerce/${folder}`,
          transformation: folder === 'carousel'
            ? [{ width: 1920, height: 600, crop: 'fill', gravity: 'center', quality: 85, format: 'webp' }]
            : undefined
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
    return result.secure_url;
  }

  // Local: process and write buffer to disk
  const uploadDir = path.join(__dirname, `../../uploads/${folder}`);
  ensureDir(uploadDir);
  const filename = filenameHint || `${folder}-${Date.now()}.webp`;
  const filepath = path.join(uploadDir, filename);

  // For carousel images, resize with sharp if available
  if (folder === 'carousel') {
    try {
      const sharp = require('sharp');
      await sharp(buffer)
        .resize(1920, 600, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toFile(filepath);
    } catch (err) {
      // sharp not available, save raw buffer
      await fs.writeFile(filepath, buffer);
    }
  } else {
    await fs.writeFile(filepath, buffer);
  }

  return `/uploads/${folder}/${filename}`;
};

/**
 * Delete an image (Cloudinary or local file)
 */
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return null;

    // ── Local file ──
    if (imageUrl.startsWith('/uploads/')) {
      if (!useCloudinary) {
        const filepath = path.join(__dirname, '../../', imageUrl);
        try {
          await fs.unlink(filepath);
          logger.info(`Deleted local file: ${filepath}`);
        } catch (err) {
          logger.warn('File not found for deletion:', imageUrl);
        }
      }
      return null;
    }

    // ── Cloudinary ──
    if (!useCloudinary || !cloudinary) return null;

    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) {
      logger.warn('Could not extract public_id from URL:', imageUrl);
      return null;
    }
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');

    logger.info(`Deleting Cloudinary image: ${publicId}`);
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Error deleting image:', error);
    return null;
  }
};

module.exports = {
  useCloudinary,
  cloudinary,
  productStorage,
  logoStorage,
  paymentProofStorage,
  getFileUrl,
  uploadBuffer,
  deleteImage
};
