const { User, Category, Product } = require('../src/models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
    
    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });
    
    console.log('Admin user created:', adminUser.email);

    // Create test user
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@test.com',
      password: hashedPassword,
      role: 'customer',
      isVerified: true
    });
    
    console.log('Test user created:', testUser.email);

    // Create categories
    const category1 = await Category.create({
      name: 'Electrónicos',
      slug: 'electronicos',
      description: 'Dispositivos electrónicos y gadgets',
      isActive: true
    });
    
    const category2 = await Category.create({
      name: 'Ropa',
      slug: 'ropa',
      description: 'Ropa y accesorios de moda',
      isActive: true
    });
    
    console.log('Categories created:', category1.name, category2.name);

    // Create products
    const product1 = await Product.create({
      name: 'iPhone 13',
      slug: 'iphone-13',
      sku: 'IPHONE13-128GB',
      description: 'Smartphone Apple iPhone 13 128GB',
      price: 899.99,
      stock: 50,
      categoryId: category1.id,
      isActive: true,
      images: ['iphone13.jpg']
    });

    const product2 = await Product.create({
      name: 'Samsung Galaxy S21',
      slug: 'samsung-galaxy-s21',
      sku: 'GALAXY-S21-256GB',
      description: 'Smartphone Samsung Galaxy S21 256GB',
      price: 799.99,
      stock: 30,
      categoryId: category1.id,
      isActive: true,
      images: ['galaxy-s21.jpg']
    });

    const product3 = await Product.create({
      name: 'Camiseta Nike',
      slug: 'camiseta-nike',
      sku: 'NIKE-SHIRT-M',
      description: 'Camiseta deportiva Nike talla M',
      price: 29.99,
      stock: 100,
      categoryId: category2.id,
      isActive: true,
      images: ['nike-shirt.jpg']
    });

    console.log('Products created:', product1.name, product2.name, product3.name);

    console.log('Database seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();