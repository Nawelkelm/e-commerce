# Despliegue — frontend en Vercel, backend aparte

TiendaKit se despliega en **dos piezas separadas**, en dominios distintos:

| Pieza | Dónde | Por qué |
|---|---|---|
| Frontend (React/Vite) | **Vercel** | Es un SPA estático: Vercel lo sirve rápido y gratis |
| Backend (Express) | **Host con proceso persistente** | Tiene crons, conexión sostenida a PostgreSQL y colas Bull |

> ⚠️ **El backend no es portable a funciones serverless.** Los crons de stock y
> de tracking, y la sincronización con ARCA, necesitan un proceso que siga vivo.
> En funciones serverless no corren. Está como guardrail en `CLAUDE.md`.

---

## 1. Frontend en Vercel

### Configuración del proyecto

Al importar el repo en Vercel:

| Campo | Valor |
|---|---|
| **Root Directory** | `client` |
| Framework Preset | Vite (lo detecta solo) |
| Build Command | `npm run build` (lo toma de `vercel.json`) |
| Output Directory | `dist` |

El `client/vercel.json` ya trae esa configuración. **Tiene que estar dentro del
Root Directory**: Vercel busca el archivo ahí, no en la raíz del repo.

### La reescritura del SPA no es opcional

```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```

Sin esto, entrar directo a `/terminos` o refrescar en `/admin/pedidos` da **404**:
Vercel busca un archivo en esa ruta y no existe, porque el ruteo lo hace React
en el navegador. Con la reescritura, cualquier ruta devuelve `index.html` y el
router se encarga.

### Variable de entorno

Una sola, y es de **build time** (Vite la hornea en el bundle):

```
VITE_API_URL = https://api.tu-dominio.com/api
```

> Cambiar esta variable **exige un redeploy**: no alcanza con reiniciar, porque
> el valor queda dentro del JavaScript compilado.

---

## 2. Backend

Va en un host con proceso persistente. El plan es **Coolify** self-hosted sobre
un VPS (ver `DEPLOYMENT-COOLIFY.md`), pero sirve cualquier host que corra un
contenedor de larga vida.

Necesita tres recursos:

- **Node 18** (es lo que usa `server/Dockerfile` y lo que valida el CI)
- **PostgreSQL**
- **Redis** (cache y colas)

### Al primer arranque

```bash
cd server
npm run db:migrate     # crea el esquema completo (38 tablas)
```

En una base vacía alcanza con eso. Si la base ya venía funcionando con un
esquema creado por `sync()`, primero hay que correr `npm run db:baseline`
**una sola vez**. Ver `architecture.md` sección 6.d.

---

## 3. CORS: el punto que más se olvida

Al quedar frontend y backend en dominios distintos, el navegador bloquea las
llamadas salvo que el backend autorice explícitamente el origen:

```
CORS_ORIGINS = https://tu-tienda.vercel.app,https://www.tu-dominio.com
```

Es una lista separada por comas, **sin barra final**. Si falta el dominio de
Vercel, la tienda carga pero ninguna llamada al API funciona — y el error en
consola habla de CORS, no de que falte configurar esto.

---

## 4. Variables del backend

Los nombres están todos en `.env.example`. Las imprescindibles para que arranque:

| Variable | Notas |
|---|---|
| `DATABASE_URL` | Cadena completa de PostgreSQL |
| `REDIS_URL` | |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Generar al azar, largos, distintos entre sí |
| `SESSION_SECRET` / `CSRF_SECRET` | Ídem |
| `CORS_ORIGINS` | Ver arriba |
| `FRONTEND_URL` / `BACKEND_URL` | Para los links de los emails |
| `NODE_ENV=production` | Con esto el esquema **no** se altera al arrancar |
| `DB_SSL` | `true` sólo si el proveedor de Postgres usa TLS |

Después, según lo que la tienda use: MercadoPago, Cloudinary, SMTP, AFIP, OCA.

> **Nunca** commitear valores reales. Si agregás una variable, documentá su
> nombre en `.env.example`.

---

## 5. Checklist antes de salir a producción

- [ ] `npm run db:migrate` corrido contra la base de producción
- [ ] `CORS_ORIGINS` incluye el dominio real de Vercel
- [ ] `VITE_API_URL` apunta al dominio del backend (y se hizo redeploy)
- [ ] `NODE_ENV=production` en el backend
- [ ] Secretos generados al azar, no los de desarrollo
- [ ] **Datos fiscales cargados** en Admin → Datos del comercio. Sin esto las
      páginas legales muestran rayas donde van la razón social y el CUIT
      (M.10 en el ROADMAP)
- [ ] Backups automáticos de PostgreSQL configurados (M.6)
- [ ] La PostgreSQL vieja de Render **borrada o con la contraseña rotada**:
      la credencial quedó en el historial de git (0.8 en el ROADMAP)
- [ ] Smoke test contra producción: `npm run smoke`

---

## Por qué no Cloudflare Workers

El repo tenía un `wrangler.jsonc` y un `npm run deploy` apuntando a Cloudflare
Workers. Se eliminaron: contradecían la decisión de desplegar en Vercel, y
además la configuración estaba rota (servía `client/` en vez de `client/dist`,
es decir el código fuente en lugar del build).

Cloudflare sigue en el plan, pero **por delante**: DNS, proxy y SSL. No como
host de la aplicación.
