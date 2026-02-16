const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  carrier: {
    type: DataTypes.STRING,
    allowNull: false,
    // Correo Argentino, Andreani, OCA, etc.
  },
  carrierService: {
    type: DataTypes.STRING,
    allowNull: true,
    // Standard, Express, Next Day, etc.
  },
  status: {
    type: DataTypes.ENUM(
      'pending',           // Pendiente de envío
      'label_created',     // Etiqueta creada
      'picked_up',         // Recogido por transportista
      'in_transit',        // En tránsito
      'out_for_delivery',  // En reparto
      'delivered',         // Entregado
      'failed_delivery',   // Intento de entrega fallido
      'returned',          // Devuelto
      'cancelled'          // Cancelado
    ),
    defaultValue: 'pending'
  },
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    // Peso en kg
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: true,
    // { length, width, height } en cm
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
    // { street, city, state, postalCode, country, phone, recipientName }
  },
  originAddress: {
    type: DataTypes.JSON,
    allowNull: true,
    // Dirección de origen del envío
  },
  estimatedDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  packageType: {
    type: DataTypes.STRING,
    allowNull: true,
    // Box, Envelope, Pallet, etc.
  },
  numberOfPackages: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  insuranceAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  labelUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    // URL de la etiqueta de envío
  },
  trackingUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    // URL de seguimiento del transportista
  },
  signatureRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deliveryProofUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    // URL de la foto/comprobante de entrega
  },
  recipientSignature: {
    type: DataTypes.STRING,
    allowNull: true,
    // URL de la firma del destinatario
  },
  deliveredBy: {
    type: DataTypes.STRING,
    allowNull: true,
    // Nombre del repartidor que entregó
  },
  failedDeliveryReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attemptedDeliveries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastAttemptDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'shipments',
  timestamps: true,
  indexes: [
    { fields: ['trackingNumber'] },
    { fields: ['carrier'] },
    { fields: ['status'] },
    { fields: ['estimatedDeliveryDate'] },
    { fields: ['orderId'] }
  ]
});

module.exports = Shipment;
