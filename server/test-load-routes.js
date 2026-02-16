console.log('=== PROBANDO CARGA DE RUTAS ===\n');

try {
  console.log('1. Cargando controlador...');
  const controller = require('./src/controllers/invoiceController');
  console.log('   ✅ Controlador cargado');
  console.log('   Funciones:', Object.keys(controller).join(', '));
  
  console.log('\n2. Cargando middleware auth...');
  const auth = require('./src/middleware/auth');
  console.log('   ✅ Auth middleware cargado');
  
  console.log('\n3. Cargando express...');
  const express = require('express');
  console.log('   ✅ Express cargado');
  
  console.log('\n4. Cargando rate-limit...');
  const rateLimit = require('express-rate-limit');
  console.log('   ✅ Rate limit cargado');
  
  console.log('\n5. Intentando cargar invoiceRoutes...');
  const routes = require('./src/routes/invoiceRoutes');
  console.log('   ✅ RUTAS CARGADAS EXITOSAMENTE');
  
  console.log('\n✅ TODO ESTÁ FUNCIONANDO CORRECTAMENTE');
  
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('\nStack:', error.stack);
  process.exit(1);
}
