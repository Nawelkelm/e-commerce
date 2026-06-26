const { Shipment, ShipmentTracking, Order, OrderItem, Product, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

// Get all shipments with filtering and pagination
const getAllShipments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      carrier,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filters
    if (status) {
      where.status = status;
    }

    if (carrier) {
      where.carrier = { [Op.iLike]: `%${carrier}%` };
    }

    if (search) {
      where[Op.or] = [
        { trackingNumber: { [Op.iLike]: `%${search}%` } },
        { '$order.orderNumber$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    const { count, rows: shipments } = await Shipment.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'total', 'status'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    res.json({
      shipments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching shipments:', error);
    res.status(500).json({ message: 'Error al obtener envíos', error: error.message });
  }
};

// Get shipment by ID
const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await Shipment.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            },
            {
              model: OrderItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'sku', 'images']
                }
              ]
            }
          ]
        },
        {
          model: ShipmentTracking,
          as: 'trackingHistory',
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }

    res.json(shipment);
  } catch (error) {
    logger.error('Error fetching shipment:', error);
    res.status(500).json({ message: 'Error al obtener envío', error: error.message });
  }
};

// Get shipment by tracking number
const getShipmentByTracking = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const shipment = await Shipment.findOne({
      where: { trackingNumber },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'total']
        },
        {
          model: ShipmentTracking,
          as: 'trackingHistory',
          where: { isPublic: true },
          required: false,
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Número de seguimiento no encontrado' });
    }

    // Return only public information for non-admin users
    const publicData = {
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      status: shipment.status,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      deliveredAt: shipment.deliveredAt,
      trackingUrl: shipment.trackingUrl,
      trackingHistory: shipment.trackingHistory
    };

    res.json(publicData);
  } catch (error) {
    logger.error('Error fetching shipment by tracking:', error);
    res.status(500).json({ message: 'Error al obtener información de seguimiento', error: error.message });
  }
};

// Create shipment for an order
const createShipment = async (req, res) => {
  try {
    const {
      orderId,
      trackingNumber,
      carrier,
      carrierService,
      shippingCost,
      weight,
      dimensions,
      packageType,
      numberOfPackages,
      insuranceAmount,
      estimatedDeliveryDate,
      notes,
      trackingUrl,
      signatureRequired
    } = req.body;

    // Verify order exists
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Check if shipment already exists for this order
    const existingShipment = await Shipment.findOne({ where: { orderId } });
    if (existingShipment) {
      return res.status(400).json({ message: 'Ya existe un envío para esta orden' });
    }

    // Create shipment
    const shipment = await Shipment.create({
      orderId,
      trackingNumber,
      carrier,
      carrierService,
      shippingCost: shippingCost || order.shippingAmount,
      weight,
      dimensions,
      shippingAddress: order.shippingAddress,
      estimatedDeliveryDate,
      packageType,
      numberOfPackages,
      insuranceAmount,
      notes,
      trackingUrl,
      signatureRequired,
      status: 'label_created'
    });

    // Create initial tracking event
    await ShipmentTracking.create({
      shipmentId: shipment.id,
      status: 'label_created',
      description: 'Etiqueta de envío creada',
      timestamp: new Date(),
      isPublic: true
    });

    // Update order status if needed
    if (order.status === 'confirmed' || order.status === 'processing') {
      await order.update({ 
        status: 'processing',
        trackingNumber: trackingNumber
      });
    }

    const createdShipment = await Shipment.findByPk(shipment.id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            }
          ]
        },
        {
          model: ShipmentTracking,
          as: 'trackingHistory'
        }
      ]
    });

    res.status(201).json(createdShipment);
  } catch (error) {
    logger.error('Error creating shipment:', error);
    res.status(500).json({ message: 'Error al crear envío', error: error.message });
  }
};

// Update shipment
const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const shipment = await Shipment.findByPk(id);

    if (!shipment) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }

    await shipment.update(updates);

    const updatedShipment = await Shipment.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: ShipmentTracking,
          as: 'trackingHistory',
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    res.json(updatedShipment);
  } catch (error) {
    logger.error('Error updating shipment:', error);
    res.status(500).json({ message: 'Error al actualizar envío', error: error.message });
  }
};

// Update shipment status
const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, description, carrierMessage, isPublic = true } = req.body;

    const shipment = await Shipment.findByPk(id, {
      include: [{ model: Order, as: 'order' }]
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }

    // Update shipment status
    await shipment.update({ status });

    // Handle specific status updates
    if (status === 'delivered') {
      await shipment.update({ deliveredAt: new Date() });
      // Update order status
      if (shipment.order) {
        await shipment.order.update({ 
          status: 'delivered',
          deliveredAt: new Date()
        });
      }
    } else if (status === 'in_transit' && !shipment.shippedAt) {
      await shipment.update({ shippedAt: new Date() });
      // Update order status
      if (shipment.order && shipment.order.status !== 'shipped') {
        await shipment.order.update({ status: 'shipped' });
      }
    } else if (status === 'failed_delivery') {
      await shipment.update({ 
        attemptedDeliveries: shipment.attemptedDeliveries + 1,
        lastAttemptDate: new Date()
      });
    }

    // Create tracking event
    await ShipmentTracking.create({
      shipmentId: shipment.id,
      status,
      location,
      description: description || getStatusDescription(status),
      carrierMessage,
      timestamp: new Date(),
      isPublic
    });

    const updatedShipment = await Shipment.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: ShipmentTracking,
          as: 'trackingHistory',
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    res.json(updatedShipment);
  } catch (error) {
    logger.error('Error updating shipment status:', error);
    res.status(500).json({ message: 'Error al actualizar estado del envío', error: error.message });
  }
};

