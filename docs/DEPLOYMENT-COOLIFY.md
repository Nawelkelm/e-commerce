# Despliegue en Coolify — DojiPrint

Guía paso a paso para desplegar el e-commerce en **Coolify** (PaaS self-hosted),
con **PostgreSQL + Redis + SSL + dominio dojiprint.com.ar + backups automáticos**,
detrás de **Cloudflare**. **No se usa Render.**

---

## 0. Arquitectura del despliegue

```
Cloudflare (DNS + proxy + SSL en el borde)
   www.dojiprint.com.ar ─┐
   dojiprint.com.ar      ├─► VPS (IP pública) con Coolify
   api.dojiprint.com.ar ─┘        ├─ App: frontend (nginx, build estático)
                                  ├─ App: backend (Node API, :5000)
                                  ├─ Recurso: PostgreSQL 15
                                  └─ Recurso: Redis 7
```

---

## 1. Elegir y crear el servidor (VPS)

Coolify es gratis; pagás (o no) el VPS. Dos caminos:

### Opción A — Oracle Cloud Always Free (💲0, recomendado)
- Instancia **Ampere A1 (ARM)**: hasta 4 OCPU + **24 GB RAM** + 200 GB — gratis para siempre.
- Requiere tarjeta para verificar identidad (no cobra en el tier Always Free).
- Pasos:
  1. Crear cuenta en https://cloud.oracle.com (elegí región cercana, p. ej. São Paulo).
  2. **Compute → Instances → Create**. Imagen: **Ubuntu 22.04**. Shape: **VM.Standard.A1.Flex** (ARM), 2-4 OCPU, 12-24 GB RAM.
  3. Si dice "out of capacity", reintentá en otra AD/horario o bajá a 2 OCPU. (Es el cuello típico del free tier.)
  4. Agregá tu clave SSH pública.
  5. **Networking:** en la VCN, Security List, abrir ingress **TCP 22, 80, 443, 8000** (8000 = panel Coolify).
  6. Dentro del server, además, abrir el firewall del SO:
     ```bash
     sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
     sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
     sudo iptables -I INPUT -p tcp --dport 8000 -j ACCEPT
     sudo netfilter-persistent save
     ```

### Opción B — Hetzner (≈ €4/mes, cero fricción)
- https://www.hetzner.com/cloud → **CX22** (2 vCPU, 4 GB, 40 GB).
- Imagen Ubuntu 22.04, agregá tu SSH key. Firewall: abrir 22/80/443/8000.
- x86, súper estable; ideal si Oracle te da problemas de capacidad.

> Mínimo realista para todo el stack: **2 vCPU / 4 GB RAM**. Con 8-24 GB vas holgado.

---

## 2. Instalar Coolify

SSH al server y:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```
Al terminar, abrí `http://<IP_DEL_SERVER>:8000`, creá el usuario admin y completá el onboarding (Coolify se autoconfigura como "localhost" server).

---

## 3. DNS en Cloudflare

En el panel de Cloudflare de `dojiprint.com.ar` → **DNS → Records**. Borrá los CNAME viejos que apuntaban a Render y creá registros **A** a la IP del VPS:

| Tipo | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `IP_DEL_VPS` | 🟠 Proxied |
| A | `www` | `IP_DEL_VPS` | 🟠 Proxied |
| A | `api` | `IP_DEL_VPS` | 🟠 Proxied |

> Para que Let's Encrypt funcione con Cloudflare proxied, poné **SSL/TLS → Overview → Full (strict)**. Si al emitir el certificado en Coolify hay problemas, pasá temporalmente el proxy a **DNS only** (nube gris), emití el cert, y volvé a Proxied.

El archivo `cloudflare-dns.txt` del repo apunta a Render y queda **obsoleto**: reemplazalo por estos registros A.

---

## 4. Crear recursos gestionados en Coolify

En tu proyecto de Coolify → **+ New**:

### PostgreSQL
- **Databases → PostgreSQL 15**. Coolify genera usuario/clave/DB y una `DATABASE_URL` interna (host = nombre del servicio en la red interna). Copiala.

### Redis
- **Databases → Redis 7**. Coolify genera la `REDIS_URL` interna. Copiala.

> Estos servicios viven en la red interna de Coolify; el backend los alcanza por su hostname interno, no hace falta exponer puertos públicos.

