/**
 * Construccion de la aplicacion Express: middleware, rutas y manejo de
 * errores. NO abre el puerto ni toca la base de datos.
 *
 * Vive separada de index.js para que los tests puedan montarla con
 * Supertest sin arrancar el servidor, los seeds ni los crons.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const homeSettingsRoutes = require('./routes/homeSettingsRoutes');
const couponRoutes = require('./routes/couponRoutes');
const emailRoutes = require('./routes/emailRoutes');
const smtpRoutes = require('./routes/smtpRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const stockRoutes = require('./routes/stockRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const afipRoutes = require('./routes/afipRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const logisticsCredentialsRoutes = require('./routes/logisticsCredentialsRoutes');
const shippingMethodRoutes = require('./routes/shippingMethodRoutes');
const bankAccountRoutes = require('./routes/bankAccountRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
app.use(compression());

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for public read-only endpoints (they get hit a lot)
  skip: (req) => {
    const publicPaths = ['/api/settings/public', '/api/home-settings', '/api/categories', '/api/coupons/public'];
    return req.method === 'GET' && publicPaths.some(p => req.path.startsWith(p));
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS) || 5,
  message: 'Demasiados intentos de inicio de sesión, intenta de nuevo en 15 minutos.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.REGISTER_RATE_LIMIT_MAX_ATTEMPTS) || 3,
  message: 'Demasiados intentos de registro, intenta de nuevo en 1 hora.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// CORS configuration
// Orígenes permitidos vía env. CORS_ORIGINS es una lista separada por comas;
// si no está, se usan FRONTEND_URL / BACKEND_URL + localhost para desarrollo.
const allowedOrigins = (
  process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [process.env.FRONTEND_URL, process.env.BACKEND_URL, 'http://localhost:3000']
)
  .filter(Boolean)
  .map((o) => o.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize inputs to prevent XSS
const { sanitizeInput } = require('./middleware/sanitize');
app.use(sanitizeInput);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Custom middleware for SVG files with .jpg extension
app.use('/uploads', (req, res, next) => {
  const fs = require('fs');
  const path = require('path');
  
  const filePath = path.join(__dirname, '../uploads', req.path);
  
  // Check if file exists and is SVG content
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('<svg')) {
        res.set('Content-Type', 'image/svg+xml');
        return res.send(content);
      }
    } catch (error) {
      // If not readable as text, continue to normal static serving
    }
  }
  
  next();
});

// Static files
app.use('/uploads', express.static('uploads'));

// Placeholder image route - serve SVG as image
app.get('/placeholder-product.jpg', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '../uploads/placeholder-product.svg');
  
  res.set('Content-Type', 'image/svg+xml');
  fs.createReadStream(filePath).pipe(res);
});

// Public settings endpoint
const settingController = require('./controllers/settingController');
app.get('/api/settings/public', settingController.getPublicSettings);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/home-settings', homeSettingsRoutes);
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/coupons', couponRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/smtp', smtpRoutes);
app.use('/api', reviewRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/afip', afipRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/logistics-credentials', logisticsCredentialsRoutes);
app.use('/api/shipping-methods', shippingMethodRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/content-pages', require('./routes/contentPageRoutes'));
app.use('/api/regret-requests', require('./routes/regretRequestRoutes'));

// Health check (verifica conectividad real con la base de datos)
app.get('/api/health', async (req, res) => {
  const health = { status: 'OK', timestamp: new Date().toISOString(), db: 'unknown' };
  try {
    await sequelize.authenticate();
    health.db = 'up';
    res.json(health);
  } catch (err) {
    health.status = 'ERROR';
    health.db = 'down';
    res.status(503).json(health);
  }
});

// 404 handler (must be after all routes)
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection and server start
module.exports = app;
