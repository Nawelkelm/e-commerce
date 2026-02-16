const { authenticateToken, isAdmin } = require('./src/middleware/auth');

console.log('=== VERIFICANDO MIDDLEWARE AUTH ===\n');
console.log('authenticateToken:', typeof authenticateToken);
console.log('isAdmin:', typeof isAdmin);

if (typeof authenticateToken !== 'function') {
  console.error('❌ authenticateToken NO es una función');
  process.exit(1);
}

if (typeof isAdmin !== 'function') {
  console.error('❌ isAdmin NO es una función');
  process.exit(1);
}

console.log('\n✅ Ambos middleware son funciones válidas');
