#!/usr/bin/env node

/**
 * Script para resetear la contraseña del admin
 * Uso: node scripts/resetAdminPassword.js
 */

const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function resetAdminPassword() {
  try {
    console.log('🔐 Reseteando contraseña del admin...\n');

    const adminEmail = 'admin@ecommerce.com';
    const newPassword = 'admin123'; // Contraseña temporal

    // Buscar el usuario admin
    const admin = await User.findOne({
      where: { email: adminEmail }
    });

    if (!admin) {
      console.error('❌ No se encontró usuario admin con email:', adminEmail);
      process.exit(1);
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    await admin.update({ password: hashedPassword });

    console.log('✅ Contraseña del admin actualizada exitosamente\n');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Contraseña temporal:', newPassword);
    console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña después de iniciar sesión\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error reseteando contraseña:', error);
    process.exit(1);
  }
}

resetAdminPassword();
