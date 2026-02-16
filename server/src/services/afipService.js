const Afip = require('@afipsdk/afip.js');
const AfipCredential = require('../models/AfipCredential');
const Invoice = require('../models/Invoice');
const path = require('path');
const fs = require('fs').promises;

class AfipService {
  constructor() {
    this.afipInstance = null;
    this.credential = null;
  }

  /**
   * Inicializa la instancia de AFIP con las credenciales activas
   */
  async initialize() {
    try {
      // Buscar credencial activa
      this.credential = await AfipCredential.findOne({
        where: { isActive: true }
      });

      if (!this.credential) {
        throw new Error('No hay credenciales AFIP configuradas');
      }

      if (!this.credential.hasCredentials()) {
        throw new Error('Las credenciales AFIP están incompletas');
      }

      // Crear directorios para certificados si no existen
      const certsDir = path.join(__dirname, '../../certs');
      await fs.mkdir(certsDir, { recursive: true });

      // Guardar certificado y clave temporalmente
      const certPath = path.join(certsDir, `${this.credential.cuit}.crt`);
      const keyPath = path.join(certsDir, `${this.credential.cuit}.key`);

      await fs.writeFile(certPath, this.credential.certificate);
      await fs.writeFile(keyPath, this.credential.privateKey);

      // Configuración de AFIP
      const afipConfig = {
        CUIT: this.credential.cuit,
        cert: certPath,
        key: keyPath,
        production: this.credential.production,
        ta_folder: path.join(__dirname, '../../temp/afip'),
      };

      // Crear carpeta para tickets de autorización
      await fs.mkdir(afipConfig.ta_folder, { recursive: true });

      // Inicializar SDK de AFIP
      this.afipInstance = new Afip(afipConfig);

      console.log(`✅ AFIP inicializado - CUIT: ${this.credential.cuit} - Ambiente: ${this.credential.getEnvironment()}`);

      return this.afipInstance;
    } catch (error) {
      console.error('❌ Error al inicializar AFIP:', error);
      throw error;
    }
  }

  /**
   * Verifica la conexión con los servidores de AFIP
   */
  async testConnection() {
    try {
      await this.initialize();

      // Intentar obtener el estado del servidor
      const status = await this.afipInstance.ElectronicBilling.getServerStatus();

      // Actualizar estado de conexión
      await this.credential.update({
        connectionStatus: 'connected',
        lastConnectionTest: new Date(),
        lastError: null
      });

      return {
        success: true,
        message: 'Conexión exitosa con AFIP',
        serverStatus: status,
        environment: this.credential.getEnvironment(),
        cuit: this.credential.cuit
      };
    } catch (error) {
      // Actualizar estado de error
      if (this.credential) {
        await this.credential.update({
          connectionStatus: 'error',
          lastConnectionTest: new Date(),
          lastError: error.message
        });
      }

      return {
        success: false,
        message: 'Error al conectar con AFIP',
        error: error.message
      };
    }
  }

  /**
   * Obtiene el último número de comprobante autorizado
   */
  async getLastInvoiceNumber(invoiceType, pointOfSale) {
    try {
      await this.initialize();

      const voucherType = this.getVoucherTypeCode(invoiceType);
      const lastNumber = await this.afipInstance.ElectronicBilling.getLastVoucher(
        pointOfSale,
        voucherType
      );

      return {
        success: true,
        lastNumber: parseInt(lastNumber),
        nextNumber: parseInt(lastNumber) + 1
      };
    } catch (error) {
      console.error('Error al obtener último número de factura:', error);
      throw error;
    }
  }

