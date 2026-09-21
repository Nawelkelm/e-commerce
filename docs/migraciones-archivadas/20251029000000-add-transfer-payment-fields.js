'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'paymentProofUrl', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL del comprobante de transferencia'
    });

    await queryInterface.addColumn('Orders', 'paymentProofUploadedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha de carga del comprobante'
    });

    await queryInterface.addColumn('Orders', 'bankTransferData', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Datos bancarios mostrados al cliente'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'paymentProofUrl');
    await queryInterface.removeColumn('Orders', 'paymentProofUploadedAt');
    await queryInterface.removeColumn('Orders', 'bankTransferData');
  }
};
