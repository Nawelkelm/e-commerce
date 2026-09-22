# Roadmap & Backlog — TiendaKit

> Estado: 2026-09-21. Prioridad acordada con el dueño: **OCA → Redis → Tests → Backups**.
> Convención: cada tarea se implementa de a una, con tests cuando aplique, docs y commit.

Leyenda de prioridad: 🔴 crítica · 🟠 alta · 🟡 media · 🟢 baja
Estado: ⬜ pendiente · 🔄 en progreso · ✅ hecho

---

## FASE 0 — Seguridad crítica + base (en curso)

| # | Tarea | Prio | Estado |
|---|-------|------|--------|
| 0.1 | Quitar credencial PostgreSQL hardcodeada en `database.js` (fail-fast por `DATABASE_URL`) | 🔴 | ✅ |
| 0.2 | SSL de DB configurable (`DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED`) | 🔴 | ✅ |
| 0.3 | Externalizar CORS/URLs a env (`CORS_ORIGINS`, `FRONTEND_URL`, `BACKEND_URL`) | 🔴 | ✅ |
| 0.4 | `/api/health` con verificación real de DB | 🟠 | ✅ |
| 0.5 | Eliminar archivos backup/duplicados versionados | 🟡 | ✅ |
| 0.6 | `.env.example` actualizado (TiendaKit + Redis + nuevas vars) | 🟠 | ✅ |
| 0.7 | Docs base: `architecture.md`, `ROADMAP.md`, `CLAUDE.md`, guía Coolify, skills | 🟠 | ✅ |
| 0.8 | **Credencial de Render neutralizada**: la PostgreSQL ya no existe (Render elimina las del plan gratuito al expirar), así que la contraseña del historial de git no abre nada. Verificado el 2026-09-22: en la cuenta sólo quedan los servicios `ecommerce-api` y `ecommerce-web` | 🔴 | ✅ |
| 0.9 | Quitar todas las URLs/referencias de Render del proyecto | 🟠 | ✅ |
| 0.10 | Eliminar los servicios `ecommerce-api` y `ecommerce-web` que quedaron en Render. No responden, pero conservan configuración de entorno y pueden volver a desplegar el repo | 🟡 | ⬜ (acción del dueño) |

---

## MVP — Estabilizar y poner online en Coolify

Objetivo: web funcional, segura y desplegada en Coolify con dominio + SSL + backups.

| # | Tarea | Prio | Estado |
|---|-------|------|--------|
| M.1 | **Fix OCA**: claves `.env` duplicadas + URL/namespace/SOAPAction/campos del WSDL corregidos; parser robusto. Integración OK (devuelve respuesta real de OCA) | 🔴 | ✅ |
| M.1b | **Credenciales OCA**: OCA responde "CUIT o operativa inválidos". Conseguir contrato ePak + operativa válida y cargar `OCA_CUIT`/`OCA_OPERATIVA` reales | 🔴 | ⬜ (acción del dueño) |
| M.2 | Bajar a nivel `debug` los logs verbosos de `ocaService` y `shippingMethodController` | 🟡 | ✅ |
| M.3 | `docker-compose` apto Coolify (servicios separados, sin secrets en archivo) + `.dockerignore` + nginx SPA + Dockerfile build args | 🔴 | ✅ |
| M.4 | Guía y ejecución de deploy en Coolify (Oracle Free / Hetzner) | 🔴 | 🔄 |
| M.5 | Configurar dominios: frontend en Vercel + api en el backend, con SSL | 🔴 | ⬜ |
| M.6 | Backups automáticos de PostgreSQL (Coolify → S3/Cloudflare R2) | 🟠 | ⬜ |
| M.7 | Smoke test post-deploy: script `npm run smoke` (health/DB, settings, categorías, productos, login admin, token, acceso admin). Checkout MP sandbox = manual. Falta correrlo contra prod | 🟠 | 🔄 |
| M.8 | Limpiar migraciones duplicadas (coupons ×2, categoryIcons ×3) | 🟡 | ✅ |
| M.9 | **Cumplimiento legal AR**: botón de arrepentimiento (Res. 424/2020), links a Defensa del Consumidor, páginas de términos/privacidad/cookies editables desde el panel | 🔴 | ✅ |
| M.10 | **Completar los datos fiscales** de las páginas legales (razón social, CUIT, domicilio, jurisdicción) desde Admin > Páginas | 🔴 | ⬜ (acción del dueño) |
| M.11 | Precargar la dirección guardada del perfil en el checkout + enlazar términos/privacidad antes de confirmar | 🟠 | ✅ |
| M.12 | Eliminar páginas huérfanas sin ruta y el `Header.jsx` muerto | 🟡 | ✅ |
| M.13 | **Sincronizar comprobantes desde ARCA**: cron diario que reconstruye la serie con `FECompUltimoAutorizado` + `FECompConsultar` e importa los emitidos fuera de la tienda | 🟠 | ✅ |

---

## V1 — Robustez