  /**
   * Solicita CAE (Código de Autorización Electrónica) para una factura
   */
  async requestCAE(invoice) {
    try {
      await this.initialize();

      // Validar datos requeridos
      this.validateInvoiceData(invoice);

      // Obtener el tipo de comprobante en código AFIP
      const voucherType = this.getVoucherTypeCode(invoice.invoiceType);
      const conceptType = 1; // 1=Productos, 2=Servicios, 3=Productos y Servicios

      // Obtener el último número de comprobante
      const lastVoucherInfo = await this.getLastInvoiceNumber(
        invoice.invoiceType,
        invoice.pointOfSale
      );
      const voucherNumber = lastVoucherInfo.nextNumber;

      // Preparar datos del comprobante
      const today = new Date();
      const voucherDate = this.formatDate(today);

      // Calcular montos según el tipo de factura
      const amounts = this.calculateAmounts(invoice);

      // Datos del comprobante para AFIP
      const voucherData = {
        CantReg: 1, // Cantidad de comprobantes (siempre 1 en este caso)
        PtoVta: invoice.pointOfSale,
        CbteTipo: voucherType,
        Concepto: conceptType,
        DocTipo: this.getDocumentTypeCode(invoice.customerTaxCategory),
        DocNro: invoice.customerCuit ? parseInt(invoice.customerCuit) : 0,
        CbteDesde: voucherNumber,
        CbteHasta: voucherNumber,
        CbteFch: voucherDate,
        ImpTotal: parseFloat(amounts.total),
        ImpTotConc: 0, // Importe neto no gravado
        ImpNeto: parseFloat(amounts.netAmount),
        ImpOpEx: 0, // Importe exento
        ImpIVA: parseFloat(amounts.vatAmount),
        ImpTrib: 0, // Otros tributos
        MonId: 'PES', // Moneda: Pesos
        MonCotiz: 1, // Cotización moneda
      };

      // Agregar IVA si corresponde
      if (amounts.vatAmount > 0) {
        voucherData.Iva = [
          {
            Id: 5, // 5 = 21%, 4 = 10.5%
            BaseImp: parseFloat(amounts.netAmount),
            Importe: parseFloat(amounts.vatAmount)
          }
        ];
      }

      console.log('📝 Solicitando CAE a AFIP:', voucherData);

      // Solicitar CAE a AFIP
      const response = await this.afipInstance.ElectronicBilling.createVoucher(voucherData);

      console.log('✅ Respuesta de AFIP:', response);

      // Actualizar factura con datos de AFIP
      const updateData = {
        cae: response.CAE,
        caeDueDate: this.parseAfipDate(response.CAEFchVto),
        afipStatus: 'authorized',
        afipResponse: response,
        afipRequestDate: new Date(),
        invoiceNumber: this.formatInvoiceNumber(
          invoice.pointOfSale,
          invoice.invoiceType,
          voucherNumber
        )
      };

      await invoice.update(updateData);

      return {
        success: true,
        cae: response.CAE,
        caeDueDate: response.CAEFchVto,
        voucherNumber: voucherNumber,
        message: 'CAE obtenido exitosamente'
      };

    } catch (error) {
      console.error('❌ Error al solicitar CAE:', error);

      // Actualizar factura con error
      await invoice.update({
        afipStatus: 'error',
        afipResponse: {
          error: error.message,
          timestamp: new Date()
        },
        afipRequestDate: new Date()
      });

      throw new Error(`Error AFIP: ${error.message}`);
    }
  }

  /**
   * Consulta un CAE previamente autorizado
   */
  async getCAEInfo(pointOfSale, voucherType, voucherNumber) {
    try {
      await this.initialize();

      const info = await this.afipInstance.ElectronicBilling.getVoucherInfo(
        voucherNumber,
        pointOfSale,
        this.getVoucherTypeCode(voucherType)
      );

      return {
        success: true,
        data: info
      };
    } catch (error) {
      console.error('Error al consultar CAE:', error);
      throw error;
    }
  }

  /**
   * Valida un CUIT/CUIL
   */
  async validateCUIT(cuit) {
    try {
      // Eliminar guiones y espacios
      const cleanCuit = cuit.replace(/[-\s]/g, '');

      // Validar formato (11 dígitos)
      if (!/^\d{11}$/.test(cleanCuit)) {
        return {
          valid: false,
          message: 'El CUIT debe tener 11 dígitos'
        };
      }

      // Validar dígito verificador
      const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
      let sum = 0;

      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCuit[i]) * multipliers[i];
      }

      const remainder = sum % 11;
      const expectedDigit = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;
      const actualDigit = parseInt(cleanCuit[10]);

      if (expectedDigit !== actualDigit) {
        return {
          valid: false,
          message: 'CUIT inválido (dígito verificador incorrecto)'
        };
      }

