const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SmtpSettings = sequelize.define('SmtpSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  host: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'smtp.gmail.com'
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 587
  },
  secure: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  user: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fromName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'E-Commerce'
  },
  fromEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'noreply@example.com'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  testEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  provider: {
    type: DataTypes.ENUM('gmail', 'outlook', 'sendgrid', 'mailgun', 'custom'),
    allowNull: false,
    defaultValue: 'gmail'
  },
  lastTestedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  testStatus: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    allowNull: true
  },
  testError: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'SmtpSettings',
  timestamps: true
});

module.exports = SmtpSettings;
