-- Agregar campos de dirección de envío y facturación al modelo User
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "shippingAddress" JSONB,
ADD COLUMN IF NOT EXISTS "billingAddress" JSONB;

-- Comentarios explicativos
COMMENT ON COLUMN "Users"."shippingAddress" IS 'Dirección de envío por defecto del usuario en formato JSON';
COMMENT ON COLUMN "Users"."billingAddress" IS 'Dirección de facturación del usuario en formato JSON';
