# Arquitectura — TiendaKit

> Documento vivo. Última actualización: 2026-06-26.
> Cada cliente despliega con su propio dominio (ej: www.tu-dominio.com / api.tu-dominio.com).

## 1. Visión general

E-commerce B2C full-stack para el mercado argentino, con pagos (MercadoPago +
transferencia), facturación electrónica AFIP, logística (OCA / Andreani /
Correo Argentino) y un panel de administración extenso.

```
                         ┌─────────────────────────────────────────────┐
   Navegador  ──HTTPS──► │              Cloudflare (DNS + CDN + WAF)     │
                         └───────────────┬───────────────┬─────────────┘
                                         │               │
                       www.tu-dominio.com        api.tu-dominio.com
                                         │               │
                         ┌───────────────▼───────────────▼─────────────┐
                         │            VPS  +  Coolify (Traefik/SSL)      │
                         │   ┌──────────┐  ┌──────────┐  ┌───────────┐  │
                         │   │ frontend │  │ backend  │  │ PostgreSQL │  │
                         │   │ (nginx)  │  │ (Node)   │  │   15       │  │
                         │   └──────────┘  └────┬─────┘  └───────────┘  │
                         │                      │        ┌───────────┐  │
                         │                      └───────►│  Redis 7   │  │
                         │                               └───────────┘  │
                         └───────────────────────────────────────────────┘
                                         │
                         Servicios externos: MercadoPago · AFIP · OCA ·
                                             Cloudinary · SMTP (Gmail)
```

## 2. Stack tecnológico

### Frontend (`/client`)
- **React 18** + **Vite 5**
- **TailwindCSS 3** (estilos)
- **Zustand** (estado global: auth, theme, wishlist)
- **react-query v3** (data fetching/cache)
- **react-router-dom v6** (routing, rutas protegidas y admin)
- **react-hook-form** (formularios)
- **react-helmet-async** (SEO/meta por página)
- **axios** (cliente HTTP) — base URL vía `VITE_API_URL`
- Build estático servido por **nginx** (ver `client/Dockerfile`)

### Backend (`/server`)
- **Node.js 18** + **Express 4**
- **Sequelize 6** (ORM) sobre **PostgreSQL** (`pg`)
- **JWT** (`jsonwebtoken`) + **bcryptjs** (auth)
- **Helmet** + **express-rate-limit** + sanitización XSS (`middleware/sanitize.js`)
- **Winston** (logging) + **morgan** (HTTP logs)
- **Multer** + **Cloudinary** (subida de imágenes)
- **Nodemailer** (email transaccional + plantillas)
- **node-cron** (tareas programadas: stock, tracking)
- **bull** (instalada; pendiente de integración real con Redis)
- Integraciones AR: **@afipsdk/afip.js** (facturación), OCA (SOAP), Andreani, Correo Argentino

### Datos
- **PostgreSQL 15** (relacional, 40+ modelos Sequelize)
- **Redis 7** (cache + colas; hoy declarado pero subutilizado)
- Almacenamiento de archivos: Cloudinary (imágenes de productos) + disco local `/uploads`

### Infra
- **Docker** + **docker-compose** (postgres, backend, frontend, redis, nginx)
- **Coolify** (PaaS self-hosted) como plataforma de despliegue objetivo
- **Cloudflare** (DNS, proxy, SSL en el borde)

## 3. Estructura del repositorio

