const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ShipmentTracking = sequelize.define('ShipmentTracking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    // Ciudad, provincia o punto específico
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  carrierMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    // Mensaje original del transportista
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    // Si el cliente puede ver este evento
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    // Información adicional del evento
  }
}, {
  tableName: 'shipment_trackings',
  timestamps: true,
  indexes: [
    { fields: ['shipmentId'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = ShipmentTracking;
