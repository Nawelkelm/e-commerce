const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo para lotes y fechas de vencimiento
const ProductBatch = sequelize.define('ProductBatch', {
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
  batchNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Unique batch/lot number'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  initialQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Initial quantity when batch was received'
  },
  manufactureDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  expirationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  supplierName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  supplierReference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Supplier order/invoice reference'
  },
  purchaseCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Purchase cost per unit for this batch'
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Total cost of the batch'
  },
  locationCode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Storage location code'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'depleted', 'expired', 'recalled']]
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPerishable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  daysUntilExpiration: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.expirationDate) return null;
      const today = new Date();
      const expDate = new Date(this.expirationDate);
      const diffTime = expDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
  },
  isExpiringSoon: {
    type: DataTypes.VIRTUAL,
    get() {
      const days = this.daysUntilExpiration;
      return days !== null && days <= 30 && days >= 0;
    }
  },
  isExpired: {
    type: DataTypes.VIRTUAL,
    get() {
      const days = this.daysUntilExpiration;
      return days !== null && days < 0;
    }
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
    { fields: ['batchNumber'] },
    { fields: ['expirationDate'] },
    { fields: ['status'] },
    { fields: ['locationCode'] },
    { unique: true, fields: ['productId', 'batchNumber'] }
  ]
});

module.exports = ProductBatch;
