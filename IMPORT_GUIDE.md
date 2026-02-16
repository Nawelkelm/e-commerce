# 🎯 Guía Rápida de Importación de Productos

## Paso 1: Acceder al Panel de Productos

1. Inicia sesión como administrador
2. Ve a **Panel Admin** → **Productos**
3. Verás tres botones nuevos:
   - 📄 **Plantilla Excel**
   - ⬆️ **Importar Excel**
   - ⬇️ **Exportar Excel**

## Paso 2: Descargar la Plantilla

Click en **"Plantilla Excel"** para descargar `plantilla-productos.xlsx`

La plantilla incluye:
- ✅ Hoja "Productos" con columnas pre-configuradas
- ✅ Hoja "Instrucciones" con guía detallada
- ✅ Ejemplo de producto completo
- ✅ Lista de categorías disponibles

## Paso 3: Completar los Datos

### Formato de Ejemplo:

| SKU | Nombre | Descripción Corta | Categoría | Precio | Precio Oferta | Costo | Stock | Stock Mínimo | Peso (kg) | Activo | Destacado |
|-----|--------|-------------------|-----------|--------|---------------|-------|-------|--------------|-----------|--------|-----------|
| LAPTOP001 | Laptop HP | Laptop 15.6" i5 8GB | Electrónica | 599990 | 499990 | 350000 | 25 | 5 | 2.5 | SI | SI |
| MOUSE001 | Mouse Logitech | Mouse inalámbrico | Electrónica | 15990 | | 8000 | 100 | 10 | 0.2 | SI | NO |
| | Teclado Gaming | Teclado RGB mecánico | Electrónica | 89990 | 79990 | 45000 | 50 | 5 | 1.2 | SI | NO |

### Columnas Obligatorias:
- **Nombre**: No vacío
- **Precio**: Número entero sin puntos ni comas
- **Stock**: Número entero (puede ser 0)

### Columnas Opcionales:
- **SKU**: Se genera automáticamente si está vacío
- **Descripción Corta**: Texto libre
- **Categoría**: Debe existir en el sistema
- **Precio Oferta**: Debe ser menor que Precio
- **Costo**: Tu costo de adquisición
- **Stock Mínimo**: Default 5 si está vacío
- **Peso**: En kilogramos
- **Activo**: SI/NO (default SI)
- **Destacado**: SI/NO (default NO)

## Paso 4: Importar el Archivo

1. Click en **"Importar Excel"**
2. Arrastra el archivo o click para seleccionar
3. Click en **"Vista Previa"**

### Resultado de Vista Previa:

```
┌─────────────────────────────────────┐
│   Resumen de Importación            │
├─────────────────────────────────────┤
│  ✅ 45 Productos válidos            │
│  ❌ 3 Errores                       │
│  ⚠️  8 Advertencias                 │
└─────────────────────────────────────┘
```

## Paso 5: Revisar Errores y Advertencias

### ❌ Errores (Bloquean la importación):
```
Fila 10: Nombre es requerido
Fila 15: Categoría "Ropa" no encontrada
Fila 23: Precio de oferta debe ser menor al precio normal
```

**Solución:** Corrige los errores en el archivo Excel y vuelve a importar.

### ⚠️ Advertencias (No bloquean):
```
Fila 5: "Mouse USB" tiene stock bajo (3 <= 5)
Fila 12: "Teclado Básico" tiene stock bajo (4 <= 10)
```

**Nota:** Puedes continuar con la importación. Se crearán los productos pero aparecerán en alertas de stock bajo.

## Paso 6: Confirmar Importación

Si no hay errores:

1. Click en **"Importar 45 productos"**
2. Espera la confirmación
3. Verás un resumen:
   ```
   ✅ 42 productos importados
   🔄 3 productos actualizados
   ❌ 0 productos omitidos
   ```

## 📊 Después de Importar

### Alertas de Stock Automáticas

El sistema mostrará automáticamente en la parte superior:

```
┌────────────────────────────────────────────────┐
│ ⚠️  ALERTAS DE STOCK                           │
├────────────────────────────────────────────────┤
│ • 2 productos sin stock                        │
│ • 8 productos con stock bajo                   │
│                                                │
│ Mouse USB - Sin stock                      0   │
│ Teclado Básico - Stock bajo              4/10  │
│ Laptop Dell - Stock bajo                 3/5   │
│ ... y 7 más                                    │
└────────────────────────────────────────────────┘
```

## 🔄 Actualización de Productos Existentes

Si importas un producto con **SKU existente**:
- ✅ Se actualizarán todos los datos
- ✅ Las imágenes existentes se mantienen
- ✅ Se puede cambiar cualquier campo

**Ejemplo:**
```excel
SKU: LAPTOP001 (ya existe)
Nombre: Laptop HP Pro (nuevo nombre)
Stock: 100 (nuevo stock)
→ Se actualiza el producto existente
```

## 💡 Consejos Útimos

### 1. Exportar antes de Importar
```
Click "Exportar Excel" → Modificar datos → Reimportar
```
Esto garantiza que el formato sea correcto.

### 2. Importación por Lotes
Para muchos productos:
- Importa en grupos de 100-200
- Más fácil de revisar errores
- Más rápido de procesar

### 3. Backup Regular
```
Exportar → Guardar con fecha
Ejemplo: productos-2024-10-24.xlsx
```

### 4. Validar Categorías Primero
Antes de importar:
1. Ve a **Admin** → **Categorías**
2. Crea las categorías necesarias
3. Luego importa los productos

## 🚨 Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Categoría no encontrada" | La categoría no existe | Crear la categoría primero |
| "Precio inválido" | Precio con decimales o texto | Usar números enteros: 19990 |
| "Stock negativo" | Stock con signo negativo | Usar 0 o números positivos |
| "SKU duplicado" | Mismo SKU dos veces en el archivo | Cambiar uno de los SKUs |
| "Archivo muy grande" | Archivo > 10MB | Dividir en archivos más pequeños |

## 📱 Vista del Panel

```
┌──────────────────────────────────────────────────────────┐
│                      PRODUCTOS                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  [📄 Plantilla Excel] [⬆️ Importar] [⬇️ Exportar]        │
│                                                           │
│  ⚠️  ALERTAS: 2 sin stock | 8 stock bajo                │
│                                                           │
│  [ + Agregar Producto ]                                  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Producto          │ Precio   │ Stock │ Estado    │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Laptop HP         │ $499,990 │  25   │ ✅ Activo │   │
│  │ Mouse Logitech    │ $15,990  │ 100   │ ✅ Activo │   │
│  │ Teclado Gaming    │ $79,990  │  50   │ ✅ Activo │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## 🎓 Tutorial en Video

*(Aquí podrías agregar un link a un video tutorial si lo creas)*

---

**¿Necesitas ayuda?** Consulta el archivo `STOCK_MANAGEMENT.md` para más detalles técnicos.
