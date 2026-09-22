/**
 * Se ejecuta antes de cargar cualquier módulo en cada archivo de test.
 *
 * Tiene que correr acá y no dentro de los tests porque `config/database.js`
 * lee `DATABASE_URL` al importarse y aborta el proceso si no está definida.
 */
const { prepararEntorno } = require('./helpers/db');

prepararEntorno();
