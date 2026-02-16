// Script para probar el flujo completo de e-commerce
const http = require('http');

async function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            data: JSON.parse(body)
          };
          resolve(result);
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testCompleteFlow() {
  console.log('🚀 Probando flujo completo de e-commerce...\n');

  try {
    // 1. Registrar un usuario
    console.log('1. Registrando un nuevo usuario...');
    const registerData = {
      firstName: 'Usuario',
      lastName: 'Prueba',
      email: `test.${Date.now()}@example.com`,
      password: '123456'
    };

    const register = await makeRequest('/auth/register', 'POST', registerData);
    console.log(`   Status: ${register.status}`);
    
    if (register.status !== 201) {
      throw new Error('Error al registrar usuario');
    }

    // 2. Hacer login
    console.log('2. Iniciando sesión...');
    const login = await makeRequest('/auth/login', 'POST', {
      email: registerData.email,
      password: registerData.password
    });

    if (login.status !== 200 || !login.data.token) {
      throw new Error('Error al hacer login');
    }

    const token = login.data.token;
    console.log('   ✅ Login exitoso');

    // 3. Obtener productos
    console.log('3. Obteniendo productos...');
    const products = await makeRequest('/products');
    
    if (products.status !== 200 || !products.data.products?.length) {
      throw new Error('No hay productos disponibles');
    }

    const product = products.data.products[0];
    console.log(`   ✅ Producto seleccionado: ${product.name} - $${product.price}`);

    // 4. Agregar producto al carrito
    console.log('4. Agregando producto al carrito...');
    const addToCart = await makeRequest('/cart/add', 'POST', {
      productId: product.id,
      quantity: 2
    }, token);

    if (addToCart.status !== 200) {
      console.log('   Error:', addToCart.data);
      throw new Error('Error al agregar producto al carrito');
    }

    console.log('   ✅ Producto agregado al carrito');

    // 5. Crear una orden
    console.log('5. Creando orden...');
    const orderData = {
      shippingAddress: {
        firstName: 'Usuario',
        lastName: 'Prueba',
        street: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        postalCode: '1043',
        country: 'Argentina',
        phone: '+54 11 1234-5678'
      }
    };

    const order = await makeRequest('/orders', 'POST', orderData, token);
    console.log(`   Status: ${order.status}`);
    
    if (order.status !== 201) {
      console.log('   Error:', order.data);
      throw new Error('Error al crear la orden');
    }

    const orderId = order.data.order.id;
    console.log(`   ✅ Orden creada: ${orderId}`);

    // 6. Crear preferencia de pago
    console.log('6. Creando preferencia de pago...');
    const payment = await makeRequest('/payments/create', 'POST', { orderId }, token);
    console.log(`   Status: ${payment.status}`);
    
    if (payment.status !== 200) {
      console.log('   Error:', payment.data);
      throw new Error('Error al crear preferencia de pago');
    }

    console.log(`   ✅ Preferencia creada: ${payment.data.preferenceId}`);
    console.log(`   🔗 Link de pago: ${payment.data.init_point}`);

    // 7. Simular webhook de pago exitoso
    console.log('7. Simulando webhook de pago exitoso...');
    const webhookData = {
      type: 'payment',
      data: {
        id: '12345678'
      }
    };

    // Para simular el webhook, necesitaríamos el external_reference (order number)
    const orderDetails = await makeRequest(`/orders/${orderId}`, 'GET', null, token);
    if (orderDetails.status === 200) {
      console.log(`   📋 Número de orden: ${orderDetails.data.orderNumber}`);
      console.log('   ⚠️  En producción, MercadoPago enviaría el webhook automáticamente');
    }

    // 8. Verificar estado final de la orden
    console.log('8. Verificando estado de la orden...');
    const finalOrder = await makeRequest(`/orders/${orderId}`, 'GET', null, token);
    console.log(`   Status: ${finalOrder.status}`);
    
    if (finalOrder.status === 200) {
      const orderData = finalOrder.data;
      console.log(`   📊 Estado de la orden: ${orderData.status}`);
      console.log(`   💳 Estado del pago: ${orderData.paymentStatus}`);
      console.log(`   💰 Total: $${orderData.total}`);
    }

    console.log('\n🎉 ¡Flujo de prueba completado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('✅ Registro de usuario');
    console.log('✅ Autenticación');  
    console.log('✅ Selección de productos');
    console.log('✅ Agregar al carrito');
    console.log('✅ Creación de orden');
    console.log('✅ Generación de preferencia de pago');
    console.log('⚠️  Webhook (requiere URL pública en producción)');

    console.log('\n🔗 URLs importantes:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000/api');
    console.log(`   Link de pago: ${payment.data.initPoint || payment.data.sandboxInitPoint}`);

    console.log('\n💡 Próximos pasos:');
    console.log('   • Usar ngrok para exponer webhook públicamente');
    console.log('   • Completar panel administrativo');
    console.log('   • Agregar más productos de prueba');
    console.log('   • Configurar envío de emails');

  } catch (error) {
    console.error('\n❌ Error en el flujo:', error.message);
  }
}

testCompleteFlow();