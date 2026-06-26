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
        emailVerified: true,
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
        emailVerified: true,
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
        slug: 'samsung-galaxy-s21',
        sku: 'ELEC-SAM-S21',
        description: 'Smartphone Samsung Galaxy S21 con cámara de 64MP y pantalla AMOLED',
        price: 450000,
        stock: 25,
        categoryId: createdCategories[0].id,
        images: ['https://placehold.co/400x400?text=Galaxy+S21'],
        isActive: true,
        weight: 0.169,
        dimensions: '15.1 x 7.1 x 0.79 cm'
      },
      {
        name: 'Camiseta Nike Dri-FIT',
        slug: 'camiseta-nike-dri-fit',
        sku: 'ROPA-NIK-DRI',
        description: 'Camiseta deportiva Nike Dri-FIT de algodón 100%',
        price: 25000,
        stock: 50,
        categoryId: createdCategories[1].id,
        images: ['https://placehold.co/400x400?text=Nike+Shirt'],
        isActive: true,
        weight: 0.2,
        dimensions: '30 x 20 x 2 cm'
      },
      {
        name: 'Lámpara LED Escritorio',
        slug: 'lampara-led-escritorio',
        sku: 'HOGAR-LAMP-LED',
        description: 'Lámpara LED de escritorio con control táctil y 3 niveles de brillo',
        price: 35000,
        stock: 15,
        categoryId: createdCategories[2].id,
        images: ['https://placehold.co/400x400?text=LED+Lamp'],
        isActive: true,
        weight: 0.8,
        dimensions: '25 x 15 x 40 cm'
      },
      {
        name: 'Zapatillas Adidas Ultraboost',
        slug: 'zapatillas-adidas-ultraboost',
        sku: 'DEP-ADI-UB',
        description: 'Zapatillas deportivas Adidas Ultraboost para running',
        price: 95000,
        stock: 30,
        categoryId: createdCategories[3].id,
        images: ['https://placehold.co/400x400?text=Adidas+Shoes'],
        isActive: true,
        weight: 0.6,
        dimensions: '32 x 20 x 12 cm'
      },
      {
        name: 'MacBook Air M2',
        slug: 'macbook-air-m2',
        sku: 'ELEC-APL-MBA',
        description: 'Laptop Apple MacBook Air con chip M2, 8GB RAM, 256GB SSD',
        price: 1200000,
        stock: 10,
        categoryId: createdCategories[0].id,
        images: ['https://placehold.co/400x400?text=MacBook+Air'],
        isActive: true,
        weight: 1.24,
        dimensions: '30.41 x 21.24 x 1.13 cm'
      },
      {
        name: 'Jeans Levis 501',
        slug: 'jeans-levis-501',
        sku: 'ROPA-LEV-501',
        description: 'Pantalón jeans clásico Levis 501 de corte regular',
        price: 55000,
        stock: 40,
        categoryId: createdCategories[1].id,
        images: ['https://placehold.co/400x400?text=Levis+Jeans'],
        isActive: true,
        weight: 0.7,
        dimensions: '35 x 25 x 3 cm'
      },
      {
        name: 'Cafetera Nespresso Vertuo',
        slug: 'cafetera-nespresso-vertuo',
        sku: 'HOGAR-NSP-VRT',
        description: 'Cafetera automática Nespresso Vertuo con sistema de cápsulas',
        price: 130000,
        stock: 20,
        categoryId: createdCategories[2].id,
        images: ['https://placehold.co/400x400?text=Nespresso'],
        isActive: true,
        weight: 2.3,
        dimensions: '32 x 15 x 26 cm'
      },
      {
        name: 'Pelota de Fútbol Adidas',
        slug: 'pelota-futbol-adidas',
        sku: 'DEP-ADI-FUT',
        description: 'Pelota de fútbol Adidas FIFA aprobada, tamaño oficial',
        price: 22000,
        stock: 60,
        categoryId: createdCategories[3].id,
        images: ['https://placehold.co/400x400?text=Soccer+Ball'],
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