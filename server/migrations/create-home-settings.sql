-- Crear tabla para configuración del Home personalizable
CREATE TABLE IF NOT EXISTS "HomeSettings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Carrousel (3 slides)
  "carousel" JSONB DEFAULT '[]',
  -- Estructura: [
  --   {
  --     "image": "/uploads/carousel/slide1.jpg",
  --     "title": "Título del slide",
  --     "subtitle": "Subtítulo",
  --     "buttonText": "Ver más",
  --     "buttonLink": "/productos",
  --     "enabled": true
  --   }
  -- ]
  
  -- Hero Section
  "heroTitle" VARCHAR(200) DEFAULT 'Bienvenido a Nuestra Tienda',
  "heroSubtitle" TEXT DEFAULT 'Encuentra los mejores productos al mejor precio',
  "heroCta1Text" VARCHAR(100) DEFAULT 'Ver Productos',
  "heroCta1Link" VARCHAR(200) DEFAULT '/productos',
  "heroCta2Text" VARCHAR(100) DEFAULT 'Ofertas',
  "heroCta2Link" VARCHAR(200) DEFAULT '/productos?ofertas=true',
  
  -- Sección Características
  "featuresEnabled" BOOLEAN DEFAULT true,
  "featuresTitle" VARCHAR(200) DEFAULT '¿Por qué elegirnos?',
  "features" JSONB DEFAULT '[
    {"icon": "truck", "title": "Envío Gratis", "description": "En compras superiores a $10,000"},
    {"icon": "shield", "title": "Compra Segura", "description": "Protegemos tus datos"},
    {"icon": "refresh", "title": "Devoluciones", "description": "30 días para devolver"},
    {"icon": "support", "title": "Soporte 24/7", "description": "Estamos para ayudarte"}
  ]',
  
  -- Sección Categorías Destacadas
  "categoriesEnabled" BOOLEAN DEFAULT true,
  "categoriesTitle" VARCHAR(200) DEFAULT 'Categorías Destacadas',
  "categoryIds" JSONB DEFAULT '[]',
  
  -- Sección Testimonios
  "testimonialsEnabled" BOOLEAN DEFAULT false,
  "testimonialsTitle" VARCHAR(200) DEFAULT 'Lo que dicen nuestros clientes',
  "testimonials" JSONB DEFAULT '[]',
  
  -- Newsletter
  "newsletterEnabled" BOOLEAN DEFAULT true,
  "newsletterTitle" VARCHAR(200) DEFAULT 'Suscríbete a nuestro newsletter',
  "newsletterSubtitle" TEXT DEFAULT 'Recibe ofertas exclusivas y novedades',
  
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto
INSERT INTO "HomeSettings" ("id") 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT ("id") DO NOTHING;

-- Comentarios
COMMENT ON TABLE "HomeSettings" IS 'Configuración personalizable del Home';
COMMENT ON COLUMN "HomeSettings"."carousel" IS 'Array de máximo 3 slides para el carrousel principal';
COMMENT ON COLUMN "HomeSettings"."features" IS 'Array de características/beneficios con icono, título y descripción';
