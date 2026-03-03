const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo para código de barras
const ProductBarcode = sequelize.define('ProductBarcode', {
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
  barcode: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Barcode number (EAN, UPC, etc.)'
  },
  barcodeType: {
    type: DataTypes.STRING,
    defaultValue: 'EAN13',
    validate: {
      isIn: [['EAN13', 'EAN8', 'UPC', 'CODE128', 'QR', 'CODE39', 'ITF14']]
    }
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Primary barcode for the product'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
    { fields: ['barcode'], unique: true },
    { fields: ['barcodeType'] },
    { fields: ['isPrimary'] }
  ]
});

module.exports = ProductBarcode;
