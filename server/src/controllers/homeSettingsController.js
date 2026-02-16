const { HomeSettings, Setting } = require('../models');
const logger = require('../config/logger');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

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
      return res.status(400).json({ message: 'No se proporciono ninguna imagen' });
    }
    const uploadsDir = path.join(__dirname, '../../uploads/carousel');
    await fs.mkdir(uploadsDir, { recursive: true });
    const timestamp = Date.now();
    const filename = 'carousel-' + timestamp + '.webp';
    const filepath = path.join(uploadsDir, filename);
    await sharp(req.file.buffer).resize(1920, 600, { fit: 'cover', position: 'center' }).webp({ quality: 85 }).toFile(filepath);
    const imageUrl = '/uploads/carousel/' + filename;
    logger.info('Carousel image uploaded:', imageUrl);
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
    const filename = imageUrl.split('/').pop();
    const filepath = path.join(__dirname, '../../uploads/carousel', filename);
    try {
      await fs.unlink(filepath);
      logger.info('Carousel image deleted:', imageUrl);
    } catch (err) {
      logger.warn('File not found for deletion:', imageUrl);
    }
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