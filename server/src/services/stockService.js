const { 
  Product, 
  StockReservation, 
  StockMovement, 
  StockAlert,
  StockLocation,
  ProductBatch 
} = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');
const { sequelize } = require('../config/database');

/**
 * Stock Reservation Service (Feature 1)
 * Manages temporary stock reservations for shopping carts
 */
class StockReservationService {
  /**
   * Reserve stock when item is added to cart
   * @param {string} productId
   * @param {number} quantity
   * @param {string} userId - User ID or session ID
   * @param {boolean} isGuest - If true, userId is treated as sessionId
   * @returns {Promise<StockReservation>}
   */
  static async reserveStock(productId, quantity, userId, isGuest = false) {
    const transaction = await sequelize.transaction();
    
    try {
      // Check available stock
      const product = await Product.findByPk(productId, { transaction });
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Calculate currently reserved stock
      const activeReservations = await StockReservation.sum('quantity', {
        where: {
          productId,
          status: 'active',
          expiresAt: { [Op.gt]: new Date() }
        },
        transaction
      });

      const reservedStock = activeReservations || 0;
      const availableStock = product.stock - reservedStock;

      if (availableStock < quantity) {
        throw new Error(`Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`);
      }

      // Create or update reservation
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const reservationData = {
        productId,
        quantity,
        expiresAt,
        status: 'active'
      };

      if (isGuest) {
        reservationData.sessionId = userId;
      } else {
        reservationData.userId = userId;
      }

      // Check if there's an existing active reservation
      const existingReservation = await StockReservation.findOne({
        where: {
          productId,
          ...(isGuest ? { sessionId: userId } : { userId }),
          status: 'active',
          expiresAt: { [Op.gt]: new Date() }
        },
        transaction
      });

      let reservation;
      if (existingReservation) {
        // Update existing reservation
        reservation = await existingReservation.update({
          quantity: existingReservation.quantity + quantity,
          expiresAt
        }, { transaction });
      } else {
        // Create new reservation
        reservation = await StockReservation.create(reservationData, { transaction });
      }

      await transaction.commit();
      logger.info(`Stock reserved: ${quantity} units of product ${productId}`);
      
      return reservation;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error reserving stock:', error);
      throw error;
    }
  }

  /**
   * Release reservation (when item removed from cart or expired)
   */
  static async releaseReservation(reservationId) {
    try {
      const reservation = await StockReservation.findByPk(reservationId);
      
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      await reservation.update({ status: 'cancelled' });
      
      logger.info(`Stock reservation released: ${reservationId}`);
      
      return reservation;
    } catch (error) {
      logger.error('Error releasing reservation:', error);
      throw error;
    }
  }

  /**
   * Complete reservation (when order is completed)
   */
  static async completeReservation(reservationId, orderId) {
    const transaction = await sequelize.transaction();
    
    try {
      const reservation = await StockReservation.findByPk(reservationId, { transaction });
      
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // Update product stock
      const product = await Product.findByPk(reservation.productId, { transaction });
      await product.update({ 
        stock: product.stock - reservation.quantity 
      }, { transaction });

      // Record stock movement
      await StockMovement.create({
        productId: reservation.productId,
        type: 'sale',
        quantity: -reservation.quantity,
        previousStock: product.stock + reservation.quantity,
        newStock: product.stock,
        referenceType: 'order',
        referenceId: orderId,
        userId: reservation.userId || 'system'
      }, { transaction });

      // Mark reservation as completed
      await reservation.update({ status: 'completed' }, { transaction });

      await transaction.commit();
      logger.info(`Stock reservation completed: ${reservationId}`);
      
      return reservation;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error completing reservation:', error);
      throw error;
    }
  }

  /**
   * Clean up expired reservations (run periodically)
   */
  static async cleanExpiredReservations() {
    try {
      const expiredCount = await StockReservation.update(
        { status: 'expired' },
        {
          where: {
            status: 'active',
            expiresAt: { [Op.lt]: new Date() }
          }
        }
      );

      logger.info(`Expired reservations cleaned: ${expiredCount[0]}`);
      
      return expiredCount[0];
    } catch (error) {
      logger.error('Error cleaning expired reservations:', error);
      throw error;
    }
  }

