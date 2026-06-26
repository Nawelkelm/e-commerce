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

Al arrancar: conecta a la DB → (hack) convierte ENUM→VARCHAR → `sequelize.sync({ alter: true })` → inicializa roles/permisos → seeds → cron de stock → cron de tracking → seed de métodos de envío → `listen`.

> ⚠️ **Deuda técnica:** `sync({ alter: true })` + el hack de ENUM en cada arranque es frágil y peligroso en producción. Plan: migrar a migraciones Sequelize versionadas y `sync` sólo en desarrollo. Ver `ROADMAP.md`.

## 7. Seguridad

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
