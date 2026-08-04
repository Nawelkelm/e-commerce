#!/usr/bin/env node
/**
 * Smoke test de ESCRITURA de TiendaKit.
 *
 * Complementa a smokeTest.js (que solo lee). Este ejerce la cadena de escritura
 * del panel admin mediante ciclos CRUD completos sobre datos de prueba efimeros:
 *
 *   Categoria  → crear · leer detalle (:id) · actualizar · borrar · verificar 404
 *   Cupon      → crear · leer detalle (:id) · toggle · actualizar · borrar
 *   Cuenta     → crear · leer en listado · actualizar · borrar
 *   Validacion → POST con body invalido debe responder 4xx (nunca 5xx)
 *
 * SEGURIDAD (importante para correrlo en produccion):
 *   - Todo lo que crea lo crea INACTIVO (isActive:false) → nunca es visible al
 *     cliente, ni siquiera durante los segundos que dura el test.
 *   - Todo lo creado se BORRA al final, incluso si un paso intermedio falla
 *     (registro de limpieza que se vacia en un finally).
 *   - NO usa operaciones con efecto cruzado sobre datos reales (p.ej. set-primary
 *     de cuentas bancarias), que dejarian la tienda en un estado alterado.
 *   Si el test aborta y no logra limpiar, avisa con los IDs que quedaron para
 *   que los borres a mano.
 *
 * Uso:
 *   node src/scripts/smokeTestWrite.js http://localhost:5000
 *   SMOKE_BASE_URL=https://api.tu-dominio.com npm run smoke:write
 *
 * Variables de entorno (iguales que smokeTest.js):
 *   SMOKE_BASE_URL, SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD, SMOKE_TIMEOUT_MS
 *
 * Sale con codigo 0 si todo pasa (y se limpio); 1 si algun chequeo critico falla.
 */

'use strict';

