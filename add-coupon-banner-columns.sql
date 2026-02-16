ALTER TABLE "HomeSettings" 
ADD COLUMN IF NOT EXISTS "couponBannerEnabled" BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS "couponBannerTitle" VARCHAR(200) DEFAULT '¡Ofertas Especiales!',
ADD COLUMN IF NOT EXISTS "couponBannerSubtitle" VARCHAR(200) DEFAULT 'Aprovecha estos cupones de descuento',
ADD COLUMN IF NOT EXISTS "couponBannerMaxCoupons" INTEGER DEFAULT 3 NOT NULL;
