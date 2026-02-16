const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Número de factura único (ej: INV-2025-00001)'
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  // Información del cliente (snapshot al momento de facturar)
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customerAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customerTaxId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'RFC, CUIT, DNI, etc.'
  },
  
  // Campos AFIP
  cae: {
    type: DataTypes.STRING(14),
    allowNull: true,
    comment: 'Código de Autorización Electrónica de AFIP'
  },
  caeDueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha de vencimiento del CAE'
  },
  invoiceType: {
    type: DataTypes.ENUM('A', 'B', 'C', 'E', 'M'),
    allowNull: false,
    defaultValue: 'B',
    comment: 'Tipo de comprobante fiscal'
  },
  pointOfSale: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Punto de venta de AFIP'
  },
  afipStatus: {
    type: DataTypes.ENUM('pending', 'authorized', 'rejected', 'error', 'not_required'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Estado de autorización en AFIP'
  },
  afipResponse: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Respuesta completa de AFIP'
  },
  afipRequestDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de solicitud a AFIP'
  },
  customerTaxCategory: {
    type: DataTypes.ENUM(
      'responsable_inscripto',
      'responsable_monotributo',
      'exento',
      'no_responsable',
      'consumidor_final'
    ),
    allowNull: false,
    defaultValue: 'consumidor_final',
    comment: 'Categoría tributaria del cliente'
  },
  customerCuit: {
    type: DataTypes.STRING(11),
    allowNull: true,
    comment: 'CUIT/CUIL del cliente'
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones de la factura'
  },
  
  // Montos
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'IVA u otros impuestos'
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 16.00,
    comment: 'Porcentaje de impuesto'
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  shipping: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  
  // Detalles de items (JSON para mantener snapshot)
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Array de items con nombre, cantidad, precio unitario, subtotal'
  },
  
  // Información de pago
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'MercadoPago, Transferencia, Efectivo, etc.'
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID de transacción del método de pago'
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  // Estado de la factura
  status: {
    type: DataTypes.ENUM('draft', 'issued', 'paid', 'cancelled', 'refunded'),
    defaultValue: 'issued',
    allowNull: false
  },
  
  // Fechas importantes
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de vencimiento para pagos a crédito'
  },
  
  // Notas y observaciones
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas internas'
  },
  customerNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas visibles para el cliente'
  },
  
  // PDF
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del PDF generado'
  },
  
  // Cancelación
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['invoiceNumber'], unique: true },
    { fields: ['orderId'] },
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['issueDate'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Invoice;
