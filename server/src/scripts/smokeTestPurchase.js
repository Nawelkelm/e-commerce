#!/usr/bin/env node
/**
 * Smoke test del FLUJO DE COMPRA de TiendaKit (end-to-end del cliente).
 *
 * Recorre el camino crítico de ingresos y limpia todo lo que crea:
 *   1. Registro de un cliente nuevo (endpoint público de alta)
 *   2. Login de un cliente verificado (el sembrado por defecto)
 *   3. Elegir un producto con stock
 *   4. Agregar al carrito + verificar el carrito
 *   5. Crear una orden (items directos + dirección de envío)
 *   6. La orden aparece en "mis órdenes"
 *   7. Crear pago (MercadoPago) degrada sin crashear si no hay token real
 *   8. CLEANUP: cancelar la orden (libera stock) + verificar stock restaurado +
 *      borrar el usuario registrado de prueba
 *
 * SEGURIDAD (para correrlo incluso en producción):
 *   - La orden se cancela al final, lo que restaura el stock descontado → el
 *     inventario queda igual que antes (el test lo verifica).
 *   - El usuario registrado de prueba se borra vía admin.
 *   - Si algo no se limpia, avisa con los IDs para que lo hagas a mano.
 *   Aun así, corre una orden real: usalo en staging o en ventanas controladas.
 *
 * Requiere credenciales de admin (para verificar stock y limpiar) y de un
 * cliente verificado (para comprar).
 *
 * Uso:
 *   node src/scripts/smokeTestPurchase.js http://localhost:5000
 *   SMOKE_BASE_URL=https://api.tu-dominio.com npm run smoke:purchase
 *
 * Variables de entorno:
 *   SMOKE_BASE_URL         URL base de la API
 *   SMOKE_ADMIN_EMAIL      admin (default admin@ecommerce.com)
 *   SMOKE_ADMIN_PASSWORD   admin (default 123456)
 *   SMOKE_CUSTOMER_EMAIL   cliente verificado (default cliente@example.com)
 *   SMOKE_CUSTOMER_PASSWORD cliente (default 123456)
 *   SMOKE_TIMEOUT_MS       timeout por request (default 15000)
 *
 * Sale con código 0 si todo pasa; 1 si algún chequeo crítico falla.
 */

'use strict';

