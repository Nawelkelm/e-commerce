// Test simple de MercadoPago
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configurar MercadoPago con credenciales de sandbox públicas
const client = new MercadoPagoConfig({ 
  accessToken: 'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398',
  options: { timeout: 5000, idempotencyKey: 'abc' }
});

const preference = new Preference(client);

async function testMercadoPago() {
  try {
    console.log('🧪 Probando conexión con MercadoPago...');
    
    const preferenceData = {
      items: [
        {
          id: 'test-product',
          title: 'Test Product',
          description: 'Test description',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: 10.0
        }
      ],
      back_urls: {
        success: 'http://localhost:3000/payment/success',
        failure: 'http://localhost:3000/payment/failure',
        pending: 'http://localhost:3000/payment/pending'
      },
      auto_return: 'approved',
      external_reference: 'TEST-001'
    };

    console.log('📦 Datos de preferencia:', JSON.stringify(preferenceData, null, 2));
    
    const result = await preference.create({ body: preferenceData });
    
    console.log('✅ Preferencia creada exitosamente!');
    console.log('🆔 ID:', result.id);
    console.log('🔗 Init Point:', result.init_point);
    console.log('🧪 Sandbox Init Point:', result.sandbox_init_point);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Detalles del error:', error);
  }
}

testMercadoPago();