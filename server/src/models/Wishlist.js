const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'Wishlists',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'productId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['productId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Wishlist;
