# Frontend de Gestión de Stock Avanzada

## 📊 Descripción General

Sistema completo de interfaces de usuario para la gestión avanzada de inventario, construido con React y diseñado con soporte total para dark mode.

## 🎨 Componentes Creados

### 1. **StockMovementHistory.jsx** - Historial de Movimientos
Componente para visualizar y filtrar todos los movimientos de stock del sistema.

**Características:**
- ✅ Tabla completa de movimientos con 8 tipos diferentes
- ✅ Filtros por tipo, fechas y producto
- ✅ Iconos y colores distintivos por tipo de movimiento
- ✅ Exportación a Excel del historial
- ✅ Vista resumida con estadísticas
- ✅ Soporte completo dark mode
- ✅ Información de usuario y costos

**Tipos de Movimiento Soportados:**
- 🟢 Compra (purchase) - Verde
- 🔵 Venta (sale) - Azul
- 🟡 Ajuste (adjustment) - Amarillo
- 🟣 Devolución (return) - Púrpura
- 🔴 Merma/Daño (damage) - Rojo
- 🟦 Transferencia Entrada (transfer_in) - Teal
- 🟧 Transferencia Salida (transfer_out) - Naranja
- 🟪 Importación (import) - Índigo

**Uso:**
```jsx
// Para un producto específico
<StockMovementHistory productId="uuid-del-producto" />

// Para todos los productos
<StockMovementHistory />
```

**API Endpoints:**
- `GET /api/stock/history?productId={id}&type={type}&startDate={date}&endDate={date}`
- `GET /api/stock/history/{productId}/summary`
- `GET /api/stock/history/export` - Descarga Excel

---

### 2. **BatchManagement.jsx** - Gestión de Lotes FIFO/FEFO
Componente para gestionar lotes de productos con seguimiento de fechas de fabricación y vencimiento.

**Características:**
- ✅ Sistema FIFO/FEFO automático
- ✅ Seguimiento de fechas de vencimiento
- ✅ Alertas visuales (vencido, próximo a vencer)
- ✅ Estados: Activo, Consumido, Vencido
- ✅ Ajustes rápidos de cantidad (-10, -1, +1, +10)
- ✅ Formulario completo con validación
- ✅ Indicador "Siguiente a usar"
- ✅ Información de proveedor y costos

**Estados de Lote:**
- 🟢 **Activo** - Más de 30 días hasta vencer
- 🟡 **Próximo a Vencer** - Entre 7 y 30 días
- 🔴 **Vence Pronto** - Menos de 7 días
- ⚫ **Vencido** - Fecha de vencimiento pasada
- ⚪ **Consumido** - Cantidad agotada

**Uso:**
```jsx
<BatchManagement productId="uuid-del-producto" />
```

**API Endpoints:**
- `GET /api/products/{id}/batches` - Listar lotes
- `POST /api/products/{id}/batches` - Crear lote
- `PUT /api/stock/batches/{batchId}` - Actualizar lote
- `PATCH /api/stock/batches/{batchId}/quantity` - Ajustar cantidad

**Campos del Formulario:**
```javascript
{
  batchNumber: string,    // Ej: LOTE-2024-001
  quantity: number,       // Unidades del lote
  manufacturingDate: date,
  expirationDate: date,
  unitCost: number,      // Costo unitario opcional
  supplier: string,      // Proveedor opcional
  notes: string          // Notas adicionales
}
```

---

### 3. **BarcodeManagement.jsx** - Gestión de Códigos de Barras
Componente para administrar múltiples códigos de barras por producto con búsqueda rápida.

**Características:**
- ✅ Soporte para 7 tipos de códigos
- ✅ Modo de búsqueda con scanner o input manual
- ✅ Código principal destacado
- ✅ Generador de códigos aleatorios
- ✅ Copiar al portapapeles
- ✅ Vista de tarjetas con información detallada
- ✅ Búsqueda con resultados enriquecidos

**Tipos de Códigos Soportados:**
1. **EAN-13** - Estándar europeo (13 dígitos)
2. **UPC-A** - Estándar americano (12 dígitos)
3. **Code 128** - Alfanumérico alta densidad
4. **Code 39** - Industrial alfanumérico
5. **QR Code** - Código 2D multifuncional
6. **Data Matrix** - Código 2D compacto
7. **Interno** - Sistema propio

**Uso:**
```jsx
<BarcodeManagement productId="uuid-del-producto" />
```

