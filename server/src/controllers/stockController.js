const {
  StockReservationService,
  StockMovementService,
  StockAlertService
} = require('../services/stockService');
const { Product, StockLocation, ProductBarcode, ProductBatch, StockMovement, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');
const XLSX = require('xlsx');

/**
 * Get stock movement history (general or for a specific product)
 */
const getStockHistory = async (req, res) => {
  try {
    const { productId, limit, offset, type, startDate, endDate } = req.query;

    // Build query
    const where = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    logger.info('=== Stock History Request ===');
    logger.info('Query params:', req.query);
    logger.info('Where clause:', where);

    const movements = await StockMovement.findAll({
      where,
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'sku', 'images'],
          required: false
        },
        {
          model: User,
          as: 'performer',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    });

    logger.info(`Found ${movements.length} stock movements`);
    res.json(movements);
  } catch (error) {
    logger.error('=== Stock History Error ===');
    logger.error('Error message:', error.message);
    logger.error('Error stack:', error.stack);
    logger.error('Get stock history error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get stock movements summary
 */
const getStockSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.query;

    const summary = await StockMovementService.getMovementsSummary(
      id,
      parseInt(days) || 30
    );

    res.json(summary);
  } catch (error) {
    logger.error('Get stock summary error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Manual stock adjustment
 */
const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason, notes } = req.body;

    if (!quantity || isNaN(quantity)) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const movement = await StockMovementService.recordMovement({
      productId: id,
      type: 'adjustment',
      quantity: parseInt(quantity),
      userId: req.user.id,
      reason,
      notes,
      referenceType: 'manual'
    });

    res.json({
      message: 'Stock adjusted successfully',
      movement
    });
  } catch (error) {
    logger.error('Adjust stock error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get available stock (considering reservations)
 */
const getAvailableStock = async (req, res) => {
  try {
    const { id } = req.params;

    const stockInfo = await StockReservationService.getAvailableStock(id);

    res.json(stockInfo);
  } catch (error) {
    logger.error('Get available stock error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get all active stock alerts
 */
const getStockAlerts = async (req, res) => {
  try {
    const { severity, type, limit } = req.query;

    const alerts = await StockAlertService.getActiveAlerts({
      severity,
      type,
      limit: parseInt(limit) || 100
    });

    res.json({
      count: alerts.length,
      alerts
    });
  } catch (error) {
    logger.error('Get stock alerts error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Resolve a stock alert
 */
const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await StockAlertService.resolveAlert(id, req.user.id);

    res.json({
      message: 'Alert resolved successfully',
      alert
    });
  } catch (error) {
    logger.error('Resolve alert error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get stock locations for a product
 */
const getStockLocations = async (req, res) => {
  try {
    const { id } = req.params;

    const locations = await StockLocation.findAll({
      where: { productId: id, isActive: true },
      order: [['isPrimary', 'DESC'], ['locationName', 'ASC']]
    });

    const totalStock = locations.reduce((sum, loc) => sum + loc.quantity, 0);
    const totalReserved = locations.reduce((sum, loc) => sum + loc.reservedQuantity, 0);

    res.json({
      locations,
      summary: {
        totalStock,
        totalReserved,
        totalAvailable: totalStock - totalReserved,
        locationCount: locations.length
      }
    });
  } catch (error) {
    logger.error('Get stock locations error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Add or update stock location
 */
const updateStockLocation = async (req, res) => {
  try {
    const { id } = req.params; // product ID
    const { locationCode, locationName, quantity, address, isPrimary } = req.body;

    if (!locationCode || !locationName) {
      return res.status(400).json({ message: 'Location code and name are required' });
    }

    const [location, created] = await StockLocation.findOrCreate({
      where: {
        productId: id,
        locationCode
      },
      defaults: {
        productId: id,
        locationCode,
        locationName,
        quantity: parseInt(quantity) || 0,
        address,
        isPrimary: isPrimary || false
      }
    });

    if (!created) {
      await location.update({
        locationName,
        quantity: parseInt(quantity),
        address,
        isPrimary
      });
    }

    res.json({
      message: created ? 'Location created successfully' : 'Location updated successfully',
      location
    });
  } catch (error) {
    logger.error('Update stock location error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get product barcodes
 */
const getProductBarcodes = async (req, res) => {
  try {
    const { id } = req.params;

    const barcodes = await ProductBarcode.findAll({
      where: { productId: id, isActive: true },
      order: [['isPrimary', 'DESC'], ['createdAt', 'ASC']]
    });

    res.json(barcodes);
  } catch (error) {
    logger.error('Get product barcodes error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Add barcode to product
 */
const addBarcode = async (req, res) => {
  try {
    const { id } = req.params;
    const { barcode, barcodeType, isPrimary } = req.body;

    if (!barcode) {
      return res.status(400).json({ message: 'Barcode is required' });
    }

    // Check if barcode already exists
    const existing = await ProductBarcode.findOne({
      where: { barcode }
    });

    if (existing) {
      return res.status(400).json({ message: 'Barcode already exists' });
    }

    // If setting as primary, remove primary from others
    if (isPrimary) {
      await ProductBarcode.update(
        { isPrimary: false },
        { where: { productId: id } }
      );
    }

    const productBarcode = await ProductBarcode.create({
      productId: id,
      barcode,
      barcodeType: barcodeType || 'EAN13',
      isPrimary: isPrimary || false
    });

    res.status(201).json({
      message: 'Barcode added successfully',
      barcode: productBarcode
    });
  } catch (error) {
    logger.error('Add barcode error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Search product by barcode
 */
const searchByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const productBarcode = await ProductBarcode.findOne({
      where: { barcode, isActive: true },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'slug', 'sku', 'price', 'stock', 'images']
        }
      ]
    });

    if (!productBarcode) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(productBarcode.Product);
  } catch (error) {
    logger.error('Search by barcode error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get product batches
 */
const getProductBatches = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, includeExpired } = req.query;

    const where = { productId: id };

    if (status) {
      where.status = status;
    } else if (!includeExpired) {
      where.status = { [Op.ne]: 'expired' };
    }

    const batches = await ProductBatch.findAll({
      where,
      order: [['expirationDate', 'ASC'], ['createdAt', 'DESC']]
    });

    // Separate active, expiring soon, and expired
    const categorized = {
      active: [],
      expiring: [],
      expired: [],
      depleted: []
    };

    batches.forEach(batch => {
      if (batch.status === 'depleted') {
        categorized.depleted.push(batch);
      } else if (batch.isExpired) {
        categorized.expired.push(batch);
      } else if (batch.isExpiringSoon) {
        categorized.expiring.push(batch);
      } else {
        categorized.active.push(batch);
      }
    });

    res.json({
      batches,
      categorized,
      summary: {
        total: batches.length,
        active: categorized.active.length,
        expiring: categorized.expiring.length,
        expired: categorized.expired.length,
        depleted: categorized.depleted.length
      }
    });
  } catch (error) {
    logger.error('Get product batches error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Add new batch
 */
const addBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      batchNumber,
      quantity,
      manufactureDate,
      expirationDate,
      supplierName,
      supplierReference,
      purchaseCost,
      locationCode,
      notes,
      isPerishable
    } = req.body;

    if (!batchNumber || !quantity) {
      return res.status(400).json({ message: 'Batch number and quantity are required' });
    }

    // Check if batch number already exists for this product
    const existing = await ProductBatch.findOne({
      where: { productId: id, batchNumber }
    });

    if (existing) {
      return res.status(400).json({ message: 'Batch number already exists for this product' });
    }

    const batch = await ProductBatch.create({
      productId: id,
      batchNumber,
      quantity: parseInt(quantity),
      initialQuantity: parseInt(quantity),
      manufactureDate,
      expirationDate,
      supplierName,
      supplierReference,
      purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
      totalCost: purchaseCost ? parseFloat(purchaseCost) * parseInt(quantity) : null,
      locationCode,
      notes,
      isPerishable: isPerishable || false,
      status: 'active'
    });

    // Record stock movement
    await StockMovementService.recordMovement({
      productId: id,
      type: 'purchase',
      quantity: parseInt(quantity),
      userId: req.user.id,
      unitCost: purchaseCost ? parseFloat(purchaseCost) : null,
      reason: `New batch: ${batchNumber}`,
      notes: `Supplier: ${supplierName || 'N/A'}`,
      referenceType: 'other',
      referenceId: batch.id
    });

    res.status(201).json({
      message: 'Batch added successfully',
      batch
    });
  } catch (error) {
    logger.error('Add batch error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Update batch quantity
 */
const updateBatchQuantity = async (req, res) => {
  try {
    const { id, batchId } = req.params;
    const { quantity, reason } = req.body;

    const batch = await ProductBatch.findOne({
      where: { id: batchId, productId: id }
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const previousQuantity = batch.quantity;
    const newQuantity = parseInt(quantity);
    const difference = newQuantity - previousQuantity;

    await batch.update({ 
      quantity: newQuantity,
      status: newQuantity === 0 ? 'depleted' : batch.status
    });

    // Record stock movement
    if (difference !== 0) {
      await StockMovementService.recordMovement({
        productId: id,
        type: 'adjustment',
        quantity: difference,
        userId: req.user.id,
        reason: reason || `Batch ${batch.batchNumber} adjusted`,
        referenceType: 'other',
        referenceId: batchId
      });
    }

    res.json({
      message: 'Batch quantity updated successfully',
      batch
    });
  } catch (error) {
    logger.error('Update batch quantity error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Export stock movement history to Excel
 */
const exportStockHistory = async (req, res) => {
  try {
    const { productId, type, startDate, endDate } = req.query;

    // Build query
    const where = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Get movements
    const movements = await StockMovement.findAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'sku']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5000 // Maximum 5000 records
    });

    // Prepare data for Excel
    const data = movements.map(m => ({
      'Fecha': new Date(m.createdAt).toLocaleString('es-ES'),
      'Producto': m.product?.name || 'N/A',
      'SKU': m.product?.sku || 'N/A',
      'Tipo': m.type,
      'Cantidad': m.quantity,
      'Stock Anterior': m.previousStock,
      'Stock Nuevo': m.newStock,
      'Costo Unitario': m.unitCost || 0,
      'Costo Total': m.totalCost || 0,
      'Usuario': m.user?.name || 'Sistema',
      'Referencia': m.referenceType ? `${m.referenceType}: ${m.referenceId}` : '',
      'Notas': m.notes || ''
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Fecha
      { wch: 30 }, // Producto
      { wch: 15 }, // SKU
      { wch: 20 }, // Tipo
      { wch: 10 }, // Cantidad
      { wch: 15 }, // Stock Anterior
      { wch: 15 }, // Stock Nuevo
      { wch: 12 }, // Costo Unitario
      { wch: 12 }, // Costo Total
      { wch: 20 }, // Usuario
      { wch: 25 }, // Referencia
      { wch: 30 }  // Notas
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=movimientos_stock_${Date.now()}.xlsx`);

    res.send(buffer);
  } catch (error) {
    logger.error('Export stock history error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getStockHistory,
  getStockSummary,
  adjustStock,
  getAvailableStock,
  getStockAlerts,
  resolveAlert,
  getStockLocations,
  updateStockLocation,
  getProductBarcodes,
  addBarcode,
  searchByBarcode,
  getProductBatches,
  addBatch,
  updateBatchQuantity,
  exportStockHistory
};
