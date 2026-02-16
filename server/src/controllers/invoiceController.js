const { Order, OrderItem, Product, User, Invoice } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const InvoicePDFService = require('../services/invoicePDFService');
const afipService = require('../services/afipService');
const emailService = require('../services/emailService');
const path = require('path');
const fs = require('fs');

// Helper para convertir valores DECIMAL de Sequelize a números
const normalizeInvoiceForPDF = (invoice) => {
  const invoiceData = invoice.toJSON ? invoice.toJSON() : invoice;
  
  // Parsear valores numéricos
  const subtotal = parseFloat(invoiceData.subtotal) || 0;
  const tax = parseFloat(invoiceData.tax) || 0;
  const taxRate = parseFloat(invoiceData.taxRate) || 21;
  const discount = parseFloat(invoiceData.discount) || 0;
  const shipping = parseFloat(invoiceData.shipping) || 0;
  
  // Calcular total si es NaN o inválido
  let total = parseFloat(invoiceData.total);
  if (isNaN(total) || invoiceData.total === 'NaN') {
    total = subtotal + tax + shipping - discount;
  }
  
  return {
    ...invoiceData,
    subtotal,
    tax,
    taxRate,
    discount,
    shipping,
    total,
    items: (invoiceData.items || []).map(item => ({
      ...item,
      name: item.name || item.description || 'Producto',
      sku: item.sku || item.productId || '',
      quantity: parseInt(item.quantity) || 0,
      unitPrice: parseFloat(item.unitPrice) || parseFloat(item.price) || 0,
      subtotal: parseFloat(item.subtotal) || parseFloat(item.totalPrice) || 0
    }))
  };
};

// Generar número de factura único
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  // Buscar la última factura del año
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
  
  return `${prefix}${String(nextNumber).padStart(5, '0')}`;
};

// Crear factura desde una orden
const createInvoiceFromOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId } = req.params;
    const { 
      customerTaxId,
      customerAddress,
      customerPhone,
      paymentMethod,
      paymentId,
      notes,
      customerNotes,
      // Campos AFIP
      invoiceType = 'B', // A, B, C - por defecto B (Consumidor Final)
      customerTaxCategory = 'consumidor_final',
      customerCuit = null,
      observations = null,
      requestAfipCAE = true // Solicitar CAE automáticamente
    } = req.body;
    
    // Buscar la orden con sus items
    const order = await Order.findByPk(orderId, {
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
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    // Verificar que la orden esté pagada
    if (order.paymentStatus !== 'paid') {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'La orden debe estar pagada para generar una factura' 
      });
    }
    
    // Verificar si ya existe una factura para esta orden
    const existingInvoice = await Invoice.findOne({
      where: { orderId }
    });
    
    if (existingInvoice) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Ya existe una factura para esta orden',
        invoiceNumber: existingInvoice.invoiceNumber
      });
    }
    
    // Generar número de factura
    const invoiceNumber = await generateInvoiceNumber();
    
    // Preparar items para la factura (snapshot)
    const invoiceItems = order.items.map(item => ({
      productId: item.productId,
      name: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: parseFloat(item.price),
      subtotal: parseFloat(item.quantity * item.price)
    }));
    
    // Calcular montos
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = 16.00; // IVA del 16% (configurable)
    const tax = (subtotal * taxRate) / 100;
    const shipping = parseFloat(order.shippingCost || 0);
    const discount = parseFloat(order.discount || 0);
    const total = subtotal + tax + shipping - discount;
    
    // Crear factura
    const invoice = await Invoice.create({
      invoiceNumber,
      orderId: order.id,
      userId: order.userId,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerEmail: order.user.email,
      customerPhone: customerPhone || order.shippingAddress?.phone || null,
      customerAddress: customerAddress || order.shippingAddress?.fullAddress || null,
      customerTaxId: customerTaxId || null,
      subtotal,
      tax,
      taxRate,
      discount,
      shipping,
      total,
      items: invoiceItems,
      paymentMethod: paymentMethod || order.paymentMethod || 'MercadoPago',
      paymentId: paymentId || order.paymentId || null,
      paymentDate: order.paidAt || new Date(),
      status: 'paid',
      issueDate: new Date(),
      notes,
      customerNotes,
      // Campos AFIP
      invoiceType,
      customerTaxCategory,
      customerCuit,
      observations,
      afipStatus: 'pending', // Pendiente hasta solicitar CAE
      pointOfSale: 1 // Por defecto, se puede configurar
    }, { transaction });
    
    // Actualizar orden con referencia a factura
    await order.update({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber
    }, { transaction });
    
    await transaction.commit();

    // Solicitar CAE a AFIP automáticamente (sin bloquear la transacción)
    if (requestAfipCAE) {
      try {
        console.log('📝 Solicitando CAE a AFIP para factura:', invoice.invoiceNumber);
        await afipService.requestCAE(invoice);
        console.log('✅ CAE obtenido exitosamente');
        
        // Recargar factura con datos actualizados
        await invoice.reload();
      } catch (afipError) {
        console.error('⚠️ Error al solicitar CAE (factura creada sin CAE):', afipError.message);
        // No fallar la creación de factura si AFIP falla
        // El CAE se puede solicitar manualmente después
      }
    }
    
    res.status(201).json({
      message: 'Factura creada exitosamente',
      invoice,
      afipStatus: invoice.afipStatus,
      cae: invoice.cae || null
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear factura:', error);
    res.status(500).json({ 
      message: 'Error al crear la factura',
      error: error.message 
    });
  }
};

