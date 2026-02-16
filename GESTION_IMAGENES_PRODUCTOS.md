# 📸 Gestión de Imágenes de Productos - Guía de Uso

## ✅ Problema Resuelto

Se ha corregido el problema de actualización y borrado de imágenes de productos. Ahora el sistema maneja correctamente:

- ✅ **Eliminar imágenes existentes** de productos ya creados
- ✅ **Agregar nuevas imágenes** a productos existentes
- ✅ **Actualizar imágenes** sin perder las que ya existen
- ✅ **Limpieza automática** de archivos físicos eliminados del servidor

## 🎨 Interfaz Mejorada

### Al Editar un Producto

La interfaz ahora muestra **dos secciones separadas**:

#### 1. **Imágenes Actuales** (Borde Azul 🔵)
- Muestra las imágenes que ya están guardadas en el producto
- La imagen principal tiene una etiqueta "Principal"
- Puedes eliminar cualquier imagen haciendo clic en la ❌ roja
- Al eliminar, el archivo se borra tanto de la base de datos como del servidor

#### 2. **Nuevas Imágenes a Agregar** (Borde Verde 🟢)
- Muestra las imágenes que acabas de seleccionar
- Estas se subirán cuando guardes el producto
- También puedes eliminarlas antes de guardar

## 🔧 Cómo Usar

### Crear un Producto Nuevo

1. Haz clic en "Nuevo Producto"
2. Llena los datos del formulario
3. Selecciona imágenes desde el botón "Seleccionar imágenes"
4. Verás previews con **borde verde** de las imágenes nuevas
5. Puedes quitar imágenes haciendo clic en la ❌
6. Haz clic en "Crear Producto"

### Editar un Producto Existente

1. Haz clic en el botón **✏️ Editar** de un producto
2. Verás dos secciones:
   - **Imágenes actuales** (borde azul) - Las que ya tiene el producto
   - **Nuevas imágenes** (borde verde) - Solo aparece si agregas más

#### Para ELIMINAR imágenes:
- Haz clic en la ❌ roja de cualquier imagen actual (azul)
- El archivo se eliminará del servidor al guardar

#### Para AGREGAR más imágenes:
- Haz clic en "Agregar más imágenes"
- Selecciona los archivos
- Verás previews con borde verde
- Puedes quitar las que no quieras antes de guardar

#### Para REEMPLAZAR todas las imágenes:
1. Elimina todas las imágenes actuales (❌ en cada una)
2. Selecciona las nuevas imágenes
3. Guarda el producto

## 🔄 Cambios Técnicos Implementados

### Frontend (`client/src/pages/Admin/Products.jsx`)

1. **Tres estados separados:**
   ```javascript
   - existingImages[] - Imágenes ya guardadas (edición)
   - images[] - Nuevos archivos File a subir
   - imagePreview[] - URLs temporales para preview
   ```

2. **Funciones nuevas:**
   - `removeExistingImage(index)` - Elimina de imágenes guardadas
   - `removeImage(index)` - Elimina de nuevas imágenes
   - Actualizado `handleEdit()` para cargar existingImages
   - Actualizado `handleSubmit()` para enviar existingImages como JSON

3. **UI Mejorada:**
   - Sección "Imágenes actuales" con borde azul
   - Sección "Nuevas imágenes" con borde verde
   - Etiqueta "Principal" en la imagen primaria
   - Botones de eliminación en ambas secciones

### Backend (`server/src/controllers/productController.js`)

1. **Importado `fs.promises`** para eliminar archivos

2. **Actualizado `updateProduct()`:**
   - Lee `existingImages` desde el FormData
   - Compara imágenes antiguas vs conservadas
   - **Elimina archivos físicos** de imágenes removidas con `fs.unlink()`
   - Combina imágenes existentes + nuevas subidas
   - Asegura que haya una imagen primaria

3. **Logs mejorados:**
   - Registra cuando se eliminan archivos
   - Maneja errores de eliminación de archivos

## 📋 Flujo de Actualización

```
USUARIO EDITA PRODUCTO
    ↓
Carga imágenes actuales en existingImages[]
    ↓
Usuario elimina imagen A → Se quita de existingImages[]
Usuario agrega imagen B → Se añade a images[] (nuevas)
    ↓
Al GUARDAR:
    ↓
Frontend envía:
- FormData con campos del producto
- existingImages: JSON ["url1", "url2"] (las que quedan)
- images: File[] (archivos nuevos)
    ↓
Backend compara:
- Imágenes OLD del producto en DB: ["url1", "url2", "urlA"]
- Imágenes KEPT recibidas: ["url1", "url2"]
- Imágenes DELETED: ["urlA"] ← Se elimina físicamente
    ↓
Backend actualiza:
- images = existingImages + newImages
- Elimina /uploads/products/urlA del disco
- Guarda producto con nuevas imágenes
```

## 🎯 Casos de Uso

### Caso 1: Solo eliminar imágenes
1. Editar producto
2. Hacer clic en ❌ de las imágenes a quitar
3. Guardar
**Resultado:** Imágenes eliminadas, archivos borrados del servidor

### Caso 2: Solo agregar imágenes
1. Editar producto
2. Hacer clic en "Agregar más imágenes"
3. Seleccionar archivos
4. Guardar
**Resultado:** Nuevas imágenes agregadas, las viejas se conservan

### Caso 3: Reemplazar todas
1. Editar producto
2. Eliminar todas las actuales (❌ en cada una)
3. Seleccionar nuevas imágenes
4. Guardar
**Resultado:** Solo las nuevas imágenes, archivos viejos eliminados

### Caso 4: Actualizar sin tocar imágenes
1. Editar producto
2. Cambiar nombre, precio, descripción, etc.
3. NO tocar imágenes
4. Guardar
**Resultado:** Datos actualizados, imágenes intactas

## 🐛 Debugging

Si las imágenes no se actualizan:

1. **Verifica los logs del backend:**
   ```bash
   docker logs ecommerce_backend
   ```
   Busca: "Deleted image file:" o errores

2. **Verifica la consola del navegador:**
   - Abre DevTools (F12)
   - Pestaña "Network"
   - Filtra por "products"
   - Verifica el FormData enviado

3. **Verifica el estado React:**
   ```javascript
   // En handleSubmit, antes de fetch:
   console.log('Existing:', existingImages)
   console.log('New:', images)
   ```

## 📝 Notas Importantes

- ⚠️ Los archivos eliminados **NO se pueden recuperar**
- ✅ La primera imagen siempre será la imagen primaria
- ✅ El sistema acepta JPG, PNG, GIF, WEBP (máx 5MB cada una)
- ✅ Puedes subir hasta 10 imágenes por producto
- ✅ Los archivos se guardan en `/uploads/products/`

## 🎉 Mejoras Futuras Sugeridas

- [ ] Arrastrar y soltar para reordenar imágenes
- [ ] Seleccionar cuál imagen es la principal
- [ ] Edición de textos alt de las imágenes
- [ ] Compresión automática de imágenes grandes
- [ ] Preview ampliado al hacer clic en miniatura
- [ ] Confirmación antes de eliminar imágenes

---

**Versión:** 1.0  
**Fecha:** Octubre 16, 2025  
**Estado:** ✅ Funcionando
