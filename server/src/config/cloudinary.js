const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const logger = require('./logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
  }
});

// Storage for logo/favicon
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
  }
});

// Storage for carousel images
const carouselStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce/carousel',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1920, height: 600, crop: 'fill', gravity: 'center', quality: 85, format: 'webp' }]
  }
});

// Storage for payment proofs
const paymentProofStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce/payment-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});

/**
 * Delete an image from Cloudinary by its URL
 * @param {string} imageUrl - The full Cloudinary URL or public_id
 * @returns {Promise<object>} Cloudinary deletion result
 */
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return null;
    
    // If it's an old local URL (starts with /uploads/), skip deletion
    if (imageUrl.startsWith('/uploads/')) {
      logger.warn('Skipping deletion of local file URL:', imageUrl);
      return null;
    }

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v1234/folder/filename.ext
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) {
      logger.warn('Could not extract public_id from URL:', imageUrl);
      return null;
    }
    
    // Get everything after 'upload/vXXXX/' and remove extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    logger.info(`Deleting Cloudinary image: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error('Error deleting Cloudinary image:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  productStorage,
  logoStorage,
  carouselStorage,
  paymentProofStorage,
  deleteImage
};
