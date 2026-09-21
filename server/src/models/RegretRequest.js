const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Solicitudes del boton de arrepentimiento.
 *
 * La Resolucion 424/2020 de la Secretaria de Comercio Interior obliga a todo
 * comercio electronico argentino a ofrecer un "Boton de arrepentimiento"
 * visible en la primera pantalla del sitio, que le permita al consumidor
 * iniciar la cancelacion de una compra dentro de los 10 dias corridos.
 *
 * Cada solicitud queda registrada para poder acreditar su recepcion y el
 * plazo de respuesta.
 */
const RegretRequest = sequelize.define('RegretRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Datos de contacto: se piden siempre, aunque el cliente este logueado,
  // porque la solicitud tiene que poder hacerla cualquiera.
  customerName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: true }
  },
  customerEmail: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { isEmail: true }
  },
  customerPhone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  customerDocument: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'DNI o CUIT de quien realizo la compra'
  },
  orderNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Numero de pedido. Opcional: el consumidor puede no tenerlo a mano'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo, opcional: la ley no exige justificar el arrepentimiento'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'processing', 'resolved', 'rejected']]
    }
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Se completa si la solicitud se envio con sesion iniciada'
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Se completa si el numero de pedido coincide con uno existente'
  }
}, {
  tableName: 'RegretRequests',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['customerEmail'] }
  ]
});

module.exports = RegretRequest;
