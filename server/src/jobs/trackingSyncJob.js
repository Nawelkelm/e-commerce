const cron = require('node-cron');
const logisticsIntegrationService = require('../services/logistics/logisticsIntegrationService');
const logger = require('../config/logger');

/**
 * Tarea cron para sincronizar tracking de envíos activos
 * Se ejecuta cada 30 minutos
 */
const startTrackingSyncCron = () => {
  // Ejecutar cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    try {
      logger.info('Starting automatic shipment tracking sync...');
      
      const results = await logisticsIntegrationService.syncAllActiveShipments();
      
      logger.info('Automatic sync completed:', results);
    } catch (error) {
      logger.error('Error in automatic tracking sync:', error);
    }
  });

  logger.info('Tracking sync cron job started (runs every 30 minutes)');
};

/**
 * Sincronización manual inmediata
 */
const runManualSync = async () => {
  try {
    logger.info('Starting manual shipment tracking sync...');
    
    const results = await logisticsIntegrationService.syncAllActiveShipments();
    
    logger.info('Manual sync completed:', results);
    
    return results;
  } catch (error) {
    logger.error('Error in manual tracking sync:', error);
    throw error;
  }
};

module.exports = {
  startTrackingSyncCron,
  runManualSync
};
