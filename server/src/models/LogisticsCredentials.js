const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LogisticsCredentials = sequelize.define('LogisticsCredentials', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  carrier: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Andreani', 'OCA', 'Correo Argentino']]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  credentials: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
    // Estructura según carrier:
    // Andreani: { username, password, contract, apiUrl }
    // OCA: { cuit, operativa, password, apiUrl }
    // Correo Argentino: { apiKey, clientId, apiUrl }
  },
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  syncStatus: {
    type: DataTypes.STRING,
    defaultValue: 'never',
    validate: {
      isIn: [['success', 'error', 'pending', 'never']]
    }
  },
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {}
    // Configuraciones adicionales como autoSync, syncInterval, etc.
  }
}, {
  tableName: 'LogisticsCredentials',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['carrier'] }
  ]
});

module.exports = LogisticsCredentials;
