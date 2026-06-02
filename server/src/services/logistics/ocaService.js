const axios = require('axios');
const logger = require('../../config/logger');

// URLs correctas del webservice OCA
const OCA_URLS = {
  TARIFAR: 'https://webservice.oca.com.ar/oep_quoute/webservice.asmx',
  TRACKING: 'https://webservice.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx',
  INGRESO: 'https://webservice.oca.com.ar/Oep_OEPickUp/OEPickUp.asmx'
};

class OCAService {
  constructor() {
    this.cuit = process.env.OCA_CUIT;
    this.password = process.env.OCA_PASSWORD;
    this.originPostalCode = process.env.OCA_ORIGIN_POSTAL_CODE || process.env.ORIGIN_POSTAL_CODE || '1000';
    // Operativas disponibles
    this.operativas = {
      p2p: process.env.OCA_OPERATIVA_P2P || process.env.OCA_OPERATIVA || '0',
      p2s: process.env.OCA_OPERATIVA_P2S || process.env.OCA_OPERATIVA || '0',
      s2p: process.env.OCA_OPERATIVA_S2P || process.env.OCA_OPERATIVA || '0',
      s2s: process.env.OCA_OPERATIVA_S2S || process.env.OCA_OPERATIVA || '0',
    };
    // Operativa por defecto para e-commerce: Puerta a Puerta
    this.operativa = this.operativas.p2p;
  }

  /**
   * Cotizar todas las modalidades disponibles
   */
  async getAllQuotes(quoteData) {
    const modalidades = [
      { key: 'p2p', label: 'Puerta a Puerta' },
      { key: 'p2s', label: 'Puerta a Sucursal' },
    ];
    const results = [];
    for (const mod of modalidades) {
      const operativa = this.operativas[mod.key];
      if (!operativa || operativa === '0') continue;
      const result = await this.getQuote(quoteData, operativa);
      if (result.success) {
        results.push({ ...result, modalidad: mod.label, operativa });
      }
    }
    return results;
  }

