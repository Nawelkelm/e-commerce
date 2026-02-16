#!/usr/bin/env node

/**
 * Script para ejecutar seeders de la aplicación
 * Uso: node scripts/seed.js [seeder-name]
 * Ejemplo: node scripts/seed.js invoices
 */

const path = require('path');

async function runSeeder(seederName) {
  try {
    console.log(`\n🚀 Ejecutando seeder: ${seederName}\n`);

    let seederModule;
    
    switch (seederName) {
      case 'invoices':
        seederModule = require('../seeders/invoiceSeeder');
        await seederModule.seedInvoices();
        break;
      
      case 'regenerate-pdfs':
        seederModule = require('../seeders/invoiceSeeder');
        await seederModule.regenerateAllPDFs();
        break;
      
      default:
        console.error(`❌ Seeder desconocido: ${seederName}`);
        console.log('\nSeeders disponibles:');
        console.log('  - invoices: Genera facturas de prueba con PDFs');
        console.log('  - regenerate-pdfs: Regenera PDFs de facturas existentes');
        process.exit(1);
    }

    console.log('\n✅ Seeder ejecutado exitosamente\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error ejecutando seeder:', error);
    process.exit(1);
  }
}

// Obtener el nombre del seeder de los argumentos
const seederName = process.argv[2] || 'invoices';

// Ejecutar
runSeeder(seederName);
