const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs').promises;
const { Product, Category } = require('../models');
const logger = require('../config/logger');

// Columns for the Excel template/import
const EXCEL_COLUMNS = [
  { header: 'SKU', key: 'sku', width: 15 },
  { header: 'Nombre', key: 'name', width: 30 },
  { header: 'Descripción Corta', key: 'shortDescription', width: 40 },
  { header: 'Categoría', key: 'categoryName', width: 20 },
  { header: 'Precio', key: 'price', width: 12 },
  { header: 'Precio Oferta', key: 'salePrice', width: 12 },
  { header: 'Costo', key: 'cost', width: 12 },
  { header: 'Stock', key: 'stock', width: 10 },
  { header: 'Stock Mínimo', key: 'lowStockThreshold', width: 12 },
  { header: 'Peso (kg)', key: 'weight', width: 10 },
  { header: 'Activo', key: 'isActive', width: 10 },
  { header: 'Destacado', key: 'isFeatured', width: 10 }
];

/**
 * Generate Excel template for product import
 */
const generateTemplate = async () => {
  try {
    // Get all categories for reference
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['name'],
      order: [['name', 'ASC']]
    });

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create main sheet with headers and example data
    const wsData = [
      EXCEL_COLUMNS.map(col => col.header),
      [
        'SKU123456789',
        'Producto Ejemplo',
        'Descripción breve del producto',
        categories.length > 0 ? categories[0].name : 'Electrónica',
        '19990',
        '15990',
        '10000',
        '50',
        '10',
        '0.5',
        'SI',
        'NO'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = EXCEL_COLUMNS.map(col => ({ wch: col.width }));

    // Add the main sheet
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');

    // Create instructions sheet
    const instructionsData = [
      ['INSTRUCCIONES PARA IMPORTAR PRODUCTOS'],
      [],
      ['Columnas requeridas:'],
      ['- SKU: Código único del producto (si está vacío, se genera automáticamente)'],
      ['- Nombre: Nombre del producto (REQUERIDO)'],
      ['- Categoría: Nombre exacto de la categoría (debe existir previamente)'],
      ['- Precio: Precio de venta (REQUERIDO, sin puntos ni comas)'],
      ['- Stock: Cantidad disponible (REQUERIDO)'],
      [],
      ['Columnas opcionales:'],
      ['- Descripción Corta: Descripción breve del producto'],
      ['- Precio Oferta: Precio con descuento (debe ser menor al precio normal)'],
      ['- Costo: Costo de adquisición del producto'],
      ['- Stock Mínimo: Nivel de stock para alertas (por defecto: 5)'],
      ['- Peso: Peso en kilogramos'],
      ['- Activo: SI/NO (por defecto: SI)'],
      ['- Destacado: SI/NO para mostrar en home (por defecto: NO)'],
      [],
      ['Notas importantes:'],
      ['- Los precios deben ser números enteros sin puntos ni comas (ej: 19990)'],
      ['- Las categorías deben existir previamente en el sistema'],
      ['- SI/NO se pueden escribir como: SI, SÍ, YES, 1, VERDADERO, TRUE'],
      ['- Filas vacías o con errores se omitirán y aparecerán en el reporte'],
      [],
      ['Categorías disponibles:'],
      ...categories.map(cat => [cat.name])
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instrucciones');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  } catch (error) {
    logger.error('Error generating Excel template:', error);
    throw error;
  }
};

/**
 * Export current products to Excel
 */
const exportProducts = async (filters = {}) => {
  try {
    const where = { isActive: true };

    // Apply filters if provided
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    const products = await Product.findAll({
      where,
      include: [
        {
          model: Category,
          attributes: ['name']
        }
      ],
      order: [['name', 'ASC']]
    });

    // Prepare data
    const wsData = [
      EXCEL_COLUMNS.map(col => col.header),
      ...products.map(product => [
        product.sku,
        product.name,
        product.shortDescription || '',
        product.Category?.name || '',
        product.price,
        product.salePrice || '',
        product.cost || '',
        product.stock,
        product.lowStockThreshold,
        product.weight || '',
        product.isActive ? 'SI' : 'NO',
        product.isFeatured ? 'SI' : 'NO'
      ])
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = EXCEL_COLUMNS.map(col => ({ wch: col.width }));

    XLSX.utils.book_append_sheet(wb, ws, 'Productos');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  } catch (error) {
    logger.error('Error exporting products:', error);
    throw error;
  }
};

/**
 * Parse boolean values from Excel
 */
const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.toUpperCase().trim();
    return ['SI', 'SÍ', 'YES', 'TRUE', 'VERDADERO', '1'].includes(normalized);
  }
  return false;
};

/**
 * Validate and parse Excel row
 */
