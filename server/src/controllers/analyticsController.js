const { sequelize } = require('../config/database');
const { Order, OrderItem, Product, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

// Obtener analytics de ventas
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Definir fechas por defecto (últimos 6 meses)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(end.getMonth() - 6));

    // 1. Total de ventas y órdenes
    const ordersStats = await Order.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled'] },
        createdAt: { [Op.between]: [start, end] }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalSales'],
        [sequelize.fn('AVG', sequelize.col('total')), 'averageOrder']
      ],
      raw: true
    });

    // 2. Ventas del período anterior para calcular crecimiento
    const previousStart = new Date(start);
    previousStart.setMonth(previousStart.getMonth() - 6);
    const previousEnd = new Date(start);

    const previousOrdersStats = await Order.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled'] },
        createdAt: { [Op.between]: [previousStart, previousEnd] }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalSales'],
        [sequelize.fn('AVG', sequelize.col('total')), 'averageOrder']
      ],
      raw: true
    });

    // Calcular porcentajes de crecimiento
    const currentStats = ordersStats[0];
    const previousStats = previousOrdersStats[0];

    const salesGrowth = previousStats.totalSales > 0 
      ? ((currentStats.totalSales - previousStats.totalSales) / previousStats.totalSales * 100).toFixed(1)
      : 0;

    const ordersGrowth = previousStats.totalOrders > 0
      ? ((currentStats.totalOrders - previousStats.totalOrders) / previousStats.totalOrders * 100).toFixed(1)
      : 0;

    const avgOrderGrowth = previousStats.averageOrder > 0
      ? ((currentStats.averageOrder - previousStats.averageOrder) / previousStats.averageOrder * 100).toFixed(1)
      : 0;

    // 3. Ventas por mes
    const salesByMonth = await Order.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled'] },
        createdAt: { [Op.between]: [start, end] }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('SUM', sequelize.col('total')), 'sales'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Formatear meses
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const formattedSalesByMonth = salesByMonth.map(item => ({
      month: monthNames[new Date(item.month).getMonth()],
      sales: parseFloat(item.sales),
      orders: parseInt(item.orders)
    }));

    // 4. Top productos más vendidos
    const topProducts = await OrderItem.findAll({
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug']
      }, {
        model: Order,
        attributes: [],
        where: {
          status: { [Op.notIn]: ['cancelled'] },
          createdAt: { [Op.between]: [start, end] }
        }
      }],
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue']
      ],
      group: ['productId', 'product.id', 'product.name', 'product.slug'],
      order: [[sequelize.fn('SUM', sequelize.col('totalPrice')), 'DESC']],
      limit: 5,
      raw: true
    });

    // Formatear productos
    const formattedTopProducts = topProducts.map(item => ({
      id: item.productId,
      name: item['product.name'],
      slug: item['product.slug'],
      sales: parseInt(item.totalQuantity),
      revenue: parseFloat(item.totalRevenue)
    }));

    // 5. Tasa de conversión (usuarios que hicieron pedido / total usuarios)
    const totalUsers = await User.count();
    const usersWithOrders = await Order.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled'] },
        createdAt: { [Op.between]: [start, end] }
      },
      attributes: [[sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'count']],
      raw: true
    });

    const conversionRate = totalUsers > 0 
      ? (usersWithOrders[0].count / totalUsers * 100).toFixed(1)
      : 0;

    // Conversión período anterior
    const previousUsersWithOrders = await Order.findAll({
      where: {
        status: { [Op.notIn]: ['cancelled'] },
        createdAt: { [Op.between]: [previousStart, previousEnd] }
      },
      attributes: [[sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'count']],
      raw: true
    });

    const previousConversionRate = totalUsers > 0
      ? (previousUsersWithOrders[0].count / totalUsers * 100)
      : 0;

    const conversionGrowth = previousConversionRate > 0
      ? ((conversionRate - previousConversionRate) / previousConversionRate * 100).toFixed(1)
      : 0;

    // 6. Órdenes por estado
    const ordersByStatus = await Order.findAll({
      where: {
        createdAt: { [Op.between]: [start, end] }
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const statusDistribution = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    // Respuesta final
    res.json({
      summary: {
        totalSales: parseFloat(currentStats.totalSales) || 0,
        salesGrowth: parseFloat(salesGrowth),
        totalOrders: parseInt(currentStats.totalOrders) || 0,
        ordersGrowth: parseFloat(ordersGrowth),
        averageOrder: parseFloat(currentStats.averageOrder) || 0,
        avgOrderGrowth: parseFloat(avgOrderGrowth),
        conversionRate: parseFloat(conversionRate),
        conversionGrowth: parseFloat(conversionGrowth)
      },
      salesByMonth: formattedSalesByMonth,
      topProducts: formattedTopProducts,
      ordersByStatus: statusDistribution,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });

  } catch (error) {
    logger.error('Error fetching sales analytics:', error);
    res.status(500).json({ 
      message: 'Error al obtener analytics de ventas',
      error: error.message 
    });
  }
};

// Obtener productos con bajo stock
exports.getInventoryAlerts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [Op.lte]: threshold,
          [Op.gt]: 0
        }
      },
      attributes: ['id', 'name', 'slug', 'stock', 'price'],
      order: [['stock', 'ASC']],
      limit: 20
    });

    const outOfStockProducts = await Product.findAll({
      where: {
        stock: 0
      },
      attributes: ['id', 'name', 'slug', 'stock', 'price'],
      limit: 20
    });

    res.json({
      lowStockProducts,
      outOfStockProducts,
      threshold: parseInt(threshold)
    });

  } catch (error) {
    logger.error('Error fetching inventory alerts:', error);
    res.status(500).json({ 
      message: 'Error al obtener alertas de inventario',
      error: error.message 
    });
  }
};
