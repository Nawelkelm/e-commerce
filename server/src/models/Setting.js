const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(50),
    defaultValue: 'text'
  },
  category: {
    type: DataTypes.STRING(100),
    defaultValue: 'general'
  }
}, {
  tableName: 'Settings',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['key'] }
  ]
});

module.exports = Setting;
