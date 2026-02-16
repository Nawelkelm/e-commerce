const { validationResult } = require('express-validator');
const { User, Order, Product } = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');
const { Op } = require('sequelize');

// Get all users (Admin only)
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Search by name or email
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single user (Admin only)
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Order,
          attributes: ['id', 'orderNumber', 'status', 'paymentStatus', 'total', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const totalOrders = await Order.count({ where: { userId: id } });
    const totalSpent = await Order.sum('total', { 
      where: { 
        userId: id, 
        paymentStatus: 'paid' 
      } 
    });

    const userWithStats = {
      ...user.toJSON(),
      statistics: {
        totalOrders,
        totalSpent: totalSpent || 0
      }
    };

    res.json(userWithStats);
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create user (Admin only)
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      role = 'customer',
      isActive = true
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
      isActive
    });

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    logger.info(`User created: ${email} by admin ${req.user.id}`);

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove password from update data if empty
    if (updateData.password && updateData.password.trim() === '') {
      delete updateData.password;
    }

    // Hash password if provided
    if (updateData.password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is changing and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email: updateData.email, 
          id: { [Op.ne]: id } 
        } 
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    await User.update(updateData, { where: { id } });

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    logger.info(`User updated: ${id} by admin ${req.user.id}`);

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (Admin only) - Soft delete
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Soft delete - deactivate user
    await User.update({ isActive: false }, { where: { id } });

    logger.info(`User deactivated: ${id} by admin ${req.user.id}`);

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile (User can update their own profile)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // El usuario autenticado
    const { 
      firstName, 
      lastName, 
      phone, 
      address,
      shippingAddress,
      billingAddress
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Campos que el usuario puede actualizar
    const updateData = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
    if (billingAddress !== undefined) updateData.billingAddress = billingAddress;

    await user.update(updateData);

    // Devolver usuario sin password
    const { password, ...userWithoutPassword } = user.toJSON();

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
};

// Get dashboard statistics (Admin only) - Simplified version
const getDashboardStats = async (req, res) => {
  try {
    const { sequelize, Op } = require('../config/database');
    const { Order, Product } = require('../models');

    // Definir períodos de tiempo
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // 1. Total de usuarios
    const totalUsers = await User.count();
    
    // Usuarios del mes actual
    const usersThisMonth = await User.count({
      where: {
        createdAt: { [Op.gte]: startOfThisMonth }
      }
    });

    // Usuarios del mes anterior
    const usersLastMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startOfLastMonth,
          [Op.lt]: startOfThisMonth
        }
      }
    });

    // Crecimiento de usuarios
    const userGrowth = usersLastMonth > 0 
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1)
      : 0;

    // 2. Total de órdenes (excluyendo canceladas)
    const totalOrders = await Order.count({
      where: {
        status: { [Op.notIn]: ['cancelled'] }
      }
    });

    // Órdenes del mes actual
    const ordersThisMonth = await Order.count({
      where: {
        status: { [Op.notIn]: ['cancelled'] },
        createdAt: { [Op.gte]: startOfThisMonth }
      }
    });

    // Órdenes del mes anterior
    const ordersLastMonth = await Order.count({
      where: {
        status: { [Op.notIn]: ['cancelled'] },
        createdAt: {
          [Op.gte]: startOfLastMonth,
          [Op.lt]: startOfThisMonth
        }
      }
    });

    // Crecimiento de órdenes
    const ordersGrowth = ordersLastMonth > 0
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(1)
      : 0;

    // 3. Ingresos totales
    const revenueResult = await Order.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled'] }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
      ],
      raw: true
    });
    const totalRevenue = parseFloat(revenueResult[0]?.totalRevenue || 0);

    // Ingresos del mes actual
    const revenueThisMonthResult = await Order.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled'] },
        createdAt: { [Op.gte]: startOfThisMonth }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'revenue']
      ],
      raw: true
    });
    const revenueThisMonth = parseFloat(revenueThisMonthResult[0]?.revenue || 0);

    // Ingresos del mes anterior
    const revenueLastMonthResult = await Order.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled'] },
        createdAt: {
          [Op.gte]: startOfLastMonth,
          [Op.lt]: startOfThisMonth
        }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'revenue']
      ],
      raw: true
    });
    const revenueLastMonth = parseFloat(revenueLastMonthResult[0]?.revenue || 0);

    // Crecimiento de ingresos
    const revenueGrowth = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
      : 0;

    // 4. Total de productos
    const totalProducts = await Product.count();

    // Productos con bajo stock (stock <= 10)
    const lowStockProducts = await Product.count({
      where: {
        stock: { [Op.lte]: 10 }
      }
    });

    // 5. Estadísticas por estado de orden
    const orderStatusStats = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.json({
      totalUsers,
      usersThisMonth,
      userGrowth: parseFloat(userGrowth),
      totalOrders,
      ordersThisMonth,
      ordersGrowth: parseFloat(ordersGrowth),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      revenueThisMonth: parseFloat(revenueThisMonth.toFixed(2)),
      revenueGrowth: parseFloat(revenueGrowth),
      totalProducts,
      lowStockProducts,
      orderStatusStats: orderStatusStats.map(stat => ({
        status: stat.status,
        count: parseInt(stat.count)
      }))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  getDashboardStats
};