// Crear factura manualmente (admin)
const createManualInvoice = async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerTaxId,
      customerCuit,
      customerTaxCategory = 'consumidor_final',
      invoiceType = 'B',
      items,
      discount = 0,
      shipping = 0,
      taxRate = 21,
      paymentMethod = 'Efectivo',
      paymentId = null,
      observations,
      requestAfipCAE = false
    } = req.body;

    // Validaciones
    if (!customerName || !customerEmail) {
      return res.status(400).json({ message: 'Faltan datos del cliente' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Debe agregar al menos un producto' });
    }

    // Generar número de factura
    const invoiceNumber = await generateInvoiceNumber();

    // Calcular montos
    const subtotal = items.reduce((sum, item) => 
      sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice)), 0
    );
    const tax = (subtotal * parseFloat(taxRate)) / 100;
    const total = subtotal + tax + parseFloat(shipping) - parseFloat(discount);

    // Crear factura
    const invoice = await Invoice.create({
      invoiceNumber,
      userId: userId || null,
      orderId: null, // Factura manual sin orden
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      customerAddress: customerAddress || null,
      customerTaxId: customerTaxId || null,
      customerCuit: customerCuit || null,
      customerTaxCategory,
      invoiceType,
      subtotal,
      tax,
      taxRate: parseFloat(taxRate),
      discount: parseFloat(discount),
      shipping: parseFloat(shipping),
      total,
      items: items.map(item => ({
        name: item.name,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        subtotal: parseFloat(item.subtotal) || (parseInt(item.quantity) * parseFloat(item.unitPrice))
      })),
      paymentMethod,
      paymentId,
      paymentDate: new Date(),
      status: 'paid', // Facturas manuales se marcan como pagadas
      issueDate: new Date(),
      observations,
      afipStatus: 'pending',
      pointOfSale: 1
    });

    // Solicitar CAE a AFIP si está habilitado
    if (requestAfipCAE) {
      try {
        console.log('📝 Solicitando CAE a AFIP para factura manual:', invoice.invoiceNumber);
        await afipService.requestCAE(invoice);
        await invoice.reload();
      } catch (afipError) {
        console.error('Error al solicitar CAE:', afipError.message);
        // No falla la creación, solo registra el error
      }
    }

    res.status(201).json({
      message: 'Factura creada exitosamente',
      invoice,
      afipStatus: invoice.afipStatus,
      cae: invoice.cae || null
    });

  } catch (error) {
    console.error('Error al crear factura manual:', error);
    res.status(500).json({ 
      message: 'Error al crear la factura',
      error: error.message 
    });
  }
};

