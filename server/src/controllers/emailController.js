const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');
const { sendEmail, sendTemplateEmail } = require('../services/emailServiceHelpers');
const { replaceVariables } = require('../services/emailServiceHelpers');
const { Op } = require('sequelize');

// Get all email templates
exports.getAllTemplates = async (req, res) => {
  try {
    const { search, type, isActive, page = 1, limit = 20 } = req.query;
    
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (type) {
      where.type = type;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: templates } = await EmailTemplate.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: require('../models/User'),
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    res.status(200).json({
      success: true,
      templates,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalTemplates: count
    });
    
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plantillas de email',
      error: error.message
    });
  }
};

// Get single email template
exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await EmailTemplate.findByPk(id, {
      include: [{
        model: require('../models/User'),
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      template
    });
    
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plantilla',
      error: error.message
    });
  }
};

// Create email template
exports.createTemplate = async (req, res) => {
  try {
    const {
      name,
      subject,
      htmlContent,
      textContent,
      type,
      variables,
      isActive
    } = req.body;
    
    // Validation
    if (!name || !subject || !htmlContent || !type) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, asunto, contenido HTML y tipo son requeridos'
      });
    }
    
    // Check for duplicate name
    const existing = await EmailTemplate.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una plantilla con ese nombre'
      });
    }
    
    const template = await EmailTemplate.create({
      name,
      subject,
      htmlContent,
      textContent,
      type,
      variables: variables || [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Plantilla creada exitosamente',
      template
    });
    
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear plantilla',
      error: error.message
    });
  }
};

// Update email template
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      subject,
      htmlContent,
      textContent,
      type,
      variables,
      isActive
    } = req.body;
    
    const template = await EmailTemplate.findByPk(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }
    
    // Check for duplicate name if changing name
    if (name && name !== template.name) {
      const existing = await EmailTemplate.findOne({ where: { name } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una plantilla con ese nombre'
        });
      }
    }
    
    await template.update({
      name: name || template.name,
      subject: subject || template.subject,
      htmlContent: htmlContent || template.htmlContent,
      textContent: textContent !== undefined ? textContent : template.textContent,
      type: type || template.type,
      variables: variables || template.variables,
      isActive: isActive !== undefined ? isActive : template.isActive
    });
    
    res.status(200).json({
      success: true,
      message: 'Plantilla actualizada exitosamente',
      template
    });
    
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar plantilla',
      error: error.message
    });
  }
};

// Delete email template
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await EmailTemplate.findByPk(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }
    
    await template.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Plantilla eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar plantilla',
      error: error.message
    });
  }
};

// Toggle template status
exports.toggleTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await EmailTemplate.findByPk(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }
    
    await template.update({ isActive: !template.isActive });
    
    res.status(200).json({
      success: true,
      message: `Plantilla ${template.isActive ? 'activada' : 'desactivada'} exitosamente`,
      template
    });
    
  } catch (error) {
    console.error('Error toggling template status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de plantilla',
      error: error.message
    });
  }
};

