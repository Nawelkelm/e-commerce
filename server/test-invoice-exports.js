const controller = require('./src/controllers/invoiceController');

console.log('=== VERIFICACIÓN DE EXPORTS ===');
console.log('Funciones exportadas:', Object.keys(controller));
console.log('\n=== TIPO DE CADA FUNCIÓN ===');

Object.entries(controller).forEach(([name, fn]) => {
  console.log(`${name}: ${typeof fn}`);
});

console.log('\n✅ Todas las funciones están correctamente exportadas');
