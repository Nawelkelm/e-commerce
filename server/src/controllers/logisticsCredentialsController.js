const LogisticsCredentials = require('../models/LogisticsCredentials');
const logger = require('../config/logger');
const crypto = require('crypto');

// Clave para encriptar/desencriptar credenciales
const ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

// Encriptar credenciales
const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
    let encrypted = cipher.update(JSON.stringify(text));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    logger.error('Error encrypting credentials:', error);
    throw error;
  }
};

// Desencriptar credenciales
const decrypt = (text) => {
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (error) {
    logger.error('Error decrypting credentials:', error);
    throw error;
  }
};

// Get all logistics credentials
const getAllCredentials = async (req, res) => {
  try {
    const credentials = await LogisticsCredentials.findAll({
      order: [['carrier', 'ASC']]
    });

    // Desencriptar y ocultar información sensible para la respuesta
    const credentialsData = credentials.map(cred => {
      const decrypted = decrypt(cred.credentials);
      const masked = {};
      
      // Enmascarar valores sensibles
      Object.keys(decrypted).forEach(key => {
        if (['password', 'apiKey', 'token'].includes(key)) {
          masked[key] = decrypted[key] ? '••••••••' : '';
        } else {
          masked[key] = decrypted[key];
        }
      });

      return {
        id: cred.id,
        carrier: cred.carrier,
        isActive: cred.isActive,
        credentials: masked,
        lastSyncAt: cred.lastSyncAt,
        syncStatus: cred.syncStatus,
        lastError: cred.lastError,
        settings: cred.settings,
        createdAt: cred.createdAt,
        updatedAt: cred.updatedAt
      };
    });

    res.json({ credentials: credentialsData });
  } catch (error) {
    logger.error('Get all credentials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get credentials by carrier
const getCredentialsByCarrier = async (req, res) => {
  try {
    const { carrier } = req.params;

    const credentials = await LogisticsCredentials.findOne({
      where: { carrier }
    });

    if (!credentials) {
      return res.status(404).json({ message: 'Credentials not found for this carrier' });
    }

    const decrypted = decrypt(credentials.credentials);
    const masked = {};
    
    Object.keys(decrypted).forEach(key => {
      if (['password', 'apiKey', 'token'].includes(key)) {
        masked[key] = decrypted[key] ? '••••••••' : '';
      } else {
        masked[key] = decrypted[key];
      }
    });

    res.json({
      id: credentials.id,
      carrier: credentials.carrier,
      isActive: credentials.isActive,
      credentials: masked,
      lastSyncAt: credentials.lastSyncAt,
      syncStatus: credentials.syncStatus,
      lastError: credentials.lastError,
      settings: credentials.settings
    });
  } catch (error) {
    logger.error('Get credentials by carrier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or update credentials
const saveCredentials = async (req, res) => {
  try {
    const { carrier, credentials, isActive, settings } = req.body;

    if (!carrier || !credentials) {
      return res.status(400).json({ message: 'Carrier and credentials are required' });
    }

    // Validar carrier
    const validCarriers = ['Andreani', 'OCA', 'Correo Argentino'];
    if (!validCarriers.includes(carrier)) {
      return res.status(400).json({ message: 'Invalid carrier' });
    }

    // Encriptar credenciales
    const encryptedCredentials = encrypt(credentials);

    // Buscar si ya existe
    let existingCredentials = await LogisticsCredentials.findOne({
      where: { carrier }
    });

    if (existingCredentials) {
      // Actualizar
      await existingCredentials.update({
        credentials: encryptedCredentials,
        isActive: isActive !== undefined ? isActive : existingCredentials.isActive,
        settings: settings || existingCredentials.settings,
        syncStatus: 'pending'
      });

      logger.info(`Credentials updated for carrier: ${carrier}`);
      res.json({ 
        message: 'Credentials updated successfully',
        carrier,
        isActive: existingCredentials.isActive
      });
    } else {
      // Crear nuevo
      const newCredentials = await LogisticsCredentials.create({
        carrier,
        credentials: encryptedCredentials,
        isActive: isActive !== undefined ? isActive : false,
        settings: settings || {},
        syncStatus: 'pending'
      });

      logger.info(`Credentials created for carrier: ${carrier}`);
      res.status(201).json({ 
        message: 'Credentials created successfully',
        carrier,
        isActive: newCredentials.isActive
      });
    }
  } catch (error) {
    logger.error('Save credentials error:', error);
    res.status(500).json({ message: 'Server error saving credentials' });
  }
};

// Toggle active status
const toggleActive = async (req, res) => {
  try {
    const { carrier } = req.params;

    const credentials = await LogisticsCredentials.findOne({
      where: { carrier }
    });

    if (!credentials) {
      return res.status(404).json({ message: 'Credentials not found' });
    }

    await credentials.update({
      isActive: !credentials.isActive
    });

    res.json({ 
      message: `Carrier ${credentials.isActive ? 'activated' : 'deactivated'}`,
      isActive: credentials.isActive
    });
  } catch (error) {
    logger.error('Toggle active error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Test credentials
const testCredentials = async (req, res) => {
  try {
    const { carrier } = req.params;

    const credentials = await LogisticsCredentials.findOne({
      where: { carrier }
    });

    if (!credentials) {
      return res.status(404).json({ message: 'Credentials not found' });
    }

    // Desencriptar credenciales
    const decryptedCredentials = decrypt(credentials.credentials);

    // Importar el servicio correspondiente y probar conexión
    let service;
    try {
      if (carrier === 'Andreani') {
        const andreaniService = require('../services/logistics/andreaniService');
        // Configurar credenciales temporalmente
        andreaniService.username = decryptedCredentials.username;
        andreaniService.password = decryptedCredentials.password;
        await andreaniService.authenticate();
        service = 'Andreani';
      } else if (carrier === 'OCA') {
        const ocaService = require('../services/logistics/ocaService');
        ocaService.cuit = decryptedCredentials.cuit;
        ocaService.operativa = decryptedCredentials.operativa;
        service = 'OCA';
      } else if (carrier === 'Correo Argentino') {
        const correoService = require('../services/logistics/correoArgentinoService');
        correoService.apiKey = decryptedCredentials.apiKey;
        correoService.clientId = decryptedCredentials.clientId;
        service = 'Correo Argentino';
      }

      // Actualizar estado
      await credentials.update({
        syncStatus: 'success',
        lastError: null,
        lastSyncAt: new Date()
      });

      res.json({ 
        message: `Connection successful to ${service}`,
        status: 'success'
      });
    } catch (error) {
      await credentials.update({
        syncStatus: 'error',
        lastError: error.message
      });

      throw error;
    }
  } catch (error) {
    logger.error('Test credentials error:', error);
    res.status(400).json({ 
      message: 'Connection failed',
      error: error.message 
    });
  }
};

// Delete credentials
const deleteCredentials = async (req, res) => {
  try {
    const { carrier } = req.params;

    const credentials = await LogisticsCredentials.findOne({
      where: { carrier }
    });

    if (!credentials) {
      return res.status(404).json({ message: 'Credentials not found' });
    }

    await credentials.destroy();

    logger.info(`Credentials deleted for carrier: ${carrier}`);
    res.json({ message: 'Credentials deleted successfully' });
  } catch (error) {
    logger.error('Delete credentials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCredentials,
  getCredentialsByCarrier,
  saveCredentials,
  toggleActive,
  testCredentials,
  deleteCredentials,
  encrypt,
  decrypt
};
