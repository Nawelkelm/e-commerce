const afipService = require('../services/afipService');
const AfipCredential = require('../models/AfipCredential');
const Invoice = require('../models/Invoice');
const { Op } = require('sequelize');

// Test de conexión con AFIP
exports.testConnection = async (req, res) => {
  try {
    const result = await afipService.testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          serverStatus: result.serverStatus,
          environment: result.environment,
          cuit: result.cuit
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en test de conexión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al probar conexión con AFIP',
      error: error.message
    });
  }
};

// Obtener configuración AFIP activa
exports.getActiveCredential = async (req, res) => {
  try {
    const credential = await AfipCredential.findOne({
      where: { isActive: true }
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'No hay credenciales AFIP configuradas'
      });
    }

    // No enviar datos sensibles
    const safeCredential = {
      id: credential.id,
      name: credential.name,
      cuit: credential.cuit,
      businessName: credential.businessName,
      pointOfSale: credential.pointOfSale,
      production: credential.production,
      taxCategory: credential.taxCategory,
      address: credential.address,
      city: credential.city,
      postalCode: credential.postalCode,
      province: credential.province,
      connectionStatus: credential.connectionStatus,
      lastConnectionTest: credential.lastConnectionTest,
      lastError: credential.lastError,
      hasCredentials: credential.hasCredentials()
    };

    res.json({
      success: true,
      data: safeCredential
    });
  } catch (error) {
    console.error('Error al obtener credenciales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración AFIP',
      error: error.message
    });
  }
};

// Crear o actualizar credenciales AFIP
exports.saveCredential = async (req, res) => {
  try {
    const {
      name,
      cuit,
      businessName,
      certificate,
      privateKey,
      pointOfSale,
      production,
      taxCategory,
      address,
      city,
      postalCode,
      province,
      iibbNumber,
      activityStartDate
    } = req.body;

    // Validar CUIT
    const cuitValidation = await afipService.validateCUIT(cuit);
    if (!cuitValidation.valid) {
      return res.status(400).json({
        success: false,
        message: cuitValidation.message
      });
    }

    // Buscar credencial existente
    let credential = await AfipCredential.findOne({
      where: { cuit: cuitValidation.cuit }
    });

    const credentialData = {
      name,
      cuit: cuitValidation.cuit,
      businessName,
      certificate,
      privateKey,
      pointOfSale: pointOfSale || 1,
      production: production || false,
      taxCategory: taxCategory || 'responsable_inscripto',
      address,
      city,
      postalCode,
      province,
      iibbNumber,
      activityStartDate,
      isActive: true,
      connectionStatus: 'not_configured'
    };

    if (credential) {
      // Actualizar existente
      await credential.update(credentialData);
    } else {
      // Crear nueva (desactivar otras primero)
      await AfipCredential.update(
        { isActive: false },
        { where: { isActive: true } }
      );
      credential = await AfipCredential.create(credentialData);
    }

    res.json({
      success: true,
      message: 'Credenciales AFIP guardadas exitosamente',
      data: {
        id: credential.id,
        cuit: credential.cuit,
        businessName: credential.businessName
      }
    });
  } catch (error) {
    console.error('Error al guardar credenciales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar credenciales AFIP',
      error: error.message
    });
  }
};

// Solicitar CAE para una factura
exports.requestCAE = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findByPk(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Verificar si ya tiene CAE
    if (invoice.cae && invoice.afipStatus === 'authorized') {
      return res.status(400).json({
        success: false,
        message: 'Esta factura ya tiene CAE autorizado',
        cae: invoice.cae,
        caeDueDate: invoice.caeDueDate
      });
    }

    // Solicitar CAE
    const result = await afipService.requestCAE(invoice);

    res.json({
      success: true,
      message: 'CAE obtenido exitosamente',
      data: result
    });

  } catch (error) {
    console.error('Error al solicitar CAE:', error);
    res.status(500).json({
      success: false,
      message: 'Error al solicitar CAE a AFIP',
      error: error.message
    });
  }
};

