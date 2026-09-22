const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Product, Category } = require('../../src/models');
const { migrar, limpiar } = require('../helpers/db');

/**
 * Carrito y creación de órdenes.
 *
 * Es el flujo donde hay plata en juego: un bug acá no es un detalle visual,
 * es un pedido perdido, cobrado de más o vendido sin stock.
 */

const comprador = {
  firstName: 'Bruno',
  lastName: 'Díaz',
  email: 'bruno@ejemplo.com',
  password: 'secreta123'
};

const direccion = {
  firstName: 'Bruno',
  lastName: 'Díaz',
  street: 'Av. Siempreviva 742',
  city: 'Rosario',
  state: 'Santa Fe',
  postalCode: '2000',
  country: 'Argentina',
  phone: '3415550100'
};

/** Sesión de invitado: el carrito se identifica con esta cabecera. */
const sesionInvitado = 'sesion-de-prueba-123';

let categoria;

const crearProducto = async (extra = {}) => {
  const n = Math.random().toString(36).slice(2, 8);
  return Product.create({
    name: `Producto ${n}`,
    slug: `producto-${n}`,
    sku: `SKU-${n}`,
    price: 1000,
    stock: 10,
    isActive: true,
    categoryId: categoria.id,
    ...extra
  });
};

const entrar = async () => {
  await request(app).post('/api/auth/register').send(comprador);
  await sequelize.query('UPDATE "Users" SET "emailVerified" = true WHERE email = :email', {
    replacements: { email: comprador.email }
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: comprador.email, password: comprador.password });
  return res.body.token;
};

beforeAll(async () => {
  await sequelize.authenticate();
  await migrar(sequelize);
});

beforeEach(async () => {
  await limpiar(sequelize);
  categoria = await Category.create({ name: 'General', slug: 'general' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Carrito', () => {
  it('agrega un producto y lo devuelve con su cantidad', async () => {
    const producto = await crearProducto();

    const alta = await request(app)
      .post('/api/cart/add')
      .set('x-session-id', sesionInvitado)
      .send({ productId: producto.id, quantity: 2 });

    expect(alta.status).toBeLessThan(400);

    const carrito = await request(app)
      .get('/api/cart')
      .set('x-session-id', sesionInvitado);

    const items = carrito.body.CartItems || carrito.body.items || [];
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('rechaza una cantidad de cero o negativa', async () => {
    const producto = await crearProducto();

    const res = await request(app)
      .post('/api/cart/add')
      .set('x-session-id', sesionInvitado)
      .send({ productId: producto.id, quantity: 0 });

    expect(res.status).toBe(400);
  });

  it('rechaza un productId que no es un UUID', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .set('x-session-id', sesionInvitado)
      .send({ productId: 'no-es-uuid', quantity: 1 });

    expect(res.status).toBe(400);
  });

  it('no deja agregar más unidades que el stock disponible', async () => {
    const producto = await crearProducto({ stock: 3 });

    const res = await request(app)
      .post('/api/cart/add')
      .set('x-session-id', sesionInvitado)
      .send({ productId: producto.id, quantity: 99 });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('mantiene separados los carritos de dos sesiones distintas', async () => {
    const producto = await crearProducto();

    await request(app)
      .post('/api/cart/add')
      .set('x-session-id', 'sesion-A')
      .send({ productId: producto.id, quantity: 1 });

    const otro = await request(app).get('/api/cart').set('x-session-id', 'sesion-B');
    const items = otro.body.CartItems || otro.body.items || [];
    expect(items).toHaveLength(0);
  });
});

describe('Creación de órdenes', () => {
  it('crea la orden a partir del carrito', async () => {
    const token = await entrar();
    const producto = await crearProducto({ price: 2500 });

    await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: producto.id, quantity: 2 });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shippingAddress: direccion, paymentMethod: 'transfer' });

    expect(res.status).toBe(201);

    const orden = res.body.order || res.body;
    expect(orden.orderNumber).toBeTruthy();
    expect(Number(orden.total)).toBeGreaterThan(0);
  });

  it('rechaza la orden si el carrito está vacío', async () => {
    const token = await entrar();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shippingAddress: direccion, paymentMethod: 'transfer' });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('rechaza la orden sin dirección de envío', async () => {
    const token = await entrar();
    const producto = await crearProducto();

    await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: producto.id, quantity: 1 });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ paymentMethod: 'transfer' });

    expect(res.status).toBe(400);
  });

  it('el total de la orden se calcula en el servidor, no se toma del cliente', async () => {
    // Si el precio viniera del request, cualquiera podría comprar a $1.
    const token = await entrar();
    const producto = await crearProducto({ price: 5000 });

    await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: producto.id, quantity: 1 });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        shippingAddress: direccion,
        paymentMethod: 'transfer',
        total: 1,
        subtotal: 1
      });

    expect(res.status).toBe(201);
    const orden = res.body.order || res.body;
    expect(Number(orden.total)).toBeGreaterThanOrEqual(5000);
  });

  it('un usuario no puede ver la orden de otro', async () => {
    const tokenA = await entrar();
    const producto = await crearProducto();

    await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ productId: producto.id, quantity: 1 });

    const creada = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ shippingAddress: direccion, paymentMethod: 'transfer' });

    const orden = creada.body.order || creada.body;

    // Segundo usuario, distinto
    const otro = { ...comprador, email: 'otra@ejemplo.com' };
    await request(app).post('/api/auth/register').send(otro);
    await sequelize.query('UPDATE "Users" SET "emailVerified" = true WHERE email = :email', {
      replacements: { email: otro.email }
    });
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: otro.email, password: otro.password });

    const res = await request(app)
      .get(`/api/orders/${orden.id}`)
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('exige sesión para listar los pedidos propios', async () => {
    const res = await request(app).get('/api/orders/my-orders');
    expect(res.status).toBe(401);
  });

  it('un usuario común no puede listar todas las órdenes', async () => {
    const token = await entrar();

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBeGreaterThanOrEqual(401);
    expect(res.status).toBeLessThan(500);
  });
});