  /**
   * Obtener cotización de envío - usa API pública (no requiere credenciales)
   */
  async getQuote(quoteData, operativaOverride = null) {
    try {
      const pesoTotal = quoteData.packages.reduce((sum, pkg) => sum + (parseFloat(pkg.weight) || 0.5), 0);
      const volumenTotal = quoteData.packages.reduce((sum, pkg) => {
        const alto = parseFloat(pkg.height) || 10;
        const ancho = parseFloat(pkg.width) || 10;
        const largo = parseFloat(pkg.length) || 10;
        return sum + (alto * ancho * largo / 1000000); // cm³ a m³
      }, 0);

      const originCP = quoteData.originPostalCode || this.originPostalCode;
      const destCP = quoteData.destinationPostalCode;

      if (!destCP) {
        return { success: false, error: 'Código postal destino requerido' };
      }

      // Usar credenciales corporativas si están configuradas, sino operativa pública
      const cuit = this.cuit || '0';
      const operativa = operativaOverride || this.operativa || '0';

      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Tarifar_Envio_Corporativo xmlns="http://webservice.oca.com.ar/">
      <PesoTotal>${pesoTotal.toFixed(2)}</PesoTotal>
      <VolumenTotal>${volumenTotal.toFixed(6)}</VolumenTotal>
      <CodigoPostalOrigen>${originCP}</CodigoPostalOrigen>
      <CodigoPostalDestino>${destCP}</CodigoPostalDestino>
      <CantidadPaquetes>${quoteData.packages.length}</CantidadPaquetes>
      <Cuit>${cuit}</Cuit>
      <Operativa>${operativa}</Operativa>
    </Tarifar_Envio_Corporativo>
  </soap:Body>
</soap:Envelope>`;

      const response = await axios.post(
        OCA_URLS.TARIFAR,
        soapRequest,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://webservice.oca.com.ar/Tarifar_Envio_Corporativo'
          },
          timeout: 10000
        }
      );

      // Parsear respuesta XML
      const xml = response.data;
      const precio = xml.match(/<Precio>([\d.,]+)<\/Precio>/)?.[1];
      const plazo = xml.match(/<PlazoEntrega>(\d+)<\/PlazoEntrega>/)?.[1];
      const idTipoServicio = xml.match(/<IdTipoServicio>(\d+)<\/IdTipoServicio>/)?.[1];

      if (!precio) {
        // Intentar extraer error del XML
        const errorMsg = xml.match(/<string[^>]*>(.*?)<\/string>/)?.[1];
        logger.warn('OCA quote - sin precio en respuesta:', errorMsg || xml.substring(0, 200));
        return { success: false, error: errorMsg || 'Sin respuesta de precio de OCA' };
      }

      const precioNum = parseFloat(precio.replace(',', '.'));

      return {
        success: true,
        price: precioNum,
        currency: 'ARS',
        estimatedDays: plazo ? parseInt(plazo) : 5,
        serviceType: idTipoServicio,
        carrier: 'OCA'
      };

    } catch (error) {
      logger.error('Error getting OCA quote:', error?.response?.data || error.message);
      return {
        success: false,
        error: error?.response?.data || error.message
      };
    }
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
        OCA_URLS.TRACKING,
        soapRequest,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://webservice.oca.com.ar/Tracking_Pieza'
          },
          timeout: 10000
        }
      );

      return this.normalizeTracking(response.data, trackingNumber);
    } catch (error) {
      logger.error('Error getting OCA tracking:', error.message);
      return null;
    }
  }

  /**
   * Normalizar respuesta de tracking
   */
  normalizeTracking(xmlData, trackingNumber) {
    try {
      const statusMap = {
        'INGRESADO': 'pending',
        'ADMITIDO': 'label_created',
        'EN PLANTA': 'in_transit',
        'EN REPARTO': 'out_for_delivery',
        'ENTREGADO': 'delivered',
        'DEVUELTO': 'returned',
        'RETENIDO': 'failed'
      };

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
        trackingNumber,
        carrier: 'OCA',
        status: events.length > 0 ? events[0].status : 'pending',
        estimatedDeliveryDate: null,
        events: events.sort((a, b) => b.timestamp - a.timestamp)
      };
    } catch (error) {
      logger.error('Error parsing OCA tracking:', error);
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
      <psw>${this.password}</psw>
      <xml_Datos><![CDATA[
        <ROWS>
          <Operativa>${this.operativa}</Operativa>
          <Remitente>
            <Nombre>${shipmentData.sender.name}</Nombre>
            <Calle>${shipmentData.origin.street}</Calle>
            <Numero>${shipmentData.origin.number}</Numero>
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
            <CodigoPostal>${shipmentData.destination.postalCode}</CodigoPostal>
            <Localidad>${shipmentData.destination.city}</Localidad>
            <Provincia>${shipmentData.destination.state}</Provincia>
            <Telefono>${shipmentData.recipient.phone}</Telefono>
            <Email>${shipmentData.recipient.email}</Email>
          </Destinatario>
          <Paquetes>
            ${shipmentData.items.map((item, idx) => `
              <Paquete NroPaquete="${idx + 1}">
                <Peso>${item.weight}</Peso>
                <Alto>${item.height || 10}</Alto>
                <Ancho>${item.width || 10}</Ancho>
                <Largo>${item.length || 10}</Largo>
                <ValorDeclarado>${item.value}</ValorDeclarado>
              </Paquete>
            `).join('')}
          </Paquetes>
          <ValorDeclarado>${shipmentData.totalValue}</ValorDeclarado>
        </ROWS>
      ]]></xml_Datos>
    </IngresoOR>
  </soap:Body>
</soap:Envelope>`;

      const response = await axios.post(
        OCA_URLS.INGRESO,
        soapRequest,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://webservice.oca.com.ar/IngresoOR'
          },
          timeout: 15000
        }
      );

      const numeroEnvio = response.data.match(/<NumeroEnvio>(.*?)<\/NumeroEnvio>/)?.[1];

      return {
        success: !!numeroEnvio,
        trackingNumber: numeroEnvio,
        label: null,
        estimatedDeliveryDate: null
      };
    } catch (error) {
      logger.error('Error creating OCA shipment:', error?.response?.data || error.message);
      return {
        success: false,
        error: error?.response?.data || error.message
      };
    }
  }
}

module.exports = new OCAService();


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
