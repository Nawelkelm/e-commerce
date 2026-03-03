const { validationResult } = require('express-validator');
const { Order, OrderItem, Cart, CartItem, Product, User } = require('../models');
const { sequelize, Op } = require('../config/database');
const logger = require('../config/logger');
const emailService = require('../services/emailService');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp.slice(-8)}-${random}`;
};

// Get user orders with pagination
const getUserOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'images']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order by ID
const getOrder = async (req, res) => {
  try {
    console.log('=== GET ORDER CALLED ===');
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    console.log('Order ID:', id);
    console.log('User ID:', userId);
    console.log('Is Admin:', isAdmin);

    const where = { id };
    if (!isAdmin) {
      where.userId = userId;
    }

    const order = await Order.findOne({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'images']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order found, sending response');
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    logger.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create order from cart
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('=== CREATE ORDER CALLED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
      await transaction.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      shippingAddress,
      billingAddress,
      customerNotes,
      paymentMethod = 'mercadopago',
      couponId,
      discountApplied,
      items, // Aceptar items directamente del frontend
      shippingMethod // Método de envío seleccionado por el cliente
    } = req.body;

    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      await transaction.rollback();
      return res.status(400).json({ message: 'User authentication or session ID required' });
    }

    // If items are provided directly, use them. Otherwise, find user's cart
    let cartItems = [];
    
    if (items && Array.isArray(items) && items.length > 0) {
      // Items provided directly from frontend
      for (const item of items) {
        const product = await Product.findByPk(item.productId || item.id, {
          attributes: ['id', 'name', 'sku', 'price', 'salePrice', 'stock', 'isActive'],
          transaction
        });
        
        if (!product) {
          await transaction.rollback();
          return res.status(400).json({ message: `Product with ID ${item.productId || item.id} not found` });
        }
        
        cartItems.push({
          Product: product,
          quantity: item.quantity,
          attributes: item.attributes || {}
        });
      }
    } else {
      // Fallback to database cart
      const cart = await Cart.findOne({
        where: userId ? { userId } : { sessionId },
        include: [
          {
            model: CartItem,
            include: [
              {
                model: Product,
                attributes: ['id', 'name', 'sku', 'price', 'salePrice', 'stock', 'isActive']
              }
            ]
          }
        ],
        transaction
      });

      if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Cart is empty' });
      }
      
      cartItems = cart.CartItems;
    }

    // Validate cart items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const product = cartItem.Product;

      // Check if product is still active
      if (!product.isActive) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Product "${product.name}" is no longer available` 
        });
      }

      // Check stock availability
      if (product.stock < cartItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}` 
        });
      }

      const unitPrice = product.salePrice || product.price;
      const totalPrice = unitPrice * cartItem.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: cartItem.quantity,
        unitPrice,
        totalPrice,
        attributes: cartItem.attributes,
        productSnapshot: {
          name: product.name,
          sku: product.sku,
          price: product.price,
          salePrice: product.salePrice,
          images: product.images
        }
      });
    }

    // Calculate shipping and taxes
    let shippingAmount = 0;
    let shippingMethodId = null;
    let shippingMethodCode = null;
    let shippingMethodName = null;

    // Si se proporcionó un método de envío, usarlo
    if (shippingMethod) {
      shippingAmount = parseFloat(shippingMethod.price || 0);
      shippingMethodId = shippingMethod.id;
      shippingMethodCode = shippingMethod.code;
      shippingMethodName = shippingMethod.name;
    } else {
      // Fallback: shipping simplificado (puede ser eliminado luego)
      shippingAmount = subtotal > 5000 ? 0 : 500;
    }

    const taxAmount = subtotal * 0.21; // 21% IVA in Argentina
    const discountAmount = discountApplied || 0;
    const total = subtotal + shippingAmount + taxAmount - discountAmount;

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      userId: userId || null,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      subtotal,
      taxAmount,
      shippingAmount,
      shippingMethodId,
      shippingMethodCode,
      shippingMethodName,
      discountAmount,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      customerNotes
    }, { transaction });

    // Create order items and update product stock
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item
      }, { transaction });

      // Reduce product stock
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction
      });
    }

    // Clear cart only if it came from database
    if (!items && typeof cart !== 'undefined' && cart.id) {
      await CartItem.destroy({ 
        where: { cartId: cart.id },
        transaction
      });
    }

    // Register coupon usage if coupon was applied
    if (couponId && userId) {
      const { CouponUsage, Coupon } = require('../models');
      
      // Create usage record
      await CouponUsage.create({
        couponId,
        userId,
        orderId: order.id,
        discountApplied: discountAmount
      }, { transaction });

      // Increment coupon usage counter
      await Coupon.increment('usedCount', {
        where: { id: couponId },
        transaction
      });
    }

    await transaction.commit();

    // Fetch complete order
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'images']
            }
          ]
        }
      ]
    });

    // Send confirmation email if user is authenticated
    if (userId) {
      const user = await User.findByPk(userId);
      if (user) {
        try {
          // Use new template-based email system
          await emailService.sendOrderConfirmation(completeOrder, user);
          logger.info(`Order confirmation email sent to ${user.email}`);
        } catch (emailError) {
          logger.error('Order confirmation email error:', emailError);
          // Don't fail the order creation if email fails
        }
      }
    }

    logger.info(`Order created: ${orderNumber} for user ${userId || sessionId}`);

    res.status(201).json({
      message: 'Order created successfully',
      order: completeOrder
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, trackingNumber, adminNotes } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updateData = { status };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    // Set delivery date if status is delivered
    if (status === 'delivered' && order.status !== 'delivered') {
      updateData.deliveredAt = new Date();
    }

    // Set cancelled date if status is cancelled
    if (status === 'cancelled' && order.status !== 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    await Order.update(updateData, { where: { id } });

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'images']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    // Send email notifications based on status change
    if (updatedOrder.user) {
      try {
        if (status === 'shipped' && order.status !== 'shipped') {
          // Send shipping notification
          await emailService.sendShippingNotification(
            updatedOrder,
            updatedOrder.user,
            trackingNumber
          );
          logger.info(`Shipping notification sent to ${updatedOrder.user.email}`);
        } else if (status === 'delivered' && order.status !== 'delivered') {
          // Send delivery confirmation
          await emailService.sendDeliveryConfirmation(
            updatedOrder,
            updatedOrder.user
          );
          logger.info(`Delivery confirmation sent to ${updatedOrder.user.email}`);
        }
      } catch (emailError) {
        logger.error('Status change email error:', emailError);
        // Don't fail the status update if email fails
      }
    }

    logger.info(`Order status updated: ${id} to ${status} by admin ${req.user.id}`);

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    console.log('=== GET ALL ORDERS CALLED ===');
    console.log('User:', req.user);
    console.log('Query params:', req.query);
    
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by payment status
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Search by order number or customer email
    if (search) {
      where[Op.or] = [
        { orderNumber: { [Op.iLike]: `%${search}%` } },
        { '$User.email$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'quantity', 'unitPrice', 'totalPrice'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'images']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('GET ALL ORDERS ERROR DETAILS:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    logger.error('Get all orders error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const where = { id };
    if (!isAdmin) {
      where.userId = userId;
    }

    const order = await Order.findOne({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }

    // Restore product stock
    const orderItems = order.items || order.OrderItems || [];
    for (const item of orderItems) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction
      });
    }

    // Update order status
    await Order.update({
      status: 'cancelled',
      cancelledAt: new Date()
    }, { 
      where: { id },
      transaction
    });

    await transaction.commit();

    logger.info(`Order cancelled: ${id} by user ${userId}`);

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    await transaction.rollback();
    logger.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload payment proof for bank transfer
const uploadPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const where = { id };
    if (!isAdmin) {
      where.userId = userId;
    }

    const order = await Order.findOne({ where });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verificar que el método de pago sea transferencia
    if (order.paymentMethod !== 'Transferencia Bancaria') {
      return res.status(400).json({ 
        message: 'Payment proof only applicable for bank transfers' 
      });
    }

    // Actualizar orden con el comprobante (Cloudinary o local - auto-detectado)
    const { getFileUrl } = require('../config/cloudinary');
    const paymentProofUrl = getFileUrl(req.file, 'payment-proofs');
    await order.update({
      paymentProofUrl,
      paymentProofUploadedAt: new Date(),
      paymentStatus: 'pending_verification' // Cambiar a pendiente de verificación
    });

    logger.info(`Payment proof uploaded for order ${id}`);
    res.json({ 
      message: 'Payment proof uploaded successfully',
      paymentProofUrl,
      order
    });
  } catch (error) {
    logger.error('Upload payment proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get orders pending shipping management (for admin)
const getOrdersPendingShipping = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      shippingMethod
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {
      status: { [Op.in]: ['pending', 'confirmed', 'processing'] } // Excluir shipped, delivered, cancelled
    };

    // Filtrar solo órdenes que requieren gestión de envío
    // Incluir "ACORDAR_VENDEDOR" y otros métodos que requieran intervención
    if (shippingMethod) {
      where.shippingMethodCode = shippingMethod;
    }

    if (status) {
      where.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
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
              attributes: ['id', 'name', 'images']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Get orders pending shipping error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update shipping address for an order (admin only)
const updateShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingAddress } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({ shippingAddress });

    logger.info(`Shipping address updated for order ${id}`);
    res.json({
      message: 'Shipping address updated successfully',
      order
    });
  } catch (error) {
    logger.error('Update shipping address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
  uploadPaymentProof,
  getOrdersPendingShipping,
  updateShippingAddress
};