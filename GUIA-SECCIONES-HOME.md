# 📋 Guía: Administrar Secciones del Home (Ofertas Especiales)

## 🎯 ¿Dónde Administrar las Secciones?

**Panel de Administración → Personalizar Home → Pestaña "Secciones"**

🔗 **URL directa:** `http://localhost:3000/admin/home`

---

## ✨ Crear Sección de "Ofertas Especiales"

### **Paso 1: Ir a Personalizar Home**
1. Inicia sesión como administrador
2. Ve al menú lateral → **"Personalizar Home"**
3. Haz clic en la pestaña **"Secciones"** (última pestaña)

### **Paso 2: Scroll hasta "Agregar Nueva Sección Personalizada"**
Busca el formulario con fondo gris punteado que dice "Agregar Nueva Sección Personalizada"

### **Paso 3: Configurar la Sección**

Complete los siguientes campos:

#### **Campos Obligatorios:**

**Título:**
```
Ofertas Especiales
```

**Subtítulo:**
```
Aprovecha nuestros cupones de descuento exclusivos
```

#### **Campos de Personalización:**

**Icono:**
- Selecciona: `GiftIcon` o `TagIcon` o `ReceiptPercentIcon`
- Hay más de 80 iconos disponibles en el dropdown

**Color de Fondo:**
```
#7c3aed
```
O usa el selector de color para elegir un tono morado/púrpura

**Color de Texto/Icono:**
```
#ffffff
```
(Blanco para que contraste con el fondo morado)

**Texto del Botón:**
```
Ver Cupones
```

**Enlace del Botón:**
```
/cupones
```

**Orden:**
```
1
```
(Para que aparezca primero, después del carrusel/hero)

### **Paso 4: Vista Previa**
- En el mismo formulario verás una vista previa en tiempo real
- Ajusta colores y texto hasta que te guste

### **Paso 5: Agregar y Guardar**
1. Haz clic en **"Agregar Sección"** (botón azul)
2. La sección aparecerá arriba en la lista de secciones existentes
3. Verifica que el checkbox **"Activa"** esté marcado
4. Haz clic en **"Guardar Todas las Secciones Personalizadas"** (botón verde)

---

## 🎨 Ejemplos de Configuraciones

### **Opción 1: Estilo Vibrante (Recomendado)**
```
Título: Ofertas Especiales 🎁
Subtítulo: Descuentos de hasta 50% en productos seleccionados
Icono: GiftIcon
Color de Fondo: #7c3aed (morado)
Color de Texto: #ffffff (blanco)
Botón: Ver Todas las Ofertas → /cupones
```

### **Opción 2: Estilo Minimalista**
```
Título: Cupones Activos
Subtítulo: Ahorra en tu próxima compra
Icono: TagIcon
Color de Fondo: #f3f4f6 (gris claro)
Color de Texto: #111827 (negro)
Botón: Explorar Cupones → /cupones
```

### **Opción 3: Estilo Urgencia**
```
Título: ⚡ Ofertas por Tiempo Limitado
Subtítulo: Cupones disponibles solo esta semana
Icono: BoltIcon
Color de Fondo: #ef4444 (rojo)
Color de Texto: #ffffff (blanco)
Botón: ¡Aprovechar Ahora! → /cupones
```

---

## 🔧 Gestionar Secciones Existentes

### **Editar una Sección:**
1. Encuentra la sección en la lista superior
2. Modifica cualquier campo directamente
3. Los cambios se reflejan en la vista previa
4. Haz clic en **"Guardar Todas las Secciones Personalizadas"**

### **Desactivar una Sección:**
1. Desmarca el checkbox **"Activa"**
2. Guarda los cambios
3. La sección desaparecerá del home (pero permanece en la base de datos)

### **Eliminar una Sección:**
1. Haz clic en el ícono de basura 🗑️ (rojo)
2. Confirma la eliminación
3. Guarda los cambios

### **Reordenar Secciones:**
1. Cambia el número en el campo **"Orden"**
2. Menor número = aparece primero
3. Guarda los cambios

---

## 📊 Estado Actual del Sistema

### **Almacenamiento:**
- Las secciones se guardan en la tabla `Settings`
- Clave: `home_sections`
- Valor: Array JSON con todas las secciones

### **Página de Cupones:**
✅ **Ya está creada y funcional:** `http://localhost:3000/cupones`

**Características:**
- Muestra todos los cupones públicos activos
- Botón para copiar código
- Información de validez y límites
- Diseño responsive y atractivo
- Instrucciones de uso (4 pasos)

---

## 🚀 Resultado Final

Cuando configures correctamente la sección:

1. **En el Home:** Aparecerá una sección grande con:
   - Ícono grande centrado
   - Título destacado
   - Subtítulo descriptivo
   - Botón llamativo que lleva a `/cupones`

2. **Al hacer clic:** Los usuarios irán a la página de cupones donde verán:
   - Todos los cupones activos disponibles
   - Tarjetas con códigos copiables
   - Información de descuento y validez
   - Botón para ir a comprar

---

## 🎯 Iconos Recomendados para Ofertas/Cupones

- `GiftIcon` - 🎁 Regalo (MÁS RECOMENDADO)
- `TagIcon` - 🏷️ Etiqueta de precio
- `ReceiptPercentIcon` - 📝 Recibo con porcentaje
- `TicketIcon` - 🎫 Ticket
- `BanknotesIcon` - 💵 Billetes
- `SparklesIcon` - ✨ Brillos (especial)
- `FireIcon` - 🔥 Fuego (trending)
- `BoltIcon` - ⚡ Rayo (rápido)
- `TrophyIcon` - 🏆 Trofeo (premium)

---

## ⚠️ Notas Importantes

1. **No confundir con Cupones Admin:** 
   - `/admin/cupones` es para CREAR cupones
   - Las secciones del home son para PROMOCIONAR cupones

2. **Los datos SÍ se almacenan:**
   - Las secciones se guardan en la base de datos
   - No son datos hardcodeados
   - Persisten después de recargar

3. **Múltiples Secciones:**
   - Puedes crear tantas secciones como quieras
   - Cada una con su propio diseño y propósito
   - Ejemplos: "Envío Gratis", "Nuevos Productos", "Black Friday"

4. **Orden de Aparición:**
   - Las secciones aparecen DESPUÉS del carrusel/hero
   - Y ANTES de las categorías
   - El orden se controla con el campo "Orden"

---

## 🆘 Solución de Problemas

**Problema:** No veo la sección en el home
- ✅ Verifica que el checkbox "Activa" esté marcado
- ✅ Asegúrate de haber guardado los cambios (botón verde)
- ✅ Recarga la página principal (Ctrl+F5)

**Problema:** Los colores no se ven bien
- ✅ Usa la vista previa para ajustar antes de guardar
- ✅ Asegura buen contraste entre fondo y texto
- ✅ Prueba con colores complementarios

**Problema:** El botón no funciona
- ✅ Verifica que el enlace empiece con `/`
- ✅ Asegúrate de que `/cupones` esté escrito correctamente
- ✅ Los enlaces externos requieren `http://` o `https://`

---

## 📞 Acceso Rápido

- **Admin Home:** http://localhost:3000/admin/home
- **Página Cupones Públicos:** http://localhost:3000/cupones
- **Admin Cupones (crear/editar):** http://localhost:3000/admin/cupones
- **Home Público:** http://localhost:3000

---

¡Listo! Ahora puedes crear y administrar secciones personalizadas en el home, incluyendo la sección de "Ofertas Especiales" que enlaza a la página de cupones. 🎉
