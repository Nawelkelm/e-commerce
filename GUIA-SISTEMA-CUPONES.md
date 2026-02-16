# 📋 Guía del Sistema de Cupones

## 🎯 Resumen del Sistema

El sistema de cupones tiene **3 componentes principales**:

### 1️⃣ **Banner de Cupones en Home** (CouponBanner)
- 📍 **Ubicación**: Página principal, después del hero
- 🎨 **Apariencia**: Banner destacado con tarjetas de cupones
- ⚙️ **Administración**: `/admin/home` → Pestaña "Cupones"
- 📊 **Límite configurable**: 1-6 cupones

### 2️⃣ **Sección "Ofertas Especiales"** (Custom Section)
- 📍 **Ubicación**: Página principal, sección personalizable
- 🎨 **Apariencia**: Bloque con fondo púrpura, icono de regalo
- ⚙️ **Administración**: `/admin/home` → Pestaña "Secciones"
- 🔗 **Acción**: Redirige a `/cupones`

### 3️⃣ **Página Completa de Cupones** (/cupones)
- 📍 **Ubicación**: Ruta dedicada `/cupones`
- 🎨 **Apariencia**: Página completa con todos los cupones
- 📊 **Muestra**: TODOS los cupones activos sin límite
- ℹ️ **Incluye**: Instrucciones de uso, detalles completos

---

## 🔧 Cómo Administrar

### Paso 1: Crear Cupones
1. Ve a `/admin/cupones`
2. Click en "Nuevo Cupón"
3. Configura:
   - **Código**: Ej. `DESCUENTO50`
   - **Tipo**: Porcentaje / Fijo / Envío gratis
   - **Valor**: Ej. 50 (para $50 OFF)
   - **Público**: ✅ Activar (importante para mostrarlo)
   - **Activo**: ✅ Activar
   - **Fechas**: Inicio y fin de validez
4. Guardar

### Paso 2: Configurar Banner de Cupones
1. Ve a `/admin/home`
2. Click en pestaña **"Cupones"**
3. Configura:
   - ✅ **Habilitar banner**: Activa para mostrar en home
   - 📝 **Título**: "¡Ofertas Especiales!" (personalizable)
   - 📝 **Subtítulo**: "Aprovecha estos cupones de descuento"
   - 🔢 **Cantidad**: Elige 1-6 cupones a mostrar
4. Guardar cambios

### Paso 3: Configurar Sección "Ofertas Especiales" (Opcional)
1. Ve a `/admin/home`
2. Click en pestaña **"Secciones"**
3. Busca la sección "Ofertas Especiales" o créala:
   - **Título**: "Ofertas Especiales"
   - **Subtítulo**: "Aprovecha nuestros cupones..."
   - **Icono**: GiftIcon
   - **Color fondo**: #7c3aed (púrpura)
   - **Color texto**: #ffffff (blanco)
   - **Botón texto**: "Ver Cupones"
   - **Botón link**: /cupones
   - **Habilitado**: ✅
4. Guardar

---

## 🎨 Diferencias entre los Elementos

| Característica | Banner Home | Sección Home | Página /cupones |
|---|---|---|---|
| **Ubicación** | Inicio del home | Medio del home | Página separada |
| **Cantidad** | 1-6 (configurable) | Solo título/botón | Todos los cupones |
| **Administración** | /admin/home → Cupones | /admin/home → Secciones | N/A (automático) |
| **Diseño** | Tarjetas horizontales | Bloque con botón CTA | Grid completo |
| **Función** | Vista rápida | Redirección | Información completa |
| **Copiar código** | ✅ Sí | ❌ No | ✅ Sí |
| **Detalles** | Básicos | Solo título | Completos |

---

## 🔄 Flujo del Usuario

```
Usuario llega al HOME
       ↓
Ve Banner "¡Ofertas Especiales!"
   - 3 cupones destacados
   - Puede copiar código
   - Botón "Comprar Ahora" → /productos
       ↓
Scroll hacia abajo
       ↓
Ve Sección "Ofertas Especiales"
   - Bloque púrpura con regalo
   - Botón "Ver Cupones"
       ↓
Click en "Ver Cupones"
       ↓
Redirige a /cupones
   - Ve TODOS los cupones activos
   - Puede copiar códigos
   - Lee instrucciones de uso
   - Botón "Comprar Ahora" → /productos
       ↓
Va a productos y aplica cupón en checkout
```

---

## 🛠️ Configuración Técnica

### Base de Datos

#### Tabla: `Coupons`
```sql
- id (PRIMARY KEY)
- code (UNIQUE, STRING)
- description
- discountType (percentage/fixed/freeShipping)
- discountValue (DECIMAL)
- isActive (BOOLEAN)
- isPublic (BOOLEAN) -- ⚠️ Debe estar en TRUE para mostrarse
- startDate
- endDate
- minPurchase
- maxDiscount
```