```
e-commerce/
├── client/                  # Frontend React + Vite
│   └── src/
│       ├── components/      # UI reutilizable (Admin, Auth, Layout, Product, ...)
│       ├── pages/           # Vistas (Home, Cart, Checkout, Admin/*, User/*, Auth/*)
│       ├── store/           # Zustand (authStore, themeStore, wishlistStore)
│       ├── services/        # api.js (axios)
│       ├── config/          # api.js (base URL)
│       ├── hooks/           # useDebounce, ...
│       └── utils/           # imageHelpers, ...
├── server/                  # Backend Node + Express
│   └── src/
│       ├── config/          # database.js, logger.js, cloudinary.js
│       ├── controllers/     # Lógica por dominio (~30)
│       ├── models/          # Modelos Sequelize (~40) + index.js (asociaciones)
│       ├── routes/          # Rutas Express por dominio
│       ├── middleware/      # auth, permissions, sanitize, errorHandler, uploads, auditLog
│       ├── services/        # afip, email, excel, invoicePDF, stock, stockCron
│       ├── jobs/            # trackingSyncJob (cron)
│       ├── migrations/      # migraciones Sequelize (con duplicados a limpiar)
│       ├── scripts/         # seeds, init de permisos, utilidades
│       └── index.js         # bootstrap del servidor
├── db/init.sql              # init de PostgreSQL para Docker
├── migrations/              # SQL sueltos (wishlists)
├── docker-compose.yml
├── architecture.md          # (este archivo)
├── ROADMAP.md
└── CLAUDE.md
```

## 4. Módulos de dominio (backend)

| Módulo | Controller / Routes | Descripción |
|--------|--------------------|-------------|
| Auth | `authController` / `authRoutes` | Registro, login, JWT + refresh, verificación email, reset password |
| Usuarios | `userController` / `userRoutes` | Perfil, direcciones, gestión admin |
| Roles/Permisos | `roleController` | RBAC granular (`Role`, `Permission`, `RolePermission`) |
| Productos | `productController` | CRUD, imágenes, SEO, reviews agregadas |
| Categorías | `categoryController` | Árbol de categorías + íconos |
| Carrito | `cartController` | Carrito persistente por usuario |
| Órdenes | `orderController` | Creación, estados, items, método de envío |
| Pagos | `paymentController` | MercadoPago (preference + webhook), transferencia + comprobante |
| Cupones | `couponController` | Descuentos, uso por usuario, banner |
| Reviews | `reviewController` | Reseñas + "útil" + moderación |
| Wishlist | `wishlistController` | Lista de deseos |
| Stock | `stockController` / `stockService` | Lotes, ubicaciones, movimientos, reservas, alertas, cron |
| Proveedores | `supplierController` | ABM de proveedores |
| Facturación | `invoiceController` + `afipController`/`afipService` | Factura electrónica AFIP + PDF |
| Envíos | `shipmentController` + `shippingMethodController` | OCA/Andreani/CorreoArg, tracking, métodos |
| Cuentas banc. | `bankAccountController` | Datos para transferencia |
| Email/SMTP | `emailController`/`smtpController` | Plantillas + envío + logs + config SMTP |
| Home/Settings | `homeSettingsController`/`settingController` | Personalización del home y settings públicos |
| Analytics | `analyticsController` | Métricas del panel admin |

## 5. Flujos críticos

1. **Checkout MercadoPago:** carrito → `POST /api/orders` → `POST /api/payments` crea preference → redirect a MP → webhook `POST /api/payments/webhook` actualiza estado de la orden.
2. **Checkout transferencia:** orden pendiente → usuario sube comprobante (`uploadPaymentProof`) → admin valida → orden pagada.
3. **Facturación AFIP:** orden pagada → `afipService` solicita CAE → `invoicePDFService` genera PDF (`/uploads/invoices`).
4. **Envío OCA:** cotización por CP/peso/dimensiones → alta de envío → `trackingSyncJob` (cron) sincroniza estados.

## 6. Bootstrap del servidor (`server/src/index.js`)

Al arrancar: conecta a la DB → sincroniza el esquema **según el entorno** (ver abajo) → inicializa roles/permisos → seeds → cron de stock → cron de tracking → seed de métodos de envío → `listen`.

