const { Sequelize, Op } = require('sequelize');
const logger = require('./logger');

// La cadena de conexión SIEMPRE viene de variables de entorno.
// Nunca hardcodear credenciales (riesgo de filtración en el repo).
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  logger.error('FATAL: DATABASE_URL no está definida. Configúrala en el entorno (.env / Coolify).');
  throw new Error('DATABASE_URL is required');
}

// SSL: activar SOLO con DB_SSL=true. En Coolify el PostgreSQL interno no usa TLS,
// así que no inferimos SSL desde NODE_ENV. Configurar explícitamente por entorno.
const useSsl = process.env.DB_SSL === 'true';
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';

const sequelize = new Sequelize(
  DATABASE_URL,
  {
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    dialectOptions: {
      ssl: useSsl ? {
        require: true,
        rejectUnauthorized
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      match: [
        /ECONNRESET/,
        /ETIMEDOUT/,
        /ENOTFOUND/,
        /EHOSTUNREACH/,
        /EINVAL/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    }
  }
);

module.exports = { sequelize, Op };