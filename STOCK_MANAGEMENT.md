# Sistema de Gestión de Stock - Importación/Exportación Excel

## 📋 Características Implementadas

### 1. **Importación desde Excel**
- Importación masiva de productos desde archivos Excel (.xlsx, .xls)
- Validación completa de datos antes de importar
- Vista previa de productos a importar
- Actualización automática de productos existentes (por SKU)
- Creación de nuevos productos
- Reportes detallados de errores y advertencias

### 2. **Exportación a Excel**
- Exportación de productos existentes
- Formato compatible para re-importación
- Filtrado por categoría (opcional)

### 3. **Plantilla Excel**
- Plantilla descargable con formato correcto
- Instrucciones detalladas incluidas
- Lista de categorías disponibles
- Ejemplo de datos

### 4. **Alertas de Stock**
- Notificación de productos sin stock
- Alertas de stock bajo (basado en umbral configurado)
- Panel visual en la sección de productos

## 🚀 Cómo Usar

### Importar Productos

1. **Descargar la Plantilla**
   - En la página de Productos del panel admin
   - Click en "Plantilla Excel"
   - Se descargará `plantilla-productos.xlsx`

2. **Llenar la Plantilla**
   
   **Columnas Requeridas:**
   - `Nombre`: Nombre del producto (obligatorio)
   - `Precio`: Precio de venta sin decimales (ej: 19990)
   - `Stock`: Cantidad disponible (obligatorio)
   
   **Columnas Opcionales:**
   - `SKU`: Código único (se genera automáticamente si está vacío)
   - `Descripción Corta`: Descripción breve
   - `Categoría`: Nombre exacto de la categoría (debe existir)
   - `Precio Oferta`: Precio con descuento (debe ser menor al precio)
   - `Costo`: Costo de adquisición
   - `Stock Mínimo`: Umbral para alertas (default: 5)
   - `Peso (kg)`: Peso en kilogramos
   - `Activo`: SI/NO (default: SI)
   - `Destacado`: SI/NO para mostrar en home (default: NO)

3. **Vista Previa**
   - Click en "Importar Excel"
   - Seleccionar el archivo
   - Click en "Vista Previa"
   - Revisar:
     - ✅ Productos válidos (verde)
     - ❌ Errores (rojo) - deben corregirse
     - ⚠️ Advertencias (amarillo) - stock bajo

4. **Confirmar Importación**
   - Si no hay errores, click en "Importar X productos"
   - Los productos se crearán o actualizarán automáticamente

### Exportar Productos

1. Click en "Exportar Excel"
2. Se descargará un archivo con todos los productos actuales
3. El archivo puede modificarse y reimportarse

## 📝 Formato de Datos

### Precios
- **Sin puntos ni comas**: 19990 (no 19.990 ni 19,990)
- Solo números enteros

### Valores Booleanos (SI/NO)
Acepta múltiples formatos:
- `SI`, `SÍ`, `YES`, `1`, `VERDADERO`, `TRUE` → `true`
- `NO`, `0`, `FALSO`, `FALSE` → `false`

### Categorías
- Deben existir previamente en el sistema
- Nombre exacto (case-insensitive)
- Ver lista en hoja "Instrucciones" de la plantilla

### SKU
- Si se proporciona, debe ser único
- Si está vacío, se genera automáticamente
- Formato auto: `SKU` + timestamp + random

## 🔍 Validaciones

El sistema valida automáticamente:

1. **Campos requeridos**
   - Nombre no vacío
   - Precio válido (número positivo)
   - Stock válido (número entero no negativo)

2. **Integridad de datos**
   - Categoría existe en el sistema
   - Precio oferta < Precio normal
   - Costo < Precio de venta
   - Stock no negativo

3. **Advertencias (no bloquean importación)**
   - Stock bajo (stock ≤ stock mínimo)
   - Precio de costo alto

## 📊 Gestión de Stock

### Alertas Automáticas
- El panel muestra automáticamente:
  - Productos sin stock (stock = 0)
  - Productos con stock bajo (stock ≤ umbral)
  
### Actualización de Stock
- **Por Excel**: Importar con nuevo valor de stock
- **Individual**: Editar producto manualmente
- **Masiva**: Exportar, modificar, reimportar

## 💡 Ejemplos

### Ejemplo de Fila Completa
```
SKU: PROD001
Nombre: Laptop Dell Inspiron
Descripción Corta: Laptop 15.6" Intel i5 8GB RAM
Categoría: Electrónica
Precio: 599990
Precio Oferta: 499990
Costo: 350000
Stock: 25
Stock Mínimo: 5
Peso (kg): 2.5
Activo: SI
Destacado: SI
```

### Ejemplo Mínimo (solo requeridos)
```
Nombre: Mouse Inalámbrico
Precio: 15990
Stock: 50
```

## 🐛 Solución de Problemas

### "Categoría no encontrada"
- Verificar que la categoría exista en el sistema
- El nombre debe ser exacto (sin importar mayúsculas/minúsculas)
- Crear la categoría antes de importar

### "Precio de oferta debe ser menor al precio normal"
- Revisar que `Precio Oferta` < `Precio`
- Si no hay oferta, dejar la celda vacía

### "El archivo contiene errores"
- Revisar la lista de errores mostrada
- Corregir en el archivo Excel
- Volver a importar

### "Archivo temporal no encontrado"
- La vista previa expiró
- Subir el archivo nuevamente
- Hacer vista previa y confirmar inmediatamente

## 🔐 Seguridad

- Solo usuarios con rol **admin** pueden importar/exportar
- Validación en backend y frontend
- Los archivos temporales se eliminan después de procesar
- Límite de tamaño: 10MB

## 📈 Mejoras Futuras

- [ ] Importación de imágenes desde URLs
- [ ] Historial de importaciones
- [ ] Programación de importaciones automáticas
- [ ] Integración con proveedores externos
- [ ] Exportación en múltiples formatos (CSV, PDF)
- [ ] Validación de códigos de barras
- [ ] Sincronización con inventario físico

## 🆘 Soporte

Para problemas o dudas:
1. Revisar los logs del servidor
2. Verificar la consola del navegador
3. Consultar este README
4. Contactar al equipo de desarrollo
