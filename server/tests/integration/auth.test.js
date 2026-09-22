const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');
const { migrar, limpiar } = require('../helpers/db');

/**
 * Flujo de autenticación contra una PostgreSQL real.
 *
 * Se ejercita la app completa —validaciones, sanitización, hasheo, JWT— y no
 * el controller aislado: los bugs de este flujo suelen estar en el middleware,
 * no en la función final.
 */

const usuario = {
  firstName: 'Ana',
  lastName: 'Gómez',
  email: 'ana@ejemplo.com',
  password: 'secreta123'
};

/** El registro deja la cuenta sin verificar y sin poder iniciar sesión. */
const registrar = (datos = usuario) =>
  request(app).post('/api/auth/register').send(datos);

/** Marca el email como verificado, que es lo que haría el link del correo. */
const verificarEmail = (email) =>
  sequelize.query('UPDATE "Users" SET "emailVerified" = true WHERE email = :email', {
    replacements: { email }
  });

/** Registra, verifica e inicia sesión. Devuelve el token. */
const registrarYEntrar = async (datos = usuario) => {
  await registrar(datos);
  await verificarEmail(datos.email);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: datos.email, password: datos.password });
  return res.body.token;
};

beforeAll(async () => {
  await sequelize.authenticate();
  await migrar(sequelize);
});

beforeEach(async () => {
  await limpiar(sequelize);
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/auth/register', () => {
  it('crea la cuenta pero NO entrega token: falta verificar el email', async () => {
    const res = await registrar();

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(usuario.email);
    expect(res.body.token).toBeUndefined();
  });

  it('nunca devuelve la contraseña', async () => {
    const res = await registrar();

    expect(res.body.user.password).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain(usuario.password);
  });

  it('guarda la contraseña hasheada, no en texto plano', async () => {
    await registrar();

    const [filas] = await sequelize.query(
      'SELECT password FROM "Users" WHERE email = :email',
      { replacements: { email: usuario.email } }
    );
    expect(filas[0].password).not.toBe(usuario.password);
    expect(filas[0].password).toMatch(/^\$2[aby]\$/); // bcrypt
  });

  it('rechaza un email ya registrado', async () => {
    await registrar();
    const res = await registrar();

    expect(res.status).toBe(400);
  });

  it('rechaza un email inválido', async () => {
    const res = await registrar({ ...usuario, email: 'no-es-un-email' });
    expect(res.status).toBe(400);
  });

  it('rechaza una contraseña de menos de 6 caracteres', async () => {
    const res = await registrar({ ...usuario, password: '123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('devuelve un token con las credenciales correctas', async () => {
    await registrar();
    await verificarEmail(usuario.email);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: usuario.email, password: usuario.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('bloquea el ingreso mientras el email no esté verificado', async () => {
    await registrar();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: usuario.email, password: usuario.password });

    expect(res.status).toBe(403);
    expect(res.body.emailVerified).toBe(false);
  });

  it('rechaza una contraseña incorrecta', async () => {
    await registrar();
    await verificarEmail(usuario.email);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: usuario.email, password: 'equivocada' });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeFalsy();
  });

  it('rechaza un email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@ejemplo.com', password: usuario.password });

    expect(res.status).toBe(401);
  });

  it('no permite enumerar cuentas con una contraseña incorrecta', async () => {
    // Antes la verificación de email se chequeaba ANTES que la contraseña, así
    // que una cuenta sin verificar respondía 403 ante cualquier contraseña
    // mientras que una inexistente respondía 401: eso confirmaba qué emails
    // estaban registrados.
    await registrar(); // queda sin verificar

    const existente = await request(app)
      .post('/api/auth/login')
      .send({ email: usuario.email, password: 'equivocada' });

    const inexistente = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@ejemplo.com', password: 'equivocada' });

    expect(existente.status).toBe(inexistente.status);
    expect(existente.body.message).toBe(inexistente.body.message);
  });
});

describe('Rutas protegidas', () => {
  it('devuelve el perfil con un token válido', async () => {
    const token = await registrarYEntrar();

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user?.email || res.body.email).toBe(usuario.email);
  });

  it('rechaza el acceso sin token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('rechaza un token inventado', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer token.completamente.invalido');

    expect(res.status).toBe(401);
  });
});