// Consultar CAE de una factura
exports.getCAE = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findByPk(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    if (!invoice.cae) {
      return res.status(404).json({
        success: false,
        message: 'Esta factura no tiene CAE'
      });
    }

    res.json({
      success: true,
      data: {
        cae: invoice.cae,
        caeDueDate: invoice.caeDueDate,
        invoiceNumber: invoice.invoiceNumber,
        afipStatus: invoice.afipStatus,
        afipRequestDate: invoice.afipRequestDate,
        afipResponse: invoice.afipResponse
      }
    });

  } catch (error) {
    console.error('Error al consultar CAE:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar CAE',
      error: error.message
    });
  }
};

// Obtener último número de factura
exports.getLastInvoiceNumber = async (req, res) => {
  try {
    const { invoiceType, pointOfSale } = req.query;

    if (!invoiceType) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de factura requerido'
      });
    }

    const pos = pointOfSale || 1;
    const result = await afipService.getLastInvoiceNumber(invoiceType, pos);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error al obtener último número:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener último número de factura',
      error: error.message
    });
  }
};

// Validar CUIT
exports.validateCUIT = async (req, res) => {
  try {
    const { cuit } = req.body;

    if (!cuit) {
      return res.status(400).json({
        success: false,
        message: 'CUIT requerido'
      });
    }

    const result = await afipService.validateCUIT(cuit);

    res.json({
      success: result.valid,
      message: result.message || 'CUIT válido',
      data: result.valid ? {
        cuit: result.cuit,
        formatted: result.formatted
      } : null
    });

  } catch (error) {
    console.error('Error al validar CUIT:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar CUIT',
      error: error.message
    });
  }
};

// Estadísticas de facturación AFIP
exports.getAfipStats = async (req, res) => {
  try {
    const stats = await Invoice.findAll({
      attributes: [
        'afipStatus',
        [Invoice.sequelize.fn('COUNT', Invoice.sequelize.col('id')), 'count'],
        [Invoice.sequelize.fn('SUM', Invoice.sequelize.col('total')), 'total']
      ],
      group: ['afipStatus']
    });

    const byType = await Invoice.findAll({
      attributes: [
        'invoiceType',
        [Invoice.sequelize.fn('COUNT', Invoice.sequelize.col('id')), 'count'],
        [Invoice.sequelize.fn('SUM', Invoice.sequelize.col('total')), 'total']
      ],
      where: {
        afipStatus: 'authorized'
      },
      group: ['invoiceType']
    });

    res.json({
      success: true,
      data: {
        byStatus: stats,
        byType: byType
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas AFIP',
      error: error.message
    });
  }
};

// Re-solicitar CAE para facturas con error
exports.retryCAE = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findByPk(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Resetear estado
    await invoice.update({
      afipStatus: 'pending',
      cae: null,
      caeDueDate: null,
      afipResponse: null
    });

    // Solicitar CAE nuevamente
    const result = await afipService.requestCAE(invoice);

    res.json({
      success: true,
      message: 'CAE re-solicitado exitosamente',
      data: result
    });

  } catch (error) {
    console.error('Error al re-solicitar CAE:', error);
    res.status(500).json({
      success: false,
      message: 'Error al re-solicitar CAE',
      error: error.message
    });
  }
};

// Listar facturas pendientes de autorización
exports.getPendingInvoices = async (req, res) => {
  try {
    const pendingInvoices = await Invoice.findAll({
      where: {
        afipStatus: {
          [Op.in]: ['pending', 'error']
        }
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: pendingInvoices,
      count: pendingInvoices.length
    });

  } catch (error) {
    console.error('Error al obtener facturas pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas pendientes',
      error: error.message
    });
  }
};

// Procesar en lote facturas pendientes
exports.processPendingInvoices = async (req, res) => {
  try {
    const pendingInvoices = await Invoice.findAll({
      where: {
        afipStatus: 'pending'
      },
      limit: 10 // Procesar de a 10
    });

    const results = {
      processed: 0,
      authorized: 0,
      errors: 0,
      details: []
    };

    for (const invoice of pendingInvoices) {
      try {
        await afipService.requestCAE(invoice);
        results.authorized++;
        results.details.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          status: 'authorized'
        });
      } catch (error) {
        results.errors++;
        results.details.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          status: 'error',
          error: error.message
        });
      }
      results.processed++;
    }

    res.json({
      success: true,
      message: `Procesadas ${results.processed} facturas`,
      data: results
    });

  } catch (error) {
    console.error('Error al procesar facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar facturas pendientes',
      error: error.message
    });
  }
};
