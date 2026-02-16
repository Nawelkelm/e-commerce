const { Setting } = require('../models');
const logger = require('../config/logger');

// Get all settings
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll({
      order: [['category', 'ASC'], ['displayName', 'ASC']]
    });

    // Convert to key-value object
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.key] = {
        value: setting.value,
        displayName: setting.displayName,
        description: setting.description,
        type: setting.type,
        category: setting.category
      };
    });

    res.json(settingsObject);
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single setting
const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ where: { key } });

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(setting);
  } catch (error) {
    logger.error('Get setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update setting
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    // Use findOrCreate to handle both new and existing settings
    const [setting, created] = await Setting.findOrCreate({
      where: { key },
      defaults: {
        value,
        displayName: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        description: `Setting for ${key}`,
        type: 'text',
        category: key.includes('home') ? 'home' : 'general',
        isPublic: false
      }
    });

    // If not created, update the value
    if (!created) {
      await setting.update({ value });
    }

    logger.info(`Setting ${key} ${created ? 'created' : 'updated'} by user ${req.user.id}`);
    res.json({ message: `Setting ${created ? 'created' : 'updated'} successfully`, setting });
  } catch (error) {
    logger.error('Update setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get public settings (no auth required)
const getPublicSettings = async (req, res) => {
  try {
    const publicKeys = ['site_name', 'site_logo', 'site_description', 'site_favicon'];
    const settings = await Setting.findAll({
      where: { key: publicKeys }
    });

    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });

    res.json(settingsObject);
  } catch (error) {
    logger.error('Get public settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct the logo URL
    const logoUrl = `/uploads/logos/${req.file.filename}`;

    // Update site_logo setting
    const setting = await Setting.findOne({ where: { key: 'site_logo' } });
    
    if (setting) {
      // Delete old logo file if exists
      if (setting.value && setting.value.startsWith('/uploads/logos/')) {
        const fs = require('fs').promises;
        const path = require('path');
        const oldLogoPath = path.join(__dirname, '../../', setting.value);
        
        try {
          await fs.unlink(oldLogoPath);
        } catch (err) {
          // Ignore if file doesn't exist
          logger.warn('Could not delete old logo:', err.message);
        }
      }

      await setting.update({ value: logoUrl });
    } else {
      await Setting.create({
        key: 'site_logo',
        value: logoUrl,
        displayName: 'Logo del Sitio',
        description: 'Logo principal de la tienda',
        type: 'image',
        category: 'general'
      });
    }

    logger.info(`Logo uploaded by user ${req.user.id}: ${logoUrl}`);
    res.json({ 
      message: 'Logo uploaded successfully', 
      logoUrl,
      setting 
    });
  } catch (error) {
    logger.error('Upload logo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload favicon
const uploadFavicon = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct the favicon URL
    const faviconUrl = `/uploads/logos/${req.file.filename}`;

    // Update site_favicon setting
    const setting = await Setting.findOne({ where: { key: 'site_favicon' } });
    
    if (setting) {
      // Delete old favicon file if exists
      if (setting.value && setting.value.startsWith('/uploads/logos/')) {
        const fs = require('fs').promises;
        const path = require('path');
        const oldFaviconPath = path.join(__dirname, '../../', setting.value);
        
        try {
          await fs.unlink(oldFaviconPath);
        } catch (err) {
          // Ignore if file doesn't exist
          logger.warn('Could not delete old favicon:', err.message);
        }
      }

      await setting.update({ value: faviconUrl });
    } else {
      await Setting.create({
        key: 'site_favicon',
        value: faviconUrl,
        displayName: 'Favicon',
        description: 'Icono que aparece en la pestaña del navegador',
        type: 'image',
        category: 'general'
      });
    }

    logger.info(`Favicon uploaded by user ${req.user.id}: ${faviconUrl}`);
    res.json({ 
      message: 'Favicon uploaded successfully', 
      faviconUrl,
      setting 
    });
  } catch (error) {
    logger.error('Upload favicon error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSettings,
  getSetting,
  updateSetting,
  getPublicSettings,
  uploadLogo,
  uploadFavicon
};
