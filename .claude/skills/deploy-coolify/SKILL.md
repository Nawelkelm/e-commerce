---
name: deploy-coolify
description: Guía y verifica el despliegue del e-commerce DojiPrint en Coolify (VPS self-hosted) con PostgreSQL, Redis, Cloudflare, SSL, dominio dojiprint.com.ar y backups. Úsala cuando el usuario quiera desplegar, redeployar, configurar el servidor, dominios, SSL o backups. NO usar Render.
---

# Deploy en Coolify — DojiPrint

Esta skill operacionaliza `docs/DEPLOYMENT-COOLIFY.md`. Seguí ese documento como
fuente de verdad y usá esta skill como checklist accionable.

## Antes de empezar, confirmá con el usuario
1. ¿Tiene VPS? (Oracle Cloud Free / Hetzner / otro) y su IP pública.
2. ¿Coolify ya instalado y accesible en `http://IP:8000`?
3. ¿Dominio `dojiprint.com.ar` gestionado en Cloudflare? (sí)

## Pasos (resumen accionable)
1. **Servidor**: VPS con Ubuntu 22.04, firewall abierto 22/80/443/8000.
2. **Coolify**: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash`.
3. **DNS Cloudflare**: registros A (`@`, `www`, `api`) → IP del VPS, SSL **Full (strict)**.
4. **Recursos Coolify**: crear PostgreSQL 15 y Redis 7; copiar `DATABASE_URL` y `REDIS_URL` internas.
5. **Backend**: app Dockerfile, base dir `/server`, puerto 5000, dominio `api.dojiprint.com.ar`,
   health `/api/health`, volúmenes `/app/uploads` y `/app/logs`, todas las env vars (ver `.env.example`).
6. **Frontend**: app Dockerfile, base dir `/client`, puerto 10000, dominio `www.dojiprint.com.ar`,
   build env `VITE_API_URL=https://api.dojiprint.com.ar/api`.
7. **Backups**: PostgreSQL → Scheduled Backups → destino Cloudflare R2 (S3). Probar restore.
8. **Smoke test**: `curl https://api.dojiprint.com.ar/api/health` → `db: up`; login admin; checkout sandbox.

## Reglas
- Nunca pegar secretos en el repo ni en commits; van sólo en las env vars de Coolify.
- Recordar al usuario **rotar la contraseña de PostgreSQL** que quedó en el historial de git.
- No reintroducir URLs de Render. CORS y URLs siempre a dojiprint.com.ar.
- Verificar SSL emitido para www, root y api antes de dar por cerrado.

## Verificación final
Recorré el checklist de la sección 10 de `docs/DEPLOYMENT-COOLIFY.md` y reportá
qué quedó OK y qué pendiente.
