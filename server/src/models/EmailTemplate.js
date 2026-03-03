const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EmailTemplate = sequelize.define('EmailTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 100]
    }
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  htmlContent: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  textContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['order_confirmation', 'order_shipped', 'order_delivered', 'abandoned_cart', 'welcome', 'password_reset', 'promotional', 'custom']]
    }
  },
  variables: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'EmailTemplates',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['name'] }
  ]
});

module.exports = EmailTemplate;
