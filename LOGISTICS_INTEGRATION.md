# Integración con APIs de Logística Argentina

Este documento explica cómo configurar y usar las integraciones con las principales empresas de logística argentinas.

## Empresas Soportadas

### 1. Andreani
- **Sitio oficial**: https://www.andreani.com
- **Documentación API**: https://developers.andreani.com
- **Características**:
  - Tracking en tiempo real
  - Creación de envíos
  - Cotización de tarifas
  - Gestión de etiquetas

### 2. OCA
- **Sitio oficial**: https://www.oca.com.ar
- **Documentación API**: WebService SOAP
- **Características**:
  - Tracking de piezas
  - Creación de órdenes de recolección
  - Cotización de envíos
  - Gestión de sucursales

### 3. Correo Argentino
- **Sitio oficial**: https://www.correoargentino.com.ar
- **Documentación API**: https://api.correoargentino.com.ar/docs
- **Características**:
  - Tracking completo
  - Creación de envíos
  - Cotizador
  - Consulta de sucursales

## Configuración

### 1. Variables de Entorno

Copiar el archivo `.env.example` y configurar las siguientes variables:

```env
# Andreani
ANDREANI_API_URL=https://api.andreani.com/v2
ANDREANI_USERNAME=tu_usuario
ANDREANI_PASSWORD=tu_contraseña
ANDREANI_CONTRACT=tu_numero_de_contrato

# OCA
OCA_API_URL=https://webservice.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx
OCA_CUIT=tu_cuit
OCA_OPERATIVA=codigo_operativa
OCA_PASSWORD=tu_contraseña

# Correo Argentino
CORREO_ARGENTINO_API_URL=https://api.correoargentino.com.ar
CORREO_ARGENTINO_API_KEY=tu_api_key
CORREO_ARGENTINO_CLIENT_ID=tu_client_id
```

### 2. Obtener Credenciales

#### Andreani
1. Registrarse en https://www.andreani.com/empresas
2. Solicitar acceso a la API de desarrolladores
3. Obtener usuario y contraseña de la API
4. Obtener el número de contrato empresarial

#### OCA
1. Contactar con el área comercial: empresas@oca.com.ar
2. Solicitar acceso a los webservices
3. Obtener CUIT registrado y código de operativa
4. Recibir credenciales de acceso

#### Correo Argentino
1. Registrarse en el portal "Mi Correo": https://micorreo.correoargentino.com.ar
2. Solicitar API Key desde el panel de desarrolladores
3. Obtener Client ID asignado
4. Activar servicios API requeridos

## Uso

### Sincronización Automática

El sistema sincroniza automáticamente todos los envíos activos cada 30 minutos.

Para cambiar el intervalo, modificar en `server/src/jobs/trackingSyncJob.js`:

```javascript
// Cambiar '*/30 * * * *' por el intervalo deseado
// Ejemplos:
// '*/15 * * * *' = cada 15 minutos
// '0 * * * *' = cada hora
// '0 */6 * * *' = cada 6 horas
```

### Sincronización Manual

#### Desde el Panel de Administración

1. Ir a **Envíos** en el menú de administración
2. Clic en **"Sincronizar Todo"** para actualizar todos los envíos activos
3. O clic en el ícono de sincronización individual en cada envío

#### Desde la API

```bash
# Sincronizar todos los envíos
POST /api/shipments/sync/all
Authorization: Bearer {admin_token}

# Sincronizar un envío específico
POST /api/shipments/{shipment_id}/sync
Authorization: Bearer {admin_token}
```

### Cotización de Envíos

#### Cotizar con un carrier específico

```bash
POST /api/shipments/quote/Andreani
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "originPostalCode": "1426",
  "destinationPostalCode": "5000",
  "packages": [
    {
      "weight": 2.5,
      "height": 20,
      "width": 30,
      "length": 40
    }
  ]
}
```

#### Cotizar con todos los carriers

```bash
POST /api/shipments/quotes/all
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "originPostalCode": "1426",
  "destinationPostalCode": "5000",
  "packages": [
    {
      "weight": 2.5,
      "height": 20,
      "width": 30,
      "length": 40
    }
  ]
}
```

### Crear Envío en el Carrier

```bash
POST /api/shipments
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "orderId": "order-uuid",
  "carrier": "Andreani",
  "trackingNumber": "AUTO",  // Se generará automáticamente
  "shippingAddress": {
    "street": "Av. Corrientes",
    "number": "1234",
    "postalCode": "1426",
    "city": "Buenos Aires",
    "state": "CABA"
  },
  // ... más datos
}
```

## Estructura de Datos

### Tracking Event

```javascript
{
  "status": "in_transit",
  "location": "Buenos Aires, CABA",
  "description": "Paquete en tránsito",
  "timestamp": "2025-10-31T10:30:00Z",
  "carrierMessage": "En depósito de distribución",
  "isPublic": true
}
```

### Estados de Envío

- `pending`: Pendiente
- `label_created`: Etiqueta creada
- `picked_up`: Recogido por el carrier
- `in_transit`: En tránsito
- `out_for_delivery`: En reparto
- `delivered`: Entregado
- `failed_delivery`: Entrega fallida
- `returned`: Devuelto
- `cancelled`: Cancelado

## Monitoreo y Logs

Los logs de sincronización se guardan en:
- `server/logs/combined.log`: Todos los logs
- `server/logs/error.log`: Solo errores

Ver logs en tiempo real:

```bash
# En el servidor
tail -f server/logs/combined.log

# Con Docker
docker logs -f ecommerce_backend
```

## Troubleshooting

### Error: "Carrier not supported"
- Verificar que el nombre del carrier sea exacto: "Andreani", "OCA" o "Correo Argentino"
- Revisar que las credenciales estén configuradas en el archivo .env

### Error de autenticación
- Verificar que las credenciales sean correctas
- Comprobar que la cuenta tenga permisos de API
- Para Andreani, verificar que el token no haya expirado (se renueva automáticamente)

### No se sincronizan los envíos
- Verificar que el cron job esté activo (ver logs del servidor)
- Comprobar que los envíos no estén en estado "delivered" o "cancelled"
- Revisar que el tracking number sea válido en el sistema del carrier

### Respuestas lentas
- Las APIs de los carriers pueden tener rate limits
- El sistema incluye pausas de 500ms entre requests en sincronización masiva
- Considerar aumentar el intervalo del cron job si hay muchos envíos

## Mejoras Futuras

- [ ] Soporte para más carriers (Urbano, Via Cargo, etc.)
- [ ] Webhooks para notificaciones en tiempo real
- [ ] Cache de respuestas para reducir llamadas a las APIs
- [ ] Dashboard de métricas de sincronización
- [ ] Notificaciones automáticas a clientes por email/SMS
- [ ] Integración con Google Maps para visualizar tracking

## Soporte

Para problemas con las APIs de los carriers, contactar:

- **Andreani**: soporte.api@andreani.com
- **OCA**: soporte.webservices@oca.com.ar
- **Correo Argentino**: api@correoargentino.com.ar
