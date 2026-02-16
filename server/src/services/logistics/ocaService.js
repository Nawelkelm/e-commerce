const axios = require('axios');
const logger = require('../../config/logger');

class OCAService {
  constructor() {
    this.apiUrl = process.env.OCA_API_URL || 'https://webservice.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx';
    this.cuit = process.env.OCA_CUIT;
    this.operativa = process.env.OCA_OPERATIVA;
    this.token = null;
  }

  /**
   * Obtener tracking de un envío
   */
  async getTracking(trackingNumber) {
    try {
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <Tracking_Pieza xmlns="http://webservice.oca.com.ar/">
              <Pieza>${trackingNumber}</Pieza>
              <Cuit>${this.cuit}</Cuit>
              <Operativa>${this.operativa}</Operativa>
            </Tracking_Pieza>
          </soap:Body>
        </soap:Envelope>`;

      const response = await axios.post(
        this.apiUrl,
        soapRequest,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://webservice.oca.com.ar/Tracking_Pieza'
          }
        }
      );

      return this.normalizeTracking(response.data, trackingNumber);
    } catch (error) {
      logger.error('Error getting OCA tracking:', error);
      return null;
    }
  }

  /**
   * Normalizar respuesta de tracking a formato estándar
   */
  normalizeTracking(xmlData, trackingNumber) {
    try {
      // Parsear XML a objeto (simplificado - en producción usar xml2js)
      const statusMap = {
        'INGRESADO': 'pending',
        'ADMITIDO': 'label_created',
        'EN PLANTA': 'in_transit',
        'EN REPARTO': 'out_for_delivery',
        'ENTREGADO': 'delivered',
        'DEVUELTO': 'returned',
        'RETENIDO': 'failed'
      };

      // Extraer eventos del XML
      const eventMatches = xmlData.match(/<Evento>(.*?)<\/Evento>/gs) || [];
      
      const events = eventMatches.map(eventXml => {
        const descripcion = eventXml.match(/<Descripcion>(.*?)<\/Descripcion>/)?.[1] || '';
        const fecha = eventXml.match(/<Fecha>(.*?)<\/Fecha>/)?.[1] || '';
        const sucursal = eventXml.match(/<Sucursal>(.*?)<\/Sucursal>/)?.[1] || '';
        
        return {
          status: statusMap[descripcion.toUpperCase()] || 'in_transit',
          location: sucursal,
          description: descripcion,
          timestamp: new Date(fecha),
          carrierMessage: descripcion,
          isPublic: true
        };
      });

      return {
        trackingNumber: trackingNumber,
        carrier: 'OCA',
        status: events.length > 0 ? events[0].status : 'pending',
        estimatedDeliveryDate: null,
        events: events.sort((a, b) => b.timestamp - a.timestamp)
      };
    } catch (error) {
      logger.error('Error parsing OCA tracking response:', error);
      return null;
    }
  }

  /**
   * Crear un nuevo envío
   */
  async createShipment(shipmentData) {
    try {
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <IngresoOR xmlns="http://webservice.oca.com.ar/">
              <usr>${this.cuit}</usr>
              <psw>${process.env.OCA_PASSWORD}</psw>
              <xml_Datos>
                <![CDATA[
                  <ROWS>
                    <Operativa>${this.operativa}</Operativa>
                    <Remitente>
                      <Nombre>${shipmentData.sender.name}</Nombre>
                      <Calle>${shipmentData.origin.street}</Calle>
                      <Numero>${shipmentData.origin.number}</Numero>
                      <Piso></Piso>
                      <Depto></Depto>
                      <CodigoPostal>${shipmentData.origin.postalCode}</CodigoPostal>
                      <Localidad>${shipmentData.origin.city}</Localidad>
                      <Provincia>${shipmentData.origin.state}</Provincia>
                      <Telefono>${shipmentData.sender.phone}</Telefono>
                      <Email>${shipmentData.sender.email}</Email>
                    </Remitente>
                    <Destinatario>
                      <Nombre>${shipmentData.recipient.name}</Nombre>
                      <Calle>${shipmentData.destination.street}</Calle>
                      <Numero>${shipmentData.destination.number}</Numero>
                      <Piso></Piso>
                      <Depto></Depto>
                      <CodigoPostal>${shipmentData.destination.postalCode}</CodigoPostal>
                      <Localidad>${shipmentData.destination.city}</Localidad>
                      <Provincia>${shipmentData.destination.state}</Provincia>
                      <Telefono>${shipmentData.recipient.phone}</Telefono>
                      <Email>${shipmentData.recipient.email}</Email>
                    </Destinatario>
                    <Paquetes>
                      ${shipmentData.items.map((item, idx) => `
                        <Paquete${idx + 1}>
                          <Peso>${item.weight}</Peso>
                          <Alto>${item.height || 10}</Alto>
                          <Ancho>${item.width || 10}</Ancho>
                          <Largo>${item.length || 10}</Largo>
                          <ValorDeclarado>${item.value}</ValorDeclarado>
                        </Paquete${idx + 1}>
                      `).join('')}
                    </Paquetes>
                    <ValorDeclarado>${shipmentData.totalValue}</ValorDeclarado>
                  </ROWS>
                ]]>
              </xml_Datos>
            </IngresoOR>
          </soap:Body>
        </soap:Envelope>`;

      const response = await axios.post(
        this.apiUrl.replace('Oep_TrackEPak', 'Oep_IngresoOR'),
        soapRequest,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://webservice.oca.com.ar/IngresoOR'
          }
        }
      );

      // Parsear respuesta
      const numeroEnvio = response.data.match(/<NumeroEnvio>(.*?)<\/NumeroEnvio>/)?.[1];

      return {
        success: !!numeroEnvio,
        trackingNumber: numeroEnvio,
        label: null,
        estimatedDeliveryDate: null
      };
    } catch (error) {
      logger.error('Error creating OCA shipment:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Obtener cotización de envío
   */
  async getQuote(quoteData) {
    try {
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <Tarifar_Envio_Corporativo xmlns="http://webservice.oca.com.ar/">
              <PesoTotal>${quoteData.packages.reduce((sum, pkg) => sum + pkg.weight, 0)}</PesoTotal>
              <VolumenTotal>${quoteData.packages.reduce((sum, pkg) => sum + (pkg.height * pkg.width * pkg.length / 1000000), 0)}</VolumenTotal>
              <CodigoPostalOrigen>${quoteData.originPostalCode}</CodigoPostalOrigen>
              <CodigoPostalDestino>${quoteData.destinationPostalCode}</CodigoPostalDestino>
              <Cuit>${this.cuit}</Cuit>
              <Operativa>${this.operativa}</Operativa>
            </Tarifar_Envio_Corporativo>
          </soap:Body>
        </soap:Envelope>`;

      const response = await axios.post(
        this.apiUrl.replace('Oep_TrackEPak', 'Tarifar_Envio_Corporativo'),
        soapRequest,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://webservice.oca.com.ar/Tarifar_Envio_Corporativo'
          }
        }
      );

      const precio = response.data.match(/<Precio>(.*?)<\/Precio>/)?.[1];

      return {
        success: !!precio,
        price: parseFloat(precio),
        currency: 'ARS',
        estimatedDays: null
      };
    } catch (error) {
      logger.error('Error getting OCA quote:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

module.exports = new OCAService();