#### Tabla: `HomeSettings`
```sql
- couponBannerEnabled (BOOLEAN, default: true)
- couponBannerTitle (VARCHAR, default: '¡Ofertas Especiales!')
- couponBannerSubtitle (VARCHAR, default: 'Aprovecha estos cupones...')
- couponBannerMaxCoupons (INTEGER, default: 3)
```

#### Tabla: `Settings`
```sql
- key = 'home_sections'
- value = JSON array con secciones personalizables
```

### API Endpoints

#### GET `/api/coupons/public`
Devuelve todos los cupones activos y públicos.

**Respuesta**:
```json
{
  "coupons": [
    {
      "id": 1,
      "code": "DESCUENTO50",
      "description": "$50 de descuento...",
      "discountType": "fixed",
      "discountValue": "50.00",
      "minPurchase": "300.00",
      "maxDiscount": null,
      "endDate": "2025-11-04T20:01:46.300Z"
    }
  ]
}
```

#### GET `/api/home-settings`
Devuelve toda la configuración del home, incluyendo configuración de cupones.

**Respuesta**:
```json
{
  "couponBannerEnabled": true,
  "couponBannerTitle": "¡Ofertas Especiales!",
  "couponBannerSubtitle": "Aprovecha estos cupones de descuento",
  "couponBannerMaxCoupons": 3,
  ...
}
```

---

## ✅ Checklist de Verificación

### Para que el Banner aparezca en Home:
- [ ] Tienes al menos 1 cupón creado
- [ ] El cupón está **Activo** (`isActive = true`)
- [ ] El cupón es **Público** (`isPublic = true`)
- [ ] El cupón está dentro de fechas válidas
- [ ] El banner está **Habilitado** en `/admin/home` → Cupones
- [ ] `couponBannerEnabled = true` en HomeSettings

### Para que la Sección aparezca en Home:
- [ ] Sección creada en `/admin/home` → Secciones
- [ ] Campo `enabled = true`
- [ ] Tiene título y botón configurados
- [ ] El link del botón apunta a `/cupones`

### Para que la Página /cupones funcione:
- [ ] Tienes cupones activos y públicos
- [ ] El endpoint `/api/coupons/public` responde correctamente
- [ ] La ruta `/cupones` está registrada en `App.jsx`

---

## 🎯 Casos de Uso

### Caso 1: Promoción de Temporada
**Objetivo**: Destacar cupón de Black Friday

1. Crear cupón: `BLACKFRIDAY30` (30% OFF)
2. Configurar banner: Mostrar solo 1 cupón
3. Título: "🎉 Black Friday - 30% OFF"
4. Resultado: Cupón destacado en banner principal

### Caso 2: Múltiples Ofertas
**Objetivo**: Mostrar varias ofertas simultáneas

1. Crear 5 cupones diferentes
2. Configurar banner: Mostrar 4 cupones
3. Los clientes ven 4 en home, todos en /cupones
4. Resultado: Variedad de opciones para el cliente

### Caso 3: Desactivar Temporalmente
**Objetivo**: Ocultar cupones sin eliminarlos

**Opción A** - Ocultar solo el banner:
- `/admin/home` → Cupones → Deshabilitar banner
- Resultado: Banner no aparece, pero /cupones sigue funcionando

**Opción B** - Desactivar cupón específico:
- `/admin/cupones` → Editar → Desmarcar "Activo"
- Resultado: Cupón no aparece en ningún lugar

---

## 🔍 Solución de Problemas

### ❌ El banner no aparece en home
**Causas posibles**:
1. `couponBannerEnabled = false` → Ve a `/admin/home` → Cupones → Habilitar
2. No hay cupones activos → Crea al menos un cupón en `/admin/cupones`
3. Cupones no son públicos → Edita cupón → Marca "Público"
4. Cupones fuera de fecha → Verifica `startDate` y `endDate`

### ❌ La página /cupones está vacía
**Causas posibles**:
1. No hay cupones públicos → Marca cupones como públicos
2. Todos los cupones están desactivados → Activa al menos uno
3. Error en API → Verifica endpoint `/api/coupons/public`

### ❌ No puedo copiar el código
**Causas posibles**:
1. Navegador no soporta clipboard API → Actualiza navegador
2. Permisos de clipboard bloqueados → Permite en configuración del navegador

---

## 🚀 Mejoras Futuras Sugeridas

1. **Cupones Personalizados por Usuario**
   - Cupones únicos por email
   - Límite de uso por usuario

2. **Estadísticas de Uso**
   - Cuántas veces se usó cada cupón
   - Tasa de conversión

3. **Categorías de Cupones**
   - Cupones por categoría de productos
   - Filtros en página /cupones

4. **Notificaciones**
   - Email cuando se crea nuevo cupón
   - Push notification para cupones próximos a expirar

5. **Gamificación**
   - Cupones secretos (Easter eggs)
   - Cupones por puntos de fidelidad

---

## 📞 Soporte

Para más información sobre el sistema de cupones, consulta:
- Documentación de administración: `/admin/cupones`
- Configuración de home: `/admin/home`
- Guía de secciones: `GUIA-SECCIONES-HOME.md`