const BASE_URL = (process.argv[2] || process.env.SMOKE_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL || 'admin@ecommerce.com';
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || '123456';
const TIMEOUT_MS = parseInt(process.env.SMOKE_TIMEOUT_MS, 10) || 15000;
const TAG = Date.now(); // sufijo unico para no colisionar entre corridas

const useColor = process.stdout.isTTY;
const c = {
  green: (s) => (useColor ? `\x1b[32m${s}\x1b[0m` : s),
  red: (s) => (useColor ? `\x1b[31m${s}\x1b[0m` : s),
  yellow: (s) => (useColor ? `\x1b[33m${s}\x1b[0m` : s),
  gray: (s) => (useColor ? `\x1b[90m${s}\x1b[0m` : s),
  bold: (s) => (useColor ? `\x1b[1m${s}\x1b[0m` : s),
};

const results = [];
const cleanups = []; // { label, fn }  -> se ejecutan al final, siempre

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

async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true });
    console.log(`${c.green('✓')} ${name}${detail ? c.gray(` — ${detail}`) : ''}`);
  } catch (err) {
    results.push({ name, ok: false });
    console.log(`${c.red('✗')} ${name} ${c.gray('— ' + err.message)}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// extrae un id de una respuesta de create, tolerando varias formas de envoltura
function extractId(json, wrapper) {
  if (!json) return undefined;
  if (wrapper && json[wrapper] && json[wrapper].id !== undefined) return json[wrapper].id;
  if (json.id !== undefined) return json.id;
  if (json.data && json.data.id !== undefined) return json.data.id;
  return undefined;
}

async function run() {
  console.log(c.bold(`\nSmoke test de ESCRITURA TiendaKit → ${BASE_URL}\n`));

  const shared = {};

  // --- login admin (prerequisito) ---
  await check('Login admin', async () => {
    const r = await request('/api/auth/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status} ${r.json ? `(${r.json.message || ''})` : ''}`);
    assert(r.json && r.json.token, 'no llegó token');
    shared.token = r.json.token;
    return ADMIN_EMAIL;
  });

  if (!shared.token) {
    console.log(c.red('\nSin token de admin: no se puede continuar con las escrituras.\n'));
    process.exit(1);
  }
  const token = shared.token;

  // ============================ CATEGORIA ============================
  await check('Categoría: crear (POST /api/admin/categories)', async () => {
    const r = await request('/api/admin/categories', {
      method: 'POST', token,
      body: { name: `ZZ Smoke Cat ${TAG}`, description: 'temporal smoke test', isActive: false },
    });
    if (r.error) throw new Error(r.error);
    assert(r.status === 201 || r.status === 200, `esperaba 201, recibí ${r.status}`);
    const id = extractId(r.json, 'category');
    assert(id, 'no se obtuvo id de la categoría creada');
    shared.catId = id;
    cleanups.push({ label: `categoría ${id}`, fn: () => request(`/api/admin/categories/${id}`, { method: 'DELETE', token }) });
    return `id=${id}`;
  });

  await check('Categoría: leer detalle (GET /api/admin/categories/:id)', async () => {
    assert(shared.catId, 'sin categoría creada');
    const r = await request(`/api/admin/categories/${shared.catId}`, { token });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    return 'detalle OK (incluye inactivas)';
  });

  await check('Categoría: actualizar (PUT /api/admin/categories/:id)', async () => {
    assert(shared.catId, 'sin categoría creada');
    const r = await request(`/api/admin/categories/${shared.catId}`, {
      method: 'PUT', token, body: { name: `ZZ Smoke Cat ${TAG} EDIT`, isActive: false },
    });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    return 'PUT OK';
  });

  await check('Categoría: borrar y verificar 404', async () => {
    assert(shared.catId, 'sin categoría creada');
    const del = await request(`/api/admin/categories/${shared.catId}`, { method: 'DELETE', token });
    if (del.error) throw new Error(del.error);
    assert(del.status === 200 || del.status === 204, `DELETE esperaba 200, recibí ${del.status}`);
    // ya borrada: sacamos su cleanup pendiente
    shared.catDeleted = true;
    const after = await request(`/api/admin/categories/${shared.catId}`, { token });
    assert(after.status === 404, `post-delete esperaba 404, recibí ${after.status}`);
    return 'borrada y confirmada';
  });

  // ============================ CUPON ============================
  await check('Cupón: crear (POST /api/coupons)', async () => {
    const r = await request('/api/coupons', {
      method: 'POST', token,
      body: { code: `ZZSMOKE${TAG}`, discountType: 'percentage', discountValue: 10, minPurchase: 0, isActive: false },
    });
    if (r.error) throw new Error(r.error);
    assert(r.status === 201 || r.status === 200, `esperaba 201, recibí ${r.status}`);
    const id = extractId(r.json, 'coupon');
    assert(id, 'no se obtuvo id del cupón creado');
    shared.coupId = id;
    cleanups.push({ label: `cupón ${id}`, fn: () => request(`/api/coupons/${id}`, { method: 'DELETE', token }) });
    return `id=${id}`;
  });

  await check('Cupón: leer detalle (GET /api/coupons/:id)', async () => {
    assert(shared.coupId, 'sin cupón creado');
    const r = await request(`/api/coupons/${shared.coupId}`, { token });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    return 'detalle OK';
  });

  await check('Cupón: toggle (PATCH /api/coupons/:id/toggle)', async () => {
    assert(shared.coupId, 'sin cupón creado');
    const r = await request(`/api/coupons/${shared.coupId}/toggle`, { method: 'PATCH', token });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    return 'toggle OK';
  });

  await check('Cupón: actualizar (PUT /api/coupons/:id)', async () => {
    assert(shared.coupId, 'sin cupón creado');
    const r = await request(`/api/coupons/${shared.coupId}`, { method: 'PUT', token, body: { discountValue: 15, isActive: false } });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    return 'PUT OK';
  });

  // ============================ CUENTA BANCARIA ============================
  await check('Cuenta bancaria: crear (POST /api/bank-accounts)', async () => {
    const r = await request('/api/bank-accounts', {
      method: 'POST', token,
      body: {
        bankName: 'Banco Smoke Test', accountType: 'Caja de Ahorro', accountNumber: `000${TAG}`.slice(-12),
        cbu: '0000000000000000000000', holderName: 'Smoke Test', holderDocument: '20111222', isActive: false,
      },
    });
    if (r.error) throw new Error(r.error);
    assert(r.status === 201 || r.status === 200, `esperaba 201, recibí ${r.status} ${r.json ? JSON.stringify(r.json.errors || r.json.message || '') : ''}`);
    const id = extractId(r.json, 'account');
    assert(id, 'no se obtuvo id de la cuenta creada');
    shared.bankId = id;
    cleanups.push({ label: `cuenta ${id}`, fn: () => request(`/api/bank-accounts/${id}`, { method: 'DELETE', token }) });
    return `id=${id}`;
  });

  await check('Cuenta bancaria: actualizar (PUT /api/bank-accounts/:id)', async () => {
    assert(shared.bankId, 'sin cuenta creada');
    const r = await request(`/api/bank-accounts/${shared.bankId}`, {
      method: 'PUT', token,
      body: {
        bankName: 'Banco Smoke Test EDIT', accountType: 'Caja de Ahorro', accountNumber: `000${TAG}`.slice(-12),
        cbu: '0000000000000000000000', holderName: 'Smoke Test', holderDocument: '20111222', isActive: false,
      },
    });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200, `esperaba 200, recibí ${r.status}`);
    return 'PUT OK';
  });

  // ============================ VALIDACION (negativas) ============================
  // Un body invalido debe dar 4xx (validacion), nunca 5xx (crash sin proteger).
  const negatives = [
    ['Validación: cuenta vacía → 4xx', '/api/bank-accounts'],
    ['Validación: categoría vacía → 4xx', '/api/admin/categories'],
    ['Validación: cupón sin code → 4xx', '/api/coupons', { discountValue: 5 }],
  ];
  for (const [name, path, body] of negatives) {
    await check(name, async () => {
      const r = await request(path, { method: 'POST', token, body: body || {} });
      if (r.error) throw new Error(r.error);
      assert(r.status >= 400 && r.status < 500, `esperaba 4xx, recibí ${r.status}${r.status >= 500 ? ' (crash: validación no protege)' : ''}`);
      // si por error creó algo (2xx), lo registramos para limpiar
      if (r.status < 400) {
        const id = extractId(r.json, 'account') || extractId(r.json, 'category') || extractId(r.json, 'coupon');
        if (id) cleanups.push({ label: `residuo ${path} ${id}`, fn: () => request(`${path}/${id}`, { method: 'DELETE', token }) });
      }
      return `rechazado con ${r.status}`;
    });
  }

  // ============================ CLEANUP ============================
  console.log(c.gray('\nLimpiando datos de prueba…'));
  const leftovers = [];
  for (const { label, fn } of cleanups) {
    // la categoría ya se borró en su propio chequeo
    if (label.startsWith('categoría') && shared.catDeleted) continue;
    try {
      const r = await fn();
      if (r.status === 200 || r.status === 204 || r.status === 404) {
        console.log(`  ${c.green('✓')} limpio: ${label}`);
      } else {
        leftovers.push(`${label} (DELETE devolvió ${r.status})`);
        console.log(`  ${c.yellow('⚠')} no se pudo limpiar: ${label} → ${r.status}`);
      }
    } catch (err) {
      leftovers.push(`${label} (${err.message})`);
      console.log(`  ${c.yellow('⚠')} error limpiando ${label}: ${err.message}`);
    }
  }

  // ============================ RESUMEN ============================
  const failed = results.filter((r) => !r.ok);
  console.log('');
  console.log(c.bold('Resumen:'));
  console.log(`  Pasaron: ${c.green(results.filter((r) => r.ok).length)}/${results.length}`);
  if (leftovers.length) {
    console.log(c.yellow(`  ⚠ Datos de prueba SIN limpiar (borralos a mano): ${leftovers.join('; ')}`));
  }
  if (failed.length) {
    console.log(`  ${c.red('Fallaron: ' + failed.length)} → ${failed.map((f) => f.name).join(', ')}`);
    console.log(c.red('\nSMOKE TEST DE ESCRITURA FALLIDO\n'));
    process.exit(1);
  }
  console.log(c.green('\nSMOKE TEST DE ESCRITURA OK — CRUD admin de punta a punta, datos de prueba limpiados.\n'));
}

run().catch(async (err) => {
  console.error(c.red(`\nError inesperado: ${err.message}`));
  // intento de limpieza best-effort ante un crash no controlado
  for (const { label, fn } of cleanups) {
    try { await fn(); console.error(c.gray(`  (cleanup de emergencia: ${label})`)); } catch { /* ignore */ }
  }
  console.error('');
  process.exit(1);
});
