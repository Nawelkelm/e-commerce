const { validationResult } = require('express-validator');
const { RegretRequest, Order, HomeSettings } = require('../models');
const { sendEmail } = require('../services/emailServiceHelpers');
const logger = require('../config/logger');

const HOME_SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Notifica por mail al cliente (acuse de recibo) y a la tienda.
 * Un fallo de mail no puede tumbar la solicitud: la ley exige registrarla,
 * el aviso es accesorio.
 */
const notify = async (request) => {
  const settings = await HomeSettings.findByPk(HOME_SETTINGS_ID);
  const storeEmail = settings?.footerEmail || process.env.ADMIN_EMAIL;

  const detalle = `
    <ul>
      <li><strong>Nombre:</strong> ${request.customerName}</li>
      <li><strong>Email:</strong> ${request.customerEmail}</li>
      <li><strong>Telefono:</strong> ${request.customerPhone || '-'}</li>
      <li><strong>Documento:</strong> ${request.customerDocument || '-'}</li>
      <li><strong>Pedido:</strong> ${request.orderNumber || '-'}</li>
      <li><strong>Motivo:</strong> ${request.reason || '-'}</li>
    </ul>
  `;

  await sendEmail({
    to: request.customerEmail,
    subject: 'Recibimos tu solicitud de arrepentimiento',
    html: `
      <p>Hola ${request.customerName},</p>
      <p>Recibimos tu solicitud de arrepentimiento de compra y ya la estamos procesando.
      Te vamos a contactar a este mismo correo con los pasos a seguir.</p>
      <p>Estos son los datos que registramos:</p>
      ${detalle}
      <p>Numero de solicitud: <strong>${request.id}</strong></p>
    `,
    metadata: { recipientName: request.customerName }
  }).catch(err => logger.error('Regret request: fallo el acuse al cliente', err));

  if (storeEmail) {
    await sendEmail({
      to: storeEmail,
      subject: `Nueva solicitud de arrepentimiento - ${request.customerName}`,
      html: `<p>Se recibio una nueva solicitud de arrepentimiento.</p>${detalle}`
    }).catch(err => logger.error('Regret request: fallo el aviso a la tienda', err));
  }
};

/**
 * Alta publica: cualquiera puede enviarla, con o sin sesion iniciada.
 */
const createRegretRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, customerEmail, customerPhone, customerDocument, orderNumber, reason } = req.body;

    // Si el numero de pedido existe, se deja vinculado para que el admin
    // tenga el contexto a mano.
    let orderId = null;
    if (orderNumber) {
      const order = await Order.findOne({ where: { orderNumber }, attributes: ['id'] });
      orderId = order ? order.id : null;
    }

    const request = await RegretRequest.create({
      customerName,
      customerEmail,
      customerPhone,
      customerDocument,
      orderNumber,
      reason,
      orderId,
      userId: req.user?.id || null
    });

    await notify(request);

    logger.info(`Regret request created: ${request.id}`);
    res.status(201).json({
      message: 'Solicitud registrada. Te enviamos un correo con el acuse de recibo.',
      id: request.id
    });
  } catch (error) {
    next(error);
  }
};

// --- Administracion -------------------------------------------------------

const getRegretRequests = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    }

    const requests = await RegretRequest.findAll({
      where,
      include: [{ model: Order, as: 'order', attributes: ['id', 'orderNumber', 'status', 'total'], required: false }],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

const updateRegretRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = await RegretRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const { status, adminNotes } = req.body;
    const updates = {};
    if (status !== undefined) {
      updates.status = status;
      // Se sella la fecha al cerrarla, para poder acreditar el plazo.
      const cerrada = status === 'resolved' || status === 'rejected';
      updates.resolvedAt = cerrada ? new Date() : null;
    }
    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
    }

    await request.update(updates);

    logger.info(`Regret request updated: ${request.id} -> ${request.status}`);
    res.json(request);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRegretRequest,
  getRegretRequests,
  updateRegretRequest
};
