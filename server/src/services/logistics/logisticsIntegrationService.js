const andreaniService = require('./andreaniService');
const ocaService = require('./ocaService');
const correoArgentinoService = require('./correoArgentinoService');
const logger = require('../../config/logger');
const { Shipment, ShipmentTracking } = require('../../models');
const { Op } = require('sequelize');

class LogisticsIntegrationService {
  constructor() {
    this.providers = {
      'Andreani': andreaniService,
      'OCA': ocaService,
      'Correo Argentino': correoArgentinoService
    };
  }

  /**
   * Obtener el servicio correspondiente al carrier
   */
  getProvider(carrier) {
    const provider = this.providers[carrier];
    if (!provider) {
      throw new Error(`Carrier not supported: ${carrier}`);
    }
    return provider;
  }

  /**
   * Sincronizar tracking de un envío específico
   */
  async syncShipmentTracking(shipmentId) {
    try {
      const shipment = await Shipment.findByPk(shipmentId);
      
      if (!shipment) {
        throw new Error('Shipment not found');
      }

      // Obtener provider según el carrier
      const provider = this.getProvider(shipment.carrier);
      
      // Obtener tracking actualizado de la API del carrier
      const trackingData = await provider.getTracking(shipment.trackingNumber);

      if (!trackingData) {
        logger.warn(`No tracking data found for shipment ${shipmentId}`);
        return { success: false, message: 'No tracking data available' };
      }

      // Actualizar información del shipment
      await shipment.update({
        status: trackingData.status,
        estimatedDeliveryDate: trackingData.estimatedDeliveryDate
      });

      // Obtener eventos existentes
      const existingEvents = await ShipmentTracking.findAll({
        where: { shipmentId: shipment.id }
      });

      const existingEventKeys = new Set(
        existingEvents.map(e => `${e.timestamp.getTime()}-${e.description}`)
      );

      // Agregar solo nuevos eventos
      const newEvents = trackingData.events.filter(event => {
        const eventKey = `${event.timestamp.getTime()}-${event.description}`;
        return !existingEventKeys.has(eventKey);
      });

      if (newEvents.length > 0) {
        await ShipmentTracking.bulkCreate(
          newEvents.map(event => ({
            shipmentId: shipment.id,
            status: event.status,
            location: event.location,
            description: event.description,
            timestamp: event.timestamp,
            carrierMessage: event.carrierMessage,
            isPublic: event.isPublic
          }))
        );

        logger.info(`Added ${newEvents.length} new tracking events for shipment ${shipmentId}`);
      }

      // Si el envío fue entregado, actualizar la orden
      if (trackingData.status === 'delivered' && shipment.orderId) {
        const Order = require('../../models/Order');
        await Order.update(
          { 
            status: 'delivered',
            deliveredAt: new Date()
          },
          { where: { id: shipment.orderId } }
        );
      }

      return {
        success: true,
        newEventsCount: newEvents.length,
        status: trackingData.status
      };
    } catch (error) {
      logger.error(`Error syncing shipment tracking for ${shipmentId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sincronizar tracking de todos los envíos activos
   */
  async syncAllActiveShipments() {
    try {
      // Obtener envíos que no están entregados, cancelados o devueltos
      const activeShipments = await Shipment.findAll({
        where: {
          status: {
            [Op.notIn]: ['delivered', 'cancelled', 'returned']
          }
        }
      });

      logger.info(`Syncing ${activeShipments.length} active shipments...`);

      const results = {
        total: activeShipments.length,
        successful: 0,
        failed: 0,
        newEventsTotal: 0
      };

      for (const shipment of activeShipments) {
        const result = await this.syncShipmentTracking(shipment.id);
        
        if (result.success) {
          results.successful++;
          results.newEventsTotal += result.newEventsCount || 0;
        } else {
          results.failed++;
        }

        // Pequeña pausa entre requests para no saturar las APIs
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      logger.info('Sync completed:', results);

      return results;
    } catch (error) {
      logger.error('Error syncing all shipments:', error);
      throw error;
    }
  }

  /**
   * Crear envío en el sistema del carrier
   */
  async createShipmentInCarrier(carrier, shipmentData) {
    try {
      const provider = this.getProvider(carrier);
      const result = await provider.createShipment(shipmentData);
      
      return result;
    } catch (error) {
      logger.error(`Error creating shipment in ${carrier}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener cotización de envío
   */
  async getQuote(carrier, quoteData) {
    try {
      const provider = this.getProvider(carrier);
      const result = await provider.getQuote(quoteData);
      
      return result;
    } catch (error) {
      logger.error(`Error getting quote from ${carrier}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener cotizaciones de todos los carriers disponibles
   */
  async getAllQuotes(quoteData) {
    const quotes = [];

    for (const [carrierName, provider] of Object.entries(this.providers)) {
      try {
        const quote = await provider.getQuote(quoteData);
        if (quote.success) {
          quotes.push({
            carrier: carrierName,
            ...quote
          });
        }
      } catch (error) {
        logger.error(`Error getting quote from ${carrierName}:`, error);
      }
    }

    return quotes;
  }

  /**
   * Verificar si un carrier está disponible
   */
  isCarrierAvailable(carrier) {
    return !!this.providers[carrier];
  }

  /**
   * Obtener lista de carriers disponibles
   */
  getAvailableCarriers() {
    return Object.keys(this.providers);
  }
}

module.exports = new LogisticsIntegrationService();
