# 📄 Sistema de Facturas con PDF y Email - Documentación Completa

## 🎉 Estado Actual del Sistema

**✅ Sistema completamente funcional y operativo**

El sistema de facturas ahora incluye:
- ✅ Generación automática de facturas al realizar un pago
- ✅ CRUD completo de facturas (crear, leer, actualizar, cancelar)
- ✅ Estadísticas y reportes
- ✅ **NUEVO: Generación de PDFs profesionales**
- ✅ **NUEVO: Envío de facturas por email**
- ✅ **NUEVO: Visualización de PDFs en el navegador**

---

## 📋 Nuevos Endpoints Disponibles

### 1. Descargar Factura en PDF
```http
GET /api/invoices/:id/pdf
Authorization: Bearer {token}
```

**Descripción**: Genera y descarga la factura en formato PDF.

**Respuesta**: Archivo PDF descargable

**Ejemplo PowerShell**:
```powershell
# Obtener token (si aún no lo tienes)
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email": "admin@example.com", "password": "admin123"}'
$token = $loginResponse.token

# Descargar PDF de factura
$invoiceId = "tu-invoice-id-aqui"
Invoke-WebRequest -Uri "http://localhost:5000/api/invoices/$invoiceId/pdf" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -OutFile "factura_$invoiceId.pdf"

Write-Host "PDF descargado como factura_$invoiceId.pdf"
```

---

### 2. Ver Factura PDF en Navegador
```http
GET /api/invoices/:id/view-pdf
Authorization: Bearer {token}
```

**Descripción**: Muestra la factura en formato PDF directamente en el navegador.

**Respuesta**: PDF para visualización inline

**Ejemplo en navegador**:
```
http://localhost:5000/api/invoices/{id}/view-pdf
```
*(Requiere estar autenticado)*

---

### 3. Enviar Factura por Email
```http
POST /api/invoices/:id/email
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "cliente@example.com"  // Opcional, usa el email del cliente por defecto
}
```

**Descripción**: Genera el PDF y lo envía por email al cliente.

**Respuesta**:
```json
{
  "message": "Factura enviada exitosamente a cliente@example.com",
  "email": "cliente@example.com"
}
```

**Ejemplo PowerShell**:
```powershell
$invoiceId = "tu-invoice-id-aqui"

# Enviar al email registrado del cliente
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/$invoiceId/email" `
  -Method POST `
  -Headers @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body '{}'

Write-Host $response.message

# O enviar a un email diferente
$body = @{
  email = "otro@example.com"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/$invoiceId/email" `
  -Method POST `
  -Headers @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body $body

Write-Host $response.message
```

---

### 4. Regenerar PDF de Factura (Solo Admin)
```http
PUT /api/invoices/:id/regenerate-pdf
Authorization: Bearer {admin-token}
```

**Descripción**: Regenera el PDF de una factura (útil si hubo cambios o correcciones).

**Respuesta**:
```json
{
  "message": "PDF regenerado exitosamente",
  "pdfUrl": "/uploads/invoices/INV-2025-00001.pdf"
}
```

**Ejemplo PowerShell**:
```powershell
$invoiceId = "tu-invoice-id-aqui"

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/$invoiceId/regenerate-pdf" `
  -Method PUT `
  -Headers @{ "Authorization" = "Bearer $adminToken" }

Write-Host $response.message
Write-Host "PDF URL: $($response.pdfUrl)"
```

---

## 🎨 Características del PDF Generado

El PDF de factura incluye:

1. **Encabezado Profesional**
   - Logo de la empresa (personalizable)
   - Información de contacto
   - Diseño moderno con colores corporativos

2. **Información de la Factura**
   - Número de factura único
   - Fecha de emisión
   - Estado de la factura
   - Fecha de pago

3. **Datos del Cliente**
   - Nombre completo
   - Email
   - Teléfono
   - Dirección de envío
   - CUIT/DNI (si aplica)

4. **Tabla de Productos**
   - SKU del producto
   - Nombre y descripción
   - Cantidad
   - Precio unitario
   - Subtotal por ítem
   - Diseño con filas alternadas para mejor legibilidad

5. **Totales Detallados**
   - Subtotal
   - Descuentos aplicados
   - Costos de envío
   - IVA/Impuestos (16%)
   - **Total a pagar**

6. **Pie de Página**
   - Información de pago
   - Método de pago utilizado
   - Notas adicionales
   - Texto legal

**Formato**: A4, márgenes de 50pt, fuente Helvetica

---

## 📧 Configuración del Email

