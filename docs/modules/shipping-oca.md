# Módulo: Envíos OCA (cotización + tracking)

Integración con el webservice **OCA ePak** (SOAP) para cotizar envíos, dar de
alta órdenes de retiro y seguir el tracking.

- Servicio: `server/src/services/logistics/ocaService.js` (singleton).
- Orquestador multi-carrier: `server/src/services/logistics/logisticsIntegrationService.js`.
- Endpoint público de cotización: `POST /api/shipping-methods/quote` → `shippingMethodController.getShippingQuote`.
- Frontend: `client/src/components/Shipping/ShippingQuote.jsx`.

## Webservice OCA (verificado contra el WSDL)

- **Un solo endpoint** para tarifar, tracking e ingreso:
  `https://webservice.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx`
  (el viejo `/oep_quoute/webservice.asmx` devuelve **404**).
- **Namespace del servicio:** `#Oca_e_Pak` (no es una URL).
- **SOAPAction:** `#Oca_e_Pak/<NombreMetodo>` — p. ej. `#Oca_e_Pak/Tarifar_Envio_Corporativo`.
- **`Tarifar_Envio_Corporativo`** — orden de campos (ASMX es sensible al orden):
  `PesoTotal, VolumenTotal, CodigoPostalOrigen, CodigoPostalDestino, CantidadPaquetes, ValorDeclarado, Cuit, Operativa`.
- **Respuesta:** un `DataSet` (diffgram). En error de negocio trae `<Error>...</Error>`;
  el precio viene como `<Total>` o `<Precio>` y el plazo como `<PlazoEntrega>`.

## Variables de entorno

```
OCA_CUIT=<cuit del contrato OCA, sin guiones>
OCA_PASSWORD=<password del contrato (para IngresoOR)>
OCA_ORIGIN_POSTAL_CODE=3300
OCA_OPERATIVA=467730            # default
OCA_OPERATIVA_P2P=467730        # Puerta a Puerta
OCA_OPERATIVA_P2S=467731        # Puerta a Sucursal
OCA_OPERATIVA_S2P=467732
OCA_OPERATIVA_S2S=467733
```

> ⚠️ **No duplicar estas claves en `.env`.** dotenv toma la última ocurrencia;
> un segundo bloque con placeholders pisa los valores reales y rompe la cotización.
> (Bug histórico corregido el 2026-06-18.)

## Requisito de cuenta

El servicio sólo cotiza con **credenciales OCA válidas**. Hoy OCA responde
`"El CUIT o la operativa son inválidos."` con el CUIT/operativa cargados, lo que
indica que ese par **no está habilitado** en OCA. Para que funcione en producción:

1. Tener un **contrato OCA ePak** activo.
2. Obtener el **número de operativa** real asignado por OCA (los 4677xx son de ejemplo).
3. Cargar `OCA_CUIT` y `OCA_OPERATIVA*` reales en el entorno (local y en Coolify).

Mientras las credenciales no sean válidas, el método OCA simplemente no aparece
entre las cotizaciones (el controller descarta los carriers que fallan) y el
log muestra el mensaje exacto de OCA.

## Flujo de cotización

1. Frontend envía `{ postalCode, items[{weight, dimensions}], subtotal }`.
2. `getShippingQuote` recorre los métodos activos; para los de tipo `carrier`
   llama a `getCarrierQuote` → `logisticsIntegrationService.getQuote('OCA', ...)`.
3. `ocaService.getQuote` arma el SOAP, llama a OCA y parsea el DataSet.
4. Si OCA devuelve precio → se agrega la cotización; si falla → se omite el método.

## Verificación rápida (local)

```bash
cd server
node -e "require('dotenv').config({path:'../.env'}); require('./src/services/logistics/ocaService').getQuote({destinationPostalCode:'1426',declaredValue:15000,packages:[{weight:1,height:10,width:10,length:20}]}).then(r=>console.log(r))"
```
Con credenciales válidas debe devolver `{ success: true, price, estimatedDays }`.
