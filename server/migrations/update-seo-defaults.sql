UPDATE "HomeSettings" 
SET "metaTitle" = 'E-Commerce - Tu tienda online de confianza',
    "metaDescription" = 'Encuentra los mejores productos al mejor precio. Envío gratis, compra segura y soporte 24/7.',
    "metaKeywords" = 'tienda online, ecommerce, productos, ofertas, envío gratis'
WHERE "metaTitle" IS NULL OR "metaDescription" IS NULL OR "metaKeywords" IS NULL;