const BASE_URL = (process.argv[2] || process.env.SMOKE_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL || 'admin@ecommerce.com';
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || '123456';
const CUSTOMER_EMAIL = process.env.SMOKE_CUSTOMER_EMAIL || 'cliente@example.com';
const CUSTOMER_PASSWORD = process.env.SMOKE_CUSTOMER_PASSWORD || '123456';
const TIMEOUT_MS = parseInt(process.env.SMOKE_TIMEOUT_MS, 10) || 15000;
const TAG = Date.now();

const useColor = process.stdout.isTTY;
const c = {
  green: (s) => (useColor ? `\x1b[32m${s}\x1b[0m` : s),
  red: (s) => (useColor ? `\x1b[31m${s}\x1b[0m` : s),
  yellow: (s) => (useColor ? `\x1b[33m${s}\x1b[0m` : s),
  gray: (s) => (useColor ? `\x1b[90m${s}\x1b[0m` : s),
  bold: (s) => (useColor ? `\x1b[1m${s}\x1b[0m` : s),
};

const results = [];

async function request(path, { method = 'GET', token, body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined, signal: controller.signal,
    });
    const text = await res.text();
    let json; try { json = text ? JSON.parse(text) : undefined; } catch { /* no-JSON */ }
    return { ok: res.ok, status: res.status, json, text };
  } catch (err) {
    return { ok: false, status: 0, error: err.name === 'AbortError' ? `timeout (${TIMEOUT_MS}ms)` : err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function check(name, fn, { critical = true } = {}) {
  try {
    const detail = await fn();
    results.push({ name, ok: true });
    console.log(`${c.green('✓')} ${name}${detail ? c.gray(` — ${detail}`) : ''}`);
  } catch (err) {
    results.push({ name, ok: false, critical });
    const tag = critical ? c.red('✗') : c.yellow('⚠');
    console.log(`${tag} ${name}${critical ? '' : c.yellow(' (no crítico)')} ${c.gray('— ' + err.message)}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function pickArray(json, ...keys) {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object') {
    for (const k of keys) if (Array.isArray(json[k])) return json[k];
    if (json.data && Array.isArray(json.data.rows)) return json.data.rows;
  }
  return [];
}

async function run() {
  console.log(c.bold(`\nSmoke test de COMPRA TiendaKit → ${BASE_URL}\n`));

  const s = {};

  await check('Login admin (verificación + cleanup)', async () => {
    const r = await request('/api/auth/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200 && r.json && r.json.token, `login admin falló (${r.status})`);
    s.adminToken = r.json.token;
    return ADMIN_EMAIL;
  });

  await check('Registro de cliente nuevo (POST /api/auth/register)', async () => {
    s.buyerEmail = `smoke.buyer.${TAG}@example.com`;
    const r = await request('/api/auth/register', {
      method: 'POST',
      body: { firstName: 'Smoke', lastName: 'Buyer', email: s.buyerEmail, password: 'Test1234!', phone: '1122334455' },
    });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200 || r.status === 201, `esperaba 201, recibí ${r.status}`);
    return s.buyerEmail;
  });

  await check('Login cliente verificado (POST /api/auth/login)', async () => {
    const r = await request('/api/auth/login', { method: 'POST', body: { email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD } });
    if (r.error) throw new Error(r.error);
    if (r.status === 403) throw new Error('cliente sin email verificado');
    assert(r.status === 200 && r.json && r.json.token, `login cliente falló (${r.status})`);
    s.custToken = r.json.token;
    return CUSTOMER_EMAIL;
  });

  await check('Hay un producto con stock', async () => {
    assert(s.custToken, 'sin token de cliente');
    const r = await request('/api/products?inStock=true');
    if (r.error) throw new Error(r.error);
    const list = pickArray(r.json, 'products');
    s.product = list.find((p) => (p.stock ?? 0) > 0) || list[0];
    assert(s.product, 'no hay productos con stock para comprar');
    s.stockBefore = s.product.stock;
    return `${s.product.name} (stock=${s.product.stock})`;
  });

  await check('Agregar al carrito (POST /api/cart/add)', async () => {
    assert(s.product, 'sin producto');
    const r = await request('/api/cart/add', { method: 'POST', token: s.custToken, body: { productId: s.product.id, quantity: 1 } });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200 || r.status === 201, `esperaba 200, recibí ${r.status}`);
    const cart = await request('/api/cart', { token: s.custToken });
    assert(cart.status === 200, `GET carrito falló (${cart.status})`);
    return 'carrito OK';
  });

  await check('Crear orden (POST /api/orders)', async () => {
    assert(s.product, 'sin producto');
    const r = await request('/api/orders', {
      method: 'POST', token: s.custToken,
      body: {
        items: [{ productId: s.product.id, quantity: 1 }],
        shippingAddress: { street: 'Calle Falsa 123', city: 'CABA', state: 'Buenos Aires', postalCode: '1000', country: 'Argentina' },
        paymentMethod: 'transfer',
        customerNotes: 'ORDEN DE PRUEBA — smoke:purchase',
      },
    });
    if (r.error) throw new Error(r.error);
    assert(r.status === 200 || r.status === 201, `esperaba 201, recibí ${r.status} ${r.json ? `(${r.json.message || ''})` : ''}`);
    s.orderId = r.json && (r.json.order ? r.json.order.id : r.json.id);
    assert(s.orderId, 'no se obtuvo id de la orden');
    return `orden ${s.orderId}`;
  });

  await check('La orden aparece en "mis órdenes"', async () => {
    assert(s.orderId, 'sin orden');
    const r = await request('/api/orders/my-orders', { token: s.custToken });
    if (r.error) throw new Error(r.error);
    const found = pickArray(r.json, 'orders').some((o) => o.id === s.orderId);
    assert(r.status === 200 && found, 'la orden no aparece en mis órdenes');
    return 'OK';
  });

  // No crítico: depende de MERCADOPAGO_ACCESS_TOKEN. Sólo verificamos que no crashee (no 5xx).
  await check('Crear pago degrada sin crash (POST /api/payments/create)', async () => {
    const r = await request('/api/payments/create', { method: 'POST', token: s.custToken, body: { orderId: s.orderId } });
    if (r.error) throw new Error(r.error);
    assert(r.status < 500, `respondió ${r.status} (5xx = crash)`);
    return `status ${r.status}`;
  }, { critical: false });

  // ---------------- CLEANUP ----------------
  console.log(c.gray('\nLimpiando…'));

  if (s.orderId) {
    await check('Cancelar orden de prueba', async () => {
      const r = await request(`/api/orders/${s.orderId}/cancel`, { method: 'PATCH', token: s.custToken });
      if (r.error) throw new Error(r.error);
      assert(r.status === 200 || r.status === 204, `cancel devolvió ${r.status}`);
      return 'cancelada';
    });

    await check('Stock restaurado tras cancelar', async () => {
      assert(s.adminToken && s.product, 'faltan datos para verificar stock');
      const r = await request(`/api/admin/products/${s.product.id}`, { token: s.adminToken });
      const after = r.json && (r.json.stock ?? (r.json.product && r.json.product.stock));
      assert(after === s.stockBefore, `stock antes=${s.stockBefore}, después=${after}`);
      return `stock=${after}`;
    });
  }

  if (s.buyerEmail && s.adminToken) {
    await check('Borrar usuario de prueba', async () => {
      const r = await request(`/api/admin/users?search=${encodeURIComponent(s.buyerEmail)}`, { token: s.adminToken });
      const u = pickArray(r.json, 'users').find((x) => x.email === s.buyerEmail);
      assert(u, `no se encontró el usuario ${s.buyerEmail} para borrar (borralo a mano)`);
      const d = await request(`/api/admin/users/${u.id}`, { method: 'DELETE', token: s.adminToken });
      assert(d.status === 200 || d.status === 204, `DELETE usuario devolvió ${d.status}`);
      return 'borrado';
    }, { critical: false });
  }

  // ---------------- RESUMEN ----------------
  const failed = results.filter((r) => !r.ok && r.critical);
  const warned = results.filter((r) => !r.ok && !r.critical);
  console.log('');
  console.log(c.bold('Resumen:'));
  console.log(`  Pasaron: ${c.green(results.filter((r) => r.ok).length)}/${results.length}`);
  if (warned.length) console.log(`  Advertencias: ${c.yellow(warned.length)} → ${warned.map((w) => w.name).join(', ')}`);
  if (failed.length) {
    console.log(`  ${c.red('Fallaron (críticos): ' + failed.length)} → ${failed.map((f) => f.name).join(', ')}`);
    console.log(c.red('\nSMOKE TEST DE COMPRA FALLIDO\n'));
    process.exit(1);
  }
  console.log(c.green('\nSMOKE TEST DE COMPRA OK — flujo de cliente de punta a punta, inventario intacto.\n'));
}

run().catch((err) => {
  console.error(c.red(`\nError inesperado: ${err.message}\n`));
  process.exit(1);
});