// Obtener todas las facturas (admin)
const getAllInvoices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      startDate, 
      endDate,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate[Op.gte] = new Date(startDate);
      if (endDate) where.issueDate[Op.lte] = new Date(endDate);
    }
    
    if (search) {
      where[Op.or] = [
        { invoiceNumber: { [Op.iLike]: `%${search}%` } },
        { customerName: { [Op.iLike]: `%${search}%` } },
        { customerEmail: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const { count, rows } = await Invoice.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'status']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    res.json({
      invoices: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ 
      message: 'Error al obtener las facturas',
      error: error.message 
    });
  }
};

// Obtener facturas del usuario actual
const getUserInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Invoice.findAndCountAll({
      where: { userId },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'status']
        }
      ]
    });
    
    res.json({
      invoices: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error al obtener facturas del usuario:', error);
    res.status(500).json({ 
      message: 'Error al obtener tus facturas',
      error: error.message 
    });
  }
};

// Obtener factura por ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const where = { id };
    if (!isAdmin) {
      where.userId = userId; // Los usuarios solo pueden ver sus propias facturas
    }
    
    const invoice = await Invoice.findOne({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'status', 'shippingAddress']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    res.json({ invoice });
    
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ 
      message: 'Error al obtener la factura',
      error: error.message 
    });
  }
};

// Obtener factura por número
const getInvoiceByNumber = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const where = { invoiceNumber };
    if (!isAdmin) {
      where.userId = userId;
    }
    
    const invoice = await Invoice.findOne({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber', 'status']
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    res.json({ invoice });
    
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ 
      message: 'Error al obtener la factura',
      error: error.message 
    });
  }
};

// Cancelar factura (solo admin)
const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const invoice = await Invoice.findByPk(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    if (invoice.status === 'cancelled') {
      return res.status(400).json({ message: 'La factura ya está cancelada' });
    }
    
    await invoice.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: req.user.id,
      cancellationReason: reason || 'Sin especificar'
    });
    
    res.json({
      message: 'Factura cancelada exitosamente',
      invoice
    });
    
  } catch (error) {
    console.error('Error al cancelar factura:', error);
    res.status(500).json({ 
      message: 'Error al cancelar la factura',
      error: error.message 
    });
  }
};

