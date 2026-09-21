'use strict';

const fs = require('fs');
const path = require('path');

const ARCHIVO_SQL = path.join(__dirname, 'sql', 'initial-schema.sql');

/**
 * Esquema base de TiendaKit.
 *
 * Hasta ahora las migraciones eran sólo parches: ninguna creaba Users,
 * Products, Orders ni Categories, así que una instalación nueva dependía de
 * `sequelize.sync()` para arrancar. Esta migración cierra ese hueco: crea las
 * 37 tablas con sus índices y claves foráneas.
 *
 * El SQL se generó con pg_dump sobre una base construida por sync() desde los
 * modelos, para que el esquema resultante sea idéntico al que creaba sync().
 *
 * La fecha es anterior a la de todas las demás migraciones a propósito: tiene
 * que correr primero, porque el resto son parches sobre estas tablas.
 *
 * **Es idempotente por diseño.** Las bases que ya estaban en uso tienen el
 * esquema creado por sync() y el historial escrito por `npm run db:baseline`,
 * pero una base baselineada antes de que esta migración existiera la vería
 * como pendiente. Por eso se verifica primero si el esquema ya está y, en ese
 * caso, no se hace nada.
 */
module.exports = {
  async up(queryInterface) {
    const [filas] = await queryInterface.sequelize.query(
      `SELECT to_regclass('public."Users"') AS tabla`
    );

    if (filas[0] && filas[0].tabla) {
      // La base ya tiene el esquema: fue creada por sync() antes de que las
      // migraciones funcionaran. No hay nada que crear.
      console.log('El esquema base ya existe, se omite la creación.');
      return;
    }

    const sql = fs.readFileSync(ARCHIVO_SQL, 'utf8');
    await queryInterface.sequelize.query(sql);
  },

  async down(queryInterface) {
    // Revertir el esquema base es borrar la base entera. Se hace explícito
    // para no dejar un `down` que finja funcionar.
    throw new Error(
      'No se puede revertir la migración del esquema base: eliminaría todos ' +
      'los datos. Si necesitás empezar de cero, borrá y recreá la base.'
    );
  }
};
