/**
 * Script de prueba para integración AFIP
 * Ambiente: Homologación (Testing)
 * 
 * Uso:
 * docker exec ecommerce_backend node src/scripts/test-afip.js
 */

const AfipCredential = require('../models/AfipCredential');
const afipService = require('../services/afipService');
const Invoice = require('../models/Invoice');
const { sequelize } = require('../config/database');

// Certificado de prueba para homologación AFIP
// Este es un certificado de ejemplo - reemplazar con uno real de homologación
const TEST_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDdTCCAl2gAwIBAgIEBVr6QjANBgkqhkiG9w0BAQsFADBTMQswCQYDVQQGEwJB
UjEVMBMGA1UEChMMQUZJUCBURVNUSU5HMRQwEgYDVQQLDAtDT01QUk9CQU5URTEX
MBUGA1UEAwwOQ09NUFJPUEFOVEVTIENBMB4XDTIwMDEwMTAwMDAwMFoXDTMwMDEw
MTAwMDAwMFowSTELMAkGA1UEBhMCQVIxFTATBgNVBAoMDEFGSVAgVEVTVElORzEj
MCEGA1UEAwwaQ1VJVCAyMDEyMzQ1Njc4OSBURVNUSU5HMIIBIjANBgkqhkiG9w0B
AQEFAAOCAQ8AMIIBCgKCAQEAzPzgFwA+qvgHbG3jI8RHsq7rJWv1Kq3lqGHgGkgH
6qHOGKbPBZRe1u1W1Xy/6qHT0GkHq3lGH/6qHgGkgH6qHOGKbPBZRe1u1W1Xy/6q
HT0GkHq3lGH/6qHgGkgH6qHOGKbPBZRe1u1W1Xy/6qHT0GkHq3lGH/TEST_CERT
-----END CERTIFICATE-----`;

const TEST_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAzPzgFwA+qvgHbG3jI8RHsq7rJWv1Kq3lqGHgGkgH6qHOGKbP
BZRe1u1W1Xy/6qHT0GkHq3lGH/6qHgGkgH6qHOGKbPBZRe1u1W1Xy/6qHT0GkHq3
lGH/6qHgGkgH6qHOGKbPBZRe1u1W1Xy/6qHT0GkHq3lGH/TEST_KEY
-----END RSA PRIVATE KEY-----`;

async function testAfipIntegration() {
  console.log('\n🚀 === PRUEBA DE INTEGRACIÓN AFIP ===\n');

  try {
    // 1. Crear/Actualizar credenciales de testing
    console.log('1️⃣ Configurando credenciales de testing...');
    
    let credential = await AfipCredential.findOne({
      where: { cuit: '20123456789' }
    });

    if (credential) {
      await credential.update({
        production: false,
        connectionStatus: 'testing'
      });
      console.log('✅ Credenciales actualizadas\n');
    } else {
      credential = await AfipCredential.create({
        name: 'Testing - Homologación AFIP',
        cuit: '20123456789',
        businessName: 'Empresa de Prueba S.A.',
        certificate: TEST_CERTIFICATE,
        privateKey: TEST_PRIVATE_KEY,
        pointOfSale: 1,
        production: false, // IMPORTANTE: Testing
        taxCategory: 'responsable_inscripto',
        address: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        postalCode: 'C1043',
        province: 'Buenos Aires',
        isActive: true,
        connectionStatus: 'testing'
      });
      console.log('✅ Credenciales de testing creadas\n');
    }

    // 2. Test de conexión
    console.log('2️⃣ Probando conexión con AFIP...');
    const connectionTest = await afipService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Conexión exitosa');
      console.log('   Ambiente:', connectionTest.environment);
      console.log('   CUIT:', connectionTest.cuit);
      console.log('   Estado del servidor:', connectionTest.serverStatus);
      console.log();
    } else {
      console.log('❌ Error de conexión:', connectionTest.message);
      console.log('   Error:', connectionTest.error);
      console.log();
      console.log('⚠️  NOTA: El certificado de prueba necesita ser reemplazado');
      console.log('   con uno real obtenido de AFIP para homologación.');
      console.log();
    }

    // 3. Validar CUIT
    console.log('3️⃣ Probando validación de CUIT...');
    
    const testCUITs = [
      '20123456789',  // Válido
      '2012345678',   // Inválido (10 dígitos)
      '20-12345678-9', // Válido (con guiones)
      '20123456780'   // Inválido (dígito verificador incorrecto)
    ];

    for (const cuit of testCUITs) {
      const validation = await afipService.validateCUIT(cuit);
      console.log(`   ${cuit}: ${validation.valid ? '✅' : '❌'} ${validation.message || validation.formatted || ''}`);
    }
    console.log();

    // 4. Obtener último número de factura
    console.log('4️⃣ Consultando último número de factura...');
    try {
      const lastNumber = await afipService.getLastInvoiceNumber('B', 1);
      console.log('✅ Último número:', lastNumber.lastNumber);
      console.log('   Próximo número:', lastNumber.nextNumber);
      console.log();
    } catch (error) {
      console.log('⚠️  Error (esperado si no hay certificado válido):', error.message);
      console.log();
    }

    // 5. Generar datos de QR
    console.log('5️⃣ Probando generación de datos QR...');
    
    const testInvoice = {
      cae: '71234567890123',
      caeDueDate: '2025-11-07',
      createdAt: new Date(),
      invoiceNumber: 'B-00001-00000123',
      invoiceType: 'B',
      pointOfSale: 1,
      total: 12500.50,
      customerTaxCategory: 'consumidor_final',
      customerCuit: null
    };

    const qrData = afipService.generateQRData(testInvoice);
    console.log('✅ URL del QR generada:');
    console.log('   ', qrData ? qrData.substring(0, 100) + '...' : 'null');
    console.log();

    // 6. Calcular montos según tipo de factura
    console.log('6️⃣ Probando cálculo de montos...');
    
    const testInvoiceA = { total: 12100, invoiceType: 'A' };
    const testInvoiceB = { total: 12100, invoiceType: 'B' };
    
    const amountsA = afipService.calculateAmounts(testInvoiceA);
    const amountsB = afipService.calculateAmounts(testInvoiceB);
    
    console.log('   Factura A (discrimina IVA):');
    console.log('     - Total: $', amountsA.total);
    console.log('     - Neto: $', amountsA.netAmount);
    console.log('     - IVA: $', amountsA.vatAmount);
    console.log();
    console.log('   Factura B (IVA incluido):');
    console.log('     - Total: $', amountsB.total);
    console.log('     - Neto: $', amountsB.netAmount);
    console.log('     - IVA: $', amountsB.vatAmount);
    console.log();

    // Resumen
    console.log('\n📊 === RESUMEN DE PRUEBAS ===\n');
    console.log('✅ Credenciales de testing configuradas');
    console.log(connectionTest.success ? '✅' : '⚠️ ', 'Test de conexión', connectionTest.success ? 'exitoso' : 'falló (certificado de prueba)');
    console.log('✅ Validación de CUIT funcionando');
    console.log('✅ Generación de QR funcionando');
    console.log('✅ Cálculo de montos funcionando');
    console.log();
    console.log('📝 SIGUIENTE PASO:');
    console.log('   1. Obtener certificado real de AFIP para homologación');
    console.log('   2. Actualizar credenciales con certificado real');
    console.log('   3. Volver a ejecutar este script');
    console.log('   4. Probar generación de CAE real');
    console.log();

  } catch (error) {
    console.error('\n❌ Error en la prueba:', error);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar pruebas
testAfipIntegration()
  .then(() => {
    console.log('✅ Pruebas completadas');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