El sistema utiliza el servicio de email ya configurado en tu aplicación (`emailService`). Asegúrate de tener configurado SMTP:

**Archivo**: `server/src/config/email.js`

El email enviado incluye:
- Asunto: `Factura {número} - E-Commerce`
- Cuerpo HTML profesional con detalles de la factura
- PDF adjunto con la factura completa

---

## 🧪 Flujo de Prueba Completo

### Escenario 1: Generar Factura y Descargar PDF

```powershell
# 1. Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email": "admin@example.com", "password": "admin123"}'
$token = $loginResponse.token

# 2. Crear una factura para una orden pagada
$orderId = "uuid-de-orden-pagada"
$invoiceResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/order/$orderId" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token" }

$invoiceId = $invoiceResponse.invoice.id
Write-Host "Factura creada: $($invoiceResponse.invoice.invoiceNumber)"

# 3. Descargar PDF
Invoke-WebRequest -Uri "http://localhost:5000/api/invoices/$invoiceId/pdf" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -OutFile "factura_$($invoiceResponse.invoice.invoiceNumber).pdf"

Write-Host "PDF descargado exitosamente"

# 4. Abrir PDF (Windows)
Start-Process "factura_$($invoiceResponse.invoice.invoiceNumber).pdf"
```

---

### Escenario 2: Enviar Factura por Email

```powershell
# 1. Obtener tus facturas
$invoices = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/my-invoices" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" }

$firstInvoice = $invoices.invoices[0]
Write-Host "Enviando factura: $($firstInvoice.invoiceNumber)"

# 2. Enviar por email
$emailResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/$($firstInvoice.id)/email" `
  -Method POST `
  -Headers @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body '{}'

Write-Host $emailResponse.message
```

---

### Escenario 3: Ver PDF en Navegador

1. Obtener token mediante login
2. Abrir en navegador:
   ```
   http://localhost:5000/api/invoices/{invoice-id}/view-pdf
   ```
3. El PDF se mostrará directamente en el navegador

---

## 📁 Estructura de Archivos

```
server/
├── src/
│   ├── controllers/
│   │   └── invoiceController.js       # 11 funciones (7 originales + 4 nuevas)
│   ├── routes/
│   │   └── invoiceRoutes.js           # Rutas actualizadas con endpoints de PDF/email
│   ├── services/
│   │   └── invoicePDFService.js       # ⭐ NUEVO: Servicio de generación de PDFs
│   └── models/
│       └── Invoice.js                 # Modelo actualizado con campo pdfUrl
├── uploads/
│   └── invoices/                      # ⭐ NUEVO: Directorio para PDFs generados
└── package.json                       # Actualizado con pdfkit
```

---

## 🔍 Verificación del Sistema

### Test de Health Check
```powershell
curl http://localhost:5000/api/health
# Esperado: {"status":"ok","timestamp":"..."}
```

### Test de Autenticación
```powershell
curl http://localhost:5000/api/invoices/my-invoices
# Esperado: {"message":"No token provided"} o 401
```

### Test de PDF Generation (requiere factura existente)
```powershell
# Ver facturas disponibles
$invoices = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/my-invoices" `
  -Headers @{ "Authorization" = "Bearer $token" }

# Si hay facturas, probar descarga
if ($invoices.invoices.Count -gt 0) {
  $testId = $invoices.invoices[0].id
  Invoke-WebRequest -Uri "http://localhost:5000/api/invoices/$testId/pdf" `
    -Headers @{ "Authorization" = "Bearer $token" } `
    -OutFile "test_invoice.pdf"
  Write-Host "PDF de prueba generado: test_invoice.pdf"
}
```

---

## 🐛 Troubleshooting

### Problema: "Error al generar el PDF"

**Solución**:
1. Verificar que existe el directorio `uploads/invoices/`:
   ```powershell
   docker exec ecommerce_backend ls -la /app/uploads/invoices
   ```

2. Verificar permisos:
   ```powershell
   docker exec ecommerce_backend chown -R nodejs:nodejs /app/uploads
   ```

3. Ver logs del contenedor:
   ```powershell
   docker logs ecommerce_backend --tail 50
   ```

---

### Problema: "Error al enviar la factura"

**Solución**:
1. Verificar configuración SMTP:
   ```sql
   SELECT * FROM "SmtpSettings" LIMIT 1;
   ```

2. Verificar que el servicio de email está configurado:
   ```powershell
   docker exec ecommerce_backend cat /app/src/config/email.js
   ```

3. Ver logs de email:
   ```sql
   SELECT * FROM "EmailLogs" ORDER BY "createdAt" DESC LIMIT 5;
   ```

---

### Problema: PDF no se descarga

**Solución**:
1. Verificar que la factura existe:
   ```powershell
   $response = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/$invoiceId" `
     -Headers @{ "Authorization" = "Bearer $token" }
   $response.invoice
   ```

2. Verificar permisos de usuario (debe ser el propietario o admin)

3. Intentar regenerar el PDF:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/$invoiceId/regenerate-pdf" `
     -Method PUT `
     -Headers @{ "Authorization" = "Bearer $adminToken" }
   ```

