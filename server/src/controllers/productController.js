const { validationResult } = require('express-validator');
const { Product, Category, User, Supplier } = require('../models');
const { Op, col, fn, where: sequelizeWhere } = require('sequelize');
const logger = require('../config/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const excelService = require('../services/excelService');
const { productStorage, getFileUrl, deleteImage } = require('../config/cloudinary');

// Configure multer for image uploads (Cloudinary or local disk - auto-detected)
const upload = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Generate slug from product name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Generate unique SKU
const generateSKU = async () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const sku = `SKU${timestamp}${random}`;
  
  // Check if SKU already exists
  const existingProduct = await Product.findOne({ where: { sku } });
  if (existingProduct) {
    return generateSKU(); // Recursive call if SKU exists
  }
  
  return sku;
};

// Get all products with advanced filtering, sorting, and pagination
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      categories, // Multiple categories (comma-separated)
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      featured,
      inStock,
      onSale, // Products with salePrice
      minStock, // Minimum stock level
      sku // Search by SKU
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true };

    // Filter by single category
    if (category) {
      where.categoryId = category;
    }

    // Filter by multiple categories
    if (categories) {
      const categoryIds = categories.split(',').filter(id => id.trim());
      if (categoryIds.length > 0) {
        where.categoryId = { [Op.in]: categoryIds };
      }
    }

    // Advanced search: name, description, SKU, shortDescription
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Search by specific SKU
    if (sku) {
      where.sku = { [Op.iLike]: `%${sku}%` };
    }

    // Price range filter (considers salePrice if available)
    if (minPrice || maxPrice) {
      const priceConditions = [];
      
      if (minPrice && maxPrice) {
        // Product price OR salePrice within range
        priceConditions.push({
          [Op.or]: [
            { 
              salePrice: { 
                [Op.gte]: parseFloat(minPrice),
                [Op.lte]: parseFloat(maxPrice),
                [Op.not]: null 
              }
            },
            { 
              price: { 
                [Op.gte]: parseFloat(minPrice),
                [Op.lte]: parseFloat(maxPrice)
              },
              salePrice: null
            }
          ]
        });
      } else if (minPrice) {
        priceConditions.push({
          [Op.or]: [
            { salePrice: { [Op.gte]: parseFloat(minPrice), [Op.not]: null } },
            { price: { [Op.gte]: parseFloat(minPrice) }, salePrice: null }
          ]
        });
      } else if (maxPrice) {
        priceConditions.push({
          [Op.or]: [
            { salePrice: { [Op.lte]: parseFloat(maxPrice), [Op.not]: null } },
            { price: { [Op.lte]: parseFloat(maxPrice) }, salePrice: null }
          ]
        });
      }

      if (priceConditions.length > 0) {
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push(...priceConditions);
      }
    }

    // On sale filter (products with salePrice)
    if (onSale === 'true') {
      where.salePrice = { [Op.not]: null };
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push({
        salePrice: { [Op.lt]: col('price') }
      });
    }

    // Featured products filter
    if (featured === 'true') {
      where.isFeatured = true;
    }

    // In stock filter
    if (inStock === 'true' || inStock === true) {
      where.stock = { [Op.gt]: 0 };
    }

    // Minimum stock filter
    if (minStock) {
      where.stock = { [Op.gte]: parseInt(minStock) };
    }

    // Validate sortBy field to prevent SQL injection
    const allowedSortFields = ['name', 'price', 'salePrice', 'createdAt', 'updatedAt', 'stock', 'sortOrder'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const includeModels = [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }
    ];

    // Only include Supplier if table exists
    try {
      await Supplier.describe();
      includeModels.push({
        model: Supplier,
        as: 'supplier',
        attributes: ['id', 'name', 'contactPerson'],
        required: false
      });
    } catch (e) {
      // Supplier table doesn't exist yet, skip
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: includeModels,
      limit: parseInt(limit),
      offset,
      order: [[validSortBy, validSortOrder]],
      attributes: { exclude: ['cost'] } // Hide cost from public
    });

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Get products error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error al cargar productos'
    });
  }
};