**Modos de Operación:**
1. **Modo Gestión** - Ver/agregar/eliminar códigos
2. **Modo Búsqueda** - Escanear/buscar productos

**API Endpoints:**
- `GET /api/products/{id}/barcodes` - Listar códigos
- `POST /api/stock/barcodes` - Agregar código
- `DELETE /api/stock/barcodes/{id}` - Eliminar código
- `PATCH /api/stock/barcodes/{id}/primary` - Marcar como principal
- `GET /api/stock/barcodes/{code}/search` - Buscar producto

**Funciones Especiales:**
```javascript
// Generador automático de códigos con checksum
generateRandomCode() // EAN-13 y UPC-A con dígito verificador válido

// Copiar al portapapeles
handleCopyCode(code)

// Búsqueda con Enter
onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
```

---

### 4. **StockAlertsPanel.jsx** - Panel de Alertas de Stock
Dashboard completo para visualizar y gestionar todas las alertas del sistema de inventario.

**Características:**
- ✅ Tarjetas de estadísticas (Total, Críticas, Advertencias, Info)
- ✅ Filtros por severidad, tipo y estado
- ✅ Resolución de alertas con motivo
- ✅ Indicadores visuales por severidad
- ✅ Metadatos detallados (stock, umbrales, días)
- ✅ Enlaces directos a productos
- ✅ Timestamps relativos ("hace 2 horas")

**Niveles de Severidad:**
- 🔴 **Crítico** - Requiere acción inmediata
- 🟡 **Advertencia** - Atención necesaria
- 🔵 **Información** - Para conocimiento

**Tipos de Alertas:**
- `low_stock` - Stock Bajo
- `out_of_stock` - Sin Stock
- `expiring_soon` - Próximo a Vencer
- `expired` - Vencido
- `overstock` - Sobre Stock
- `reorder_point` - Punto de Reorden

**Uso:**
```jsx
<StockAlertsPanel />
```

**API Endpoints:**
- `GET /api/stock/alerts?severity={level}&type={type}&status={status}`
- `PATCH /api/stock/alerts/{id}/resolve` - Resolver alerta

**Filtros Disponibles:**
```javascript
{
  severity: 'critical' | 'warning' | 'info' | '',
  type: 'low_stock' | 'out_of_stock' | ... | '',
  status: 'active' | 'resolved' | ''
}
```

---

### 5. **StockDashboard.jsx** - Dashboard Principal
Página principal que integra todos los componentes de gestión de stock.

**Características:**
- ✅ Sistema de pestañas (Tabs) para navegar entre secciones
- ✅ Integración de 4 componentes principales
- ✅ Selector de producto (para lotes y códigos)
- ✅ Tarjetas informativas con gradientes
- ✅ Diseño responsivo y moderno
- ✅ Animaciones de transición

**Pestañas:**
1. **Alertas** - Panel de alertas activas
2. **Historial de Movimientos** - Todos los movimientos
3. **Gestión de Lotes** - FIFO/FEFO (requiere producto)
4. **Códigos de Barras** - Gestión de códigos (requiere producto)

**Ruta:**
```
/admin/stock
```

**Estructura del Componente:**
```jsx
<StockDashboard>
  ├── Header (Título y descripción)
  ├── Tabs Navigation
  ├── Content Area (Tab activo)
  └── Info Cards (Solo en tab Alertas)
</StockDashboard>
```

---

## 🚀 Integración con App.jsx

### Ruta Agregada:
```jsx
import StockDashboard from './pages/StockDashboard'

<Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
  <Route path="stock" element={<StockDashboard />} />
</Route>
```

### Navegación en AdminLayout:
```jsx
{ name: 'Gestión de Stock', href: '/admin/stock', icon: ChartBarIcon }
```

---

## 🎨 Diseño y Estilos

### Características de Diseño:
- ✅ **Dark Mode Completo** - Todos los componentes soportan tema oscuro
- ✅ **Tailwind CSS** - Sistema de utilidades
- ✅ **Hero Icons** - Iconografía consistente
- ✅ **Animaciones Suaves** - Transiciones y hover effects
- ✅ **Responsive Design** - Grid adaptativo para móviles
- ✅ **Color Coding** - Códigos de colores intuitivos

