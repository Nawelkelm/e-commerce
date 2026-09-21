const cron = require('node-cron');
const { AfipCredential } = require('../models');
const arcaSyncService = require('../services/arcaSyncService');
const logger = require('../config/logger');

/**
 * Sincronizacion automatica de comprobantes emitidos en ARCA.
 *
 * Corre de madrugada, cuando la tienda tiene poco movimiento y los limites de
 * frecuencia de AFIP no compiten con la emision de facturas reales.
 *
 * Cada corrida trae un cupo acotado, asi que la primera carga de un comercio
 * con historial largo se completa en varias noches. Eso es deliberado: traer
 * miles de comprobantes de una sola vez chocaria con los limites de AFIP.
 */
const CRON_EXPR = process.env.ARCA_SYNC_CRON || '0 4 * * *'; // 04:00 todos los dias

const ejecutar = async () => {
  try {
    // Sin credencial activa no hay nada que sincronizar: una tienda puede no
    // usar facturacion electronica todavia.
    const credencial = await AfipCredential.findOne({ where: { isActive: true } });
    if (!credencial) {
      logger.debug('ARCA sync: no hay credencial activa, se omite la corrida');
      return;
    }

    logger.info('ARCA sync: iniciando sincronización de comprobantes');
    const resumen = await arcaSyncService.syncFromArca();

    if (resumen.pendientes > 0) {
      logger.info(
        `ARCA sync: quedan ${resumen.pendientes} comprobantes pendientes, ` +
        'se completan en las próximas corridas'
      );
    }
  } catch (error) {
    // Un fallo de ARCA no puede tumbar el servidor ni frenar los demas crons.
    logger.error('ARCA sync: falló la corrida automática:', error.message);
  }
};

const startArcaSyncCron = () => {
  cron.schedule(CRON_EXPR, ejecutar);
  logger.info(`ARCA invoice sync cron job started (${CRON_EXPR})`);
};

module.exports = { startArcaSyncCron, ejecutar };