---

## 5. Desplegar el backend (API)

**+ New → Application → Public Repository** (o conectá GitHub) → repo `Nawelkelm/e-commerce`.

- **Build Pack:** Dockerfile. **Base Directory:** `/server`. (Usa `server/Dockerfile`.)
- **Port:** `5000`.
- **Domain:** `https://api.dojiprint.com.ar` (Coolify pide SSL → lo emite con Let's Encrypt).
- **Health check path:** `/api/health`.
- **Environment Variables** (pegá desde `.env.example`, con valores reales):
  - `NODE_ENV=production`
  - `DATABASE_URL=` (la de Coolify Postgres)
  - `DB_SSL=false` (Postgres interno de Coolify normalmente sin TLS) — o `true` si lo configurás con TLS
  - `REDIS_URL=` (la de Coolify Redis)
  - `JWT_SECRET`, `JWT_REFRESH_SECRET` (generá con `openssl rand -hex 64`)
  - `FRONTEND_URL=https://www.dojiprint.com.ar`
  - `BACKEND_URL=https://api.dojiprint.com.ar`
  - `CORS_ORIGINS=https://www.dojiprint.com.ar,https://dojiprint.com.ar`
  - `MERCADOPAGO_*`, `CLOUDINARY_*`, `SMTP_*`, `OCA_*`, `AFIP_*` (ver `.env.example`)
- **Persistent storage** (volúmenes) para no perder archivos subidos:
  - `/app/uploads` → volumen persistente
  - `/app/logs` → volumen persistente
- Deploy. El primer arranque corre `sync` + seeds + inicializa permisos.

> **Webhook de MercadoPago:** configuralo a `https://api.dojiprint.com.ar/api/payments/webhook`.

---

## 6. Desplegar el frontend

**+ New → Application** → mismo repo.

- **Build Pack:** Dockerfile. **Base Directory:** `/client`. (Usa `client/Dockerfile`, sirve con nginx.)
- **Port:** `10000` (el `EXPOSE` del Dockerfile del cliente).
- **Domain:** `https://www.dojiprint.com.ar` (agregá también `https://dojiprint.com.ar` con redirect a www).
- **Build-time env:** `VITE_API_URL=https://api.dojiprint.com.ar/api` (Vite necesita la var en build).
- Deploy.

---

## 7. Backups automáticos de PostgreSQL

En Coolify, sobre el recurso **PostgreSQL → Backups**:
- Activá **Scheduled Backups** (cron, p. ej. diario `0 3 * * *`).
- **Destino S3-compatible:** lo más barato es **Cloudflare R2** (10 GB gratis):
  - En Cloudflare → R2 → creá un bucket `dojiprint-backups` y un API token (S3).
  - En Coolify → Storages (S3) → cargá endpoint R2, access key y secret.
  - Asociá ese storage al backup de PostgreSQL.
- Verificá una restauración de prueba al menos una vez.

---

## 8. Verificación post-deploy (smoke test)

```bash
curl https://api.dojiprint.com.ar/api/health        # {"status":"OK","db":"up"}
curl https://api.dojiprint.com.ar/api/products      # lista productos
```
En el navegador: `https://www.dojiprint.com.ar` → cargar home, login admin, ver catálogo, hacer un checkout en sandbox de MercadoPago.

---

## 9. CI/CD

- Activá **auto-deploy on push** en cada app de Coolify (webhook de GitHub) → cada push a `main` redeploya.
- Recomendado (ver `ROADMAP.md` V1.6): GitHub Actions con lint + tests + build antes del deploy.

---

## 10. Checklist de producción

- [ ] VPS creado y firewall abierto (22/80/443/8000)
- [ ] Coolify instalado y onboarding completo
- [ ] DNS Cloudflare (A records) → IP del VPS, SSL Full (strict)
- [ ] PostgreSQL y Redis creados en Coolify
- [ ] Backend desplegado con todas las env vars + volúmenes uploads/logs
- [ ] Frontend desplegado con `VITE_API_URL` correcto
- [ ] SSL emitido para www, root y api
- [ ] **Contraseña de PostgreSQL vieja (Render) rotada/inutilizada**
- [ ] Webhook de MercadoPago apuntando a api.dojiprint.com.ar
- [ ] Backups automáticos a R2 configurados y probados
- [ ] Smoke test OK