  /**
   * Get available stock (considering active reservations)
   */
  static async getAvailableStock(productId) {
    try {
      const product = await Product.findByPk(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const reservedStock = await StockReservation.sum('quantity', {
        where: {
          productId,
          status: 'active',
          expiresAt: { [Op.gt]: new Date() }
        }
      }) || 0;

      return {
        totalStock: product.stock,
        reservedStock,
        availableStock: product.stock - reservedStock
      };
    } catch (error) {
      logger.error('Error getting available stock:', error);
      throw error;
    }
  }
}

/**
 * Stock Movement Service (Feature 2)
 * Tracks all stock changes with complete history
 */
class StockMovementService {
  /**
   * Record a stock movement
   */
  static async recordMovement({
    productId,
    type,
    quantity,
    userId,
    unitCost = null,
    reason = null,
    notes = null,
    referenceType = null,
    referenceId = null,
    locationFrom = null,
    locationTo = null
  }) {
    const transaction = await sequelize.transaction();
    
    try {
      const product = await Product.findByPk(productId, { transaction });
      
      if (!product) {
        throw new Error('Product not found');
      }

      const previousStock = product.stock;
      const newStock = previousStock + quantity;

      if (newStock < 0) {
        throw new Error('Insufficient stock for this operation');
      }

      // Update product stock
      await product.update({ stock: newStock }, { transaction });

      // Create movement record
      const movement = await StockMovement.create({
        productId,
        type,
        quantity,
        previousStock,
        newStock,
        unitCost,
        totalCost: unitCost ? Math.abs(quantity) * unitCost : null,
        reason,
        notes,
        referenceType,
        referenceId,
        userId,
        locationFrom,
        locationTo
      }, { transaction });

      // Check if alert needed
      await StockAlertService.checkAndCreateAlerts(productId, transaction);

      await transaction.commit();
      logger.info(`Stock movement recorded: ${type} ${quantity} units for product ${productId}`);
      
      return movement;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error recording stock movement:', error);
      throw error;
    }
  }

  /**
   * Get stock movement history for a product
   */
  static async getProductHistory(productId, options = {}) {
    try {
      const { limit = 50, offset = 0, type = null, startDate = null, endDate = null } = options;

      const where = { productId };

      if (type) {
        where.type = type;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      const movements = await StockMovement.findAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: require('./User'),
            as: 'performer',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      return movements;
    } catch (error) {
      logger.error('Error getting product history:', error);
      throw error;
    }
  }

  /**
   * Get stock movements summary/statistics
   */
  static async getMovementsSummary(productId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const movements = await StockMovement.findAll({
        where: {
          productId,
          createdAt: { [Op.gte]: startDate }
        },
        attributes: [
          'type',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['type']
      });

      return movements;
    } catch (error) {
      logger.error('Error getting movements summary:', error);
      throw error;
    }
  }
}

/**
 * Stock Alert Service (Feature 3)
 * Manages alerts for low stock, out of stock, etc.
 */
class StockAlertService {
  /**
   * Check and create alerts if needed
   */
  static async checkAndCreateAlerts(productId, transaction = null) {
    const t = transaction || await sequelize.transaction();
    const shouldCommit = !transaction;

    try {
      const product = await Product.findByPk(productId, { transaction: t });
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Check for out of stock
      if (product.stock === 0) {
        await this.createAlert({
          productId,
          type: 'out_of_stock',
          severity: 'critical',
          message: `${product.name} está sin stock`,
          currentStock: 0,
          threshold: product.lowStockThreshold
        }, t);
      }
      // Check for low stock
      else if (product.stock <= product.lowStockThreshold) {
        await this.createAlert({
          productId,
          type: 'low_stock',
          severity: 'warning',
          message: `${product.name} tiene stock bajo (${product.stock} unidades)`,
          currentStock: product.stock,
          threshold: product.lowStockThreshold
        }, t);
      } else {
        // Resolve existing alerts if stock is restored
        await StockAlert.update(
          { isResolved: true, resolvedAt: new Date() },
          {
            where: {
              productId,
              type: { [Op.in]: ['low_stock', 'out_of_stock'] },
              isResolved: false
            },
            transaction: t
          }
        );
      }

      if (shouldCommit) {
        await t.commit();
      }
    } catch (error) {
      if (shouldCommit) {
        await t.rollback();
      }
      logger.error('Error checking alerts:', error);
      throw error;
    }
  }

