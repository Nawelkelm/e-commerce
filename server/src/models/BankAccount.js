const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BankAccount = sequelize.define('BankAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  accountType: {
    type: DataTypes.ENUM('Cuenta Corriente', 'Caja de Ahorro'),
    allowNull: false
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cbu: {
    type: DataTypes.STRING(22),
    allowNull: false,
    validate: {
      len: [22, 22]
    }
  },
  alias: {
    type: DataTypes.STRING,
    allowNull: true
  },
  holderName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  holderDocument: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'CUIT/CUIL del titular'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Cuenta bancaria principal para mostrar por defecto'
  }
}, {
  tableName: 'BankAccounts',
  timestamps: true
});

// Hook para asegurar que solo una cuenta sea primaria
BankAccount.beforeSave(async (bankAccount) => {
  if (bankAccount.isPrimary) {
    // Si esta cuenta se marca como primaria, desmarcar las demás
    await BankAccount.update(
      { isPrimary: false },
      { where: { isPrimary: true } }
    );
  }
});

module.exports = BankAccount;
