'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SmtpSettings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      host: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'smtp.gmail.com'
      },
      port: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 587
      },
      secure: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Use SSL/TLS'
      },
      user: {
        type: Sequelize.STRING,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fromName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'E-Commerce'
      },
      fromEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'noreply@example.com'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      testEmail: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Email for testing configuration'
      },
      provider: {
        type: Sequelize.ENUM('gmail', 'outlook', 'sendgrid', 'mailgun', 'custom'),
        allowNull: false,
        defaultValue: 'gmail'
      },
      lastTestedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      testStatus: {
        type: Sequelize.ENUM('pending', 'success', 'failed'),
        allowNull: true
      },
      testError: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create default SMTP configuration
    await queryInterface.bulkInsert('SmtpSettings', [{
      id: Sequelize.literal('uuid_generate_v4()'),
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      fromName: 'Mi Tienda',
      fromEmail: 'noreply@example.com',
      isActive: false,
      provider: 'gmail',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SmtpSettings');
  }
};
