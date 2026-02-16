'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products', 'averageRating', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('Products', 'totalReviews', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Products', 'averageRating');
    await queryInterface.removeColumn('Products', 'totalReviews');
  }
};
