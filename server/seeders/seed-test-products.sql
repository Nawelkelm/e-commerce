-- Productos de prueba para verificar el flujo de compra
-- Ejecutar con: psql $DATABASE_URL -f server/seeders/seed-test-products.sql

-- 1. Crear categorías de prueba
INSERT INTO "Categories" (id, name, description, slug, "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Impresión Digital', 'Productos de impresión digital de alta calidad', 'impresion-digital', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'Packaging', 'Cajas, bolsas y packaging personalizado', 'packaging', true, 2, NOW(), NOW()),
  (gen_random_uuid(), 'Papelería', 'Tarjetas, folletos y papelería corporativa', 'papeleria', true, 3, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- 2. Crear productos de prueba (usando las categorías recién creadas)
INSERT INTO "Products" (
  id, name, description, "shortDescription", slug, sku,
  price, "salePrice", cost, stock, "lowStockThreshold",
  weight, dimensions, images, attributes,
  "isActive", "isFeatured", "isDigital", "sortOrder",
  "categoryId", tags, "averageRating", "totalReviews",
  "isOwnProduction", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  p.name,
  p.description,
  p.short_desc,
  p.slug,
  p.sku,
  p.price,
  p.sale_price,
  p.cost,
  p.stock,
  5,
  p.weight,
  p.dimensions::json,
  p.images::json,
  p.attributes::json,
  true,
  p.featured,
  false,
  p.sort_order,
  c.id,
  p.tags::json,
  0,
  0,
  true,
  NOW(),
  NOW()
FROM (VALUES
  (
    'Flyer A5 Full Color x100',
    'Flyers A5 (148x210mm) impresos en full color, papel ilustración 150gr. Ideales para promociones, eventos y publicidad.',
    'Flyers A5 full color, papel 150gr, x100 unidades',
    'flyer-a5-full-color-x100',
    'FLYER-A5-100',
    2500.00, 2000.00, 800.00,
    50, 0.3,
    '{"length": 21, "width": 14.8, "height": 1}',
    '[{"url": "https://placehold.co/600x400/4F46E5/white?text=Flyer+A5", "alt": "Flyer A5 Full Color", "isPrimary": true}]',
    '{"material": "Papel ilustración 150gr", "terminacion": "Sin laminado", "medida": "A5 148x210mm"}',
    true, 1, 'impresion-digital',
    '["flyer", "impresion", "publicidad", "a5"]'
  ),
  (
    'Tarjeta Personal x500',
    'Tarjetas personales 9x5cm impresas en full color frente y dorso. Papel ilustración 350gr, bordes rectos. Perfectas para networking y presentaciones profesionales.',
    'Tarjetas personales full color doble faz, papel 350gr, x500',
    'tarjeta-personal-x500',
    'TARJ-PERS-500',
    3800.00, NULL, 1200.00,
    30, 0.2,
    '{"length": 9, "width": 5, "height": 0.5}',
    '[{"url": "https://placehold.co/600x400/7C3AED/white?text=Tarjeta+Personal", "alt": "Tarjeta Personal", "isPrimary": true}]',
    '{"material": "Papel ilustración 350gr", "terminacion": "Sin laminado", "medida": "9x5cm", "impresion": "Doble faz"}',
    false, 2, 'papeleria',
    '["tarjeta", "personal", "negocio", "networking"]'
  ),
  (
    'Banner Lona 1x2m',
    'Banner publicitario en lona vinílica 440gr con impresión full color de alta resolución. Incluye ojetillos metálicos cada 50cm para fácil instalación.',
    'Banner lona 1x2m full color con ojetillos',
    'banner-lona-1x2m',
    'BANNER-1X2',
    8500.00, 7500.00, 2800.00,
    20, 0.8,
    '{"length": 200, "width": 100, "height": 0.5}',
    '[{"url": "https://placehold.co/600x400/059669/white?text=Banner+1x2m", "alt": "Banner Lona 1x2m", "isPrimary": true}]',
    '{"material": "Lona vinílica 440gr", "medida": "1x2 metros", "terminacion": "Con ojetillos"}',
    true, 3, 'impresion-digital',
    '["banner", "lona", "publicidad", "exterior"]'
  ),
  (
    'Caja Kraft Personalizada 20x15x10cm',
    'Cajas de cartón kraft personalizadas con tu logo o diseño. Impresión flexográfica en 1 color. Resistentes y ecológicas. Mínimo 50 unidades.',
    'Caja kraft personalizada con logo, x50 unidades',
    'caja-kraft-personalizada-20x15x10',
    'CAJA-KRAFT-50',
    12000.00, NULL, 4500.00,
    15, 1.5,
    '{"length": 20, "width": 15, "height": 10}',
    '[{"url": "https://placehold.co/600x400/D97706/white?text=Caja+Kraft", "alt": "Caja Kraft Personalizada", "isPrimary": true}]',
    '{"material": "Cartón kraft", "medida": "20x15x10cm", "impresion": "1 color", "cantidad": "x50 unidades"}',
    true, 4, 'packaging',
    '["caja", "kraft", "packaging", "personalizado", "ecologico"]'
  ),
  (
    'Folleto A4 Doble Faz x200',
    'Folletos A4 (210x297mm) impresos en full color frente y dorso. Papel ilustración 120gr. Ideal para menús, catálogos y presentaciones.',
    'Folleto A4 full color doble faz, papel 120gr, x200',
    'folleto-a4-doble-faz-x200',
    'FOLL-A4-200',
    5500.00, 4800.00, 1800.00,
    40, 0.6,
    '{"length": 29.7, "width": 21, "height": 1}',
    '[{"url": "https://placehold.co/600x400/DC2626/white?text=Folleto+A4", "alt": "Folleto A4 Doble Faz", "isPrimary": true}]',
    '{"material": "Papel ilustración 120gr", "medida": "A4 210x297mm", "impresion": "Doble faz"}',
    false, 5, 'papeleria',
    '["folleto", "catalogo", "menu", "a4", "impresion"]'
  )
) AS p(name, description, short_desc, slug, sku, price, sale_price, cost, stock, weight, dimensions, images, attributes, featured, sort_order, cat_slug, tags)
JOIN "Categories" c ON c.slug = p.cat_slug
ON CONFLICT (slug) DO NOTHING;

-- Verificar lo insertado
SELECT name, sku, price, stock FROM "Products" ORDER BY "sortOrder";