---

## 📊 Consultas SQL Útiles

### Ver todas las facturas con PDFs generados
```sql
SELECT 
  "invoiceNumber",
  "customerName",
  "total",
  "status",
  "pdfUrl",
  "createdAt"
FROM "Invoices"
WHERE "pdfUrl" IS NOT NULL
ORDER BY "createdAt" DESC;
```

### Ver facturas sin PDF
```sql
SELECT 
  "invoiceNumber",
  "customerName",
  "total",
  "status"
FROM "Invoices"
WHERE "pdfUrl" IS NULL
ORDER BY "createdAt" DESC;
```

### Regenerar todos los PDFs (PowerShell)
```powershell
# Obtener todas las facturas
$invoices = Invoke-RestMethod -Uri "http://localhost:5000/api/invoices/all" `
  -Headers @{ "Authorization" = "Bearer $adminToken" }

# Regenerar cada una
foreach ($invoice in $invoices.invoices) {
  try {
    $response = Invoke-RestMethod `
      -Uri "http://localhost:5000/api/invoices/$($invoice.id)/regenerate-pdf" `
      -Method PUT `
      -Headers @{ "Authorization" = "Bearer $adminToken" }
    Write-Host "✓ $($invoice.invoiceNumber): $($response.message)"
  } catch {
    Write-Host "✗ $($invoice.invoiceNumber): Error - $_"
  }
}
```

---

## 🚀 Endpoints Completos (Resumen)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/invoices/my-invoices` | User | Listar mis facturas |
| GET | `/api/invoices/:id` | User | Ver detalle de factura |
| GET | `/api/invoices/number/:number` | User | Buscar por número |
| **GET** | **`/api/invoices/:id/pdf`** | **User** | **Descargar PDF** |
| **GET** | **`/api/invoices/:id/view-pdf`** | **User** | **Ver PDF en navegador** |
| **POST** | **`/api/invoices/:id/email`** | **User** | **Enviar por email** |
| GET | `/api/invoices/all` | Admin | Listar todas (admin) |
| GET | `/api/invoices/stats/summary` | Admin | Estadísticas |
| POST | `/api/invoices/order/:orderId` | Admin | Crear factura |
| PUT | `/api/invoices/:id/cancel` | Admin | Cancelar factura |
| **PUT** | **`/api/invoices/:id/regenerate-pdf`** | **Admin** | **Regenerar PDF** |

---

## ✅ Checklist de Funcionalidades

- [x] Modelo de datos completo
- [x] API CRUD funcional
- [x] Autenticación y permisos
- [x] Generación automática en pagos
- [x] Frontend básico (React)
- [x] **Generación de PDFs profesionales**
- [x] **Descarga de facturas en PDF**
- [x] **Visualización inline de PDFs**
- [x] **Envío por email con adjunto**
- [x] **Regeneración de PDFs**
- [x] Almacenamiento de PDFs
- [x] Documentación completa

---

## 📝 Notas Importantes

1. **Seguridad**: 
   - Los PDFs solo son accesibles por el propietario o administradores
   - Requiere token JWT válido en todas las operaciones

2. **Performance**:
   - Los PDFs se generan una vez y se cachean
   - Se almacenan en `uploads/invoices/`
   - Usar `regenerate-pdf` solo cuando sea necesario

3. **Email**:
   - El PDF se adjunta automáticamente
   - Usa el email del cliente por defecto
   - Puede especificarse un email diferente

4. **Personalización**:
   - Editar `invoicePDFService.js` para cambiar diseño
   - Logo en `_addHeader` method
   - Colores corporativos en las constantes del servicio

---

## 🎯 Próximos Pasos Recomendados

1. ✅ Personalizar logo de la empresa en PDFs
2. ✅ Configurar plantilla HTML del email
3. ✅ Agregar botón de descarga en frontend
4. ✅ Implementar envío masivo de facturas
5. ✅ Agregar firmas digitales a PDFs (opcional)

---

**Sistema de Facturas v2.0 - Con PDF y Email**  
*Última actualización: 27 de Octubre, 2025*
