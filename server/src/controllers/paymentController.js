const { MercadoPagoConfig, Preference, Payment, MerchantOrder } = require('mercadopago');
const { Order, OrderItem, Cart, CartItem, Product, User, Coupon, CouponUsage, Invoice } = require('../models');
const { sequelize, Op } = require('../config/database');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});
const preference = new Preference(client);
const paymentApi = new Payment(client);

const createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.body;
    const userId = req.user?.id;

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

    if (order.shippingAmount > 0) {
      items.push({
        title: 'Envío',
        description: 'Costo de envío',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: parseFloat(order.shippingAmount)
      });
    }

    if (order.taxAmount > 0) {
      items.push({
        title: 'IVA',
        description: 'Impuestos',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: parseFloat(order.taxAmount)
      });
    }

    const preferenceData = {
      items,
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
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      statement_descriptor: 'TIENDAKIT'
    };

    const result = await preference.create({ body: preferenceData });

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
    logger.error('Create payment error:', error);
    res.status(500).json({ message: 'Error creating payment preference' });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const { type, data, action } = req.body;

    logger.info('MercadoPago webhook received:', { type, action, data });

    // SDK v2: el webhook puede venir como type=payment o action=payment.created/updated
    const isPaymentNotification =
      type === 'payment' ||
      (action && action.startsWith('payment.'));

    if (!isPaymentNotification || !data?.id) {
      return res.status(200).send('OK');
    }

    const mpPaymentId = data.id;

    // SDK v2: usar Payment.get()
    const paymentData = await paymentApi.get({ id: mpPaymentId });

    if (!paymentData || !paymentData.external_reference) {
      logger.warn(`Webhook: no external_reference in payment ${mpPaymentId}`);
      return res.status(200).send('OK');
    }

    const order = await Order.findOne({
      where: { orderNumber: paymentData.external_reference }
    });

    if (!order) {
      logger.warn(`Webhook: order not found for ref ${paymentData.external_reference}`);
      return res.status(200).send('OK');
    }

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

    await Order.update({
      paymentStatus: newPaymentStatus,
      status: newOrderStatus,
      paymentId: mpPaymentId.toString(),
      paymentMethod: paymentData.payment_type_id,
      paidAt: newPaymentStatus === 'paid' ? new Date() : null
    }, {
      where: { id: order.id }
    });

    logger.info(`Order ${order.orderNumber} updated - Payment: ${newPaymentStatus}, Status: ${newOrderStatus}`);

    if (newPaymentStatus === 'paid') {
      try {
        await generateAutoInvoice(order);
      } catch (invoiceError) {
        logger.error('Error al generar factura automática:', invoiceError);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).send('Error');
  }
};

async function generateAutoInvoice(order) {
  const existingInvoice = await Invoice.findOne({
    where: { orderId: order.id }
  });

  if (existingInvoice) return;

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

  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const lastInvoice = await Invoice.findOne({
    where: {
      invoiceNumber: { [Op.like]: `${prefix}%` }
    },
    order: [['invoiceNumber', 'DESC']]
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  const invoiceNumber = `${prefix}${String(nextNumber).padStart(5, '0')}`;

  const invoiceItems = fullOrder.items.map(item => ({
    productId: item.productId,
    name: item.product.name,
    sku: item.product.sku,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unitPrice),
    subtotal: parseFloat(item.totalPrice)
  }));

  const subtotal = parseFloat(fullOrder.subtotal);
  const taxRate = 21.00;
  const tax = parseFloat(fullOrder.taxAmount || 0);
  const shipping = parseFloat(fullOrder.shippingAmount || 0);
  const discount = parseFloat(fullOrder.discountAmount || 0);
  const total = parseFloat(fullOrder.total);

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
    paymentMethod: fullOrder.paymentMethod || 'MercadoPago',
    paymentId: fullOrder.paymentId,
    paymentDate: new Date(),
    status: 'paid',
    issueDate: new Date(),
    customerNotes: 'Factura generada automáticamente al confirmar el pago'
  });

  await Order.update({
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber
  }, {
    where: { id: fullOrder.id }
  });

  logger.info(`Factura ${invoiceNumber} generada automáticamente para orden ${fullOrder.orderNumber}`);
}

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
        const paymentData = await paymentApi.get({ id: order.paymentId });
        paymentDetails = {
          id: paymentData.id,
          status: paymentData.status,
          statusDetail: paymentData.status_detail,
          paymentMethodId: paymentData.payment_method_id,
          paymentTypeId: paymentData.payment_type_id,
          transactionAmount: paymentData.transaction_amount,
          dateCreated: paymentData.date_created,
          dateApproved: paymentData.date_approved
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

    // SDK v2: refund vía API REST directa (el SDK no expone Refund como clase en v2.0.x)
    const refundResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${order.paymentId}/refunds`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount || parseFloat(order.total)
        })
      }
    );

    const refundData = await refundResponse.json();

    if (refundData.status === 'approved') {
      const refundAmount = parseFloat(refundData.amount);
      const isPartialRefund = refundAmount < parseFloat(order.total);

      await Order.update({
        paymentStatus: isPartialRefund ? 'partially_refunded' : 'refunded',
        status: isPartialRefund ? order.status : 'refunded',
        refundedAt: new Date(),
        adminNotes: `Reembolso procesado: $${refundAmount}. Motivo: ${reason || 'Reembolso admin'}`
      }, {
        where: { id: orderId }
      });

      logger.info(`Refund processed for order ${order.orderNumber}: $${refundAmount}`);

      res.json({
        message: 'Refund processed successfully',
        refund: {
          id: refundData.id,
          amount: refundData.amount,
          status: refundData.status
        }
      });
    } else {
      res.status(400).json({
        message: 'Refund failed',
        error: refundData.message || refundData.status
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