const validateRow = async (row, rowIndex, categoriesMap) => {
  const errors = [];

  // Required fields
  if (!row.name || row.name.trim() === '') {
    errors.push(`Fila ${rowIndex}: Nombre es requerido`);
  }

  if (!row.price || isNaN(parseFloat(row.price))) {
    errors.push(`Fila ${rowIndex}: Precio inválido`);
  }

  if (row.stock === undefined || row.stock === null || isNaN(parseInt(row.stock))) {
    errors.push(`Fila ${rowIndex}: Stock es requerido`);
  }

  // Category validation
  let categoryId = null;
  if (row.categoryName) {
    categoryId = categoriesMap[row.categoryName.trim().toLowerCase()];
    if (!categoryId) {
      errors.push(`Fila ${rowIndex}: Categoría "${row.categoryName}" no encontrada`);
    }
  }

  // Price validations
  if (row.salePrice && parseFloat(row.salePrice) >= parseFloat(row.price)) {
    errors.push(`Fila ${rowIndex}: Precio de oferta debe ser menor al precio normal`);
  }

  if (row.cost && parseFloat(row.cost) >= parseFloat(row.price)) {
    errors.push(`Fila ${rowIndex}: El costo es mayor o igual al precio de venta`);
  }

  // Stock validation
  if (parseInt(row.stock) < 0) {
    errors.push(`Fila ${rowIndex}: Stock no puede ser negativo`);
  }

  return { errors, categoryId };
};

/**
 * Process Excel file for import
 */
const processImport = async (filePath) => {
  try {
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (rawData.length === 0) {
      throw new Error('El archivo Excel está vacío');
    }

    // Get all categories for mapping
    const categories = await Category.findAll({
      where: { isActive: true }
    });

    const categoriesMap = {};
    categories.forEach(cat => {
      categoriesMap[cat.name.toLowerCase()] = cat.id;
    });

    // Process rows
    const results = {
      success: [],
      errors: [],
      warnings: [],
      total: rawData.length
    };

    for (let i = 0; i < rawData.length; i++) {
      const rawRow = rawData[i];
      const rowIndex = i + 2; // +2 because Excel is 1-indexed and we have a header

      // Map columns (handle different possible column names)
      const row = {
        sku: rawRow['SKU'] || rawRow['sku'],
        name: rawRow['Nombre'] || rawRow['nombre'] || rawRow['Name'],
        shortDescription: rawRow['Descripción Corta'] || rawRow['descripcion_corta'] || rawRow['Short Description'],
        categoryName: rawRow['Categoría'] || rawRow['categoria'] || rawRow['Category'],
        price: rawRow['Precio'] || rawRow['precio'] || rawRow['Price'],
        salePrice: rawRow['Precio Oferta'] || rawRow['precio_oferta'] || rawRow['Sale Price'],
        cost: rawRow['Costo'] || rawRow['costo'] || rawRow['Cost'],
        stock: rawRow['Stock'] || rawRow['stock'],
        lowStockThreshold: rawRow['Stock Mínimo'] || rawRow['stock_minimo'] || rawRow['Low Stock Threshold'] || 5,
        weight: rawRow['Peso (kg)'] || rawRow['peso'] || rawRow['Weight'],
        isActive: rawRow['Activo'] || rawRow['activo'] || rawRow['Active'],
        isFeatured: rawRow['Destacado'] || rawRow['destacado'] || rawRow['Featured']
      };

      // Skip completely empty rows
      if (!row.name && !row.price && !row.stock) {
        continue;
      }

      // Validate row
      const { errors, categoryId } = await validateRow(row, rowIndex, categoriesMap);

      if (errors.length > 0) {
        results.errors.push(...errors);
        continue;
      }

      // Prepare product data
      const productData = {
        name: row.name.trim(),
        shortDescription: row.shortDescription ? row.shortDescription.trim() : null,
        categoryId: categoryId,
        price: parseFloat(row.price),
        salePrice: row.salePrice ? parseFloat(row.salePrice) : null,
        cost: row.cost ? parseFloat(row.cost) : null,
        stock: parseInt(row.stock),
        lowStockThreshold: parseInt(row.lowStockThreshold),
        weight: row.weight ? parseFloat(row.weight) : null,
        isActive: row.isActive !== undefined ? parseBoolean(row.isActive) : true,
        isFeatured: row.isFeatured !== undefined ? parseBoolean(row.isFeatured) : false,
        sku: row.sku ? row.sku.trim() : null
      };

      // Check for low stock warning
      if (productData.stock <= productData.lowStockThreshold) {
        results.warnings.push(
          `Fila ${rowIndex}: "${productData.name}" tiene stock bajo (${productData.stock} <= ${productData.lowStockThreshold})`
        );
      }

      results.success.push({
        row: rowIndex,
        data: productData
      });
    }

    return results;
  } catch (error) {
    logger.error('Error processing Excel import:', error);
    throw error;
  }
};

module.exports = {
  generateTemplate,
  exportProducts,
  processImport,
  EXCEL_COLUMNS
};
