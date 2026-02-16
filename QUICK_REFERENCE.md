# 🚀 Quick Reference - Sistema de Gestión de Stock

## Comandos Rápidos

### Docker
```bash
# Ver logs del backend
docker logs ecommerce_backend --tail 50

# Reconstruir backend
docker-compose build backend

# Reiniciar servicios
docker-compose restart backend

# Ver estado de servicios
docker-compose ps
```

### Acceso Rápido
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Admin Dashboard:** http://localhost:3000/admin
- **Stock Dashboard:** http://localhost:3000/admin/stock

---

## API Endpoints Principales

### Stock Movements
```http
GET    /api/stock/history
GET    /api/stock/history/export
GET    /api/stock/history/:id/summary
POST   /api/stock/products/:id/adjust
```

### Alerts
```http
GET    /api/stock/alerts?severity=critical&status=active
PATCH  /api/stock/alerts/:id/resolve
```

### Barcodes
```http
GET    /api/products/:id/barcodes
POST   /api/stock/barcodes
GET    /api/stock/barcodes/:code/search
```

### Batches
```http
GET    /api/products/:id/batches
POST   /api/products/:id/batches
PATCH  /api/stock/batches/:id/quantity
```

### Excel Import/Export
```http
GET    /api/products/template
POST   /api/products/import/preview
POST   /api/products/import/confirm
GET    /api/products/export
```

---

## Componentes React

### Uso Básico
```jsx
// Stock Dashboard (Página completa)
import StockDashboard from './pages/StockDashboard'
<Route path="/admin/stock" element={<StockDashboard />} />

// Historial de Movimientos
import StockMovementHistory from './components/StockMovementHistory'
<StockMovementHistory productId={id} />

// Gestión de Lotes
import BatchManagement from './components/BatchManagement'
<BatchManagement productId={id} />

// Códigos de Barras
import BarcodeManagement from './components/BarcodeManagement'
<BarcodeManagement productId={id} />

// Panel de Alertas
import StockAlertsPanel from './components/StockAlertsPanel'
<StockAlertsPanel />
```

---

## Servicios Backend

### StockReservationService
```javascript
const { StockReservationService } = require('../services/stockService')

// Reservar stock
await StockReservationService.reserveStock(productId, quantity, userId)

// Liberar reserva
await StockReservationService.releaseReservation(reservationId)

// Completar reserva (al pagar)
await StockReservationService.completeReservation(reservationId, orderId)

// Limpiar reservas expiradas (cron)
await StockReservationService.cleanupExpiredReservations()
```

### StockMovementService
```javascript
const { StockMovementService } = require('../services/stockService')

// Registrar movimiento
await StockMovementService.recordMovement({
  productId,
  type: 'sale',
  quantity: -5,
  userId,
  notes: 'Venta online'
})

// Obtener historial
const history = await StockMovementService.getProductHistory(productId, {
  limit: 50,
  type: 'sale'
})

// Obtener resumen
const summary = await StockMovementService.getMovementsSummary(productId, 30)
```

### StockAlertService
```javascript
const { StockAlertService } = require('../services/stockService')

// Verificar y crear alertas
await StockAlertService.checkAndCreateAlerts(productId)

// Obtener alertas activas
const alerts = await StockAlertService.getActiveAlerts({ severity: 'critical' })

// Resolver alerta
await StockAlertService.resolveAlert(alertId, 'Stock reabastecido')
```

---

## Modelos Sequelize

### StockMovement
```javascript
const movement = await StockMovement.create({
  productId,
  type: 'purchase',
  quantity: 100,
  previousStock: 50,
  newStock: 150,
  unitCost: 10.50,
  totalCost: 1050,
  userId,
  notes: 'Compra a proveedor X'
})
```

### ProductBatch
```javascript
const batch = await ProductBatch.create({
  productId,
  batchNumber: 'LOTE-2024-001',
  quantity: 500,
  manufacturingDate: '2024-01-15',
  expirationDate: '2025-01-15',
  unitCost: 12.50,
  supplier: 'Proveedor ABC'
})
```

### ProductBarcode
```javascript
const barcode = await ProductBarcode.create({
  productId,
  code: '7501234567890',
  type: 'EAN13',
  isPrimary: true
})

// Buscar producto por código
const result = await ProductBarcode.findOne({
  where: { code: '7501234567890' },
  include: [{ model: Product, as: 'product' }]
})
```

### StockAlert
```javascript
const alert = await StockAlert.create({
  productId,
  type: 'low_stock',
  severity: 'warning',
  message: 'Stock bajo: solo quedan 5 unidades',
  metadata: {
    currentStock: 5,
    threshold: 10
  }
})
```

---

## Tipos y Enums

### Movement Types
```javascript
const TYPES = [
  'purchase',      // Compra
  'sale',          // Venta
  'adjustment',    // Ajuste
  'return',        // Devolución
  'damage',        // Merma/Daño
  'transfer_in',   // Transferencia Entrada
  'transfer_out',  // Transferencia Salida
  'import'         // Importación
]
```

### Alert Types
```javascript
const ALERT_TYPES = [
  'low_stock',      // Stock Bajo
  'out_of_stock',   // Sin Stock
  'expiring_soon',  // Próximo a Vencer
  'expired',        // Vencido
  'overstock',      // Sobre Stock
  'reorder_point'   // Punto de Reorden
]
```

