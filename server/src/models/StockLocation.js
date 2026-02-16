const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo para múltiples ubicaciones de stock
const StockLocation = sequelize.define('StockLocation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  locationName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the warehouse/store/location'
  },
  locationCode: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Unique code for the location'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  reservedQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Quantity reserved in pending orders'
  },
  availableQuantity: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.quantity - this.reservedQuantity;
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Primary location for this product'
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Physical address of the location'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
    { fields: ['locationCode'] },
    { fields: ['isActive'] },
    { fields: ['isPrimary'] },
    { unique: true, fields: ['productId', 'locationCode'] }
  ]
});

module.exports = StockLocation;
