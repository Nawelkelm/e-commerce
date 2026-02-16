// Test simple de credenciales MercadoPago
require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');

async function testCredentials() {
    try {
        console.log('🧪 Probando credenciales de MercadoPago...');
        console.log('Access Token:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Configurado' : 'NO ENCONTRADO');
        
        const client = new MercadoPagoConfig({ 
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
            options: {
                timeout: 5000
            }
        });
        
        const preference = new Preference(client);
        
        const preferenceData = {
            items: [
                {
                    id: 'test-item',
                    title: 'Test Product',
                    quantity: 1,
                    unit_price: 100,
                    currency_id: 'ARS'
                }
            ],
            back_urls: {
                success: 'http://localhost:3000/checkout/success',
                failure: 'http://localhost:3000/checkout/failure',
                pending: 'http://localhost:3000/checkout/pending'
            },
            auto_return: 'approved'
        };
        
        console.log('🔄 Creando preferencia de prueba...');
        const result = await preference.create({ body: preferenceData });
        
        console.log('✅ ¡Credenciales válidas! Preferencia creada:', result.id);
        console.log('🔗 URL de pago:', result.init_point);
        
    } catch (error) {
        console.error('❌ Error con las credenciales:');
        console.error('Mensaje:', error.message);
        console.error('Código:', error.status);
        console.error('Detalles:', error.cause);
    }
}

testCredentials();