require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

/**
 * Marca las migraciones existentes como ya aplicadas.
 *
 * Contexto: el esquema de este proyecto lo construyó `sequelize.sync()`, no
 * las migraciones. Por eso una base ya en uso tiene las 38 tablas pero la
 * tabla SequelizeMeta vacía: si se corriera `db:migrate` sin más, el CLI
 * intentaría crear tablas que ya existen y fallaría en la primera.
 *
 * Este script escribe el historial que falta, para que a partir de ahora
 * `db:migrate` aplique solamente lo nuevo.
 *
 * Se corre UNA sola vez por base, y sólo en bases que ya estaban en uso.
 * En una base vacía no hace falta: ahí las migraciones corren normalmente.
 *
 * Uso:
 *   npm run db:baseline          # marca todas las migraciones como aplicadas
 *   npm run db:baseline -- --dry # muestra qué haría, sin escribir
 */

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

const listarMigraciones = () =>
  fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();

const asegurarTabla = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
      "name" VARCHAR(255) NOT NULL PRIMARY KEY
    );
  `);
};

const yaRegistradas = async () => {
  const [filas] = await sequelize.query('SELECT "name" FROM "SequelizeMeta";');
  return new Set(filas.map(f => f.name));
};

const baseline = async ({ dryRun = false } = {}) => {
  const migraciones = listarMigraciones();
  if (!migraciones.length) {
    logger.warn(`No se encontraron migraciones en ${MIGRATIONS_DIR}`);
    return { registradas: 0, yaEstaban: 0 };
  }

  await asegurarTabla();
  const registradas = await yaRegistradas();

  const faltantes = migraciones.filter(m => !registradas.has(m));

  if (dryRun) {
    console.log(`Migraciones encontradas: ${migraciones.length}`);
    console.log(`Ya registradas:          ${registradas.size}`);
    console.log(`Se marcarían como aplicadas: ${faltantes.length}`);
    faltantes.forEach(m => console.log(`  + ${m}`));
    return { registradas: 0, yaEstaban: registradas.size, simuladas: faltantes.length };
  }

  for (const nombre of faltantes) {
    await sequelize.query(
      'INSERT INTO "SequelizeMeta" ("name") VALUES (:nombre) ON CONFLICT ("name") DO NOTHING;',
      { replacements: { nombre } }
    );
  }

  logger.info(
    `Baseline listo: ${faltantes.length} migraciones marcadas como aplicadas ` +
    `(${registradas.size} ya lo estaban).`
  );

  return { registradas: faltantes.length, yaEstaban: registradas.size };
};

if (require.main === module) {
  const dryRun = process.argv.includes('--dry');

  baseline({ dryRun })
    .then(() => sequelize.close())
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Falló el baseline:', error.message);
      process.exit(1);
    });
}

module.exports = { baseline, listarMigraciones };
