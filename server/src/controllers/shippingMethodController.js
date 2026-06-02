const ShippingMethod = require('../models/ShippingMethod');
const LogisticsCredentials = require('../models/LogisticsCredentials');
const logisticsIntegrationService = require('../services/logistics/logisticsIntegrationService');
const logger = require('../config/logger');
const { decrypt } = require('./logisticsCredentialsController');

// Get all shipping methods (public - for checkout)
const getAllShippingMethods = async (req, res) => {
  try {
    const methods = await ShippingMethod.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({ methods });
  } catch (error) {
    logger.error('Get shipping methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get shipping quote (public)
const getShippingQuote = async (req, res) => {
  try {
    const { 
      postalCode, 
      city, 
      state,
      items, 
      subtotal 
    } = req.body;

    if (!postalCode || !items || items.length === 0) {
      return res.status(400).json({ message: 'Postal code and items are required' });
    }

    // Obtener métodos activos
    const methods = await ShippingMethod.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC']]
    });

    const quotes = [];

    for (const method of methods) {
      let quote = {
        id: method.id,
        name: method.name,
        code: method.code,
        type: method.type,
        description: method.description,
        estimatedDays: method.estimatedDays,
        requiresAddress: method.requiresAddress,
        pickupAddress: method.pickupAddress
      };

      // Verificar zona (si aplica)
      if (method.zones && method.zones.length > 0) {
        const inZone = checkIfInZone(postalCode, city, state, method.zones);
        if (!inZone) continue;
      }

      // Calcular precio según tipo
      if (method.type === 'carrier') {
        // Cotizar con API del carrier
        try {
          const carrierQuote = await getCarrierQuote(method.carrier, {
            destinationPostalCode: postalCode,
            items
          });

          if (carrierQuote.success) {
            quote.price = carrierQuote.price;
            quote.currency = carrierQuote.currency || 'ARS';
            quote.estimatedDays = carrierQuote.estimatedDays || method.estimatedDays;
          } else {
            // Si falla, no incluir este método
            continue;
          }
        } catch (error) {
          logger.error(`Error getting quote from ${method.carrier}:`, error);
          continue;
        }
      } else {
        // Método personalizado/pickup/agreement
        if (method.type === 'agreement') {
          // Para "Acordar con vendedor", precio variable
          quote.price = null;
          quote.description = 'El precio se coordinará directamente con el vendedor';
        } else if (method.isFree) {
          quote.price = 0;
          quote.isFree = true;
        } else if (method.freeFromAmount && subtotal >= parseFloat(method.freeFromAmount)) {
          quote.price = 0;
          quote.isFree = true;
          quote.freeFromAmount = method.freeFromAmount;
        } else {
          quote.price = parseFloat(method.price || 0);
        }
        quote.currency = 'ARS';
      }

      quotes.push(quote);
    }

    res.json({ quotes });
  } catch (error) {
    logger.error('Get shipping quote error:', error);
    res.status(500).json({ message: 'Server error getting quote' });
  }
};

// Helper: Verificar si está en zona
const checkIfInZone = (postalCode, city, state, zones) => {
  for (const zone of zones) {
    // Rango de códigos postales (ej: "1000-1999")
    if (zone.includes('-')) {
      const [start, end] = zone.split('-').map(Number);
      const code = parseInt(postalCode);
      if (code >= start && code <= end) return true;
    }
    // Nombre de ciudad o provincia
    else if (
      zone.toLowerCase() === city?.toLowerCase() ||
      zone.toLowerCase() === state?.toLowerCase() ||
      zone.toLowerCase() === postalCode
    ) {
      return true;
    }
  }
  return false;
};

// Helper: Obtener cotización de carrier
const getCarrierQuote = async (carrier, quoteData) => {
  try {
    // Verificar que el carrier esté activo
    const credentials = await LogisticsCredentials.findOne({
      where: { carrier, isActive: true }
    });

    if (!credentials) {
      return { success: false, error: 'Carrier not active' };
    }

    // Preparar datos para cotización
    // weight viene en gramos desde el frontend → convertir a kg para OCA
    const packages = quoteData.items.map(item => {
      const weightGrams = parseFloat(item.weight) || 500;
      const weightKg = weightGrams >= 100 ? weightGrams / 1000 : weightGrams; // si >= 100 asumimos gramos
      // dimensions puede venir anidado { length, width, height } o plano
      const dims = item.dimensions || {};
      return {
        weight: Math.max(0.1, weightKg),
        height: parseFloat(item.height || dims.height) || 10,
        width: parseFloat(item.width || dims.width) || 10,
        length: parseFloat(item.length || dims.length) || 20
      };
    });

    const quote = await logisticsIntegrationService.getQuote(carrier, {
      originPostalCode: process.env.ORIGIN_POSTAL_CODE || '1000',
      destinationPostalCode: quoteData.destinationPostalCode,
      packages
    });

    return quote;
  } catch (error) {
    logger.error(`Error getting carrier quote from ${carrier}:`, error);
    return { success: false, error: error.message };
  }
};

// Admin: Get all shipping methods
const adminGetAllMethods = async (req, res) => {
  try {
    const methods = await ShippingMethod.findAll({
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({ methods });
  } catch (error) {
    logger.error('Admin get shipping methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Create shipping method
const createShippingMethod = async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      carrier,
      description,
      price,
      isFree,
      freeFromAmount,
      estimatedDays,
      zones,
      restrictions,
      requiresAddress,
      pickupAddress,
      icon,
      displayOrder,
      isActive
    } = req.body;

    // Validar campos requeridos
    if (!name || !code || !type) {
      return res.status(400).json({ message: 'Name, code and type are required' });
    }

    // Validar tipo carrier
    if (type === 'carrier' && !carrier) {
      return res.status(400).json({ message: 'Carrier is required for carrier type' });
    }

    // Validar código único
    const existing = await ShippingMethod.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: 'Code already exists' });
    }

    const method = await ShippingMethod.create({
      name,
      code,
      type,
      carrier,
      description,
      price,
      isFree: isFree || false,
      freeFromAmount,
      estimatedDays,
      zones: zones || [],
      restrictions: restrictions || {},
      requiresAddress: requiresAddress !== undefined ? requiresAddress : true,
      pickupAddress,
      icon,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    logger.info(`Shipping method created: ${method.code}`);
    res.status(201).json({ method });
  } catch (error) {
    logger.error('Create shipping method error:', error);
    res.status(500).json({ message: 'Server error creating shipping method' });
  }
};

// Admin: Update shipping method
const updateShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const method = await ShippingMethod.findByPk(id);
    if (!method) {
      return res.status(404).json({ message: 'Shipping method not found' });
    }

    // Validar código único si se está cambiando
    if (updates.code && updates.code !== method.code) {
      const existing = await ShippingMethod.findOne({ 
        where: { code: updates.code } 
      });
      if (existing) {
        return res.status(400).json({ message: 'Code already exists' });
      }
    }

    await method.update(updates);

    logger.info(`Shipping method updated: ${method.code}`);
    res.json({ method });
  } catch (error) {
    logger.error('Update shipping method error:', error);
    res.status(500).json({ message: 'Server error updating shipping method' });
  }
};

// Admin: Delete shipping method
const deleteShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const method = await ShippingMethod.findByPk(id);
    if (!method) {
      return res.status(404).json({ message: 'Shipping method not found' });
    }

    await method.destroy();

    logger.info(`Shipping method deleted: ${method.code}`);
    res.json({ message: 'Shipping method deleted successfully' });
  } catch (error) {
    logger.error('Delete shipping method error:', error);
    res.status(500).json({ message: 'Server error deleting shipping method' });
  }
};

// Admin: Toggle active status
const toggleMethodActive = async (req, res) => {
  try {
    const { id } = req.params;

    const method = await ShippingMethod.findByPk(id);
    if (!method) {
      return res.status(404).json({ message: 'Shipping method not found' });
    }

    await method.update({ isActive: !method.isActive });

    res.json({ 
      message: `Shipping method ${method.isActive ? 'activated' : 'deactivated'}`,
      isActive: method.isActive 
    });
  } catch (error) {
    logger.error('Toggle method active error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllShippingMethods,
  getShippingQuote,
  adminGetAllMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  toggleMethodActive
};
