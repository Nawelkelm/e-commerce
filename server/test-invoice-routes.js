const invoiceController = require('./src/controllers/invoiceController');

console.log('=== VERIFICACIÓN DE RUTAS ===\n');

const routes = [
  { path: '/stats/summary', handler: 'getInvoiceStats' },
  { path: '/all', handler: 'getAllInvoices' },
  { path: '/order/:orderId', handler: 'createInvoiceFromOrder' },
  { path: '/:id/cancel', handler: 'cancelInvoice' },
  { path: '/my-invoices', handler: 'getUserInvoices' },
  { path: '/number/:invoiceNumber', handler: 'getInvoiceByNumber' },
  { path: '/:id', handler: 'getInvoiceById' }
];

let allOk = true;

routes.forEach(route => {
  const handler = invoiceController[route.handler];
  const status = typeof handler === 'function' ? '✅' : '❌';
  console.log(`${status} ${route.path} → ${route.handler}: ${typeof handler}`);
  if (typeof handler !== 'function') {
    allOk = false;
  }
});

if (allOk) {
  console.log('\n✅ TODAS LAS RUTAS TIENEN HANDLERS VÁLIDOS');
} else {
  console.log('\n❌ HAY HANDLERS FALTANTES');
  process.exit(1);
}
