'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Invoices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      invoiceNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      customerName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerPhone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      customerAddress: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      customerTaxId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      taxRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 16.00
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      shipping: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      items: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paymentId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('draft', 'issued', 'paid', 'cancelled', 'refunded'),
        defaultValue: 'issued',
        allowNull: false
      },
      issueDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      customerNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pdfUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelledBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      cancellationReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes
    await queryInterface.addIndex('Invoices', ['invoiceNumber'], {
      unique: true,
      name: 'invoices_invoice_number_unique'
    });
    await queryInterface.addIndex('Invoices', ['orderId']);
    await queryInterface.addIndex('Invoices', ['userId']);
    await queryInterface.addIndex('Invoices', ['status']);
    await queryInterface.addIndex('Invoices', ['issueDate']);
    await queryInterface.addIndex('Invoices', ['createdAt']);

    // Add invoice fields to Orders table
    await queryInterface.addColumn('Orders', 'paidAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Orders', 'invoiceId', {
      type: Sequelize.UUID,
      allowNull: true
    });

    await queryInterface.addColumn('Orders', 'invoiceNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addIndex('Orders', ['invoiceNumber']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes and columns from Orders
    await queryInterface.removeIndex('Orders', ['invoiceNumber']);
    await queryInterface.removeColumn('Orders', 'invoiceNumber');
    await queryInterface.removeColumn('Orders', 'invoiceId');
    await queryInterface.removeColumn('Orders', 'paidAt');

    // Drop Invoices table
    await queryInterface.dropTable('Invoices');
  }
};
