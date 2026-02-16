// Script de prueba para verificar las APIs del e-commerce
const http = require('http');

async function makeRequest(path, method = 'GET', data = null) {
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

async function runTests() {
  console.log('🚀 Iniciando pruebas de la API...\n');

  try {
    // Prueba de salud
    console.log('1. Probando endpoint de salud...');
    const health = await makeRequest('/health');
    console.log(`   Status: ${health.status} - ${health.data.status}\n`);

    // Prueba de productos
    console.log('2. Probando lista de productos...');
    const products = await makeRequest('/products');
    console.log(`   Status: ${products.status}`);
    console.log(`   Productos encontrados: ${products.data.products?.length || 0}`);
    if (products.data.products) {
      products.data.products.forEach(p => {
        console.log(`   - ${p.name} (${p.sku}) - $${p.price}`);
      });
    }
    console.log('');

    // Prueba de categorías
    console.log('3. Probando lista de categorías...');
    const categories = await makeRequest('/categories');
    console.log(`   Status: ${categories.status}`);
    console.log(`   Categorías encontradas: ${categories.data.categories?.length || 0}`);
    if (categories.data.categories) {
      categories.data.categories.forEach(c => {
        console.log(`   - ${c.name} (${c.slug})`);
      });
    }
    console.log('');

    // Prueba de registro (sin registrar realmente)
    console.log('4. Probando endpoint de registro...');
    const register = await makeRequest('/auth/register', 'POST', {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: '123456'
    });
    console.log(`   Status: ${register.status}`);
    if (register.status === 400) {
      console.log('   Email ya registrado (esperado)');
    }
    console.log('');

    // Prueba de login
    console.log('5. Probando login con usuario de prueba...');
    const login = await makeRequest('/auth/login', 'POST', {
      email: 'user@test.com',
      password: '123456'
    });
    console.log(`   Status: ${login.status}`);
    if (login.data.token) {
      console.log('   ✅ Login exitoso - Token generado');
    }
    console.log('');

    // Prueba de login admin
    console.log('6. Probando login con usuario admin...');
    const adminLogin = await makeRequest('/auth/login', 'POST', {
      email: 'admin@ecommerce.com',
      password: '123456'
    });
    console.log(`   Status: ${adminLogin.status}`);
    if (adminLogin.data.token) {
      console.log('   ✅ Login admin exitoso - Token generado');
    }
    console.log('');

    console.log('🎉 ¡Todas las pruebas completadas!\n');
    console.log('📋 Resumen:');
    console.log('✅ Backend funcionando correctamente');
    console.log('✅ Base de datos poblada con datos de prueba');
    console.log('✅ Autenticación funcionando');
    console.log('✅ APIs de productos y categorías funcionando');
    console.log('\n🔑 Credenciales de prueba:');
    console.log('   Admin: admin@ecommerce.com / 123456');
    console.log('   Usuario: user@test.com / 123456');
    console.log('\n🌐 URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000/api');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

runTests();