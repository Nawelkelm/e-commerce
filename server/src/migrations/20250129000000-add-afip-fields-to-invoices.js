'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('invoices', 'cae', {
      type: Sequelize.STRING(14),
      allowNull: true,
      comment: 'Código de Autorización Electrónica de AFIP'
    });

    await queryInterface.addColumn('invoices', 'caeDueDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'Fecha de vencimiento del CAE'
    });

    await queryInterface.addColumn('invoices', 'invoiceType', {
      type: Sequelize.ENUM('A', 'B', 'C', 'E', 'M'),
      allowNull: false,
      defaultValue: 'B',
      comment: 'Tipo de comprobante fiscal: A=Factura A, B=Factura B, C=Factura C, E=Factura E, M=Factura M'
    });

    await queryInterface.addColumn('invoices', 'pointOfSale', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Punto de venta de AFIP'
    });

    await queryInterface.addColumn('invoices', 'afipStatus', {
      type: Sequelize.ENUM('pending', 'authorized', 'rejected', 'error', 'not_required'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Estado de autorización en AFIP'
    });

    await queryInterface.addColumn('invoices', 'afipResponse', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Respuesta completa de AFIP al solicitar CAE'
    });

    await queryInterface.addColumn('invoices', 'afipRequestDate', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha y hora de solicitud a AFIP'
    });

    await queryInterface.addColumn('invoices', 'customerTaxCategory', {
      type: Sequelize.ENUM(
        'responsable_inscripto',
        'responsable_monotributo',
        'exento',
        'no_responsable',
        'consumidor_final'
      ),
      allowNull: false,
      defaultValue: 'consumidor_final',
      comment: 'Categoría tributaria del cliente'
    });

    await queryInterface.addColumn('invoices', 'customerCuit', {
      type: Sequelize.STRING(11),
      allowNull: true,
      comment: 'CUIT/CUIL del cliente (obligatorio para Factura A y B con RI)'
    });

    await queryInterface.addColumn('invoices', 'observations', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Observaciones o comentarios en la factura'
    });

    // Índices para mejorar performance en consultas AFIP
    await queryInterface.addIndex('invoices', ['cae'], {
      name: 'invoices_cae_idx'
    });

    await queryInterface.addIndex('invoices', ['afipStatus'], {
      name: 'invoices_afip_status_idx'
    });

    await queryInterface.addIndex('invoices', ['pointOfSale', 'invoiceType'], {
      name: 'invoices_point_type_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar índices
    await queryInterface.removeIndex('invoices', 'invoices_cae_idx');
    await queryInterface.removeIndex('invoices', 'invoices_afip_status_idx');
    await queryInterface.removeIndex('invoices', 'invoices_point_type_idx');

    // Eliminar columnas
    await queryInterface.removeColumn('invoices', 'cae');
    await queryInterface.removeColumn('invoices', 'caeDueDate');
    await queryInterface.removeColumn('invoices', 'invoiceType');
    await queryInterface.removeColumn('invoices', 'pointOfSale');
    await queryInterface.removeColumn('invoices', 'afipStatus');
    await queryInterface.removeColumn('invoices', 'afipResponse');
    await queryInterface.removeColumn('invoices', 'afipRequestDate');
    await queryInterface.removeColumn('invoices', 'customerTaxCategory');
    await queryInterface.removeColumn('invoices', 'customerCuit');
    await queryInterface.removeColumn('invoices', 'observations');
  }
};
