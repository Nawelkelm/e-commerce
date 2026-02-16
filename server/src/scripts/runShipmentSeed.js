require('dotenv').config();
const { sequelize } = require('../config/database');
const { seedShipments } = require('./seedShipments');

const runSeed = async () => {
  try {
    console.log('🌱 Starting shipment seeding process...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run seed
    await seedShipments();

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
