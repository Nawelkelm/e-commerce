-- Insertar métodos de envío OCA (carrier dinámico)
-- Ejecutar con: psql $DATABASE_URL -f server/migrations/add-oca-shipping-method.sql

-- OCA Puerta a Puerta (operativa 467730)
INSERT INTO "ShippingMethods" (
  id, name, code, type, carrier, "isActive", description,
  price, "isFree", "freeFromAmount", "estimatedDays",
  zones, restrictions, "requiresAddress", "pickupAddress",
  icon, "displayOrder", "createdAt", "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'OCA E-Pak - Puerta a Puerta',
  'oca_epak_p2p',
  'carrier',
  'OCA',
  true,
  'Envío a domicilio por OCA. El precio se calcula según tu código postal.',
  NULL, false, NULL, 7,
  '[]'::json,
  '{"operativaKey": "p2p"}'::json,
  true, NULL, 'truck', 10, NOW(), NOW()
)
ON CONFLICT (code) DO UPDATE SET
  "isActive" = true,
  restrictions = '{"operativaKey": "p2p"}'::json,
  "updatedAt" = NOW();

-- OCA Puerta a Sucursal (operativa 467731) - opción más económica
INSERT INTO "ShippingMethods" (
  id, name, code, type, carrier, "isActive", description,
  price, "isFree", "freeFromAmount", "estimatedDays",
  zones, restrictions, "requiresAddress", "pickupAddress",
  icon, "displayOrder", "createdAt", "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'OCA E-Pak - Retiro en Sucursal',
  'oca_epak_p2s',
  'carrier',
  'OCA',
  true,
  'Enviamos a la sucursal OCA más cercana a tu código postal. Generalmente más económico.',
  NULL, false, NULL, 5,
  '[]'::json,
  '{"operativaKey": "p2s"}'::json,
  true, NULL, 'building-storefront', 11, NOW(), NOW()
)
ON CONFLICT (code) DO UPDATE SET
  "isActive" = true,
  restrictions = '{"operativaKey": "p2s"}'::json,
  "updatedAt" = NOW();

-- Eliminar entrada genérica anterior si existe
DELETE FROM "ShippingMethods" WHERE code = 'oca_epak';
