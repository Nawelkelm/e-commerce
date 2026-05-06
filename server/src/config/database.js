const { Sequelize, Op } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://admin:L1SeQLXsrnAUTyPRNGanF3p2xeW23Z2C@dpg-d7tkbsrbc2fs738d09t0-a/ecommerce_db_o3gp',
  {
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
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