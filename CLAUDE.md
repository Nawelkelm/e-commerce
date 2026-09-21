# CLAUDE.md

Guía para Claude Code (y cualquier agente) al trabajar en este repositorio.

## Qué es este proyecto

**TiendaKit** — Plataforma e-commerce white-label para PyMEs argentinas.
Frontend React/Vite, backend Node/Express, PostgreSQL + Sequelize.
Pagos con MercadoPago y transferencia, facturación AFIP, logística
OCA/Andreani/Correo Argentino. Panel admin extenso.
Cada cliente despliega con su propio dominio (configurar en `.env`).

Ver `architecture.md` (arquitectura) y `ROADMAP.md` (backlog y prioridades).

## Comandos

```bash
# Instalar todo
npm run install:all

# Desarrollo (frontend + backend juntos)
npm run dev
# Solo backend:  cd server && npm run dev   (nodemon, puerto 5000)
# Solo frontend: cd client && npm run dev   (vite)

# Backend
cd server && npm start          # producción
cd server && npm test           # Jest (aún sin tests; ver ROADMAP V1.5)
cd server && node --check src/index.js   # chequeo de sintaxis rápido

# Frontend
cd client && npm run build      # build producción
cd client && npm run lint       # ESLint (config en client/.eslintrc.cjs)

# Docker
npm run docker:up               # levanta stack completo
npm run docker:rebuild          # reconstruye
```

## Estructura

- `client/src/{components,pages,store,services,config,hooks,utils}` — frontend.
- `server/src/{controllers,models,routes,middleware,services,jobs,migrations,scripts}` — backend.
- `server/src/index.js` — bootstrap (DB, sync, seeds, crons, listen).
- `server/src/config/database.js` — conexión Sequelize.
- `docs/DEPLOYMENT-COOLIFY.md` — despliegue.

## Convenciones

- **Idioma:** comentarios y mensajes al usuario en **español**; identificadores de código en inglés. Igualá el estilo del archivo que editás.
- **Estado frontend:** Zustand (global) + react-query (datos del servidor). No agregar Redux.
- **HTTP:** axios; la base URL sale de `VITE_API_URL`.
- **Backend:** un controller + un route file por dominio. Errores vía `next(err)` → `middleware/errorHandler.js`. Logs con Winston (`config/logger`), no `console.log` en código productivo.
- **Validación:** `express-validator`; sanitización XSS ya global (`middleware/sanitize`).
- **Auth/permisos:** proteger endpoints admin con `middleware/auth` + `middleware/permissions`.
- **Commits:** convencionales — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## 🚧 Guardrails (no hacer)

1. **Nunca** hardcodear secretos, contraseñas, tokens ni connection strings. Todo por variables de entorno. (Hubo una credencial filtrada en `database.js`; ya corregida.)
2. **Nunca** commitear `.env`. Si agregás una variable, documentala en `.env.example`.
3. **No** introducir nuevos `sequelize.sync({ alter: true })` ni depender de él en producción. Usar migraciones versionadas (ver `ROADMAP.md` V1.3).
4. **No** dejar `console.log`/debug en commits (limpiar antes de cerrar tarea).
5. **No** romper la compatibilidad con Docker/Coolify (servicios, puertos, healthchecks).
6. **No** apuntar URLs ni CORS a dominios de Render; usar el dominio del cliente.
7. **No** mover el backend a funciones serverless: rompe los crons y las conexiones persistentes.
8. Antes de borrar/sobrescribir un archivo, verificá que no esté importado.

## Flujo de trabajo por tarea (definición de "hecho")

1. Si la tarea es no trivial, presentá un plan breve antes de tocar código.
2. Implementá una tarea a la vez (seguí el orden de `ROADMAP.md`).
3. Tests verdes si aplica (`cd server && npm test`) o verificación manual documentada.
4. Actualizá la documentación del módulo afectado (`architecture.md` / docs).
5. Generá un mensaje de commit convencional.

## Notas de despliegue

- **Frontend: Vercel.** El SPA de React se sirve desde Vercel.
- **Backend: host con proceso persistente** (Coolify self-hosted es el plan).
  Express tiene crons de stock y tracking, conexión sostenida a PostgreSQL y
  colas Bull previstas: **no es portable a funciones serverless**.
- **No usar Render.**
- Recursos: PostgreSQL + Redis junto al backend; backups automáticos a S3/R2.
- Al separar frontend y backend en dominios distintos: `CORS_ORIGINS` tiene que
  incluir el dominio de Vercel, y `VITE_API_URL` apuntar al dominio del backend.
- Cloudflare por delante (DNS + proxy + SSL). Detalle en `docs/DEPLOYMENT-COOLIFY.md`.
