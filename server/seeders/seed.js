const { User, Category, Product } = require('../src/models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    // Crear usuarios de ejemplo
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true
    });

    const testUser = await User.create({
      firstName: 'Usuario',
      lastName: 'Test',
      email: 'user@test.com',
      password: hashedPassword,
      role: 'customer',
      isEmailVerified: true
    });

    // Crear categorías
    const categories = await Category.bulkCreate([
      {
        name: 'Electrónicos',
        description: 'Dispositivos y gadgets electrónicos',
        slug: 'electronicos'
      },
      {
        name: 'Ropa',
        description: 'Ropa y accesorios de moda',
        slug: 'ropa'
      },
      {
        name: 'Hogar',
        description: 'Artículos para el hogar y decoración',
        slug: 'hogar'
      },
      {
        name: 'Deportes',
        description: 'Equipos y ropa deportiva',
        slug: 'deportes'
      }
    ]);

    // Crear productos de ejemplo
    const products = await Product.bulkCreate([
      {
        name: 'iPhone 15 Pro',
        description: 'El último iPhone con chip A17 Pro',
        price: 999.99,
        stock: 50,
        categoryId: categories[0].id,
        slug: 'iphone-15-pro',
        isFeatured: true,
        isActive: true
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Smartphone Android de última generación',
        price: 899.99,
        stock: 30,
        categoryId: categories[0].id,
        slug: 'samsung-galaxy-s24',
        isFeatured: true,
        isActive: true
      },
      {
        name: 'Camiseta Premium',
        description: 'Camiseta de algodón 100% premium',
        price: 29.99,
        stock: 100,
        categoryId: categories[1].id,
        slug: 'camiseta-premium',
        isFeatured: false,
        isActive: true
      },
      {
        name: 'Jeans Clásicos',
        description: 'Jeans de corte clásico y cómodo',
        price: 79.99,
        stock: 75,
        categoryId: categories[1].id,
        slug: 'jeans-clasicos',
        isFeatured: true,
        isActive: true
      },
      {
        name: 'Lámpara LED',
        description: 'Lámpara LED moderna para escritorio',
        price: 45.99,
        stock: 25,
        categoryId: categories[2].id,
        slug: 'lampara-led',
        isFeatured: false,
        isActive: true
      },
      {
        name: 'Zapatillas Running',
        description: 'Zapatillas profesionales para running',
        price: 129.99,
        stock: 40,
        categoryId: categories[3].id,
        slug: 'zapatillas-running',
        isFeatured: true,
        isActive: true
      }
    ]);

    console.log('✅ Base de datos inicializada exitosamente!');
    console.log(`👤 Usuarios creados: ${2}`);
    console.log(`📂 Categorías creadas: ${categories.length}`);
    console.log(`📦 Productos creados: ${products.length}`);
    console.log('');
    console.log('🔑 Credenciales de prueba:');
    console.log('Admin: admin@ecommerce.com / 123456');
    console.log('Usuario: user@test.com / 123456');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
  }
}

module.exports = seedDatabase;