**Sincronización del esquema (a partir de 2026-06-26):**
- **Desarrollo** (`NODE_ENV` ≠ `production`): convierte ENUM→VARCHAR y corre `sequelize.sync({ alter: true })` para que el esquema siga a los modelos.
- **Producción** (`NODE_ENV=production`): sólo `sequelize.sync()` — crea tablas faltantes en el primer deploy y **no altera columnas existentes** (sin riesgo de corromper datos). Los cambios de esquema se aplican con migraciones (`npm run db:migrate`).
- **Override:** `DB_SYNC_ALTER=true` fuerza `alter` aunque sea producción (usar puntualmente y con backup previo).

> ⚠️ **Deuda técnica restante:** falta consolidar y versionar las migraciones (hay duplicados en `server/src/migrations/`) y adoptar `db:migrate` como mecanismo único de cambios de esquema en producción. Ver `ROADMAP.md` (V1.3 / M.8).

## 6.b Contenido y cumplimiento legal (Argentina)

Las páginas institucionales y legales viven en el modelo `ContentPage`
(`/api/content-pages`) y se editan desde **Admin > Páginas**. Se siembran 9 al
arrancar (`scripts/seedContentPages.js`, con `findOrCreate` para no pisar lo que
el comercio ya escribió): términos, privacidad, cookies, envíos, devoluciones,
FAQ, sobre nosotros, contacto y arrepentimiento.

Las marcadas como `isSystem` se pueden editar y despublicar pero no eliminar, y
no se les puede cambiar el slug, porque el footer y el checkout enlazan esas
URLs. El frontend las resuelve con la ruta `:slug`, que va al final del bloque
público para no tapar ninguna ruta fija; si el slug no existe cae en el 404.

**Botón de arrepentimiento:** la Resolución 424/2020 obliga a todo e-commerce
argentino a ofrecerlo para que el consumidor cancele una compra dentro de los
10 días corridos. Vive en `/arrepentimiento`, guarda cada solicitud en
`RegretRequest` con su fecha de resolución (para poder acreditar el plazo), y
se gestiona en **Admin > Arrepentimientos**. El endpoint de alta es público
—la ley exige que cualquiera pueda iniciarlo— con rate limit de 5 por hora
por IP. El enlace y el de Defensa de las y los Consumidores están fijos en el
footer y no dependen de la configuración, porque son obligatorios.

> ⚠️ Los datos fiscales de las páginas legales vienen entre corchetes
> (`[RAZÓN SOCIAL]`, `[CUIT]`, `[DOMICILIO COMERCIAL]`) y **cada tienda los
> tiene que completar** antes de salir a producción.

## 6.c Sincronización de comprobantes con ARCA

El cron `jobs/arcaSyncJob` (04:00 diario, configurable con `ARCA_SYNC_CRON`)
trae los comprobantes emitidos que la tienda todavía no tiene.

**Por qué funciona así:** ARCA no expone ningún método que devuelva todos los
comprobantes. El web service `wsfe` sólo permite pedir el último número
autorizado (`FECompUltimoAutorizado`) y consultar uno puntual
(`FECompConsultar`). La única forma de traerlos es reconstruir la serie
número por número.

Consecuencias de diseño:
- **Incremental:** sólo se pide el hueco entre el último local y el último de ARCA.
- **Acotada por corrida** (150 comprobantes) con pausa entre llamadas, para no
  chocar con los límites de frecuencia de AFIP. La primera carga de un comercio
  con historial largo se completa en varias noches; es deliberado.
- **De más nuevo a más viejo**, para que lo primero que aparezca en el panel
  sea lo reciente si la carga inicial se corta.

Se sincronizan 9 tipos: facturas A/B/C y sus notas de crédito y débito. Un
comprobante que existe en ARCA pero no en la tienda se importa con
`origin = "arca"`: es un registro de sólo lectura, sin pedido asociado, que
sirve para que el listado refleje el total realmente emitido (incluye lo
cargado a mano en el portal o desde otro sistema).