| # | Tarea | Prio | Estado |
|---|-------|------|--------|
| V1.1 | **Integrar Redis**: cache de productos/categorías/settings públicos | 🟠 | ⬜ |
| V1.2 | **Colas Bull** sobre Redis para email y sync de tracking (sacar de cron inline) | 🟠 | ⬜ |
| V1.3 | Migración inicial que crea el esquema base desde cero. Las 15 migraciones-parche quedaron superadas y archivadas | 🔴 | ✅ |
| V1.4 | `sync` sólo en desarrollo; en prod `sync()` sin alter + migraciones explícitas | 🟠 | ✅ |
| V1.5 | **Tests** de flujos críticos: auth, carrito, checkout y órdenes (Jest + Supertest contra PostgreSQL real, 57 tests) | 🟠 | ✅ |
| V1.15 | Tests del flujo de pagos: webhooks de MercadoPago, acreditación y comprobantes de transferencia | 🟠 | ⬜ |
| V1.6 | CI básico (GitHub Actions): lint + tests + build en cada push a `main` y en cada PR | 🟠 | ✅ |
| V1.7 | `/api/health` extendido (DB + Redis + versión) | 🟡 | ⬜ |
| V1.8 | Healthcheck del frontend en Docker/Coolify | 🟢 | ⬜ |
| V1.9 | **Arreglar `npm run db:migrate`**: `.sequelizerc` + config por entorno + `db:baseline` para bases ya en uso. Las tres carpetas de migraciones quedaron consolidadas | 🔴 | ✅ |
| V1.10 | Limpiar los 33 warnings de `react-hooks/exhaustive-deps` y volver a `--max-warnings 0` en el lint | 🟡 | ⬜ |
| V1.11 | Quitar los overrides legacy que pisaban el sistema de diseño (`.badge`, `.badge-success`, `.badge-warning`, `.btn-secondary`): 14 reglas eliminadas | 🟡 | ✅ |
| V1.12 | Migrar las hojas CSS sueltas a CSS Modules: **20 clases genéricas están definidas en más de una hoja** (10 pintan color), así que una página puede pintar a otra. Ej.: `.coupon-header` de CouponsPage pintaba la caja de cupón del checkout | 🟠 | ⬜ |
| V1.13 | Colores legacy: 102 instancias de la paleta indigo/violeta vieja reemplazadas por Malbec; "Realizar pedido" pasa a `btn-cta` | 🟡 | ✅ |
| V1.14 | Preparar el despliegue separado: `client/vercel.json` con los rewrites del SPA + `docs/DEPLOYMENT-VERCEL.md` con variables y checklist. Se quitó el `wrangler.jsonc` de Cloudflare Workers, que contradecía el plan y estaba roto | 🟠 | ✅ |

---

## V2 — Escala y calidad

| # | Tarea | Prio | Estado |
|---|-------|------|--------|
| V2.1 | Observabilidad: logs estructurados JSON + métricas + alertas | 🟡 | ⬜ |
| V2.2 | Optimización de imágenes y CDN (Cloudinary transforms + Cloudflare) | 🟡 | ⬜ |
| V2.3 | Cobertura de tests amplia (unit + integración + e2e frontend) | 🟡 | ⬜ |
| V2.4 | Performance frontend (code-splitting, lazy routes, Lighthouse) | 🟡 | ⬜ |
| V2.5 | Analytics avanzado en panel admin | 🟢 | ⬜ |
| V2.6 | Auditoría de accesibilidad (a11y) | 🟢 | ⬜ |
| V2.7 | Documentación OpenAPI/Swagger del API | 🟢 | ⬜ |

---

## Deuda técnica registrada

- `sequelize.sync({ alter: true })` + conversión ENUM→VARCHAR en cada arranque **sólo en desarrollo** (resuelto para producción en V1.4).
- El `initial-schema.sql` se generó con `pg_dump`: es exacto pero no es legible como migración de Sequelize. Si un modelo cambia, el cambio va en una migración nueva, nunca editando ese archivo.
- `bull` instalado pero sin uso real; Redis declarado y no aprovechado.
- 0 tests pese a Jest/Supertest configurados.
- 33 warnings de `react-hooks/exhaustive-deps` en el frontend.
- El CI no levanta PostgreSQL: los 31 tests son de lógica pura y no lo necesitan. Cuando lleguen los tests de integración de V1.5 hay que agregar el servicio al workflow.
- La primera sincronización con ARCA de un comercio con historial largo tarda varias noches (cupo de 150 comprobantes por corrida). No hay forma de acelerarla sin chocar con los límites de AFIP.
- Las hojas CSS sueltas no están en una `@layer`, así que **le ganan al sistema de diseño en la cascada sin importar la especificidad** (los estilos sin capa vencen a los de `@layer components`). Por eso una regla suelta pisaba el botón en toda la app. Ver V1.12.
- Bundle del frontend en un solo chunk de ~1 MB, sin code-splitting (ver V2.4).
- No existe módulo de blog (el enlace roto del footer ya se quitó).
- `.env` local con claves OCA duplicadas (placeholders pisan valores reales).
- Mezcla de almacenamiento de imágenes (Cloudinary + disco local) sin criterio único.

## Definición de "hecho" (DoD) por tarea

1. Código implementado siguiendo convenciones de `CLAUDE.md`.
2. Tests verdes (si aplica) y/o verificación manual documentada.
3. Documentación del módulo actualizada.
4. Commit con mensaje convencional (`feat:`, `fix:`, `chore:`, ...).
