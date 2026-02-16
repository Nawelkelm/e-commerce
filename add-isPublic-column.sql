ALTER TABLE "Coupons" 
ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT true NOT NULL;

-- Actualizar todos los cupones existentes como públicos
UPDATE "Coupons" SET "isPublic" = true WHERE "isPublic" IS NULL;
