module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('HomeSettings', 'couponBannerEnabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });

    await queryInterface.addColumn('HomeSettings', 'couponBannerTitle', {
      type: Sequelize.STRING(200),
      defaultValue: '¡Ofertas Especiales!',
      allowNull: true
    });

    await queryInterface.addColumn('HomeSettings', 'couponBannerSubtitle', {
      type: Sequelize.STRING(200),
      defaultValue: 'Aprovecha estos cupones de descuento',
      allowNull: true
    });

    await queryInterface.addColumn('HomeSettings', 'couponBannerMaxCoupons', {
      type: Sequelize.INTEGER,
      defaultValue: 3,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('HomeSettings', 'couponBannerEnabled');
    await queryInterface.removeColumn('HomeSettings', 'couponBannerTitle');
    await queryInterface.removeColumn('HomeSettings', 'couponBannerSubtitle');
    await queryInterface.removeColumn('HomeSettings', 'couponBannerMaxCoupons');
  }
};