// Send test email
exports.sendTestEmail = async (req, res) => {
  try {
    const { templateId, recipientEmail } = req.body;
    
    if (!templateId || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'ID de plantilla y email del destinatario son requeridos'
      });
    }
    
    const template = await EmailTemplate.findByPk(templateId);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }
    
    // Test variables
    const testVariables = {
      customerName: 'Juan Pérez',
      orderNumber: 'TEST-12345',
      orderDate: new Date().toLocaleDateString('es-ES'),
      orderTotal: '$150.00',
      orderItems: `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;">Producto de Prueba 1</td>
          <td style="padding: 10px; text-align: center;">2</td>
          <td style="padding: 10px; text-align: right;">$50.00</td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">$100.00</td>
        </tr>
      `,
      shippingAddress: 'Calle Ejemplo 123, Ciudad, Estado 12345',
      trackingUrl: process.env.FRONTEND_URL + '/tracking/test',
      trackingNumber: 'TRACK-TEST-123',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
      deliveryDate: new Date().toLocaleDateString('es-ES'),
      loginUrl: process.env.FRONTEND_URL + '/login',
      shopUrl: process.env.FRONTEND_URL + '/productos',
      supportEmail: process.env.SUPPORT_EMAIL || 'soporte@ejemplo.com',
      resetUrl: process.env.FRONTEND_URL + '/reset-password?token=test',
      expiryTime: '1 hora',
      cartTotal: '$150.00',
      cartItems: `<tr><td style="padding: 10px;">Producto en Carrito</td><td style="padding: 10px;">2</td><td style="padding: 10px;">$50.00</td></tr>`,
      cartUrl: process.env.FRONTEND_URL + '/carrito',
      couponCode: 'TEST10',
      promoTitle: 'Promoción de Prueba',
      promoDescription: 'Esta es una promoción de prueba',
      promoImage: 'https://via.placeholder.com/600x300/667eea/ffffff?text=Promocion',
      reviewUrl: process.env.FRONTEND_URL + '/review/test'
    };
    
    const subject = replaceVariables(template.subject, testVariables);
    const html = replaceVariables(template.htmlContent, testVariables);
    const text = template.textContent ? replaceVariables(template.textContent, testVariables) : null;
    
    const result = await sendEmail({
      to: recipientEmail,
      subject: '[TEST] ' + subject,
      html,
      text,
      templateId: template.id,
      metadata: { isTest: true, sentBy: req.user.id }
    });
    
    res.status(200).json({
      success: true,
      message: 'Email de prueba enviado exitosamente',
      result
    });
    
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar email de prueba',
      error: error.message
    });
  }
};

// Get email logs
exports.getEmailLogs = async (req, res) => {
  try {
    const { status, templateId, recipientEmail, page = 1, limit = 50 } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (templateId) {
      where.templateId = templateId;
    }
    
    if (recipientEmail) {
      where.recipientEmail = { [Op.iLike]: `%${recipientEmail}%` };
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: logs } = await EmailLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: EmailTemplate,
        attributes: ['id', 'name', 'type']
      }]
    });
    
    res.status(200).json({
      success: true,
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalLogs: count
    });
    
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener logs de emails',
      error: error.message
    });
  }
};

// Get email statistics
exports.getEmailStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    
    const totalSent = await EmailLog.count({
      where: {
        status: 'sent',
        createdAt: { [Op.gte]: startDate }
      }
    });
    
    const totalFailed = await EmailLog.count({
      where: {
        status: 'failed',
        createdAt: { [Op.gte]: startDate }
      }
    });
    
    const totalPending = await EmailLog.count({
      where: { status: 'pending' }
    });
    
    const opened = await EmailLog.count({
      where: {
        openedAt: { [Op.ne]: null },
        createdAt: { [Op.gte]: startDate }
      }
    });
    
    const clicked = await EmailLog.count({
      where: {
        clickedAt: { [Op.ne]: null },
        createdAt: { [Op.gte]: startDate }
      }
    });
    
    const byTemplate = await EmailLog.findAll({
      where: { createdAt: { [Op.gte]: startDate } },
      attributes: [
        'templateId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: [{
        model: EmailTemplate,
        attributes: ['name', 'type']
      }],
      group: ['templateId', 'EmailTemplate.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });
    
    res.status(200).json({
      success: true,
      stats: {
        totalSent,
        totalFailed,
        totalPending,
        opened,
        clicked,
        openRate: totalSent > 0 ? ((opened / totalSent) * 100).toFixed(2) : 0,
        clickRate: totalSent > 0 ? ((clicked / totalSent) * 100).toFixed(2) : 0,
        failureRate: (totalSent + totalFailed) > 0 ? ((totalFailed / (totalSent + totalFailed)) * 100).toFixed(2) : 0,
        byTemplate
      },
      period: `${period} días`
    });
    
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de emails',
      error: error.message
    });
  }
};