      return {
        valid: true,
        cuit: cleanCuit,
        formatted: `${cleanCuit.slice(0, 2)}-${cleanCuit.slice(2, 10)}-${cleanCuit.slice(10)}`
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message
      };
    }
  }

  /**
   * Obtiene el código de tipo de comprobante según AFIP
   */
  getVoucherTypeCode(invoiceType) {
    const types = {
      'A': 1,  // Factura A
      'B': 6,  // Factura B
      'C': 11, // Factura C
      'E': 19, // Factura E (Exportación)
      'M': 51  // Factura M
    };
    return types[invoiceType] || 6; // Default: Factura B
  }

  /**
   * Obtiene el código de tipo de documento según AFIP
   */
  getDocumentTypeCode(taxCategory) {
    // 96 = DNI, 80 = CUIT, 86 = CUIL, 99 = Consumidor Final
    if (taxCategory === 'consumidor_final') {
      return 99;
    }
    return 80; // CUIT por defecto
  }

  /**
   * Calcula montos según tipo de factura
   */
  calculateAmounts(invoice) {
    const total = parseFloat(invoice.total);
    
    if (invoice.invoiceType === 'A') {
      // Factura A: discrimina IVA
      const netAmount = total / 1.21; // Asumiendo IVA 21%
      const vatAmount = total - netAmount;
      
      return {
        total: total.toFixed(2),
        netAmount: netAmount.toFixed(2),
        vatAmount: vatAmount.toFixed(2)
      };
    } else {
      // Factura B/C: IVA incluido
      return {
        total: total.toFixed(2),
        netAmount: total.toFixed(2),
        vatAmount: 0
      };
    }
  }

  /**
   * Formatea una fecha para AFIP (YYYYMMDD)
   */
  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Parsea una fecha de AFIP (YYYYMMDD) a Date
   */
  parseAfipDate(dateStr) {
    if (!dateStr || dateStr.length !== 8) return null;
    
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatea el número de factura
   */
  formatInvoiceNumber(pointOfSale, type, number) {
    const pos = String(pointOfSale).padStart(5, '0');
    const num = String(number).padStart(8, '0');
    return `${type}-${pos}-${num}`;
  }

  /**
   * Valida los datos de la factura antes de enviar a AFIP
   */
  validateInvoiceData(invoice) {
    if (!invoice.invoiceType) {
      throw new Error('Tipo de factura requerido');
    }

    if (!invoice.pointOfSale) {
      throw new Error('Punto de venta requerido');
    }

    if (!invoice.total || invoice.total <= 0) {
      throw new Error('El total debe ser mayor a 0');
    }

    if (invoice.invoiceType === 'A' && !invoice.customerCuit) {
      throw new Error('Para Factura A se requiere CUIT del cliente');
    }

    return true;
  }

  /**
   * Genera datos para el código QR de AFIP
   */
  generateQRData(invoice) {
    if (!invoice.cae) {
      return null;
    }

    // URL base según ambiente
    const baseUrl = this.credential.production
      ? 'https://www.afip.gob.ar/fe/qr/'
      : 'https://www.afip.gob.ar/fe/qr/';

    // Formato del QR de AFIP
    const qrData = {
      ver: 1,
      fecha: this.formatDate(invoice.createdAt),
      cuit: this.credential.cuit,
      ptoVta: invoice.pointOfSale,
      tipoCmp: this.getVoucherTypeCode(invoice.invoiceType),
      nroCmp: this.extractVoucherNumber(invoice.invoiceNumber),
      importe: parseFloat(invoice.total),
      moneda: 'PES',
      ctz: 1,
      tipoDocRec: this.getDocumentTypeCode(invoice.customerTaxCategory),
      nroDocRec: invoice.customerCuit ? parseInt(invoice.customerCuit) : 0,
      tipoCodAut: 'E',
      codAut: invoice.cae
    };

    // Convertir a JSON y codificar en base64
    const jsonData = JSON.stringify(qrData);
    const base64Data = Buffer.from(jsonData).toString('base64');

    return `${baseUrl}?p=${base64Data}`;
  }

  /**
   * Extrae el número de comprobante del número de factura formateado
   */
  extractVoucherNumber(invoiceNumber) {
    // Formato: A-00001-00000123 -> 123
    if (!invoiceNumber) return 0;
    const parts = invoiceNumber.split('-');
    return parseInt(parts[2]) || 0;
  }
}

module.exports = new AfipService();
