-- Crear un cupón privado (no público) para probar el filtro
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
  'PRIVADO100',
  'Cupón exclusivo para clientes VIP - $100 de descuento',
  'fixed',
  100.00,
  500.00,
  true,
  false, -- Este cupón NO es público
  NOW(),
  NOW() + INTERVAL '30 days',
  0,
  1,
  false,
  false,
  NOW(),
  NOW()
);

-- Verificar los cupones públicos vs privados
SELECT 
  id, 
  code, 
  description, 
  "isActive", 
  "isPublic",
  CASE 
    WHEN "isPublic" = true THEN 'Se mostrará en home'
    ELSE 'Solo disponible por enlace directo'
  END as visibilidad
FROM "Coupons"
ORDER BY "createdAt" DESC;
