const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { auth, adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all suppliers
router.get('/', adminAuth, async (req, res) => {
  try {
    const { isActive, search } = req.query;
    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { contactPerson: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const suppliers = await Supplier.findAll({
      where,
      order: [['name', 'ASC']],
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id'],
        required: false
      }]
    });

    // Add product count to each supplier
    const suppliersWithCount = suppliers.map(supplier => {
      const data = supplier.toJSON();
      data.productCount = data.products ? data.products.length : 0;
      delete data.products;
      return data;
    });

    res.json(suppliersWithCount);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Error al obtener proveedores', error: error.message });
  }
});

// Get supplier by ID
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'sku', 'stock'],
        include: [{
          model: Category,
          as: 'category',
          attributes: ['name']
        }]
      }]
    });
    
    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ message: 'Error al obtener proveedor', error: error.message });
  }
});

// Get supplier products
router.get('/:id/products', adminAuth, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { supplierId: req.params.id },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }],
      order: [['name', 'ASC']]
    });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching supplier products:', error);
    res.status(500).json({ message: 'Error al obtener productos del proveedor', error: error.message });
  }
});

// Get supplier statistics
router.get('/:id/stats', adminAuth, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*)::integer as "totalProducts",
        COALESCE(SUM(stock), 0)::integer as "totalStock",
        COUNT(CASE WHEN stock > 0 THEN 1 END)::integer as "inStockProducts",
        COUNT(CASE WHEN stock = 0 THEN 1 END)::integer as "outOfStockProducts"
      FROM products
      WHERE supplier_id = :supplierId
    `, {
      replacements: { supplierId: req.params.id }
    });
    
    res.json(results[0] || {
      totalProducts: 0,
      totalStock: 0,
      inStockProducts: 0,
      outOfStockProducts: 0
    });
  } catch (error) {
    console.error('Error fetching supplier stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas del proveedor', error: error.message });
  }
});

// Create supplier
router.post('/', adminAuth, async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Error al crear proveedor', error: error.message });
  }
});

// Update supplier
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    await supplier.update(req.body);
    res.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Error al actualizar proveedor', error: error.message });
  }
});

// Delete supplier
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Check if supplier has associated products
    const productCount = await Product.count({
      where: { supplierId: req.params.id }
    });

    if (productCount > 0) {
      return res.status(400).json({ 
        message: `No se puede eliminar el proveedor porque tiene ${productCount} producto(s) asociado(s)` 
      });
    }

    await supplier.destroy();
    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Error al eliminar proveedor', error: error.message });
  }
});

module.exports = router;

