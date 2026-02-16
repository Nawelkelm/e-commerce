const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true,
    // For guest users
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['sessionId'] },
    { fields: ['expiresAt'] }
  ]
});

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    // Price at the time of adding to cart
  },
  attributes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
    // Selected product attributes (color, size, etc.)
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['cartId'] },
    { fields: ['productId'] }
  ]
});

module.exports = { Cart, CartItem };