// Add tracking event
const addTrackingEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, description, carrierMessage, isPublic = true } = req.body;

    const shipment = await Shipment.findByPk(id);

    if (!shipment) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }

    const trackingEvent = await ShipmentTracking.create({
      shipmentId: id,
      status,
      location,
      description,
      carrierMessage,
      timestamp: new Date(),
      isPublic
    });

    res.status(201).json(trackingEvent);
  } catch (error) {
    logger.error('Error adding tracking event:', error);
    res.status(500).json({ message: 'Error al agregar evento de seguimiento', error: error.message });
  }
};

// Get shipment statistics
const getShipmentStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const where = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    const [
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      failedShipments,
      avgDeliveryTime
    ] = await Promise.all([
      Shipment.count({ where }),
      Shipment.count({ where: { ...where, status: 'pending' } }),
      Shipment.count({ where: { ...where, status: 'in_transit' } }),
      Shipment.count({ where: { ...where, status: 'delivered' } }),
      Shipment.count({ where: { ...where, status: 'failed_delivery' } }),
      // Calculate average delivery time (only for delivered shipments)
      Shipment.findAll({
        where: { ...where, status: 'delivered', deliveredAt: { [Op.not]: null } },
        attributes: ['shippedAt', 'deliveredAt']
      })
    ]);

    // Calculate average delivery time in days
    let averageDeliveryDays = 0;
    if (avgDeliveryTime.length > 0) {
      const totalDays = avgDeliveryTime.reduce((sum, shipment) => {
        const shipped = new Date(shipment.shippedAt);
        const delivered = new Date(shipment.deliveredAt);
        const days = (delivered - shipped) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      averageDeliveryDays = totalDays / avgDeliveryTime.length;
    }

    // Get shipments by carrier
    const shipmentsByCarrier = await Shipment.findAll({
      where,
      attributes: [
        'carrier',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['carrier']
    });

    res.json({
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      failedShipments,
      averageDeliveryDays: Math.round(averageDeliveryDays * 10) / 10,
      shipmentsByCarrier
    });
  } catch (error) {
    logger.error('Error fetching shipment stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de envíos', error: error.message });
  }
};

// Helper function to get status description
const getStatusDescription = (status) => {
  const descriptions = {
    'pending': 'Envío pendiente',
    'label_created': 'Etiqueta de envío creada',
    'picked_up': 'Paquete recogido por el transportista',
    'in_transit': 'Paquete en tránsito',
    'out_for_delivery': 'Paquete en reparto',
    'delivered': 'Paquete entregado',
    'failed_delivery': 'Intento de entrega fallido',
    'returned': 'Paquete devuelto',
    'cancelled': 'Envío cancelado'
  };
  return descriptions[status] || status;
};

// Sync shipment tracking with carrier API
const syncShipmentTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const logisticsService = require('../services/logistics/logisticsIntegrationService');

    const result = await logisticsService.syncShipmentTracking(id);

    if (result.success) {
      res.json({
        message: 'Tracking synchronized successfully',
        newEventsCount: result.newEventsCount,
        status: result.status
      });
    } else {
      res.status(400).json({ message: result.message || result.error });
    }
  } catch (error) {
    logger.error('Sync shipment tracking error:', error);
    res.status(500).json({ message: 'Server error syncing tracking' });
  }
};

// Sync all active shipments
const syncAllShipments = async (req, res) => {
  try {
    const logisticsService = require('../services/logistics/logisticsIntegrationService');

    const results = await logisticsService.syncAllActiveShipments();

    res.json({
      message: 'All shipments synchronized',
      results
    });
  } catch (error) {
    logger.error('Sync all shipments error:', error);
    res.status(500).json({ message: 'Server error syncing all shipments' });
  }
};

// Get shipping quote from carrier
const getShippingQuote = async (req, res) => {
  try {
    const { carrier } = req.params;
    const quoteData = req.body;

    const logisticsService = require('../services/logistics/logisticsIntegrationService');

    const quote = await logisticsService.getQuote(carrier, quoteData);

    if (quote.success) {
      res.json(quote);
    } else {
      res.status(400).json({ message: quote.error });
    }
  } catch (error) {
    logger.error('Get shipping quote error:', error);
    res.status(500).json({ message: 'Server error getting quote' });
  }
};

// Get quotes from all carriers
const getAllShippingQuotes = async (req, res) => {
  try {
    const quoteData = req.body;

    const logisticsService = require('../services/logistics/logisticsIntegrationService');

    const quotes = await logisticsService.getAllQuotes(quoteData);

    res.json({ quotes });
  } catch (error) {
    logger.error('Get all shipping quotes error:', error);
    res.status(500).json({ message: 'Server error getting quotes' });
  }
};

// Get available carriers
const getAvailableCarriers = async (req, res) => {
  try {
    const logisticsService = require('../services/logistics/logisticsIntegrationService');

    const carriers = logisticsService.getAvailableCarriers();

    res.json({ carriers });
  } catch (error) {
    logger.error('Get available carriers error:', error);
    res.status(500).json({ message: 'Server error getting carriers' });
  }
};

module.exports = {
  getAllShipments,
  getShipmentById,
  getShipmentByTracking,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  addTrackingEvent,
  getShipmentStats,
  syncShipmentTracking,
  syncAllShipments,
  getShippingQuote,
  getAllShippingQuotes,
  getAvailableCarriers
};
