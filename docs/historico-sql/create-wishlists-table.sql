-- Create Wishlists table
CREATE TABLE IF NOT EXISTS "Wishlists" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Products"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "productId")
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "wishlists_user_id" ON "Wishlists"("userId");
CREATE INDEX IF NOT EXISTS "wishlists_product_id" ON "Wishlists"("productId");
CREATE INDEX IF NOT EXISTS "wishlists_created_at" ON "Wishlists"("createdAt");

-- Add comment
COMMENT ON TABLE "Wishlists" IS 'User wishlists/favorites - tracks products users want to buy later';