  /**
   * Create an alert
   */
  static async createAlert(alertData, transaction = null) {
    const t = transaction || await sequelize.transaction();
    const shouldCommit = !transaction;

    try {
      // Check if similar unresolved alert exists
      const existingAlert = await StockAlert.findOne({
        where: {
          productId: alertData.productId,
          type: alertData.type,
          isResolved: false
        },
        transaction: t
      });

      if (existingAlert) {
        // Update existing alert
        await existingAlert.update({
          currentStock: alertData.currentStock,
          message: alertData.message,
          updatedAt: new Date()
        }, { transaction: t });

        if (shouldCommit) {
          await t.commit();
        }
        
        return existingAlert;
      }

      // Create new alert
      const alert = await StockAlert.create(alertData, { transaction: t });

      if (shouldCommit) {
        await t.commit();
      }

      logger.info(`Stock alert created: ${alertData.type} for product ${alertData.productId}`);
      
      return alert;
    } catch (error) {
      if (shouldCommit) {
        await t.rollback();
      }
      logger.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Get all active alerts
   */
  static async getActiveAlerts(options = {}) {
    try {
      const { severity = null, type = null, limit = 100 } = options;

      const where = {
        isResolved: false
      };

      if (severity) {
        where.severity = severity;
      }

      if (type) {
        where.type = type;
      }

      const alerts = await StockAlert.findAll({
        where,
        limit,
        order: [
          ['severity', 'DESC'],
          ['createdAt', 'DESC']
        ],
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'slug', 'sku', 'stock', 'lowStockThreshold']
          }
        ]
      });

      return alerts;
    } catch (error) {
      logger.error('Error getting active alerts:', error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(alertId, userId) {
    try {
      const alert = await StockAlert.findByPk(alertId);
      
      if (!alert) {
        throw new Error('Alert not found');
      }

      await alert.update({
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: userId
      });

      logger.info(`Alert resolved: ${alertId} by user ${userId}`);
      
      return alert;
    } catch (error) {
      logger.error('Error resolving alert:', error);
      throw error;
    }
  }

  /**
   * Check expiring batches and create alerts
   */
  static async checkExpiringBatches(daysThreshold = 30) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysThreshold);

      const expiringBatches = await ProductBatch.findAll({
        where: {
          expirationDate: {
            [Op.lte]: futureDate,
            [Op.gte]: new Date()
          },
          status: 'active',
          quantity: { [Op.gt]: 0 }
        },
        include: [
          {
            model: Product,
            attributes: ['id', 'name']
          }
        ]
      });

      for (const batch of expiringBatches) {
        const daysUntilExpiration = batch.daysUntilExpiration;
        
        await this.createAlert({
          productId: batch.productId,
          type: 'expiring_soon',
          severity: daysUntilExpiration <= 7 ? 'critical' : 'warning',
          message: `Lote ${batch.batchNumber} de ${batch.Product.name} vence en ${daysUntilExpiration} días`,
          currentStock: batch.quantity,
          threshold: daysThreshold
        });
      }

      logger.info(`Checked expiring batches: ${expiringBatches.length} found`);
      
      return expiringBatches.length;
    } catch (error) {
      logger.error('Error checking expiring batches:', error);
      throw error;
    }
  }
}

module.exports = {
  StockReservationService,
  StockMovementService,
  StockAlertService
};
