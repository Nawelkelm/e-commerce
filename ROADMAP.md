# Roadmap & Backlog — E-commerce DojiPrint

> Estado: 2026-06-18. Prioridad acordada con el dueño: **OCA → Redis → Tests → Backups**.
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
| 0.6 | `.env.example` actualizado (dojiprint + Redis + nuevas vars) | 🟠 | ✅ |
| 0.7 | Docs base: `architecture.md`, `ROADMAP.md`, `CLAUDE.md`, guía Coolify, skills | 🟠 | ✅ |
| 0.8 | **Rotar contraseña de PostgreSQL** (la vieja quedó en el historial de git) | 🔴 | ⬜ (acción del dueño) |
| 0.9 | Quitar `VITE_API_URL` por defecto de Render en `client/src/config/api.js` | 🟠 | ⬜ |

---

## MVP — Estabilizar y poner online en dojiprint.com.ar

Objetivo: web funcional, segura y desplegada en Coolify con dominio + SSL + backups.

| # | Tarea | Prio | Estado |
|---|-------|------|--------|
| M.1 | **Fix OCA**: claves `.env` duplicadas + URL/namespace/SOAPAction/campos del WSDL corregidos; parser robusto. Integración OK (devuelve respuesta real de OCA) | 🔴 | ✅ |
| M.1b | **Credenciales OCA**: OCA responde "CUIT o operativa inválidos". Conseguir contrato ePak + operativa válida y cargar `OCA_CUIT`/`OCA_OPERATIVA` reales | 🔴 | ⬜ (acción del dueño) |
| M.2 | Bajar a nivel `debug` los logs verbosos de `ocaService` y `shippingMethodController` | 🟡 | ✅ |
| M.3 | `docker-compose` apto Coolify (servicios separados, sin secrets en archivo) | 🔴 | ⬜ |
| M.4 | Guía y ejecución de deploy en Coolify (Oracle Free / Hetzner) | 🔴 | 🔄 |
| M.5 | Configurar dominios en Cloudflare → Coolify (www + api) con SSL | 🔴 | ⬜ |
| M.6 | Backups automáticos de PostgreSQL (Coolify → S3/Cloudflare R2) | 🟠 | ⬜ |
| M.7 | Smoke test post-deploy (health, login, listar productos, checkout sandbox) | 🟠 | ⬜ |
| M.8 | Limpiar migraciones duplicadas (coupons ×2, categoryIcons ×3) | 🟡 | ⬜ |

---

## V1 — Robustez

| # | Tarea | Prio | Estado |
|---|-------|------|--------|
| V1.1 | **Integrar Redis**: cache de productos/categorías/settings públicos | 🟠 | ⬜ |
| V1.2 | **Colas Bull** sobre Redis para email y sync de tracking (sacar de cron inline) | 🟠 | ⬜ |
| V1.3 | Reemplazar `sync({ alter: true })` + hack ENUM por migraciones versionadas | 🔴 | ⬜ |
| V1.4 | `sync` sólo en desarrollo; en prod correr migraciones explícitas | 🟠 | ⬜ |
| V1.5 | **Tests** de flujos críticos: auth, checkout, órdenes, pagos (Jest + Supertest) | 🟠 | ⬜ |
| V1.6 | CI básico (GitHub Actions): lint + tests + build en cada push | 🟠 | ⬜ |
| V1.7 | `/api/health` extendido (DB + Redis + versión) | 🟡 | ⬜ |
| V1.8 | Healthcheck del frontend en Docker/Coolify | 🟢 | ⬜ |

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

- `sequelize.sync({ alter: true })` + conversión ENUM→VARCHAR en cada arranque (`index.js`).
- Migraciones duplicadas en `server/src/migrations/`.
- `bull` instalado pero sin uso real; Redis declarado y no aprovechado.
- 0 tests pese a Jest/Supertest configurados.
- `.env` local con claves OCA duplicadas (placeholders pisan valores reales).
- `client/src/config/api.js` con fallback a URL de Render.
- Mezcla de almacenamiento de imágenes (Cloudinary + disco local) sin criterio único.

## Definición de "hecho" (DoD) por tarea

1. Código implementado siguiendo convenciones de `CLAUDE.md`.
2. Tests verdes (si aplica) y/o verificación manual documentada.
3. Documentación del módulo actualizada.
4. Commit con mensaje convencional (`feat:`, `fix:`, `chore:`, ...).
