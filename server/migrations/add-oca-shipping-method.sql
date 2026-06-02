-- Insertar método de envío OCA (carrier dinámico)
-- Ejecutar con: psql $DATABASE_URL -f server/migrations/add-oca-shipping-method.sql

INSERT INTO "ShippingMethods" (
  id,
  name,
  code,
  type,
  carrier,
  "isActive",
  description,
  price,
  "isFree",
  "freeFromAmount",
  "estimatedDays",
  zones,
  restrictions,
  "requiresAddress",
  "pickupAddress",
  icon,
  "displayOrder",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'OCA E-Pak',
  'oca_epak',
  'carrier',
  'OCA',
  true,
  'Envío a domicilio por OCA. El precio se calcula según tu código postal.',
  NULL,
  false,
  NULL,
  7,
  '[]'::json,
  '{}'::json,
  true,
  NULL,
  'truck',
  10,
  NOW(),
  NOW()
)
ON CONFLICT (code) DO UPDATE SET
  "isActive" = true,
  "updatedAt" = NOW();