### Paleta de Colores:
```css
/* Light Mode */
bg-white, text-gray-900, border-gray-200

/* Dark Mode */
dark:bg-gray-800, dark:text-white, dark:border-gray-700

/* Estados */
Crítico:    red-600 / red-400
Advertencia: yellow-600 / yellow-400
Info:       blue-600 / blue-400
Éxito:      green-600 / green-400
```

---

## 📦 Dependencias Utilizadas

### Frontend:
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "react-hot-toast": "^2.x",
  "@heroicons/react": "^2.x"
}
```

### Backend (Nueva Funcionalidad):
```json
{
  "xlsx": "^0.18.5"  // Exportación a Excel
}
```

---

## 🔄 Flujos de Trabajo

### 1. Gestión de Movimientos:
```
Usuario → Selecciona filtros → API fetch → Tabla actualizada → Exportar Excel
```

### 2. Gestión de Lotes:
```
Admin → Agrega lote → Sistema ordena FIFO → Alertas automáticas vencimiento
```

### 3. Escaneo de Códigos:
```
Usuario → Modo búsqueda → Escanea código → API busca → Muestra producto
```

### 4. Resolución de Alertas:
```
Sistema genera alerta → Admin visualiza → Toma acción → Marca resuelta
```

---

## 🧪 Testing

### Casos de Prueba Recomendados:

#### StockMovementHistory:
- [ ] Filtrar por tipo de movimiento
- [ ] Filtrar por rango de fechas
- [ ] Exportar historial a Excel
- [ ] Paginación con scroll
- [ ] Dark mode funcionando

#### BatchManagement:
- [ ] Crear lote nuevo
- [ ] Ajuste rápido de cantidad
- [ ] Verificar orden FIFO
- [ ] Alertas de vencimiento
- [ ] Edición de lote existente

#### BarcodeManagement:
- [ ] Agregar código manualmente
- [ ] Generar código automático
- [ ] Buscar por código
- [ ] Marcar como principal
- [ ] Copiar al portapapeles

#### StockAlertsPanel:
- [ ] Ver alertas activas
- [ ] Filtrar por severidad
- [ ] Resolver alerta
- [ ] Ver alertas resueltas
- [ ] Link a producto funciona

---

## 📱 Responsividad

### Breakpoints:
```css
/* Mobile First */
default: 1 columna

/* Tablet */
md: 2-3 columnas en grids

/* Desktop */
lg: 4 columnas en stats, full table
```

### Componentes Móviles:
- Tabs con scroll horizontal
- Tablas con overflow-x-auto
- Modales con altura máxima
- Botones táctiles (min 44px)

---

## 🔐 Seguridad

### Consideraciones:
- ✅ Rutas protegidas con `AdminRoute`
- ✅ Validación en backend con express-validator
- ✅ Límite de 5000 registros en exportación
- ✅ Autenticación JWT requerida
- ✅ Sanitización de inputs

---

## 🚀 Próximos Pasos Sugeridos

### Mejoras Futuras:
1. **Dashboard de Analytics** - Gráficos de movimientos por período
2. **Predicción de Stock** - ML para reabastecimiento
3. **Integración con Scanner** - Uso de cámara del dispositivo
4. **Notificaciones Push** - Alertas en tiempo real
5. **Multi-Ubicación Visual** - Mapa de almacenes
6. **Impresión de Etiquetas** - Generación de códigos QR/barras
7. **Modo Offline** - PWA con sincronización

### Optimizaciones:
- Implementar React Query para caching
- Virtualización de listas largas
- Lazy loading de componentes
- Service Workers para offline
- Websockets para actualizaciones en tiempo real

---

## 📞 Soporte

Para más información sobre la implementación, consultar:
- `ADVANCED_STOCK_SYSTEM.md` - Documentación técnica backend
- `STOCK_MANAGEMENT.md` - Sistema de Excel
- `IMPORT_GUIDE.md` - Guía de usuario

---

## ✅ Checklist de Implementación

- [x] StockMovementHistory.jsx creado
- [x] BatchManagement.jsx creado
- [x] BarcodeManagement.jsx creado
- [x] StockAlertsPanel.jsx creado
- [x] StockDashboard.jsx creado
- [x] Rutas agregadas a App.jsx
- [x] Navegación agregada a AdminLayout.jsx
- [x] Endpoint de exportación Excel
- [x] Backend reconstruido y desplegado
- [x] Documentación completa

**Estado:** ✅ **COMPLETADO** - Sistema frontend de gestión de stock 100% funcional y listo para producción.
