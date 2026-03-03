const { HomeSettings, Setting } = require('../models');
const logger = require('../config/logger');
const { cloudinary, deleteImage } = require('../config/cloudinary');
const streamifier = require('streamifier');

const HOME_SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

const getHomeSettings = async (req, res) => {
  try {
    let settings = await HomeSettings.findByPk(HOME_SETTINGS_ID);
    if (!settings) {
      settings = await HomeSettings.create({ id: HOME_SETTINGS_ID });
    }

    // Load custom sections from Settings table
    const customSectionsSetting = await Setting.findOne({ where: { key: 'home_sections' } });
    let customSections = [];
    
    if (customSectionsSetting && customSectionsSetting.value) {
      try {
        customSections = JSON.parse(customSectionsSetting.value);
      } catch (parseError) {
        logger.warn('Error parsing home_sections:', parseError);
      }
    }

    // Merge settings with custom sections
    const response = {
      ...settings.toJSON(),
      customSections
    };

    res.json(response);
  } catch (error) {
    logger.error('Get home settings error:', error);
    res.status(500).json({ message: 'Error al obtener configuracion del home' });
  }
};

const updateHomeSettings = async (req, res) => {
  try {
    const updateData = { ...req.body };
    let settings = await HomeSettings.findByPk(HOME_SETTINGS_ID);
    if (!settings) {
      settings = await HomeSettings.create({ id: HOME_SETTINGS_ID, ...updateData });
    } else {
      await settings.update(updateData);
    }
    logger.info('Home settings updated successfully');
    res.json({ message: 'Configuracion actualizada exitosamente', settings });
  } catch (error) {
    logger.error('Update home settings error:', error);
    res.status(500).json({ message: 'Error al actualizar configuracion', error: error.message });
  }
};

const uploadCarouselImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
    }
    
    // Upload to Cloudinary with transformations
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ecommerce/carousel',
          transformation: [
            { width: 1920, height: 600, crop: 'fill', gravity: 'center', quality: 85, format: 'webp' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const imageUrl = result.secure_url;
    logger.info('Carousel image uploaded to Cloudinary:', imageUrl);
    res.json({ message: 'Imagen subida exitosamente', url: imageUrl });
  } catch (error) {
    logger.error('Upload carousel image error:', error);
    res.status(500).json({ message: 'Error al subir imagen', error: error.message });
  }
};

const deleteCarouselImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'URL de imagen no proporcionada' });
    }
    
    // Delete from Cloudinary
    await deleteImage(imageUrl);
    logger.info('Carousel image deleted from Cloudinary:', imageUrl);
    
    res.json({ message: 'Imagen eliminada exitosamente' });
  } catch (error) {
    logger.error('Delete carousel image error:', error);
    res.status(500).json({ message: 'Error al eliminar imagen', error: error.message });
  }
};

module.exports = {
  getHomeSettings,
  updateHomeSettings,
  uploadCarouselImage,
  deleteCarouselImage
};