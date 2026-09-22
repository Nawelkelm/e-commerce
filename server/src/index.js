/**
 * Arranque del servidor: conecta la base, sincroniza el esquema segun el
 * entorno, inicializa roles y seeds, levanta los crons y abre el puerto.
 *
 * La app Express se construye en app.js.
 */
const app = require('./app');
const { sequelize } = require('./config/database');
const logger = require('./config/logger');
const { initializeRolesAndPermissions, assignSuperAdminRole } = require('./scripts/initializePermissions');
const { seedDatabase } = require('./scripts/seedDatabase');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify critical env vars
    if (!process.env.JWT_SECRET) {
      logger.error('FATAL: JWT_SECRET environment variable is NOT set! Auth will fail.');
    } else {
      logger.info('JWT_SECRET is configured.');
    }

    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Estrategia de sincronización del esquema según el entorno:
    // - Desarrollo: sync({ alter: true }) + conversión ENUM→VARCHAR, para que el
    //   esquema siga automáticamente a los modelos mientras se desarrolla.
    // - Producción: NUNCA alterar el esquema en cada arranque (riesgo de corromper
    //   o perder datos de clientes). Sólo sync() — crea las tablas que falten en el
    //   primer deploy y no toca las columnas existentes. Los cambios de esquema en
    //   producción se aplican con migraciones versionadas (npm run db:migrate).
    // Escape hatch: DB_SYNC_ALTER=true fuerza alter aunque NODE_ENV=production
    // (usar sólo de forma puntual y con backup previo).
    const isProduction = process.env.NODE_ENV === 'production';
    const useAlter = process.env.DB_SYNC_ALTER === 'true' || !isProduction;

    if (useAlter) {
      // Convert ALL ENUM columns to VARCHAR before sync (ENUMs break alter)
      try {
        await sequelize.query(`
          DO $$
          DECLARE
            r RECORD;
          BEGIN
            FOR r IN
              SELECT c.table_name, c.column_name, c.column_default
              FROM information_schema.columns c
              WHERE c.table_schema = 'public'
                AND c.data_type = 'USER-DEFINED'
                AND c.udt_name LIKE 'enum_%'
            LOOP
              -- Drop default before type change
              EXECUTE format('ALTER TABLE %I ALTER COLUMN %I DROP DEFAULT', r.table_name, r.column_name);
              -- Convert ENUM to VARCHAR
              EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE VARCHAR(255) USING %I::VARCHAR(255)', r.table_name, r.column_name, r.column_name);
              -- Restore default if it existed
              IF r.column_default IS NOT NULL THEN
                EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DEFAULT %s', r.table_name, r.column_name, r.column_default);
              END IF;
            END LOOP;
          END $$;
        `);
        logger.info('All ENUM columns migrated to VARCHAR.');
      } catch (err) {
        logger.warn('ENUM migration skipped:', err.message);
      }

      // Sync database models (alter: true ensures schema matches models)
      await sequelize.sync({ alter: true });
      logger.warn('Database models synced with alter:true (development mode). Do NOT use in production.');
    } else {
      // Producción: crea sólo tablas faltantes, sin alterar columnas existentes.
      await sequelize.sync();
      logger.info('Database models synced (no alter). Schema changes in production go through migrations.');
    }
    
    // Initialize roles and permissions
    try {
      await initializeRolesAndPermissions();
      await assignSuperAdminRole();
      logger.info('Roles and permissions initialized successfully.');
    } catch (error) {
      logger.error('Error initializing roles and permissions:', error);
      // Don't stop the server, but log the error
    }

    // Seed database with initial data
    try {
      await seedDatabase();
      logger.info('Database seeded successfully.');
    } catch (error) {
      logger.error('Error seeding database:', error);
      // Don't stop the server, but log the error
    }

    // Initialize stock management scheduled tasks
    try {
      const { initializeStockTasks } = require('./services/stockCronService');
      initializeStockTasks();
      logger.info('Stock management scheduled tasks initialized.');
    } catch (error) {
      logger.error('Error initializing stock tasks:', error);
      // Don't stop the server, but log the error
    }

    // Inicializar sincronización automática de tracking
    try {
      const { startTrackingSyncCron } = require('./jobs/trackingSyncJob');
      startTrackingSyncCron();
      logger.info('Shipment tracking sync cron job initialized.');
    } catch (error) {
      logger.error('Error initializing tracking sync job:', error);
      // Don't stop the server, but log the error
    }

    // Sincronizacion de comprobantes emitidos en ARCA
    try {
      const { startArcaSyncCron } = require('./jobs/arcaSyncJob');
      startArcaSyncCron();
    } catch (error) {
      logger.error('Error initializing ARCA invoice sync job:', error);
      // Don't stop the server, but log the error
    }

    // Seed métodos de envío por defecto si no existen
    try {
      const seedShippingMethods = require('./scripts/seedShippingMethods');
      await seedShippingMethods();
    } catch (error) {
      logger.error('Error seeding shipping methods:', error);
      // Don't stop the server, but log the error
    }

    // Seed paginas institucionales y legales si no existen
    try {
      const seedContentPages = require('./scripts/seedContentPages');
      await seedContentPages();
    } catch (error) {
      logger.error('Error seeding content pages:', error);
      // Don't stop the server, but log the error
    }
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;