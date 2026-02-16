const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Product } = require('../models');
const logger = require('../config/logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('123456', 12);
    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@ecommerce.com' },
      defaults: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@ecommerce.com',
        password: adminPassword,
        role: 'admin',
        isActive: true,
        phone: '1234567890',
        address: 'Dirección del administrador'
      }
    });

    // Create test customer
    const customerPassword = await bcrypt.hash('123456', 12);
    const [customerUser] = await User.findOrCreate({
      where: { email: 'cliente@example.com' },
      defaults: {
        firstName: 'Roberto',
        lastName: 'Kelm',
        email: 'cliente@example.com',
        password: customerPassword,
        role: 'customer',
        isActive: true,
        phone: '0987654321',
        address: 'chacra 134 calle 76 6851'
      }
    });

    // Create categories
    const categories = [
      {
        name: 'Electrónicos',
        description: 'Dispositivos electrónicos y tecnología',
        slug: 'electronicos',
        isActive: true
      },
      {
        name: 'Ropa',
        description: 'Ropa y accesorios de moda',
        slug: 'ropa',
        isActive: true
      },
      {
        name: 'Hogar',
        description: 'Artículos para el hogar y decoración',
        slug: 'hogar',
        isActive: true
      },
      {
        name: 'Deportes',
        description: 'Equipos y ropa deportiva',
        slug: 'deportes',
        isActive: true
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const [category] = await Category.findOrCreate({
        where: { slug: categoryData.slug },
        defaults: categoryData
      });
      createdCategories.push(category);
    }

    // Create sample products
    const products = [
      {
        name: 'Samsung Galaxy S21',
        description: 'Smartphone Samsung Galaxy S21 con cámara de 64MP y pantalla AMOLED',
        price: 799.99,
        stock: 25,
        categoryId: createdCategories[0].id, // Electrónicos
        images: ['https://via.placeholder.com/400x400?text=Galaxy+S21'],
        isActive: true,
        weight: 0.169,
        dimensions: '15.1 x 7.1 x 0.79 cm'
      },
      {
        name: 'Camiseta Nike',
        description: 'Camiseta deportiva Nike de algodón 100%',
        price: 29.99,
        stock: 50,
        categoryId: createdCategories[1].id, // Ropa
        images: ['https://via.placeholder.com/400x400?text=Nike+Shirt'],
        isActive: true,
        weight: 0.2,
        dimensions: '30 x 20 x 2 cm'
      },
      {
        name: 'Lámpara LED',
        description: 'Lámpara LED de escritorio con control táctil',
        price: 45.50,
        stock: 15,
        categoryId: createdCategories[2].id, // Hogar
        images: ['https://via.placeholder.com/400x400?text=LED+Lamp'],
        isActive: true,
        weight: 0.8,
        dimensions: '25 x 15 x 40 cm'
      },
      {
        name: 'Zapatillas Adidas',
        description: 'Zapatillas deportivas Adidas para running',
        price: 89.99,
        stock: 30,
        categoryId: createdCategories[3].id, // Deportes
        images: ['https://via.placeholder.com/400x400?text=Adidas+Shoes'],
        isActive: true,
        weight: 0.6,
        dimensions: '32 x 20 x 12 cm'
      },
      {
        name: 'MacBook Air M2',
        description: 'Laptop Apple MacBook Air con chip M2, 8GB RAM, 256GB SSD',
        price: 1299.99,
        stock: 10,
        categoryId: createdCategories[0].id, // Electrónicos
        images: ['https://via.placeholder.com/400x400?text=MacBook+Air'],
        isActive: true,
        weight: 1.24,
        dimensions: '30.41 x 21.24 x 1.13 cm'
      },
      {
        name: 'Jeans Levis 501',
        description: 'Pantalón jeans clásico Levis 501 de corte regular',
        price: 65.00,
        stock: 40,
        categoryId: createdCategories[1].id, // Ropa
        images: ['https://via.placeholder.com/400x400?text=Levis+Jeans'],
        isActive: true,
        weight: 0.7,
        dimensions: '35 x 25 x 3 cm'
      },
      {
        name: 'Cafetera Nespresso',
        description: 'Cafetera automática Nespresso con sistema de cápsulas',
        price: 159.99,
        stock: 20,
        categoryId: createdCategories[2].id, // Hogar
        images: ['https://via.placeholder.com/400x400?text=Nespresso'],
        isActive: true,
        weight: 2.3,
        dimensions: '32 x 15 x 26 cm'
      },
      {
        name: 'Pelota de Fútbol',
        description: 'Pelota de fútbol FIFA aprobada, tamaño oficial',
        price: 24.99,
        stock: 60,
        categoryId: createdCategories[3].id, // Deportes
        images: ['https://via.placeholder.com/400x400?text=Soccer+Ball'],
        isActive: true,
        weight: 0.41,
        dimensions: '22 x 22 x 22 cm'
      }
    ];

    for (const productData of products) {
      const [product] = await Product.findOrCreate({
        where: { name: productData.name },
        defaults: {
          ...productData,
          createdBy: adminUser.id
        }
      });
      logger.info(`Created/Found product: ${product.name}`);
    }

    logger.info('Database seeding completed successfully');
    
    return {
      message: 'Database seeded successfully',
      users: 2,
      categories: createdCategories.length,
      products: products.length
    };
    
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = {
  seedDatabase
};