'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'shippingMethodId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ShippingMethods',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('Orders', 'shippingMethodCode', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Orders', 'shippingMethodName', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'shippingMethodId');
    await queryInterface.removeColumn('Orders', 'shippingMethodCode');
    await queryInterface.removeColumn('Orders', 'shippingMethodName');
  }
};
