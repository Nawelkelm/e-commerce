const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const afipService = require('./afipService');

class InvoicePDFService {
  /**
   * Genera un PDF de factura
   * @param {Object} invoice - Objeto de factura con todos los datos
   * @param {String} outputPath - Ruta donde guardar el PDF
   * @returns {Promise<String>} - Path del archivo generado
   */
  static async generateInvoicePDF(invoice, outputPath) {
    return new Promise(async (resolve, reject) => {
      try {
        // Crear directorio si no existe
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Factura ${invoice.invoiceNumber}`,
            Author: 'E-Commerce',
            Subject: 'Factura de compra'
          }
        });

        // Stream a archivo
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // HEADER - Logo y datos de la empresa
        this._addHeader(doc);

        // INFORMACIÓN DE LA FACTURA
        this._addInvoiceInfo(doc, invoice);

        // INFORMACIÓN DEL CLIENTE
        this._addCustomerInfo(doc, invoice);

        // TABLA DE ITEMS
        this._addItemsTable(doc, invoice);

        // TOTALES
        this._addTotals(doc, invoice);

        // FOOTER (async por el QR)
        await this._addFooter(doc, invoice);

        // Finalizar documento
        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (err) => {
          reject(err);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Header con logo y datos de la empresa
   */
  static _addHeader(doc) {
    doc
      .fontSize(20)
      .fillColor('#2563eb')
      .text('E-COMMERCE', 50, 50, { bold: true })
      .fontSize(10)
      .fillColor('#666666')
      .text('www.ecommerce.com', 50, 75)
      .text('soporte@ecommerce.com', 50, 88)
      .text('Tel: +54 11 1234-5678', 50, 101)
      .text('CUIT: 20-12345678-9', 50, 114); // Agregar CUIT de la empresa

    // Línea separadora
    doc
      .moveTo(50, 130)
      .lineTo(545, 130)
      .strokeColor('#e5e7eb')
      .stroke();
  }

  /**
   * Información de la factura
   */
  static _addInvoiceInfo(doc, invoice) {
    const top = 150;
    
    // Tipo de factura (A/B/C) en recuadro grande
    const invoiceType = invoice.invoiceType || 'B';
    doc
      .fontSize(28)
      .fillColor('#2563eb')
      .font('Helvetica-Bold')
      .rect(480, top - 10, 60, 60)
      .stroke()
      .text(invoiceType, 500, top + 5, { align: 'center', width: 20 })
      .fontSize(8)
      .font('Helvetica')
      .text('COD. ' + this._getAfipCode(invoiceType), 485, top + 40, { align: 'center', width: 50 });
    
    doc
      .fontSize(14)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('FACTURA', 350, top, { align: 'left' })
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text(`Nº: ${invoice.invoiceNumber}`, 350, top + 20, { align: 'left' })
      .text(`Fecha: ${this._formatDate(invoice.issueDate)}`, 350, top + 35, { align: 'left' })
      .text(`Estado: ${this._translateStatus(invoice.status)}`, 350, top + 50, { align: 'left' });

    // Información de CAE si existe
    if (invoice.cae) {
      doc
        .fontSize(8)
        .fillColor('#059669')
        .font('Helvetica-Bold')
        .text(`CAE: ${invoice.cae}`, 350, top + 70, { align: 'left' })
        .text(`Vto. CAE: ${this._formatDate(invoice.caeDueDate)}`, 350, top + 83, { align: 'left' });
    } else if (invoice.afipStatus === 'pending') {
      doc
        .fontSize(8)
        .fillColor('#f59e0b')
        .text('Pendiente de autorización AFIP', 350, top + 70);
    }
  }

  /**
   * Información del cliente
   */
  static _addCustomerInfo(doc, invoice) {
    const top = 250;

    doc
      .fontSize(12)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('FACTURADO A:', 50, top)
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#374151')
      .text(invoice.customerName, 50, top + 20)
      .text(invoice.customerEmail, 50, top + 35)
      .text(invoice.customerPhone || 'Sin teléfono', 50, top + 50);

    if (invoice.customerAddress) {
      doc.text(invoice.customerAddress, 50, top + 65, { width: 250 });
    }

    // CUIT del cliente si existe
    if (invoice.customerCuit) {
      doc
        .font('Helvetica-Bold')
        .text(`CUIT: ${this._formatCUIT(invoice.customerCuit)}`, 50, top + 95);
    } else if (invoice.customerTaxId) {
      doc
        .font('Helvetica-Bold')
        .text(`DNI/Tax ID: ${invoice.customerTaxId}`, 50, top + 95);
    }

    // Condición IVA
    if (invoice.customerTaxCategory) {
      doc
        .font('Helvetica')
        .text(`Condición IVA: ${this._translateTaxCategory(invoice.customerTaxCategory)}`, 50, top + 110);
    }
  }

  /**
   * Tabla de items
   */
  static _addItemsTable(doc, invoice) {
    const tableTop = 370;
    const itemHeight = 25;

    // Header de la tabla
    doc
      .fontSize(10)
      .fillColor('#ffffff')
      .rect(50, tableTop, 495, 25)
      .fill('#2563eb');

    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .text('Producto', 60, tableTop + 8, { width: 200 })
      .text('Cant.', 270, tableTop + 8, { width: 50, align: 'center' })
      .text('Precio Unit.', 330, tableTop + 8, { width: 80, align: 'right' })
      .text('Subtotal', 470, tableTop + 8, { width: 65, align: 'right' });

    // Items
    let currentY = tableTop + 30;
    doc.font('Helvetica').fillColor('#374151');

    invoice.items.forEach((item, index) => {
      // Fondo alternado
      if (index % 2 === 0) {
        doc
          .rect(50, currentY - 5, 495, itemHeight)
          .fill('#f9fafb');
      }

      // Validar valores
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const subtotal = parseFloat(item.subtotal) || (quantity * unitPrice);

      doc
        .fillColor('#374151')
        .fontSize(9)
        .text(item.name || 'Producto sin nombre', 60, currentY, { width: 200 })
        .text(quantity.toString(), 270, currentY, { width: 50, align: 'center' })
        .text(this._formatCurrency(unitPrice), 330, currentY, { width: 80, align: 'right' })
        .text(this._formatCurrency(subtotal), 470, currentY, { width: 65, align: 'right' });

      // SKU en gris más pequeño
      if (item.sku) {
        doc
          .fontSize(7)
          .fillColor('#9ca3af')
          .text(`SKU: ${item.sku}`, 60, currentY + 12, { width: 200 });
      }

      currentY += itemHeight;
    });

    // Línea final de tabla
    doc
      .moveTo(50, currentY)
      .lineTo(545, currentY)
      .strokeColor('#e5e7eb')
      .stroke();

    return currentY;
  }

  /**
   * Totales
   */
  static _addTotals(doc, invoice) {
    const startY = 570;
    const lineHeight = 20;

    // Validar y parsear valores
    const subtotal = parseFloat(invoice.subtotal) || 0;
    const discount = parseFloat(invoice.discount) || 0;
    const shipping = parseFloat(invoice.shipping) || 0;
    const tax = parseFloat(invoice.tax) || 0;
    const total = parseFloat(invoice.total) || (subtotal - discount + shipping + tax);
    const taxRate = parseFloat(invoice.taxRate) || 21;

    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .font('Helvetica');

    // Subtotal
    doc
      .text('Subtotal:', 370, startY, { width: 100, align: 'right' })
      .text(this._formatCurrency(subtotal), 475, startY, { width: 70, align: 'right' });

    // Descuento
    if (discount > 0) {
      doc
        .text('Descuento:', 370, startY + lineHeight, { width: 100, align: 'right' })
        .fillColor('#ef4444')
        .text(`-${this._formatCurrency(discount)}`, 475, startY + lineHeight, { width: 70, align: 'right' })
        .fillColor('#6b7280');
    }

    // Envío
    if (shipping > 0) {
      doc
        .text('Envío:', 370, startY + lineHeight * 2, { width: 100, align: 'right' })
        .text(this._formatCurrency(shipping), 475, startY + lineHeight * 2, { width: 70, align: 'right' });
    }

    // Impuesto
    doc
      .text(`IVA (${taxRate}%):`, 370, startY + lineHeight * 3, { width: 100, align: 'right' })
      .text(this._formatCurrency(tax), 475, startY + lineHeight * 3, { width: 70, align: 'right' });

    // Línea separadora
    doc
      .moveTo(370, startY + lineHeight * 4 - 5)
      .lineTo(545, startY + lineHeight * 4 - 5)
      .strokeColor('#d1d5db')
      .stroke();

    // Total
    doc
      .fontSize(14)
      .fillColor('#1f2937')
      .font('Helvetica-Bold')
      .text('TOTAL:', 370, startY + lineHeight * 4 + 5, { width: 100, align: 'right' })
      .fillColor('#2563eb')
      .text(this._formatCurrency(total), 475, startY + lineHeight * 4 + 5, { width: 70, align: 'right' });
  }

  /**
   * Footer con código QR de AFIP
   */
  static async _addFooter(doc, invoice) {
    const footerTop = 700;

    // Información de pago
    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .font('Helvetica')
      .text('Información de Pago:', 50, footerTop)
      .text(`Método: ${invoice.paymentMethod}`, 50, footerTop + 15)
      .text(`ID de Transacción: ${invoice.paymentId || 'N/A'}`, 50, footerTop + 30)
      .text(`Fecha de Pago: ${this._formatDate(invoice.paymentDate)}`, 50, footerTop + 45);

    // Código QR de AFIP
    if (invoice.cae) {
      try {
        const qrData = afipService.generateQRData(invoice);
        if (qrData) {
          // Generar QR como buffer
          const qrBuffer = await QRCode.toBuffer(qrData, {
            errorCorrectionLevel: 'M',
            type: 'png',
            width: 100,
            margin: 1
          });

          // Agregar QR al PDF
          doc.image(qrBuffer, 420, footerTop - 10, { width: 100 });
          
          doc
            .fontSize(7)
            .fillColor('#374151')
            .text('Comprobante autorizado', 400, footerTop + 95, { width: 140, align: 'center' })
            .text('por AFIP', 400, footerTop + 105, { width: 140, align: 'center' });
        }
      } catch (error) {
        console.error('Error al generar QR:', error);
      }
    }

    // Notas u observaciones
    if (invoice.observations) {
      doc
        .fontSize(8)
        .fillColor('#6b7280')
        .text('Observaciones:', 50, footerTop + 70)
        .text(invoice.observations, 50, footerTop + 85, { width: 300 });
    }

    // Leyenda de CAE (obligatoria por AFIP)
    if (invoice.cae) {
      doc
        .fontSize(8)
        .fillColor('#059669')
        .font('Helvetica-Bold')
        .text(
          `CAE N° ${invoice.cae} - Fecha de Vto: ${this._formatDate(invoice.caeDueDate)}`,
          50,
          750,
          { width: 340, align: 'center' }
        );
    }

    // Línea final
    doc
      .moveTo(50, 770)
      .lineTo(545, 770)
      .strokeColor('#e5e7eb')
      .stroke();

    // Texto legal
    doc
      .fontSize(7)
      .fillColor('#9ca3af')
      .text(
        'Este documento es una factura electrónica válida. Para cualquier consulta contacte a soporte@ecommerce.com',
        50,
        785,
        { align: 'center', width: 495 }
      );
  }

  /**
   * Helpers
   */
  static _formatCurrency(amount) {
    // Validar que el monto sea un número válido
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || amount === null || amount === undefined) {
      return '$ 0.00';
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(numAmount);
  }

  static _formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static _translateStatus(status) {
    const translations = {
      draft: 'Borrador',
      issued: 'Emitida',
      paid: 'Pagada',
      cancelled: 'Cancelada',
      refunded: 'Reembolsada'
    };
    return translations[status] || status;
  }

  static _getAfipCode(invoiceType) {
    const codes = {
      'A': '001',
      'B': '006',
      'C': '011',
      'E': '019',
      'M': '051'
    };
    return codes[invoiceType] || '006';
  }

  static _formatCUIT(cuit) {
    if (!cuit) return '';
    const clean = cuit.replace(/[-\s]/g, '');
    if (clean.length === 11) {
      return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
    }
    return cuit;
  }

  static _translateTaxCategory(category) {
    const translations = {
      'responsable_inscripto': 'Responsable Inscripto',
      'responsable_monotributo': 'Responsable Monotributo',
      'exento': 'Exento',
      'no_responsable': 'No Responsable',
      'consumidor_final': 'Consumidor Final'
    };
    return translations[category] || category;
  }
}

module.exports = InvoicePDFService;
