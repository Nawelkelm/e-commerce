#!/usr/bin/env node
/**
 * Smoke test post-deploy de TiendaKit.
 *
 * Verifica la cadena crítica del stack contra una instancia ya desplegada:
 *   1. /api/health           → API viva + conexión real a PostgreSQL
 *   2. /api/settings/public  → settings públicos (los consume el frontend al cargar)
 *   3. /api/categories       → lectura pública de catálogo
 *   4. /api/products         → listado de productos (estructura { products, pagination })
 *   5. POST /api/auth/login  → login de admin, devuelve token JWT
 *   6. GET /api/auth/profile → el token es válido (auth funciona)
 *   7. GET /api/orders       → endpoint protegido admin (auth + RBAC funcionan)
 *
 * El checkout con MercadoPago (sandbox) NO se automatiza aquí: implica una
 * redirección de navegador a MP y no es puramente API. Verificalo a mano desde
 * https://www.tu-dominio.com (ver docs/DEPLOYMENT-COOLIFY.md, paso 8).
 *
 * Uso:
 *   node src/scripts/smokeTest.js https://api.tu-dominio.com
 *   SMOKE_BASE_URL=https://api.tu-dominio.com npm run smoke
 *
 * Variables de entorno:
 *   SMOKE_BASE_URL       URL base de la API (o pasala como primer argumento)
 *   SMOKE_ADMIN_EMAIL    email del admin (default: admin@ecommerce.com)
 *   SMOKE_ADMIN_PASSWORD password del admin (default: admin123)
 *   SMOKE_TIMEOUT_MS     timeout por request en ms (default: 15000)
 *
 * Sale con código 0 si todo pasa; 1 si algún chequeo crítico falla.
 */

'use strict';

const BASE_URL = (process.argv[2] || process.env.SMOKE_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL || 'admin@ecommerce.com';
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || 'admin123';
const TIMEOUT_MS = parseInt(process.env.SMOKE_TIMEOUT_MS, 10) || 15000;

// Colores ANSI (se desactivan si la salida no es un TTY)
const useColor = process.stdout.isTTY;
const c = {
  green: (s) => (useColor ? `\x1b[32m${s}\x1b[0m` : s),
  red: (s) => (useColor ? `\x1b[31m${s}\x1b[0m` : s),
  yellow: (s) => (useColor ? `\x1b[33m${s}\x1b[0m` : s),
  gray: (s) => (useColor ? `\x1b[90m${s}\x1b[0m` : s),
  bold: (s) => (useColor ? `\x1b[1m${s}\x1b[0m` : s),
};

const results = [];

/** fetch con timeout. Devuelve { ok, status, json, text, error }. */
async function request(path, { method = 'GET', token, body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let json;
    try { json = text ? JSON.parse(text) : undefined; } catch { /* respuesta no-JSON */ }
    return { ok: res.ok, status: res.status, json, text };
  } catch (err) {
    return { ok: false, status: 0, error: err.name === 'AbortError' ? `timeout (${TIMEOUT_MS}ms)` : err.message };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Ejecuta un chequeo. `fn` debe devolver un string (detalle de éxito) o lanzar Error.
 * Si critical=false, un fallo se reporta como WARN y no marca el smoke como fallido.
 */
async function check(name, fn, { critical = true } = {}) {
  try {
    const detail = await fn();
    results.push({ name, ok: true });
    console.log(`${c.green('✓')} ${name}${detail ? c.gray(` — ${detail}`) : ''}`);
  } catch (err) {
    results.push({ name, ok: false, critical });
    const tag = critical ? c.red('✗') : c.yellow('⚠');
    const label = critical ? '' : c.yellow(' (no crítico)');
    console.log(`${tag} ${name}${label} ${c.gray('— ' + err.message)}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  console.log(c.bold(`\nSmoke test TiendaKit → ${BASE_URL}\n`));

  const shared = {};

  await check('Health: API + base de datos', async () => {
    const r = await request('/api/health');
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    assert(r.json && r.json.status === 'OK', `status != OK (${r.json && r.json.status})`);
    assert(r.json.db === 'up', `db != up (${r.json.db})`);
    return `db=${r.json.db}`;
  });

  await check('Settings públicos', async () => {
    const r = await request('/api/settings/public');
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    return 'OK';
  });

  await check('Categorías (lectura pública)', async () => {
    const r = await request('/api/categories');
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    return 'OK';
  });

  await check('Productos (listado público)', async () => {
    const r = await request('/api/products');
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    assert(r.json && Array.isArray(r.json.products), 'la respuesta no trae products[]');
    const total = r.json.pagination ? r.json.pagination.totalItems : r.json.products.length;
    return `${r.json.products.length} en página, ${total ?? '?'} totales`;
  });

  await check('Login admin', async () => {
    const r = await request('/api/auth/login', {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    if (r.error) throw new Error(r.error);
    if (r.status === 403) {
      throw new Error('admin sin email verificado o cuenta desactivada — verificá el usuario admin sembrado');
    }
    assert(r.status === 200, `esperaba 200, recibí ${r.status} ${r.json ? `(${r.json.message || ''})` : ''}`);
    assert(r.json && r.json.token, 'no llegó token en la respuesta');
    shared.token = r.json.token;
    return `token recibido (${ADMIN_EMAIL})`;
  });

  await check('Token válido (GET /api/auth/profile)', async () => {
    assert(shared.token, 'sin token del login (paso anterior falló)');
    const r = await request('/api/auth/profile', { token: shared.token });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    return r.json && r.json.email ? r.json.email : 'perfil OK';
  });

  await check('Acceso admin protegido (GET /api/orders)', async () => {
    assert(shared.token, 'sin token del login (paso anterior falló)');
    const r = await request('/api/orders', { token: shared.token });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200 (admin), recibí ${r.status} — ¿el usuario tiene rol admin?`);
    return 'auth + RBAC OK';
  });

  // Resumen
  const failed = results.filter((r) => !r.ok && r.critical);
  const warned = results.filter((r) => !r.ok && !r.critical);
  console.log('');
  console.log(c.bold('Resumen:'));
  console.log(`  Pasaron: ${c.green(results.filter((r) => r.ok).length)}/${results.length}`);
  if (warned.length) console.log(`  Advertencias: ${c.yellow(warned.length)}`);
  if (failed.length) {
    console.log(`  ${c.red('Fallaron (críticos): ' + failed.length)} → ${failed.map((f) => f.name).join(', ')}`);
    console.log(c.red('\nSMOKE TEST FALLIDO\n'));
    process.exit(1);
  }
  console.log(c.green('\nSMOKE TEST OK — el stack respondió de punta a punta.'));
  console.log(c.gray('Recordá probar el checkout MercadoPago (sandbox) a mano en el navegador.\n'));
}

run().catch((err) => {
  console.error(c.red(`\nError inesperado ejecutando el smoke test: ${err.message}\n`));
  process.exit(1);
});
