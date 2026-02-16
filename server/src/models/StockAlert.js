const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo para alertas de stock
const StockAlert = sequelize.define('StockAlert', {
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
  type: {
    type: DataTypes.ENUM('low_stock', 'out_of_stock', 'overstock', 'expiring_soon'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('info', 'warning', 'critical'),
    defaultValue: 'warning'
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  threshold: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notificationSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
    { fields: ['type'] },
    { fields: ['severity'] },
    { fields: ['isRead'] },
    { fields: ['isResolved'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = StockAlert;
