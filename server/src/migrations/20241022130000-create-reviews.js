'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Order that generated this review'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      isVerifiedPurchase: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'User purchased this product'
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Admin approved'
      },
      helpfulCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of helpful votes'
      },
      notHelpfulCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      adminResponse: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Response from seller/admin'
      },
      adminRespondedAt: {
        type: Sequelize.DATE,
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

    // Add indexes
    await queryInterface.addIndex('Reviews', ['productId']);
    await queryInterface.addIndex('Reviews', ['userId']);
    await queryInterface.addIndex('Reviews', ['orderId']);
    await queryInterface.addIndex('Reviews', ['rating']);
    await queryInterface.addIndex('Reviews', ['isApproved']);
    await queryInterface.addIndex('Reviews', ['isVerifiedPurchase']);
    await queryInterface.addIndex('Reviews', ['createdAt']);

    // Add composite unique index to prevent duplicate reviews per user per product
    await queryInterface.addIndex('Reviews', ['userId', 'productId'], {
      unique: true,
      name: 'reviews_user_product_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Reviews');
  }
};
