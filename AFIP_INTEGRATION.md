# Guía de Integración con AFIP - Sistema de Facturación Electrónica

## 📋 Resumen

Este sistema está integrado con AFIP (Administración Federal de Ingresos Públicos) de Argentina para la generación de facturas electrónicas con CAE (Código de Autorización Electrónica).

## 🎯 Características Implementadas

### Backend
- ✅ Modelo `AfipCredential` para almacenar certificados digitales
- ✅ Servicio `afipService.js` con integración completa a WSFE
- ✅ Controlador `afipController.js` con 10+ endpoints
- ✅ Campos AFIP en modelo `Invoice` (CAE, tipo de factura, etc.)
- ✅ PDF mejorado con código QR de AFIP
- ✅ Validación de CUIT/CUIL
- ✅ Soporte para facturas A, B, C, E, M

### Endpoints Disponibles

**Configuración:**
- `GET /api/afip/credentials` - Obtener configuración activa
- `POST /api/afip/credentials` - Guardar/actualizar credenciales

**Operaciones:**
- `GET /api/afip/test-connection` - Probar conexión con AFIP
- `POST /api/afip/invoices/:id/request-cae` - Solicitar CAE
- `GET /api/afip/invoices/:id/cae` - Consultar CAE
- `POST /api/afip/invoices/:id/retry-cae` - Reintentar CAE

**Utilidades:**
- `GET /api/afip/last-invoice-number?invoiceType=B&pointOfSale=1` - Último número
- `POST /api/afip/validate-cuit` - Validar CUIT
- `GET /api/afip/stats` - Estadísticas

**Procesamiento:**
- `GET /api/afip/pending-invoices` - Facturas pendientes
- `POST /api/afip/process-pending` - Procesar en lote

## 🔑 Requisitos Previos

### 1. Certificado Digital AFIP

Para producción necesitas tramitar el certificado digital en AFIP:

