/**
 * Infraestructura para los tests de integración.
 *
 * Corren contra una PostgreSQL real, no contra mocks: lo que hay que verificar
 * es justamente que las consultas, las restricciones y las transacciones
 * funcionen. Un mock del ORM sólo probaría que el mock hace lo que le dijimos.
 *
 * El esquema se crea con la misma migración que usa producción
 * (`20240101000000-initial-schema`), así que si esa migración se rompe, los
 * tests lo detectan.
 */
const path = require('path');

/** Sube los límites de rate limit: si no, el 6º login del archivo da 429. */
const relajarRateLimits = () => {
  process.env.RATE_LIMIT_MAX_REQUESTS = '100000';
  process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS = '100000';
  process.env.REGISTER_RATE_LIMIT_MAX_ATTEMPTS = '100000';
};

/**
 * Prepara el entorno ANTES de que se cargue cualquier módulo de la app:
 * config/database.js lee DATABASE_URL al importarse y aborta si no está.
 */
const prepararEntorno = () => {
  process.env.NODE_ENV = 'test';
  process.env.DB_SSL = 'false';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-solo-para-tests';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-solo-para-tests';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
    || process.env.DATABASE_URL
    || 'postgresql://ecommerce:localdev@127.0.0.1:5432/tiendakit_test';
  relajarRateLimits();
};

/** Crea el esquema si la base está vacía. */
const migrar = async (sequelize) => {
  const [filas] = await sequelize.query(`SELECT to_regclass('public."Users"') AS tabla`);
  if (filas[0] && filas[0].tabla) return 'ya existía';

  const migracion = require(
    path.join(__dirname, '..', '..', 'src', 'migrations', '20240101000000-initial-schema.js')
  );
  await migracion.up(sequelize.getQueryInterface());
  return 'creado';
};

/**
 * Vacía todas las tablas de datos entre tests.
 *
 * TRUNCATE ... CASCADE en una sola sentencia: hacerlo tabla por tabla choca
 * con las claves foráneas según el orden.
 */
const limpiar = async (sequelize) => {
  const [tablas] = await sequelize.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> 'SequelizeMeta'
  `);
  if (!tablas.length) return;
  const lista = tablas.map(t => `"${t.tablename}"`).join(', ');
  await sequelize.query(`TRUNCATE ${lista} RESTART IDENTITY CASCADE`);
};

module.exports = { prepararEntorno, migrar, limpiar, relajarRateLimits };
