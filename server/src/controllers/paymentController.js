const { MercadoPagoConfig, Preference } = require('mercadopago');
const { Order, OrderItem, Cart, CartItem, Product, User, Coupon, CouponUsage, Invoice } = require('../models');
const { sequelize, Op } = require('../config/database');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

// Configure MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});
const preference = new Preference(client);

// Create payment preference for MercadoPago checkout
const createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.body;
    const userId = req.user?.id;

    // Find order
    const order = await Order.findOne({
      where: { 
        id: orderId,
        ...(userId && { userId })
      },
      include: [
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
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Order payment is not pending' });
    }

    // Prepare items for MercadoPago
    const orderItems = order.items || order.OrderItems || [];
    const items = orderItems.map(item => ({
      id: item.productId,
      title: item.productName,
      description: `${item.productName} - Quantity: ${item.quantity}`,
      picture_url: item.product?.images?.[0]?.url || item.Product?.images?.[0]?.url || '',
      category_id: 'others',
      quantity: item.quantity,
      currency_id: 'ARS',
      unit_price: parseFloat(item.unitPrice)
    }));

    // Add shipping as an item if applicable
    if (order.shippingAmount > 0) {
      items.push({
        title: 'Shipping',
        description: 'Shipping cost',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: parseFloat(order.shippingAmount)
      });
    }

    // Add taxes as an item if applicable
    if (order.taxAmount > 0) {
      items.push({
        title: 'Taxes (IVA)',
        description: 'Tax amount',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: parseFloat(order.taxAmount)
      });
    }

    // Create preference data
    const preferenceData = {
      items: items,
      payer: {
        name: order.shippingAddress.firstName || '',
        surname: order.shippingAddress.lastName || '',
        email: req.user?.email || order.shippingAddress.email || '',
        phone: {
          area_code: '',
          number: order.shippingAddress.phone || ''
        },
        address: {
          street_name: order.shippingAddress.street || '',
          street_number: '',
          zip_code: order.shippingAddress.postalCode || ''
        }
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success?order=${order.id}`,
        failure: `${process.env.FRONTEND_URL}/payment/failure?order=${order.id}`,
        pending: `${process.env.FRONTEND_URL}/payment/pending?order=${order.id}`
      },
      external_reference: order.orderNumber,
      notification_url: `${process.env.BACKEND_URL || 'https://e-commerce-7q25.onrender.com'}/api/payments/webhook`,
      statement_descriptor: 'E-COMMERCE'
    };

    console.log('🔄 Creating MercadoPago preference with data:', JSON.stringify(preferenceData, null, 2));
    console.log('💳 Access Token configured:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Yes' : 'No');
    
    const result = await preference.create({ body: preferenceData });

    console.log('✅ MercadoPago preference created successfully:', result.id);

    // Update order with MercadoPago preference ID
    await Order.update({
      paymentId: result.id
    }, {
      where: { id: order.id }
    });

    logger.info(`Payment preference created for order ${order.orderNumber}: ${result.id}`);

    res.json({
      preferenceId: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });
  } catch (error) {
    console.error('❌ MercadoPago error details:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    if (error.response) {
      console.error('❌ Error response data:', error.response.data);
      console.error('❌ Error response status:', error.response.status);
    }
    logger.error('Create payment error:', error);
    res.status(500).json({ message: 'Error creating payment preference' });
  }
};

// Handle MercadoPago webhook notifications
const handleWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    logger.info('MercadoPago webhook received:', { type, data });

    if (type === 'payment') {
      const paymentId = data.id;

      // Get payment information from MercadoPago
      const payment = await mercadopago.payment.findById(paymentId);
      const paymentData = payment.body;

      logger.info('Payment data:', paymentData);

      if (paymentData.external_reference) {
        // Find order by external reference (order number)
        const order = await Order.findOne({
          where: { orderNumber: paymentData.external_reference }
        });

        if (order) {
          let newPaymentStatus;
          let newOrderStatus = order.status;

          switch (paymentData.status) {
            case 'approved':
              newPaymentStatus = 'paid';
              if (order.status === 'pending') {
                newOrderStatus = 'confirmed';
              }
              break;
            case 'pending':
              newPaymentStatus = 'pending';
              break;
            case 'in_process':
              newPaymentStatus = 'pending';
              break;
            case 'rejected':
            case 'cancelled':
              newPaymentStatus = 'failed';
              if (order.status === 'pending') {
                newOrderStatus = 'cancelled';
              }
              break;
            case 'refunded':
              newPaymentStatus = 'refunded';
              newOrderStatus = 'refunded';
              break;
            default:
              newPaymentStatus = 'pending';
          }

          // Update order
          await Order.update({
            paymentStatus: newPaymentStatus,
            status: newOrderStatus,
            paymentId: paymentId.toString(),
            paymentMethod: paymentData.payment_type_id,
            paidAt: newPaymentStatus === 'paid' ? new Date() : null
          }, {
            where: { id: order.id }
          });

          logger.info(`Order ${order.orderNumber} updated - Payment: ${newPaymentStatus}, Status: ${newOrderStatus}`);
          
          // Auto-generar factura cuando el pago es aprobado
          if (newPaymentStatus === 'paid') {
            try {
              // Verificar si ya existe una factura
              const existingInvoice = await Invoice.findOne({
                where: { orderId: order.id }
              });
              
              if (!existingInvoice) {
                // Obtener detalles completos de la orden
                const fullOrder = await Order.findByPk(order.id, {
                  include: [
                    {
                      model: OrderItem,
                      as: 'items',
                      include: [{ model: Product, as: 'product' }]
                    },
                    {
                      model: User,
                      as: 'user',
                      attributes: ['id', 'firstName', 'lastName', 'email']
                    }
                  ]
                });
                
                // Generar número de factura
                const year = new Date().getFullYear();
                const prefix = `INV-${year}-`;
                const lastInvoice = await Invoice.findOne({
                  where: {
                    invoiceNumber: {
                      [Op.like]: `${prefix}%`
                    }
                  },
                  order: [['invoiceNumber', 'DESC']]
                });
                
                let nextNumber = 1;
                if (lastInvoice) {
                  const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
                  nextNumber = lastNumber + 1;
                }
                const invoiceNumber = `${prefix}${String(nextNumber).padStart(5, '0')}`;
                
                // Preparar items
                const invoiceItems = fullOrder.items.map(item => ({
                  productId: item.productId,
                  name: item.product.name,
                  sku: item.product.sku,
                  quantity: item.quantity,
                  unitPrice: parseFloat(item.unitPrice),
                  subtotal: parseFloat(item.totalPrice)
                }));
                
                // Calcular montos
                const subtotal = parseFloat(fullOrder.subtotal);
                const taxRate = 16.00;
                const tax = parseFloat(fullOrder.taxAmount || 0);
                const shipping = parseFloat(fullOrder.shippingAmount || 0);
                const discount = parseFloat(fullOrder.discountAmount || 0);
                const total = parseFloat(fullOrder.total);
                
                // Crear factura
                const invoice = await Invoice.create({
                  invoiceNumber,
                  orderId: fullOrder.id,
                  userId: fullOrder.userId,
                  customerName: `${fullOrder.user.firstName} ${fullOrder.user.lastName}`,
                  customerEmail: fullOrder.user.email,
                  customerPhone: fullOrder.shippingAddress?.phone || null,
                  customerAddress: fullOrder.shippingAddress?.fullAddress || null,
                  subtotal,
                  tax,
                  taxRate,
                  discount,
                  shipping,
                  total,
                  items: invoiceItems,
                  paymentMethod: paymentData.payment_type_id || 'MercadoPago',
                  paymentId: paymentId.toString(),
                  paymentDate: new Date(),
                  status: 'paid',
                  issueDate: new Date(),
                  customerNotes: 'Factura generada automáticamente al confirmar el pago'
                });
                
                // Actualizar orden con referencia a factura
                await Order.update({
                  invoiceId: invoice.id,
                  invoiceNumber: invoice.invoiceNumber
                }, {
                  where: { id: fullOrder.id }
                });
                
                logger.info(`Factura ${invoiceNumber} generada automáticamente para orden ${order.orderNumber}`);
              }
            } catch (invoiceError) {
              logger.error('Error al generar factura automática:', invoiceError);
              // No fallar el proceso si hay error en factura
            }
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).send('Error');
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    const order = await Order.findOne({
      where: { 
        id: orderId,
        ...(userId && { userId })
      },
      attributes: ['id', 'orderNumber', 'status', 'paymentStatus', 'paymentId', 'paymentMethod', 'total']
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let paymentDetails = null;
    if (order.paymentId) {
      try {
        const payment = await mercadopago.payment.findById(order.paymentId);
        paymentDetails = {
          id: payment.body.id,
          status: payment.body.status,
          statusDetail: payment.body.status_detail,
          paymentMethodId: payment.body.payment_method_id,
          paymentTypeId: payment.body.payment_type_id,
          transactionAmount: payment.body.transaction_amount,
          dateCreated: payment.body.date_created,
          dateApproved: payment.body.date_approved
        };
      } catch (paymentError) {
        logger.error('Error fetching payment details:', paymentError);
      }
    }

    res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total
      },
      payment: paymentDetails
    });
  } catch (error) {
    logger.error('Get payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Process refund (Admin only)
const processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.paymentId) {
      return res.status(400).json({ message: 'No payment found for this order' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Order payment is not paid' });
    }

    // Create refund in MercadoPago
    const refund = await mercadopago.refund.create({
      payment_id: order.paymentId,
      amount: amount || order.total,
      reason: reason || 'requested_by_client'
    });

    if (refund.body.status === 'approved') {
      // Update order status
      const refundAmount = parseFloat(refund.body.amount);
      const isPartialRefund = refundAmount < parseFloat(order.total);
      
      await Order.update({
        paymentStatus: isPartialRefund ? 'partially_refunded' : 'refunded',
        status: isPartialRefund ? order.status : 'refunded',
        refundedAt: new Date(),
        adminNotes: `Refund processed: $${refundAmount}. Reason: ${reason || 'Admin refund'}`
      }, {
        where: { id: orderId }
      });

      logger.info(`Refund processed for order ${order.orderNumber}: $${refundAmount}`);

      res.json({
        message: 'Refund processed successfully',
        refund: {
          id: refund.body.id,
          amount: refund.body.amount,
          status: refund.body.status
        }
      });
    } else {
      res.status(400).json({ 
        message: 'Refund failed', 
        error: refund.body.status_detail 
      });
    }
  } catch (error) {
    logger.error('Process refund error:', error);
    res.status(500).json({ message: 'Error processing refund' });
  }
};

module.exports = {
  createPayment,
  handleWebhook,
  getPaymentStatus,
  processRefund
};