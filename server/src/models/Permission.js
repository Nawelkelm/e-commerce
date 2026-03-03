const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 100]
    }
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The resource this permission applies to (users, products, orders, etc.)'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The action this permission allows (create, read, update, delete)'
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'general',
    comment: 'Category for grouping permissions (user_management, product_management, etc.)'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['resource', 'action'] },
    { fields: ['category'] }
  ]
});

module.exports = Permission;