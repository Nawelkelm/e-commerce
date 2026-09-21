ALTER TABLE "HomeSettings" 
ADD COLUMN IF NOT EXISTS "metaTitle" VARCHAR(200) DEFAULT 'E-Commerce - Tu tienda online de confianza',
ADD COLUMN IF NOT EXISTS "metaDescription" TEXT DEFAULT 'Encuentra los mejores productos al mejor precio. Envío gratis, compra segura y soporte 24/7.',
ADD COLUMN IF NOT EXISTS "metaKeywords" TEXT DEFAULT 'tienda online, ecommerce, productos, ofertas, envío gratis';
