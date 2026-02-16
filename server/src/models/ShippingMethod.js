const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ShippingMethod = sequelize.define('ShippingMethod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('carrier', 'custom', 'pickup', 'agreement'),
    allowNull: false,
    defaultValue: 'custom'
    // carrier: Andreani, OCA, Correo Argentino
    // custom: Envío propio del vendedor
    // pickup: Retiro en local
    // agreement: Acordar con el vendedor
  },
  carrier: {
    type: DataTypes.STRING,
    allowNull: true
    // Si type es 'carrier', nombre del carrier (Andreani, OCA, etc)
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
    // Precio fijo (para custom/pickup/agreement)
    // null si es carrier (se cotiza dinámicamente)
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  freeFromAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
    // Monto mínimo para envío gratis
  },
  estimatedDays: {
    type: DataTypes.INTEGER,
    allowNull: true
    // Días estimados de entrega
  },
  zones: {
    type: DataTypes.JSON,
    defaultValue: []
    // Array de códigos postales o zonas donde aplica
    // Ejemplo: ['1000-1999', '2000-2999', 'CABA', 'GBA']
  },
  restrictions: {
    type: DataTypes.JSON,
    defaultValue: {}
    // Restricciones adicionales
    // Ejemplo: { maxWeight: 20, maxDimensions: {...}, excludedProducts: [] }
  },
  requiresAddress: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
    // false para pickup o agreement
  },
  pickupAddress: {
    type: DataTypes.JSON,
    allowNull: true
    // Dirección de retiro si type es 'pickup'
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
    // URL o nombre del ícono
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'ShippingMethods',
  timestamps: true
});

module.exports = ShippingMethod;
