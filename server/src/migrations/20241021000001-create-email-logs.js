'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EmailLogs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'EmailTemplates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      recipientEmail: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      recipientName: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'failed', 'bounced'),
        allowNull: false,
        defaultValue: 'pending'
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      openedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      clickedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('EmailLogs', ['templateId']);
    await queryInterface.addIndex('EmailLogs', ['recipientEmail']);
    await queryInterface.addIndex('EmailLogs', ['status']);
    await queryInterface.addIndex('EmailLogs', ['orderId']);
    await queryInterface.addIndex('EmailLogs', ['userId']);
    await queryInterface.addIndex('EmailLogs', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('EmailLogs');
  }
};
