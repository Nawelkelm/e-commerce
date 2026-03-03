const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo para historial de movimientos de stock
const StockMovement = sequelize.define('StockMovement', {
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
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer_in', 'transfer_out', 'import']]
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Positive for additions, negative for subtractions'
  },
  previousStock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  newStock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Cost per unit for this movement'
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Total cost of the movement'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reason for the stock movement'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referenceType: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['order', 'purchase_order', 'transfer', 'import', 'manual', 'other']]
    }
  },
  referenceId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID of related order, transfer, etc.'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'User who performed the action'
  },
  locationFrom: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Source location for transfers'
  },
  locationTo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Destination location for transfers'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
    { fields: ['type'] },
    { fields: ['userId'] },
    { fields: ['createdAt'] },
    { fields: ['referenceType', 'referenceId'] }
  ]
});

module.exports = StockMovement;
