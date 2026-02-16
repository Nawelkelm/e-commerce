const { validationResult } = require('express-validator');
const BankAccount = require('../models/BankAccount');
const logger = require('../config/logger');

// Get all bank accounts (admin only)
const getAllBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.findAll({
      order: [
        ['isPrimary', 'DESC'],
        ['isActive', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    res.json(accounts);
  } catch (error) {
    logger.error('Get bank accounts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active bank account (for public display)
const getActiveBankAccount = async (req, res) => {
  try {
    // Buscar cuenta primaria y activa
    let account = await BankAccount.findOne({
      where: { isPrimary: true, isActive: true }
    });

    // Si no hay cuenta primaria, buscar cualquier activa
    if (!account) {
      account = await BankAccount.findOne({
        where: { isActive: true },
        order: [['createdAt', 'DESC']]
      });
    }

    if (!account) {
      return res.status(404).json({ message: 'No active bank account found' });
    }

    res.json(account);
  } catch (error) {
    logger.error('Get active bank account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create bank account
const createBankAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      bankName,
      accountType,
      accountNumber,
      cbu,
      alias,
      holderName,
      holderDocument,
      isActive,
      isPrimary
    } = req.body;

    const account = await BankAccount.create({
      bankName,
      accountType,
      accountNumber,
      cbu,
      alias,
      holderName,
      holderDocument,
      isActive: isActive !== undefined ? isActive : true,
      isPrimary: isPrimary || false
    });

    logger.info(`Bank account created: ${account.id}`);
    res.status(201).json(account);
  } catch (error) {
    logger.error('Create bank account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update bank account
const updateBankAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      bankName,
      accountType,
      accountNumber,
      cbu,
      alias,
      holderName,
      holderDocument,
      isActive,
      isPrimary
    } = req.body;

    const account = await BankAccount.findByPk(id);
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    await account.update({
      bankName,
      accountType,
      accountNumber,
      cbu,
      alias,
      holderName,
      holderDocument,
      isActive,
      isPrimary
    });

    logger.info(`Bank account updated: ${account.id}`);
    res.json(account);
  } catch (error) {
    logger.error('Update bank account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete bank account
const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await BankAccount.findByPk(id);
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    await account.destroy();

    logger.info(`Bank account deleted: ${id}`);
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    logger.error('Delete bank account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set as primary account
const setPrimaryBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await BankAccount.findByPk(id);
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    // El hook beforeSave se encargará de desmarcar las demás
    await account.update({ isPrimary: true, isActive: true });

    logger.info(`Bank account set as primary: ${id}`);
    res.json(account);
  } catch (error) {
    logger.error('Set primary bank account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBankAccounts,
  getActiveBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryBankAccount
};
