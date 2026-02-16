'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ReviewHelpful', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      reviewId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Reviews',
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
      isHelpful: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: 'true = helpful, false = not helpful'
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
    await queryInterface.addIndex('ReviewHelpful', ['reviewId']);
    await queryInterface.addIndex('ReviewHelpful', ['userId']);

    // Prevent duplicate votes
    await queryInterface.addIndex('ReviewHelpful', ['userId', 'reviewId'], {
      unique: true,
      name: 'review_helpful_user_review_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ReviewHelpful');
  }
};
