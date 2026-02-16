const axios = require('axios');
const logger = require('../../config/logger');

class AndreaniService {
  constructor() {
    this.apiUrl = process.env.ANDREANI_API_URL || 'https://api.andreani.com/v2';
    this.username = process.env.ANDREANI_USERNAME;
    this.password = process.env.ANDREANI_PASSWORD;
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Autenticar con la API de Andreani
   */
  async authenticate() {
    try {
      if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.token;
      }

      const response = await axios.post(`${this.apiUrl}/login`, {
        username: this.username,
        password: this.password
      });

      this.token = response.data.token;
      // Token válido por 1 hora
      this.tokenExpiry = Date.now() + (60 * 60 * 1000);
      
      return this.token;
    } catch (error) {
      logger.error('Error authenticating with Andreani:', error);
      throw error;
    }
  }

  /**
   * Obtener tracking de un envío
   */
  async getTracking(trackingNumber) {
    try {
      const token = await this.authenticate();
      
      const response = await axios.get(
        `${this.apiUrl}/envios/${trackingNumber}/trazas`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.normalizeTracking(response.data);
    } catch (error) {
      logger.error('Error getting Andreani tracking:', error);
      return null;
    }
  }

  /**
   * Normalizar respuesta de tracking a formato estándar
   */
  normalizeTracking(data) {
    if (!data || !data.trazas) return null;

    const statusMap = {
      'Ingresado': 'pending',
      'En Sucursal': 'in_transit',
      'En Camino': 'in_transit',
      'En Distribucion': 'out_for_delivery',
      'Entregado': 'delivered',
      'Devuelto': 'returned',
      'Retenido': 'failed'
    };

    const events = data.trazas.map(traza => ({
      status: statusMap[traza.estado] || 'in_transit',
      location: `${traza.localidad || ''}, ${traza.provincia || ''}`.trim(),
      description: traza.estadoDescripcion || traza.estado,
      timestamp: new Date(traza.fecha),
      carrierMessage: traza.observaciones || null,
      isPublic: true
    }));

    return {
      trackingNumber: data.numeroDeEnvio,
      carrier: 'Andreani',
      status: events.length > 0 ? events[0].status : 'pending',
      estimatedDeliveryDate: data.fechaEstimadaEntrega ? new Date(data.fechaEstimadaEntrega) : null,
      events: events.sort((a, b) => b.timestamp - a.timestamp)
    };
  }

  /**
   * Crear un nuevo envío
   */
  async createShipment(shipmentData) {
    try {
      const token = await this.authenticate();

      const andreaniData = {
        contrato: process.env.ANDREANI_CONTRACT,
        origen: {
          postal: {
            codigoPostal: shipmentData.origin.postalCode,
            calle: shipmentData.origin.street,
            numero: shipmentData.origin.number,
            localidad: shipmentData.origin.city,
            provincia: shipmentData.origin.state,
            pais: shipmentData.origin.country || 'Argentina'
          }
        },
        destino: {
          postal: {
            codigoPostal: shipmentData.destination.postalCode,
            calle: shipmentData.destination.street,
            numero: shipmentData.destination.number,
            localidad: shipmentData.destination.city,
            provincia: shipmentData.destination.state,
            pais: shipmentData.destination.country || 'Argentina'
          }
        },
        remitente: {
          nombreCompleto: shipmentData.sender.name,
          email: shipmentData.sender.email,
          documentoTipo: 'DNI',
          documentoNumero: shipmentData.sender.document,
          telefonos: [{ tipo: 1, numero: shipmentData.sender.phone }]
        },
        destinatario: [
          {
            nombreCompleto: shipmentData.recipient.name,
            email: shipmentData.recipient.email,
            documentoTipo: 'DNI',
            documentoNumero: shipmentData.recipient.document,
            telefonos: [{ tipo: 1, numero: shipmentData.recipient.phone }]
          }
        ],
        productoAEntregar: shipmentData.items.map(item => ({
          descripcion: item.description,
          cantidad: item.quantity,
          peso: item.weight,
          valorDeclarado: item.value  
        })),
        valorDeclarado: shipmentData.totalValue
      };

      const response = await axios.post(
        `${this.apiUrl}/envios`,
        andreaniData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        trackingNumber: response.data.numeroDeEnvio,
        label: response.data.etiqueta,
        estimatedDeliveryDate: response.data.fechaEstimadaEntrega
      };
    } catch (error) {
      logger.error('Error creating Andreani shipment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Obtener cotización de envío
   */
  async getQuote(quoteData) {
    try {
      const token = await this.authenticate();

      const response = await axios.post(
        `${this.apiUrl}/tarifas`,
        {
          cpOrigen: quoteData.originPostalCode,
          cpDestino: quoteData.destinationPostalCode,
          contrato: process.env.ANDREANI_CONTRACT,
          bultos: quoteData.packages.map(pkg => ({
            kilos: pkg.weight,
            alto: pkg.height,
            ancho: pkg.width,
            largo: pkg.length,
            volumen: (pkg.height * pkg.width * pkg.length) / 1000000
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let quote = {
        success: true,
        price: response.data.tarifaConIva.total,
        currency: 'ARS',
        estimatedDays: response.data.plazoDiasDeEntrega
      };

      // Para métodos tipo 'carrier'
      if (method.type === 'carrier') {
        // Verifica credenciales activas
        const credentials = await LogisticsCredentials.findOne({
          where: { carrier: method.carrier, isActive: true }
        });
        
        if (credentials) {
          // Llama a la API real
          const carrierQuote = await getCarrierQuote(
            method.carrier, 
            destinationData
          );
          
          if (carrierQuote.success) {
            quote.price = carrierQuote.price; // Precio real
            quote.estimatedDays = carrierQuote.estimatedDays; // Días reales
          }
        }
      }

      return quote;
    } catch (error) {
      logger.error('Error getting Andreani quote:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = new AndreaniService();