// Get single product by slug
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'contactPerson']
        }
      ],
      attributes: { exclude: ['cost'] }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    logger.error('Get product by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new product (Admin only)
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      shortDescription,
      categoryId,
      price,
      salePrice,
      cost,
      stock,
      lowStockThreshold,
      weight,
      dimensions,
      attributes,
      isActive,
      isFeatured,
      isDigital,
      seoTitle,
      seoDescription,
      tags
    } = req.body;

    // Generate slug and SKU
    const slug = generateSlug(name);
    const sku = await generateSKU();

    // Check if product with this slug already exists
    const existingProduct = await Product.findOne({ where: { slug } });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    // Verify category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        url: getFileUrl(file, 'products'),
        alt: `${name} - Image ${index + 1}`,
        isPrimary: index === 0
      }));
    }

    const product = await Product.create({
      name,
      description,
      shortDescription,
      slug,
      sku,
      categoryId,
      price,
      salePrice,
      cost,
      stock: parseInt(stock) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 5,
      weight: weight ? parseFloat(weight) : null,
      dimensions: dimensions ? JSON.parse(dimensions) : null,
      attributes: attributes ? JSON.parse(attributes) : {},
      images,
      isActive: isActive !== 'false',
      isFeatured: isFeatured === 'true',
      isDigital: isDigital === 'true',
      seoTitle,
      seoDescription,
      tags: tags ? JSON.parse(tags) : [],
      createdBy: req.user.id
    });

    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    logger.info(`Product created: ${name} by user ${req.user.id}`);

    res.status(201).json({
      message: 'Product created successfully',
      product: createdProduct
    });
  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Find product
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update slug if name changed
    if (updateData.name && updateData.name !== product.name) {
      updateData.slug = generateSlug(updateData.name);
      
      // Check if new slug already exists
      const existingProduct = await Product.findOne({
        where: { slug: updateData.slug, id: { [Op.ne]: id } }
      });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this name already exists' });
      }
    }

    // Verify category if changed
    if (updateData.categoryId) {
      const category = await Category.findByPk(updateData.categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: getFileUrl(file, 'products'),
        alt: `${updateData.name || product.name} - Image ${index + 1}`,
        isPrimary: false
      }));
      
      // Manejar imágenes existentes
      let existingImages = [];
      if (req.body.existingImages) {
        try {
          existingImages = JSON.parse(req.body.existingImages);
        } catch (error) {
          logger.error('Error parsing existingImages:', error);
          existingImages = [];
        }
      }
      
      // Identificar imágenes eliminadas para borrar de Cloudinary
      const oldImageUrls = (product.images || []).map(img => img.url);
      const keptImageUrls = existingImages.map(img => img.url);
      const deletedImageUrls = oldImageUrls.filter(url => !keptImageUrls.includes(url));
      
      // Eliminar imágenes removidas de Cloudinary
      for (const imageUrl of deletedImageUrls) {
        try {
          await deleteImage(imageUrl);
          logger.info(`Deleted image from Cloudinary: ${imageUrl}`);
        } catch (error) {
          logger.error(`Error deleting image ${imageUrl}:`, error);
        }
      }
      
      // Combinar imágenes existentes con nuevas
      const allImages = [...existingImages, ...newImages];
      
      // Si no hay imagen primaria, hacer la primera como primaria
      if (!allImages.some(img => img.isPrimary) && allImages.length > 0) {
        allImages[0].isPrimary = true;
      }
      
      updateData.images = allImages;
    } else if (req.body.existingImages) {
      // Solo actualizar con imágenes existentes si no hay nuevas
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        
        // Identificar y eliminar imágenes removidas de Cloudinary
        const oldImageUrls = (product.images || []).map(img => img.url);
        const keptImageUrls = existingImages.map(img => img.url);
        const deletedImageUrls = oldImageUrls.filter(url => !keptImageUrls.includes(url));
        
        for (const imageUrl of deletedImageUrls) {
          try {
            await deleteImage(imageUrl);
            logger.info(`Deleted image from Cloudinary: ${imageUrl}`);
          } catch (error) {
            logger.error(`Error deleting image ${imageUrl}:`, error);
          }
        }
        
        updateData.images = existingImages;
      } catch (error) {
        logger.error('Error parsing existingImages:', error);
      }
    }

    // Parse JSON fields
    if (updateData.dimensions) {
      updateData.dimensions = JSON.parse(updateData.dimensions);
    }
    if (updateData.attributes) {
      updateData.attributes = JSON.parse(updateData.attributes);
    }
    if (updateData.tags) {
      updateData.tags = JSON.parse(updateData.tags);
    }

    await Product.update(updateData, { where: { id } });

    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    logger.info(`Product updated: ${id} by user ${req.user.id}`);

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Soft delete - just mark as inactive
    await Product.update({ isActive: false }, { where: { id } });

    logger.info(`Product deleted: ${id} by user ${req.user.id}`);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.findAll({
      where: { isActive: true, isFeatured: true },
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: parseInt(limit),
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      attributes: { exclude: ['cost'] }
    });

    res.json(products);
  } catch (error) {
    logger.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product stock (Admin only)
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.update({ stock: parseInt(stock) }, { where: { id } });

    logger.info(`Stock updated for product ${id}: ${stock} by user ${req.user.id}`);

    res.json({ message: 'Stock updated successfully', stock: parseInt(stock) });
  } catch (error) {
    logger.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search autocomplete/suggestions
const searchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = q.trim();

    // Search for matching products
    const products = await Product.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { sku: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        }
      ],
      attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'images', 'stock'],
      limit: parseInt(limit),
      order: [
        ['name', 'ASC']
      ]
    });

    // Format suggestions
    const suggestions = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.salePrice || product.price,
      image: product.images?.[0]?.url || null,
      category: product.Category?.name || null,
      inStock: product.stock > 0
    }));

    res.json({ 
      suggestions,
      count: suggestions.length 
    });
  } catch (error) {
    logger.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get filter options (for dynamic filters UI)
const getFilterOptions = async (req, res) => {
  try {
    // Get price range
    const priceStats = await Product.findOne({
      where: { isActive: true },
      attributes: [
        [fn('MIN', col('price')), 'minPrice'],
        [fn('MAX', col('price')), 'maxPrice']
      ],
      raw: true
    });

    // Get all active categories with product count
    const categories = await Category.findAll({
      where: { isActive: true },
      include: [
        {
          model: Product,
          where: { isActive: true },
          attributes: [],
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        'slug',
        [fn('COUNT', col('Products.id')), 'productCount']
      ],
      group: ['Category.id'],
      having: sequelizeWhere(
        fn('COUNT', col('Products.id')), 
        { [Op.gt]: 0 }
      ),
      order: [['name', 'ASC']]
    });

    res.json({
      priceRange: {
        min: Math.floor(parseFloat(priceStats?.minPrice || 0)),
        max: Math.ceil(parseFloat(priceStats?.maxPrice || 0))
      },
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: parseInt(cat.dataValues.productCount || 0)
      })),
      sortOptions: [
        { value: 'createdAt:DESC', label: 'Más recientes' },
        { value: 'price:ASC', label: 'Precio: menor a mayor' },
        { value: 'price:DESC', label: 'Precio: mayor a menor' },
        { value: 'name:ASC', label: 'Nombre: A-Z' },
        { value: 'name:DESC', label: 'Nombre: Z-A' }
      ]
    });
  } catch (error) {
    logger.error('Get filter options error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download Excel template
const downloadTemplate = async (req, res) => {
  try {
    const buffer = await excelService.generateTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla-productos.xlsx');
    res.send(buffer);
    
    logger.info(`Excel template downloaded by user ${req.user.id}`);
  } catch (error) {
    logger.error('Download template error:', error);
    res.status(500).json({ message: 'Error al generar plantilla' });
  }
};

// Export products to Excel
const exportToExcel = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filters = categoryId ? { categoryId } : {};
    
    const buffer = await excelService.exportProducts(filters);
    
    const filename = `productos-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
    
    logger.info(`Products exported to Excel by user ${req.user.id}`);
  } catch (error) {
    logger.error('Export to Excel error:', error);
    res.status(500).json({ message: 'Error al exportar productos' });
  }
};

// Configure multer for Excel uploads
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadExcel = multer({
  storage: excelStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.mimetype === 'application/vnd.ms-excel';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
  }
});

// Preview Excel import
const previewImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const filePath = req.file.path;
    
    try {
      const results = await excelService.processImport(filePath);
      
      // Don't delete file yet, save path in session or return it
      res.json({
        message: 'Archivo procesado correctamente',
        preview: {
          total: results.total,
          successCount: results.success.length,
          errorCount: results.errors.length,
          warningCount: results.warnings.length,
          success: results.success.slice(0, 10), // Preview first 10
          errors: results.errors,
          warnings: results.warnings,
          hasMore: results.success.length > 10
        },
        tempFile: path.basename(filePath)
      });
    } catch (error) {
      // Delete file on error
      await fs.unlink(filePath).catch(err => logger.error('Error deleting temp file:', err));
      throw error;
    }
  } catch (error) {
    logger.error('Preview import error:', error);
    res.status(500).json({ 
      message: 'Error al procesar archivo',
      error: error.message 
    });
  }
};

// Confirm and execute import
const confirmImport = async (req, res) => {
  try {
    const { tempFile } = req.body;
    
    if (!tempFile) {
      return res.status(400).json({ message: 'Archivo temporal no especificado' });
    }

    const filePath = path.join('uploads/temp', tempFile);
    
    // Verify file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(400).json({ message: 'Archivo temporal no encontrado o expiró' });
    }

    try {
      const results = await excelService.processImport(filePath);
      
      if (results.errors.length > 0) {
        return res.status(400).json({
          message: 'El archivo contiene errores',
          errors: results.errors
        });
      }

      // Import products
      const imported = [];
      const skipped = [];

      for (const item of results.success) {
        try {
          const productData = item.data;
          
          // Generate slug
          const slug = productData.name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');

          // Generate SKU if not provided
          if (!productData.sku) {
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            productData.sku = `SKU${timestamp}${random}`;
          }

          // Check if product exists by SKU
          const existingProduct = await Product.findOne({
            where: { sku: productData.sku }
          });

          if (existingProduct) {
            // Update existing product
            await Product.update(productData, {
              where: { sku: productData.sku }
            });
            
            imported.push({
              row: item.row,
              name: productData.name,
              action: 'updated'
            });
          } else {
            // Create new product
            await Product.create({
              ...productData,
              slug,
              createdBy: req.user.id,
              images: []
            });
            
            imported.push({
              row: item.row,
              name: productData.name,
              action: 'created'
            });
          }
        } catch (error) {
          logger.error(`Error importing row ${item.row}:`, error);
          skipped.push({
            row: item.row,
            name: item.data.name,
            error: error.message
          });
        }
      }

      // Delete temp file
      await fs.unlink(filePath).catch(err => logger.error('Error deleting temp file:', err));

      logger.info(`Products imported: ${imported.length} by user ${req.user.id}`);

      res.json({
        message: 'Importación completada',
        results: {
          imported: imported.length,
          skipped: skipped.length,
          details: {
            imported,
            skipped,
            warnings: results.warnings
          }
        }
      });
    } catch (error) {
      // Delete file on error
      await fs.unlink(filePath).catch(err => logger.error('Error deleting temp file:', err));
      throw error;
    }
  } catch (error) {
    logger.error('Confirm import error:', error);
    res.status(500).json({ 
      message: 'Error al importar productos',
      error: error.message 
    });
  }
};

// Get low stock products
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { stock: { [Op.lte]: col('lowStockThreshold') } },
          { stock: 0 }
        ]
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['stock', 'ASC']],
      attributes: ['id', 'name', 'slug', 'sku', 'stock', 'lowStockThreshold', 'price', 'images']
    });

    res.json({
      count: products.length,
      products
    });
  } catch (error) {
    logger.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  upload,
  uploadExcel,
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  updateStock,
  searchSuggestions,
  getFilterOptions,
  downloadTemplate,
  exportToExcel,
  previewImport,
  confirmImport,
  getLowStockProducts
};