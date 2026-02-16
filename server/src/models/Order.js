const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'pending_verification'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true
    // MercadoPago payment ID
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  shippingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  shippingMethodId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'ShippingMethods',
      key: 'id'
    }
  },
  shippingMethodCode: {
    type: DataTypes.STRING,
    allowNull: true
    // Código del método de envío seleccionado (ej: ANDREANI, RETIRO_LOCAL)
  },
  shippingMethodName: {
    type: DataTypes.STRING,
    allowNull: true
    // Nombre del método de envío (ej: Andreani, Retiro en Local)
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ARS'
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false
    // { street, city, state, postalCode, country, phone }
  },
  billingAddress: {
    type: DataTypes.JSON,
    allowNull: true
    // Same structure as shipping address
  },
  customerNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estimatedDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se confirmó el pago'
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Referencia a la factura generada'
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número de factura para búsqueda rápida'
  },
  paymentProofUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del comprobante de transferencia'
  },
  paymentProofUploadedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de carga del comprobante'
  },
  bankTransferData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Datos bancarios mostrados al cliente'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['orderNumber'] },
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['paymentStatus'] },
    { fields: ['paymentId'] },
    { fields: ['invoiceNumber'] },
    { fields: ['createdAt'] }
  ]
});

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false
    // Snapshot of product name at time of order
  },
  productSku: {
    type: DataTypes.STRING,
    allowNull: false
    // Snapshot of product SKU at time of order
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    // Price per unit at time of order
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    // quantity * unitPrice
  },
  attributes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
    // Selected product attributes at time of order
  },
  productSnapshot: {
    type: DataTypes.JSON,
    allowNull: true
    // Full product data snapshot at time of order
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['orderId'] },
    { fields: ['productId'] },
    { fields: ['productSku'] }
  ]
});

module.exports = { Order, OrderItem };