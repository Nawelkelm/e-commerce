// Configuración para sequelize-cli (migraciones y seeders).
//
// Separada de config/database.js porque el CLI necesita un objeto plano por
// entorno, no una instancia de Sequelize ya construida. La lógica de conexión
// es la misma: la cadena SIEMPRE viene del entorno, nunca hardcodeada.
//
// El CLI no carga el .env por su cuenta, así que se hace acá.
require('dotenv').config();

// SSL: se activa SOLO con DB_SSL=true. El PostgreSQL interno de Coolify o de
// Docker no usa TLS, así que no se infiere desde NODE_ENV.
const useSsl = process.env.DB_SSL === 'true';
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';

const base = {
  dialect: 'postgres',
  // use_env_variable hace que el CLI lea la cadena de conexión del entorno en
  // vez de guardarla en este archivo, que está versionado.
  use_env_variable: 'DATABASE_URL',
  dialectOptions: {
    ssl: useSsl ? { require: true, rejectUnauthorized } : false
  },
  // Nombre por defecto de sequelize-cli. Se deja explícito para que quede
  // claro dónde se registra el historial de migraciones aplicadas.
  migrationStorageTableName: 'SequelizeMeta'
};

module.exports = {
  development: base,
  test: base,
  production: base
};
