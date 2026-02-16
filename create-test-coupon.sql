-- Crear un cupón de prueba PÚBLICO
INSERT INTO "Coupons" (
  "code", 
  "description", 
  "discountType", 
  "discountValue", 
  "minPurchase",
  "isActive",
  "isPublic",
  "startDate",
  "endDate",
  "usedCount",
  "usageLimitPerUser",
  "firstPurchaseOnly",
  "stackable",
  "createdAt",
  "updatedAt"
) VALUES (
  'BIENVENIDA20',
  '20% de descuento en tu primera compra',
  'percentage',
  20.00,
  100.00,
  true,
  true, -- PÚBLICO - se mostrará en home
  NOW(),
  NOW() + INTERVAL '30 days',
  0,
  1,
  true,
  false,
  NOW(),
  NOW()
);

-- Verificar
SELECT id, code, "isActive", "isPublic", 
  CASE WHEN "isPublic" = true THEN '✅ Aparecerá en home' ELSE '❌ No aparecerá en home' END as resultado
FROM "Coupons";