// Obtener estadísticas de facturas (admin)
const getInvoiceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    
    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate[Op.gte] = new Date(startDate);
      if (endDate) where.issueDate[Op.lte] = new Date(endDate);
    }
    
    const stats = await Invoice.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('tax')), 'totalTax']
      ],
      group: ['status'],
      raw: true
    });
    
    const totalInvoices = await Invoice.count({ where });
    const totalRevenue = await Invoice.sum('total', { 
      where: { 
        ...where, 
        status: { [Op.in]: ['paid', 'issued'] } 
      } 
    });
    
    res.json({
      stats,
      summary: {
        totalInvoices,
        totalRevenue: totalRevenue || 0
      }
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};

// Generar y descargar PDF de factura
const downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const where = { id };
    if (!isAdmin) {
      where.userId = userId; // Los usuarios solo pueden ver sus propias facturas
    }
    
    const invoice = await Invoice.findOne({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    // Generar PDF
    const uploadsDir = path.join(__dirname, '../../uploads/invoices');
    const filename = `${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    
    // Verificar si ya existe el PDF
    if (!fs.existsSync(filePath)) {
      // Normalizar datos antes de generar PDF
      const normalizedInvoice = normalizeInvoiceForPDF(invoice);
      await InvoicePDFService.generateInvoicePDF(normalizedInvoice, filePath);
      
      // Guardar URL del PDF en la base de datos
      await invoice.update({
        pdfUrl: `/uploads/invoices/${filename}`
      });
    }
    
    // Enviar archivo
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error al enviar PDF:', err);
        res.status(500).json({ message: 'Error al generar el PDF' });
      }
    });
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ 
      message: 'Error al generar el PDF',
      error: error.message 
    });
  }
};

// Ver PDF de factura en el navegador
const viewInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const where = { id };
    if (!isAdmin) {
      where.userId = userId;
    }
    
    const invoice = await Invoice.findOne({ where });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    const uploadsDir = path.join(__dirname, '../../uploads/invoices');
    const filename = `${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    
    // Generar si no existe
    if (!fs.existsSync(filePath)) {
      // Normalizar datos antes de generar PDF
      const normalizedInvoice = normalizeInvoiceForPDF(invoice);
      await InvoicePDFService.generateInvoicePDF(normalizedInvoice, filePath);
      
      await invoice.update({
        pdfUrl: `/uploads/invoices/${filename}`
      });
    }
    
    // Enviar como inline (para ver en navegador)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error al ver PDF:', error);
    res.status(500).json({ 
      message: 'Error al mostrar el PDF',
      error: error.message 
    });
  }
};

// Enviar factura por email
const emailInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const where = { id };
    if (!isAdmin) {
      where.userId = userId;
    }
    
    const invoice = await Invoice.findOne({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber']
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    // Generar PDF si no existe
    const uploadsDir = path.join(__dirname, '../../uploads/invoices');
    const filename = `${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      // Normalizar datos antes de generar PDF
      const normalizedInvoice = normalizeInvoiceForPDF(invoice);
      await InvoicePDFService.generateInvoicePDF(normalizedInvoice, filePath);
      
      await invoice.update({
        pdfUrl: `/uploads/invoices/${filename}`
      });
    }
    
    // Enviar email
    const targetEmail = email || invoice.customerEmail;
    
    await emailService.sendEmail({
      to: targetEmail,
      subject: `Factura ${invoice.invoiceNumber} - E-Commerce`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Factura ${invoice.invoiceNumber}</h2>
          <p>Estimado/a ${invoice.customerName},</p>
          <p>Adjuntamos tu factura correspondiente a tu compra.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Número de Factura:</strong> ${invoice.invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(invoice.issueDate).toLocaleDateString('es-AR')}</p>
            <p style="margin: 5px 0;"><strong>Total:</strong> ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(invoice.total)}</p>
            <p style="margin: 5px 0;"><strong>Estado:</strong> ${invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}</p>
          </div>
          
          <p>El PDF adjunto contiene todos los detalles de tu factura.</p>
          
          <p>Si tienes alguna consulta, no dudes en contactarnos.</p>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            Este es un correo automático, por favor no responder.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          path: filePath
        }
      ]
    });
    
    res.json({
      message: `Factura enviada exitosamente a ${targetEmail}`,
      email: targetEmail
    });
    
  } catch (error) {
    console.error('Error al enviar factura por email:', error);
    res.status(500).json({ 
      message: 'Error al enviar la factura',
      error: error.message 
    });
  }
};

// Regenerar PDF de factura (por si hubo cambios)
const regenerateInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByPk(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    const uploadsDir = path.join(__dirname, '../../uploads/invoices');
    const filename = `${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    
    // Eliminar PDF anterior si existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Generar nuevo PDF con datos normalizados
    const normalizedInvoice = normalizeInvoiceForPDF(invoice);
    await InvoicePDFService.generateInvoicePDF(normalizedInvoice, filePath);
    
    await invoice.update({
      pdfUrl: `/uploads/invoices/${filename}`
    });
    
    res.json({
      message: 'PDF regenerado exitosamente',
      pdfUrl: invoice.pdfUrl
    });
    
  } catch (error) {
    console.error('Error al regenerar PDF:', error);
    res.status(500).json({ 
      message: 'Error al regenerar el PDF',
      error: error.message 
    });
  }
};

// Exportar todas las funciones
module.exports = {
  createInvoiceFromOrder,
  createManualInvoice,
  getAllInvoices,
  getUserInvoices,
  getInvoiceById,
  getInvoiceByNumber,
  cancelInvoice,
  getInvoiceStats,
  downloadInvoicePDF,
  viewInvoicePDF,
  emailInvoice,
  regenerateInvoicePDF
};
