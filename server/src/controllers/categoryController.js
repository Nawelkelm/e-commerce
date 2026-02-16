const { validationResult } = require('express-validator');
const { Category } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

// Generate slug from category name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;
    
    const where = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await Category.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug, isActive: true }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    logger.error('Get category by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new category (Admin only)
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, imageUrl, isActive, sortOrder } = req.body;

    // Generate slug
    const slug = generateSlug(name);

    // Check if category with this slug already exists
    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      name,
      description,
      slug,
      imageUrl,
      isActive: isActive !== false,
      sortOrder: parseInt(sortOrder) || 0
    });

    logger.info(`Category created: ${name} by user ${req.user.id}`);

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    logger.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update slug if name changed
    if (updateData.name && updateData.name !== category.name) {
      updateData.slug = generateSlug(updateData.name);
      
      // Check if new slug already exists
      const existingCategory = await Category.findOne({
        where: { slug: updateData.slug, id: { [Op.ne]: id } }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    await Category.update(updateData, { where: { id } });

    const updatedCategory = await Category.findByPk(id);

    logger.info(`Category updated: ${id} by user ${req.user.id}`);

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    logger.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const { Product } = require('../models');
    const productCount = await Product.count({ where: { categoryId: id } });
    
    if (productCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with associated products',
        productCount
      });
    }

    await Category.destroy({ where: { id } });

    logger.info(`Category deleted: ${id} by user ${req.user.id}`);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};