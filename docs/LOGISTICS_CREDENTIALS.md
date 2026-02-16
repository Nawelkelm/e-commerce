# Gestión de Credenciales de Logística

## 📋 Descripción

Sistema completo para gestionar las credenciales de API de los servicios de logística argentinos (Andreani, OCA, Correo Argentino) desde el panel de administración.

## ✨ Características

### Panel de Administración

- **Configuración Visual**: Interfaz intuitiva para cada carrier
- **Gestión Segura**: Credenciales encriptadas en la base de datos
- **Estado en Tiempo Real**: Indicadores de estado de conexión
- **Prueba de Conexión**: Validar credenciales antes de activar
- **Activación/Desactivación**: Control individual por carrier
- **Historial de Sincronización**: Última sincronización y errores

### Seguridad

- **Encriptación AES-256**: Todas las credenciales se encriptan antes de guardar
- **Enmascaramiento**: Los passwords/API keys se muestran ocultos en la interfaz
- **Solo Admin**: Acceso restringido a usuarios administradores
- **Logs de Auditoría**: Registro de cambios en credenciales

## 🔧 Configuración

### 1. Variable de Entorno

Agrega esta variable al archivo `.env` del servidor:

```env
# Clave para encriptar credenciales (genera una nueva con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
CREDENTIALS_ENCRYPTION_KEY=tu_clave_de_64_caracteres_hexadecimales
```

### 2. Acceder al Panel

1. Inicia sesión como administrador
2. Ve a **Credenciales Logística** en el menú lateral
3. Verás tarjetas para cada carrier disponible

## 📝 Configurar Credenciales por Carrier

### Andreani

**Campos requeridos:**
- Usuario
- Contraseña  
- Número de Contrato
- URL API (opcional, por defecto: `https://api.andreani.com/v2`)

**Cómo obtener credenciales:**
1. Contacta a Andreani en developers@andreani.com
2. Solicita acceso a API E-commerce
3. Te proporcionarán usuario, contraseña y número de contrato

### OCA

**Campos requeridos:**
- CUIT de tu empresa
- Código Operativa
- Contraseña
- URL API (opcional)

**Cómo obtener credenciales:**
1. Contacta a OCA en ecommerce@oca.com.ar
2. Solicita integración con WebService EPAK
3. Te asignarán un código de operativa y contraseña

### Correo Argentino

**Campos requeridos:**
- API Key
- Client ID
- URL API (opcional, por defecto: `https://api.correoargentino.com.ar`)

**Cómo obtener credenciales:**
1. Visita https://www.correoargentino.com.ar/empresas/api
2. Solicita acceso a la API Mi Correo
3. Te proporcionarán API Key y Client ID

## 🎯 Uso

### Configurar un Carrier

1. **Hacer clic en "Configurar"** en la tarjeta del carrier
2. **Completar los campos requeridos**
3. **Opcionalmente marcar "Activar automáticamente"**
4. **Guardar**

### Probar Conexión

1. **Click en "Probar Conexión"**
2. El sistema intentará conectarse con las credenciales guardadas
3. Si es exitoso, verás un mensaje de confirmación
4. Si falla, se mostrará el error específico

### Activar/Desactivar

- **Activar**: Habilita la sincronización automática para ese carrier
- **Desactivar**: Detiene la sincronización sin borrar credenciales

## 🔄 Sincronización Automática

Una vez que un carrier está **activo y conectado**:

- ✅ Se sincronizará automáticamente cada 30 minutos
- ✅ Solo se sincronizan envíos activos de ese carrier
- ✅ Se agregan nuevos eventos de tracking
- ✅ Se actualiza el estado de los envíos

## 🎨 Indicadores de Estado

### 🟢 Activo (Verde)
- Carrier configurado
- Activado
- Última conexión exitosa

### 🔴 Error (Rojo)
- Carrier activado
- Error en última conexión
- Ver mensaje de error en la tarjeta

### 🟡 Pendiente (Amarillo)
- Credenciales guardadas
- No se ha probado la conexión
- Requiere prueba de conexión

### ⚫ No Configurado (Gris)
- Sin credenciales configuradas
- Necesita configuración inicial

### ⚪ Inactivo (Gris Claro)
- Credenciales configuradas
- Desactivado manualmente
- No se sincroniza

## 📊 API Endpoints

```
GET    /api/logistics-credentials              # Obtener todas las credenciales
GET    /api/logistics-credentials/:carrier     # Obtener por carrier
POST   /api/logistics-credentials              # Crear/actualizar credenciales
PATCH  /api/logistics-credentials/:carrier/toggle  # Activar/desactivar
POST   /api/logistics-credentials/:carrier/test    # Probar conexión
DELETE /api/logistics-credentials/:carrier     # Eliminar credenciales
```

## 🗄️ Modelo de Base de Datos

```javascript
LogisticsCredentials {
  id: UUID
  carrier: ENUM('Andreani', 'OCA', 'Correo Argentino')
  isActive: Boolean
  credentials: JSON (encriptado)
  lastSyncAt: Date
  syncStatus: ENUM('success', 'error', 'pending', 'never')
  lastError: Text
  settings: JSON
  createdAt: Date
  updatedAt: Date
}
```

## 🔐 Seguridad

### Encriptación

Las credenciales se encriptan usando **AES-256-CBC**:

```javascript
// Ejemplo de estructura encriptada
{
  credentials: "iv:ciphertext" // Formato encriptado
}
```

### Mejores Prácticas

1. **Rotar claves periódicamente**: Cambia `CREDENTIALS_ENCRYPTION_KEY` cada 6 meses
2. **Backup seguro**: Guarda el .env en lugar seguro
3. **Acceso restringido**: Solo administradores pueden ver/editar
4. **Auditoría**: Revisa logs de cambios regularmente

## 🚨 Troubleshooting

### "Error al guardar las credenciales"

- Verifica que todos los campos requeridos estén completos
- Revisa que `CREDENTIALS_ENCRYPTION_KEY` esté configurada en `.env`

### "Error de conexión" al probar

**Andreani:**
- Verifica usuario y contraseña
- Confirma que el contrato esté activo
- Revisa que la URL de API sea correcta

**OCA:**
- Confirma que el CUIT sea correcto (sin guiones)
- Verifica el código de operativa
- Asegúrate que la contraseña sea la del WebService

**Correo Argentino:**
- Valida que la API Key sea válida
- Confirma el Client ID
- Verifica que tu cuenta esté activa

### Credenciales no se guardan

1. Revisa los logs del servidor: `docker logs ecommerce_backend`
2. Verifica permisos de base de datos
3. Confirma que la tabla `LogisticsCredentials` exista

## 📞 Soporte

Para problemas con las credenciales de los carriers, contacta directamente:

- **Andreani**: developers@andreani.com
- **OCA**: ecommerce@oca.com.ar  
- **Correo Argentino**: api@correoargentino.com.ar

## 🔄 Actualización de Credenciales

Si necesitas cambiar credenciales existentes:

1. Click en "Editar Credenciales"
2. Modifica los campos necesarios
3. Desmarcar "Activar automáticamente" si no quieres activar inmediatamente
4. Guardar
5. Probar conexión antes de activar

## 📈 Monitoreo

Desde el panel puedes ver:

- ⏰ **Última sincronización**: Fecha y hora de la última actualización
- ✅ **Estado**: Success, Error, Pending, Never
- ❌ **Último error**: Mensaje de error si la última conexión falló
- 🔄 **Sincronizaciones exitosas**: Contador de sincronizaciones

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025
