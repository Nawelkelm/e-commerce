const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isValidPhone(value) {
        if (value && value.trim().length > 0) {
          // Permitir formatos de teléfono variados incluyendo Argentina
          // Ejemplos: 0376 4969830, 03764969830, +54 11 1234-5678, +54 376 4969830
          const phoneRegex = /^[\d\s\+\-\(\)]+$/;
          if (!phoneRegex.test(value)) {
            throw new Error('El teléfono solo puede contener números, espacios, +, - y paréntesis');
          }
        }
      }
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Dirección de envío por defecto: {firstName, lastName, street, city, state, postalCode, country, phone}'
  },
  billingAddress: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Dirección de facturación Argentina: {firstName, lastName, street, city, state, postalCode, country, phone, cuit, companyName, fiscalCondition}'
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin'),
    defaultValue: 'customer'
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Roles',
      key: 'id'
    },
    comment: 'Advanced role system - if null, uses legacy role field'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verificationTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] }
  ]
});

module.exports = User;