1. Ingresar a [AFIP](https://www.afip.gob.ar)
2. Ir a "Administrador de Relaciones de Clave Fiscal"
3. Generar certificado digital para "Comprobantes en Línea"
4. Descargar el archivo `.crt` (certificado) y `.key` (clave privada)

### 2. Ambiente de Testing (Homologación)

Para pruebas, usar el ambiente de homologación:
- URL: https://wswhomo.afip.gov.ar/wsfev1/service.asmx
- CUIT de prueba: 20123456789
- No requiere certificado real

## ⚙️ Configuración

### Paso 1: Obtener Certificados

**Para Testing:**
```bash
# El sistema incluye certificados de prueba por defecto
# No se requiere configuración adicional
```

**Para Producción:**
```bash
# 1. Obtener certificado de AFIP
# 2. Guardar archivos en lugar seguro:
#    - tu-cuit.crt (certificado)
#    - tu-cuit.key (clave privada)
```

### Paso 2: Configurar en el Sistema

**Opción A: Vía API**

```bash
curl -X POST http://localhost:5000/api/afip/credentials \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Configuración Principal",
    "cuit": "20123456789",
    "businessName": "Mi Empresa S.A.",
    "certificate": "-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----",
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----",
    "pointOfSale": 1,
    "production": false,
    "taxCategory": "responsable_inscripto",
    "address": "Av. Corrientes 1234",
    "city": "Buenos Aires",
    "postalCode": "C1043",
    "province": "Buenos Aires",
    "iibbNumber": "901-123456-7",
    "activityStartDate": "2020-01-01"
  }'
```

**Opción B: Vía Panel de Administración (próximamente)**

### Paso 3: Probar Conexión

```bash
curl -X GET http://localhost:5000/api/afip/test-connection \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Conexión exitosa con AFIP",
  "data": {
    "serverStatus": "OK",
    "environment": "testing",
    "cuit": "20123456789"
  }
}
```

## 📝 Uso

### Flujo Automático

Al crear una factura desde una orden pagada, el sistema automáticamente:

1. Detecta la configuración AFIP activa
2. Determina el tipo de factura según cliente (A/B/C)
3. Solicita CAE a AFIP
4. Guarda el CAE en la base de datos
5. Genera PDF con código QR de validación
6. Envía email con factura autorizada

### Flujo Manual

```bash
# 1. Crear factura (sin CAE)
POST /api/invoices/order/:orderId

# 2. Solicitar CAE manualmente
POST /api/afip/invoices/:invoiceId/request-cae

# 3. Descargar PDF actualizado
GET /api/invoices/:invoiceId/pdf
```

## 🏷️ Tipos de Facturas

| Tipo | Código AFIP | Uso |
|------|-------------|-----|
| A | 001 | Responsable Inscripto → Responsable Inscripto (discrimina IVA) |
| B | 006 | Responsable Inscripto → Consumidor Final (IVA incluido) |
| C | 011 | Monotributista → Cualquiera (sin IVA) |
| E | 019 | Exportación |
| M | 051 | Factura M |

### Determinación Automática

El sistema determina el tipo de factura basándose en:
- Categoría tributaria del vendedor (de `AfipCredential`)
- Categoría tributaria del comprador (de `Invoice.customerTaxCategory`)

## 🔍 Campos AFIP en Invoices

```javascript
{
  // Campos nuevos
  cae: "71234567890123",              // CAE autorizado por AFIP
  caeDueDate: "2025-11-07",           // Vencimiento del CAE
  invoiceType: "B",                    // Tipo de comprobante
  pointOfSale: 1,                      // Punto de venta
  afipStatus: "authorized",            // pending | authorized | rejected | error
  afipResponse: {...},                 // Respuesta completa de AFIP
  afipRequestDate: "2025-10-29T12:00:00Z",
  customerTaxCategory: "consumidor_final",
  customerCuit: "20987654321",
  observations: "Texto adicional"
}
```

## 🐛 Troubleshooting

### Error: "No hay credenciales AFIP configuradas"
**Solución:** Configurar credenciales usando POST /api/afip/credentials

### Error: "Certificado inválido"
**Solución:** Verificar que el certificado es válido y corresponde al CUIT

### Error: "CUIT inválido"
**Solución:** Verificar que el CUIT tenga 11 dígitos y dígito verificador correcto

### Error: "Connection timeout"
**Solución:** 
1. Verificar conexión a internet
2. Si es producción, verificar que el servidor puede conectarse a AFIP
3. Probar con ambiente de testing primero

### CAE No se genera
**Solución:**
1. Verificar que la factura tenga todos los datos requeridos
2. Ver logs del backend: `docker logs ecommerce_backend`
3. Consultar campo `afipResponse` para ver el error específico

## 📊 Monitoreo

### Ver estadísticas

```bash
GET /api/afip/stats

# Respuesta:
{
  "success": true,
  "data": {
    "byStatus": [
      { "afipStatus": "authorized", "count": 45, "total": "125670.50" },
      { "afipStatus": "pending", "count": 2, "total": "1250.00" }
    ],
    "byType": [
      { "invoiceType": "B", "count": 40, "total": "112000.00" },
      { "invoiceType": "A", "count": 5, "total": "13670.50" }
    ]
  }
}
```

### Ver facturas pendientes

```bash
GET /api/afip/pending-invoices

# Procesar pendientes en lote
POST /api/afip/process-pending
```

## 🔐 Seguridad

- ✅ Todos los endpoints requieren autenticación de administrador
- ✅ Certificados almacenados encriptados en base de datos
- ✅ No se exponen claves privadas en respuestas API
- ✅ Validación de CUIT con dígito verificador
- ✅ Rate limiting aplicado

## 📚 Referencias

- [AFIP Web Service](https://www.afip.gob.ar/ws/)
- [Manual WSFE](https://www.afip.gob.ar/ws/documentacion/ws-factura-electronica.pdf)
- [SDK Node.js](https://github.com/afipsdk/afip.js)

## 🆘 Soporte

Para problemas o consultas:
1. Revisar logs: `docker logs ecommerce_backend`
2. Verificar estado de AFIP: https://serviciosweb.afip.gob.ar/estado/
3. Consultar documentación oficial de AFIP

## ✅ Checklist Pre-Producción

Antes de usar en producción:

- [ ] Obtener certificado digital real de AFIP
- [ ] Configurar CUIT correcto de la empresa
- [ ] Cambiar `production: true` en credenciales
- [ ] Probar conexión con ambiente de producción
- [ ] Generar al menos 5 facturas de prueba en homologación
- [ ] Verificar códigos QR con app de AFIP
- [ ] Configurar backup de certificados
- [ ] Documentar proceso de renovación de certificados (anual)

---

**Última actualización:** Octubre 29, 2025
**Versión:** 1.0.0