La identidad fiscal de un comprobante (punto de venta + tipo + número) tiene
índice único, así que no puede entrar dos veces.

> Se descartó scrapear "Mis Comprobantes" del portal: no tiene web service
> oficial y se rompe con cada cambio del sitio.

## 6.d Migraciones de base de datos

Los cambios de esquema van en `server/src/migrations/` como migraciones
versionadas de `sequelize-cli`. El `.sequelizerc` de `server/` apunta ahí y a
`src/config/sequelize-cli.js`, que lee la conexión de `DATABASE_URL` con
`use_env_variable` (nunca credenciales en el archivo, que está versionado).

```bash
cd server
npm run db:migrate:status   # qué está aplicado y qué falta
npm run db:migrate          # aplica lo pendiente
npm run db:migrate:undo     # revierte la última
npm run db:baseline         # sólo una vez, ver abajo
```

### `db:baseline`: obligatorio en bases que ya estaban en uso

El esquema de este proyecto lo construyó `sequelize.sync()`, no las
migraciones. Por eso una base en uso tiene todas las tablas pero
`SequelizeMeta` vacía: al correr `db:migrate` el CLI intenta aplicar
migraciones viejas sobre un esquema que ya las tiene y **falla**
(`column "averageRating" of relation "Products" already exists`).

`npm run db:baseline` escribe ese historial faltante, marcando las
migraciones actuales como aplicadas. Se corre **una sola vez por base**, y
sólo en bases preexistentes. Admite `-- --dry` para ver qué haría.

En una base vacía no hace falta: ahí las migraciones corren normalmente.

### Limitación actual

> Las 15 migraciones son **parches incrementales**: no hay ninguna que cree
> `Users`, `Products`, `Orders` ni `Categories`. Una instalación nueva sigue
> dependiendo de `sync()` para el esquema base, y las migraciones aplican los
> cambios posteriores. Generar la migración inicial completa es V1.3.

El SQL que se aplicaba a mano antes de todo esto quedó archivado en
`docs/historico-sql/`, fuera del camino del CLI.

## 7. Seguridad

**Sanitización de entrada:** `middleware/sanitize` limpia todos los strings de
cada request. Por defecto elimina todas las etiquetas HTML, que es lo correcto
para el contenido que mandan los clientes. Los campos de `RICH_TEXT_FIELDS`
(`htmlContent` de las plantillas de email y `content` de las páginas) son la
excepción: los edita un administrador, así que se sanitizan con
`USE_PROFILES: { html: true }`, que conserva el marcado seguro y descarta
script, svg, mathml, los manejadores de eventos y los protocolos peligrosos.
La decisión se toma por nombre de campo, así que funciona igual en objetos
anidados y arrays. Cubierto por `server/tests/sanitize.test.js`.

- Helmet con CSP + HSTS.
- Rate limiting general + estricto para login/registro.
- Sanitización de inputs (XSS) global.
- JWT access + refresh; contraseñas con bcrypt.
- RBAC por permisos en endpoints admin.
- **Config sensible 100% por variables de entorno** (sin fallbacks hardcodeados — corregido 2026-06-18).
- CORS por allowlist configurable (`CORS_ORIGINS`).

## 8. Despliegue

Ver **[docs/DEPLOYMENT-COOLIFY.md](docs/DEPLOYMENT-COOLIFY.md)**. Resumen:
Cloudflare (DNS/SSL) → VPS con Coolify → contenedores frontend/backend +
recursos gestionados PostgreSQL y Redis + backups automáticos a S3/R2.

## 9. Decisiones y convenciones

- Idioma: comentarios y mensajes de usuario en español; código/identificadores en inglés.
- Estado frontend: Zustand para global, react-query para datos del servidor.
- Errores backend: centralizados en `middleware/errorHandler.js`.
- Logs: Winston a `server/logs/` (en contenedores, a stdout).
- Nunca commitear `.env`; toda credencial vive en el entorno.
