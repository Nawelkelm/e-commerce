'use strict';

/**
 * Sincronizacion de comprobantes con ARCA.
 *
 * Agrega los campos que identifican fiscalmente un comprobante y permiten
 * traerlo desde ARCA, y relaja las columnas que un comprobante emitido fuera
 * de la tienda no puede tener (no hay pedido, usuario, email ni medio de pago).
 *
 * La obligatoriedad de esos cuatro campos para las facturas propias pasa a una
 * validacion a nivel modelo (`datosObligatoriosSiEsDeLaTienda` en Invoice), que
 * la sigue exigiendo cuando origin = 'store'.
 *
 * Nota: sequelize.sync({ alter: true }) NO quita el NOT NULL de orderId ni
 * userId por ser claves foraneas, asi que este cambio requiere la migracion
 * incluso en desarrollo.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Invoices', 'origin', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'store'
    });

    await queryInterface.addColumn('Invoices', 'afipVoucherType', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Invoices', 'afipVoucherNumber', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Invoices', 'arcaSyncedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    for (const [columna, tipo] of [
      ['orderId', Sequelize.UUID],
      ['userId', Sequelize.UUID],
      ['customerEmail', Sequelize.STRING],
      ['paymentMethod', Sequelize.STRING]
    ]) {
      await queryInterface.changeColumn('Invoices', columna, {
        type: tipo,
        allowNull: true
      });
    }

    await queryInterface.addIndex('Invoices', ['pointOfSale', 'afipVoucherType', 'afipVoucherNumber'], {
      unique: true,
      name: 'invoices_afip_identity'
    });

    await queryInterface.addIndex('Invoices', ['origin'], {
      name: 'invoices_origin'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Invoices', 'invoices_origin');
    await queryInterface.removeIndex('Invoices', 'invoices_afip_identity');

    // Los comprobantes importados no tienen pedido ni usuario: hay que
    // eliminarlos antes de restaurar el NOT NULL, o la migracion falla.
    await queryInterface.sequelize.query(
      `DELETE FROM "Invoices" WHERE "origin" = 'arca'`
    );

    for (const [columna, tipo] of [
      ['orderId', Sequelize.UUID],
      ['userId', Sequelize.UUID],
      ['customerEmail', Sequelize.STRING],
      ['paymentMethod', Sequelize.STRING]
    ]) {
      await queryInterface.changeColumn('Invoices', columna, {
        type: tipo,
        allowNull: false
      });
    }

    await queryInterface.removeColumn('Invoices', 'arcaSyncedAt');
    await queryInterface.removeColumn('Invoices', 'afipVoucherNumber');
    await queryInterface.removeColumn('Invoices', 'afipVoucherType');
    await queryInterface.removeColumn('Invoices', 'origin');
  }
};
