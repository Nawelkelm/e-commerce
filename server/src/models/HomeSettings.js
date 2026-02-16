const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HomeSettings = sequelize.define('HomeSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Carrousel (máximo 3 slides)
  carousel: {
    type: DataTypes.JSONB,
    defaultValue: [],
    validate: {
      maxSlides(value) {
        if (Array.isArray(value) && value.length > 3) {
          throw new Error('El carrousel no puede tener más de 3 slides');
        }
      }
    }
  },
  // Hero Section
  heroTitle: {
    type: DataTypes.STRING(200),
    defaultValue: 'Bienvenido a Nuestra Tienda'
  },
  heroSubtitle: {
    type: DataTypes.TEXT,
    defaultValue: 'Encuentra los mejores productos al mejor precio'
  },
  heroCta1Text: {
    type: DataTypes.STRING(100),
    defaultValue: 'Ver Productos'
  },
  heroCta1Link: {
    type: DataTypes.STRING(200),
    defaultValue: '/productos'
  },
  heroCta2Text: {
    type: DataTypes.STRING(100),
    defaultValue: 'Ofertas'
  },
  heroCta2Link: {
    type: DataTypes.STRING(200),
    defaultValue: '/productos?ofertas=true'
  },
  // Sección Características
  featuresEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  featuresTitle: {
    type: DataTypes.STRING(200),
    defaultValue: '¿Por qué elegirnos?'
  },
  features: {
    type: DataTypes.JSONB,
    defaultValue: [
      { icon: 'truck', title: 'Envío Gratis', description: 'En compras superiores a $10,000' },
      { icon: 'shield', title: 'Compra Segura', description: 'Protegemos tus datos' },
      { icon: 'refresh', title: 'Devoluciones', description: '30 días para devolver' },
      { icon: 'support', title: 'Soporte 24/7', description: 'Estamos para ayudarte' }
    ]
  },
  // Sección Categorías Destacadas
  categoriesEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  categoriesTitle: {
    type: DataTypes.STRING(200),
    defaultValue: 'Categorías Destacadas'
  },
  categoryIds: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  categoryIcons: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Sección Testimonios
  testimonialsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  testimonialsTitle: {
    type: DataTypes.STRING(200),
    defaultValue: 'Lo que dicen nuestros clientes'
  },
  testimonials: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // Newsletter
  newsletterEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  newsletterTitle: {
    type: DataTypes.STRING(200),
    defaultValue: 'Suscríbete a nuestro newsletter'
  },
  newsletterSubtitle: {
    type: DataTypes.TEXT,
    defaultValue: 'Recibe ofertas exclusivas y novedades'
  },
  // Coupon Banner Configuration
  couponBannerEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  couponBannerTitle: {
    type: DataTypes.STRING(200),
    defaultValue: '¡Ofertas Especiales!'
  },
  couponBannerSubtitle: {
    type: DataTypes.STRING(200),
    defaultValue: 'Aprovecha estos cupones de descuento'
  },
  couponBannerMaxCoupons: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  // SEO Metadata
  metaTitle: {
    type: DataTypes.STRING(200),
    defaultValue: 'E-Commerce - Tu tienda online de confianza'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    defaultValue: 'Encuentra los mejores productos al mejor precio. Envío gratis, compra segura y soporte 24/7.'
  },
  metaKeywords: {
    type: DataTypes.TEXT,
    defaultValue: 'tienda online, ecommerce, productos, ofertas, envío gratis'
  },
  // Footer Configuration
  footerEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  footerAboutTitle: {
    type: DataTypes.STRING(100),
    defaultValue: 'Sobre Nosotros'
  },
  footerAboutText: {
    type: DataTypes.TEXT,
    defaultValue: 'Somos una tienda comprometida con la calidad y satisfacción de nuestros clientes.'
  },
  footerContactEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  footerContactTitle: {
    type: DataTypes.STRING(100),
    defaultValue: 'Contacto'
  },
  footerAddress: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  footerPhone: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  footerEmail: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  footerSchedule: {
    type: DataTypes.STRING(200),
    defaultValue: 'Lun - Vie: 9:00 - 18:00'
  },
  // Social Media
  footerSocialEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  footerSocialTitle: {
    type: DataTypes.STRING(100),
    defaultValue: 'Síguenos'
  },
  footerFacebook: {
    type: DataTypes.STRING(200),
    defaultValue: ''
  },
  footerInstagram: {
    type: DataTypes.STRING(200),
    defaultValue: ''
  },
  footerTwitter: {
    type: DataTypes.STRING(200),
    defaultValue: ''
  },
  footerYoutube: {
    type: DataTypes.STRING(200),
    defaultValue: ''
  },
  footerTiktok: {
    type: DataTypes.STRING(200),
    defaultValue: ''
  },
  footerWhatsapp: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  footerLinkedin: {
    type: DataTypes.STRING(200),
    defaultValue: ''
  },
  // Footer Links Columns (up to 3 columns)
  footerLinksEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  footerColumn1Title: {
    type: DataTypes.STRING(100),
    defaultValue: 'Información'
  },
  footerColumn1Links: {
    type: DataTypes.JSONB,
    defaultValue: [
      { text: 'Sobre Nosotros', url: '/sobre-nosotros' },
      { text: 'Contacto', url: '/contacto' },
      { text: 'Blog', url: '/blog' }
    ]
  },
  footerColumn2Title: {
    type: DataTypes.STRING(100),
    defaultValue: 'Ayuda'
  },
  footerColumn2Links: {
    type: DataTypes.JSONB,
    defaultValue: [
      { text: 'Preguntas Frecuentes', url: '/faq' },
      { text: 'Envíos', url: '/envios' },
      { text: 'Devoluciones', url: '/devoluciones' }
    ]
  },
  footerColumn3Title: {
    type: DataTypes.STRING(100),
    defaultValue: 'Legal'
  },
  footerColumn3Links: {
    type: DataTypes.JSONB,
    defaultValue: [
      { text: 'Términos y Condiciones', url: '/terminos' },
      { text: 'Política de Privacidad', url: '/privacidad' },
      { text: 'Política de Cookies', url: '/cookies' }
    ]
  },
  // Footer Bottom
  footerCopyrightText: {
    type: DataTypes.STRING(200),
    defaultValue: '© 2025 E-Commerce. Todos los derechos reservados.'
  },
  footerShowPaymentMethods: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  footerPaymentMethods: {
    type: DataTypes.JSONB,
    defaultValue: ['visa', 'mastercard', 'amex', 'mercadopago']
  }
}, {
  timestamps: true,
  tableName: 'HomeSettings'
});

module.exports = HomeSettings;