### Alert Severities
```javascript
const SEVERITIES = [
  'critical',  // Crítico (rojo)
  'warning',   // Advertencia (amarillo)
  'info'       // Información (azul)
]
```

### Barcode Types
```javascript
const BARCODE_TYPES = [
  'EAN13',       // EAN-13 (13 dígitos)
  'UPC',         // UPC-A (12 dígitos)
  'CODE128',     // Code 128
  'CODE39',      // Code 39
  'QR',          // QR Code
  'DATAMATRIX',  // Data Matrix
  'INTERNAL'     // Código Interno
]
```

### Batch Status
```javascript
const BATCH_STATUS = [
  'active',     // Activo
  'consumed',   // Consumido
  'expired'     // Vencido
]
```

---

## Cron Jobs

### Configuración
```javascript
// server/src/services/stockCronService.js

// Cada 5 minutos - Limpiar reservas expiradas
cron.schedule('*/5 * * * *', cleanupExpiredReservations)

// Diario 8:00 AM - Verificar lotes que vencen en 30 días
cron.schedule('0 8 * * *', checkExpiringBatches30Days)

// Diario 9:00 AM - Verificar lotes que vencen en 7 días
cron.schedule('0 9 * * *', checkExpiringBatches7Days)
```

---

## Validaciones

### Express Validator
```javascript
// Ajustar stock
[
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('reason').optional().isString()
]

// Agregar lote
[
  body('batchNumber').notEmpty(),
  body('quantity').isInt({ min: 1 }),
  body('expirationDate').optional().isDate()
]

// Agregar código de barras
[
  body('code').notEmpty(),
  body('type').isIn(['EAN13', 'UPC', 'CODE128', ...])
]
```

---

## Frontend Hooks

### API Calls
```javascript
// Obtener historial
const fetchMovements = async () => {
  const response = await axios.get('/api/stock/history', {
    params: { productId, type, startDate, endDate }
  })
  setMovements(response.data)
}

// Exportar a Excel
const exportToExcel = async () => {
  const response = await axios.get('/api/stock/history/export', {
    responseType: 'blob'
  })
  
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.download = `movimientos_${Date.now()}.xlsx`
  link.click()
}

// Resolver alerta
const resolveAlert = async (id) => {
  await axios.patch(`/api/stock/alerts/${id}/resolve`, {
    resolution: 'Stock reabastecido'
  })
  toast.success('Alerta resuelta')
}
```

---

## Troubleshooting

### Backend no inicia
```bash
# Ver logs completos
docker logs ecommerce_backend

# Reconstruir sin caché
docker-compose build --no-cache backend

# Verificar variables de entorno
docker exec ecommerce_backend env | grep DB
```

### Cron jobs no ejecutan
```bash
# Verificar logs del backend
docker logs ecommerce_backend | grep "Cron"

# Reiniciar backend
docker-compose restart backend
```

### Base de datos no conecta
```bash
# Verificar PostgreSQL
docker-compose ps postgres

# Ver logs de PostgreSQL
docker logs ecommerce_postgres

# Verificar conexión desde backend
docker exec ecommerce_backend nc -zv postgres 5432
```

### Frontend no carga componentes
```bash
# Verificar build del frontend
docker logs ecommerce_frontend

# Reconstruir frontend
docker-compose build frontend
docker-compose up -d frontend

# Verificar errores en consola del navegador
# F12 > Console
```

---

## Testing

### Probar APIs con curl
```bash
# Obtener alertas
curl http://localhost:5000/api/stock/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Buscar por código de barras
curl http://localhost:5000/api/stock/barcodes/7501234567890/search \
  -H "Authorization: Bearer YOUR_TOKEN"

# Exportar historial
curl http://localhost:5000/api/stock/history/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o movimientos.xlsx
```

### Probar con Postman
1. Importar colección desde `docs/postman/`
2. Configurar environment variables
3. Ejecutar tests de integración

---

## Performance Tips

### Base de Datos
```javascript
// Usar índices
await queryInterface.addIndex('stock_movements', ['productId', 'createdAt'])
await queryInterface.addIndex('product_barcodes', ['code'])

// Limitar resultados
const movements = await StockMovement.findAll({
  limit: 50,
  offset: page * 50,
  order: [['createdAt', 'DESC']]
})
```

### Frontend
```javascript
// Lazy loading de componentes
const StockDashboard = lazy(() => import('./pages/StockDashboard'))

// Debounce en búsquedas
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
)

// Virtualización de listas largas
import { FixedSizeList } from 'react-window'
```

---

## Seguridad

### Autenticación
```javascript
// Middleware de autenticación
const { auth, adminAuth } = require('../middleware/auth')

router.get('/stock/history', adminAuth, controller.getStockHistory)
```

### Validación de Inputs
```javascript
// Sanitizar inputs
body('notes').trim().escape()

// Prevenir SQL injection (Sequelize lo hace automáticamente)
const product = await Product.findOne({
  where: { id: req.params.id }
})
```

---

## Documentación Completa

- **Arquitectura:** `ADVANCED_STOCK_SYSTEM.md`
- **Excel:** `STOCK_MANAGEMENT.md`
- **Guía Usuario:** `IMPORT_GUIDE.md`
- **Frontend:** `FRONTEND_STOCK_COMPONENTS.md`
- **Resumen:** `IMPLEMENTATION_SUMMARY.md`
- **Roadmap:** `VISUAL_ROADMAP.md`

---

**Última actualización:** Octubre 24, 2025  
**Versión:** 2.0  
**Estado:** ✅ Producción
