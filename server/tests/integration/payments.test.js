/**
 * Webhook de pagos de MercadoPago.
 *
 * Se mockea SOLO el borde externo —la llamada a la API de MercadoPago— y todo
 * lo demás corre de verdad: la búsqueda del pedido, el mapeo de estados y la
 * escritura en PostgreSQL. Mockear el controller entero no probaría nada.
 */

// El mock va antes de cargar la app: paymentController instancia el SDK al
// importarse, así que después ya sería tarde.
const mockPaymentGet = jest.fn();

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(),
  Preference: jest.fn(() => ({ create: jest.fn() })),
  Payment: jest.fn(() => ({ get: (...args) => mockPaymentGet(...args) })),
  MerchantOrder: jest.fn()
}));

const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Order, Invoice } = require('../../src/models');
const { migrar, limpiar } = require('../helpers/db');

/** Crea un pedido pendiente de pago, sin pasar por el checkout. */
const crearPedido = async (extra = {}) =>
  Order.create({
    orderNumber: `TEST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    customerName: 'Ana Gómez',
    customerEmail: 'ana@ejemplo.com',
    subtotal: 10000,
    total: 10000,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'mercadopago',
    items: [],
    shippingAddress: { street: 'Calle 1', city: 'Rosario' },
    ...extra
  });

/** Notificación tal como la manda MercadoPago. */
const notificacion = (idPago = '123456') => ({
  type: 'payment',
  action: 'payment.updated',
  data: { id: idPago }
});

/** Respuesta de la API de MercadoPago al consultar el pago. */
const respuestaMP = (estado, referencia) => ({
  id: '123456',
  status: estado,
  external_reference: referencia,
  payment_type_id: 'credit_card'
});

beforeAll(async () => {
  await sequelize.authenticate();
  await migrar(sequelize);
});

beforeEach(async () => {
  await limpiar(sequelize);
  mockPaymentGet.mockReset();
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/payments/webhook', () => {
  it('marca el pedido como pagado y confirmado cuando el pago fue aprobado', async () => {
    const pedido = await crearPedido();
    mockPaymentGet.mockResolvedValue(respuestaMP('approved', pedido.orderNumber));

    const res = await request(app).post('/api/payments/webhook').send(notificacion());

    expect(res.status).toBe(200);
    await pedido.reload();
    expect(pedido.paymentStatus).toBe('paid');
    expect(pedido.status).toBe('confirmed');
    expect(pedido.paidAt).toBeTruthy();
  });

  it('cancela el pedido cuando el pago fue rechazado', async () => {
    const pedido = await crearPedido();
    mockPaymentGet.mockResolvedValue(respuestaMP('rejected', pedido.orderNumber));

    await request(app).post('/api/payments/webhook').send(notificacion());

    await pedido.reload();
    expect(pedido.paymentStatus).toBe('failed');
    expect(pedido.status).toBe('cancelled');
    expect(pedido.paidAt).toBeFalsy();
  });

  it('deja el pedido pendiente si el pago está en proceso', async () => {
    const pedido = await crearPedido();
    mockPaymentGet.mockResolvedValue(respuestaMP('in_process', pedido.orderNumber));

    await request(app).post('/api/payments/webhook').send(notificacion());

    await pedido.reload();
    expect(pedido.paymentStatus).toBe('pending');
    expect(pedido.status).toBe('pending');
  });

  it('marca el reembolso cuando el pago fue devuelto', async () => {
    const pedido = await crearPedido({ status: 'confirmed', paymentStatus: 'paid' });
    mockPaymentGet.mockResolvedValue(respuestaMP('refunded', pedido.orderNumber));

    await request(app).post('/api/payments/webhook').send(notificacion());

    await pedido.reload();
    expect(pedido.paymentStatus).toBe('refunded');
    expect(pedido.status).toBe('refunded');
  });

  describe('no confía en lo que dice el cuerpo de la notificación', () => {
    it('usa el estado que devuelve la API, no el del request', async () => {
      // Esta es la propiedad que hace que el endpoint publico sea seguro: el
      // estado real se vuelve a pedir a MercadoPago. Si se confiara en el
      // cuerpo, cualquiera podria marcar pedidos como pagados.
      const pedido = await crearPedido();
      mockPaymentGet.mockResolvedValue(respuestaMP('rejected', pedido.orderNumber));

      await request(app)
        .post('/api/payments/webhook')
        .send({ ...notificacion(), status: 'approved', data: { id: '123456', status: 'approved' } });

      await pedido.reload();
      expect(pedido.paymentStatus).toBe('failed');
      expect(pedido.status).not.toBe('confirmed');
    });

    it('siempre consulta a la API antes de tocar el pedido', async () => {
      const pedido = await crearPedido();
      mockPaymentGet.mockResolvedValue(respuestaMP('approved', pedido.orderNumber));

      await request(app).post('/api/payments/webhook').send(notificacion('999'));

      expect(mockPaymentGet).toHaveBeenCalledTimes(1);
      expect(mockPaymentGet).toHaveBeenCalledWith({ id: '999' });
    });
  });

  describe('notificaciones que hay que ignorar', () => {
    it('responde 200 y no consulta la API si no es de un pago', async () => {
      await request(app)
        .post('/api/payments/webhook')
        .send({ type: 'plan', data: { id: '1' } })
        .expect(200);

      expect(mockPaymentGet).not.toHaveBeenCalled();
    });

    it('responde 200 si la notificación viene sin id', async () => {
      await request(app)
        .post('/api/payments/webhook')
        .send({ type: 'payment', data: {} })
        .expect(200);

      expect(mockPaymentGet).not.toHaveBeenCalled();
    });

    it('responde 200 si el pago no corresponde a ningún pedido', async () => {
      mockPaymentGet.mockResolvedValue(respuestaMP('approved', 'PEDIDO-INEXISTENTE'));

      await request(app)
        .post('/api/payments/webhook')
        .send(notificacion())
        .expect(200);
    });

    it('responde 200 si el pago no trae external_reference', async () => {
      mockPaymentGet.mockResolvedValue({ id: '123456', status: 'approved' });

      await request(app)
        .post('/api/payments/webhook')
        .send(notificacion())
        .expect(200);
    });
  });

  describe('reintentos', () => {
    it('no duplica la factura si MercadoPago reenvía la misma notificación', async () => {
      // MercadoPago reintenta las notificaciones que no responden a tiempo, asi
      // que el webhook tiene que tolerar recibir la misma dos veces.
      const pedido = await crearPedido();
      mockPaymentGet.mockResolvedValue(respuestaMP('approved', pedido.orderNumber));

      await request(app).post('/api/payments/webhook').send(notificacion());
      await request(app).post('/api/payments/webhook').send(notificacion());

      const facturas = await Invoice.count({ where: { orderId: pedido.id } });
      expect(facturas).toBeLessThanOrEqual(1);

      await pedido.reload();
      expect(pedido.paymentStatus).toBe('paid');
    });
  });

  it('el endpoint es público: MercadoPago no envía credenciales', async () => {
    const pedido = await crearPedido();
    mockPaymentGet.mockResolvedValue(respuestaMP('approved', pedido.orderNumber));

    const res = await request(app).post('/api/payments/webhook').send(notificacion());

    expect(res.status).not.toBe(401);
    expect(res.status).toBe(200);
  });
});
