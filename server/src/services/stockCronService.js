const cron = require('node-cron');
const { StockReservationService, StockAlertService } = require('../services/stockService');
const logger = require('../config/logger');

/**
 * Initialize scheduled tasks for stock management
 */
function initializeStockTasks() {
  // Clean expired reservations every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      logger.info('Running scheduled task: Clean expired reservations');
      const count = await StockReservationService.cleanExpiredReservations();
      logger.info(`Cleaned ${count} expired reservations`);
    } catch (error) {
      logger.error('Error in clean expired reservations task:', error);
    }
  });

  // Check expiring batches daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      logger.info('Running scheduled task: Check expiring batches');
      const count = await StockAlertService.checkExpiringBatches(30);
      logger.info(`Checked expiring batches: ${count} alerts created`);
    } catch (error) {
      logger.error('Error in check expiring batches task:', error);
    }
  });

  // Check expiring batches (critical - 7 days) daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('Running scheduled task: Check critical expiring batches');
      const count = await StockAlertService.checkExpiringBatches(7);
      logger.info(`Checked critical expiring batches: ${count} alerts created`);
    } catch (error) {
      logger.error('Error in check critical expiring batches task:', error);
    }
  });

  logger.info('Stock management scheduled tasks initialized');
}

module.exports = { initializeStockTasks };
