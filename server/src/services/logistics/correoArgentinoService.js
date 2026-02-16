const axios = require('axios');
const logger = require('../../config/logger');

class CorreoArgentinoService {
  constructor() {
    this.apiUrl = process.env.CORREO_ARGENTINO_API_URL || 'https://api.correoargentino.com.ar';
    this.apiKey = process.env.CORREO_ARGENTINO_API_KEY;
    this.clientId = process.env.CORREO_ARGENTINO_CLIENT_ID;
  }

  /**
   * Obtener tracking de un envío
   */
  async getTracking(trackingNumber) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/micorreo/v1/tracking/piezas/${trackingNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.normalizeTracking(response.data);
    } catch (error) {
      logger.error('Error getting Correo Argentino tracking:', error);
      return null;
    }
  }

  /**
   * Normalizar respuesta de tracking a formato estándar
   */
  normalizeTracking(data) {
    if (!data || !data.piezas || data.piezas.length === 0) return null;

    const pieza = data.piezas[0];

    const statusMap = {
      'Admitido': 'label_created',
      'En tránsito': 'in_transit',
      'En proceso de distribución': 'out_for_delivery',
      'Entregado': 'delivered',
      'Devuelto al remitente': 'returned',
      'Retenido': 'failed',
      'Pendiente de retiro': 'out_for_delivery'
    };

    const events = (pieza.eventos || []).map(evento => ({
      status: statusMap[evento.descripcion] || 'in_transit',
      location: `${evento.unidadOrganizativa || ''}, ${evento.localidad || ''}`.trim(),
      description: evento.descripcion,
      timestamp: new Date(evento.fecha),
      carrierMessage: evento.observaciones || null,
      isPublic: true
    }));

    return {
      trackingNumber: pieza.idPieza,
      carrier: 'Correo Argentino',
      status: events.length > 0 ? events[0].status : 'pending',
      estimatedDeliveryDate: pieza.fechaEstimadaEntrega ? new Date(pieza.fechaEstimadaEntrega) : null,
      events: events.sort((a, b) => b.timestamp - a.timestamp)
    };
  }

  /**
   * Crear un nuevo envío
   */
  async createShipment(shipmentData) {
    try {
      const correoData = {
        clienteId: this.clientId,
        origen: {
          codigoPostal: shipmentData.origin.postalCode,
          calle: shipmentData.origin.street,
          numero: shipmentData.origin.number,
          localidad: shipmentData.origin.city,
          provincia: shipmentData.origin.state
        },
        destino: {
          codigoPostal: shipmentData.destination.postalCode,
          calle: shipmentData.destination.street,
          numero: shipmentData.destination.number,
          localidad: shipmentData.destination.city,
          provincia: shipmentData.destination.state
        },
        remitente: {
          nombreCompleto: shipmentData.sender.name,
          email: shipmentData.sender.email,
          telefono: shipmentData.sender.phone,
          tipoDocumento: 'DNI',
          numeroDocumento: shipmentData.sender.document
        },
        destinatario: {
          nombreCompleto: shipmentData.recipient.name,
          email: shipmentData.recipient.email,
          telefono: shipmentData.recipient.phone,
          tipoDocumento: 'DNI',
          numeroDocumento: shipmentData.recipient.document
        },
        paquetes: shipmentData.items.map(item => ({
          peso: item.weight,
          alto: item.height || 10,
          ancho: item.width || 10,
          largo: item.length || 10,
          contenido: item.description,
          valorDeclarado: item.value
        })),
        tipoEnvio: 'CLASICO', // CLASICO, EXPRESO, etc.
        valorDeclarado: shipmentData.totalValue
      };

      const response = await axios.post(
        `${this.apiUrl}/micorreo/v1/envios`,
        correoData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        trackingNumber: response.data.idPieza,
        label: response.data.urlEtiqueta,
        estimatedDeliveryDate: response.data.fechaEstimadaEntrega ? new Date(response.data.fechaEstimadaEntrega) : null
      };
    } catch (error) {
      logger.error('Error creating Correo Argentino shipment:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message
      };
    }
  }

  /**
   * Obtener cotización de envío
   */
  async getQuote(quoteData) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/micorreo/v1/cotizador`,
        {
          codigoPostalOrigen: quoteData.originPostalCode,
          codigoPostalDestino: quoteData.destinationPostalCode,
          paquetes: quoteData.packages.map(pkg => ({
            peso: pkg.weight,
            alto: pkg.height,
            ancho: pkg.width,
            largo: pkg.length
          })),
          tipoEnvio: 'CLASICO'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        price: response.data.precioTotal,
        currency: 'ARS',
        estimatedDays: response.data.diasEstimados
      };
    } catch (error) {
      logger.error('Error getting Correo Argentino quote:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message
      };
    }
  }

  /**
   * Obtener sucursales cercanas
   */
  async getNearbyBranches(postalCode) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/micorreo/v1/sucursales`,
        {
          params: { codigoPostal: postalCode },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        branches: response.data.sucursales || []
      };
    } catch (error) {
      logger.error('Error getting Correo Argentino branches:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message
      };
    }
  }
}

module.exports = new CorreoArgentinoService();
