const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo para reservas temporales de stock (carrito)
const StockReservation = sequelize.define('StockReservation', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Puede ser null para usuarios no autenticados (usar sessionId)
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true, // Para usuarios no autenticados
    comment: 'Session ID for guest users'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Reservation expires after 15 minutes'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'expired', 'cancelled'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
    { fields: ['userId'] },
    { fields: ['sessionId'] },
    { fields: ['expiresAt'] },
    { fields: ['status'] }
  ]
});

module.exports = StockReservation;
