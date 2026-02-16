-- Add footer configuration fields to HomeSettings table

-- Footer General
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerAboutTitle" VARCHAR(100) DEFAULT 'Sobre Nosotros';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerAboutText" TEXT DEFAULT 'Somos una tienda comprometida con la calidad y satisfacción de nuestros clientes.';

-- Footer Contact
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerContactEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerContactTitle" VARCHAR(100) DEFAULT 'Contacto';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerAddress" TEXT DEFAULT '';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerPhone" VARCHAR(100) DEFAULT '';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerEmail" VARCHAR(100) DEFAULT '';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerSchedule" VARCHAR(200) DEFAULT 'Lun - Vie: 9:00 - 18:00';

-- Social Media
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerSocialEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerSocialTitle" VARCHAR(100) DEFAULT 'Síguenos';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerFacebook" VARCHAR(200) DEFAULT '';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerInstagram" VARCHAR(200) DEFAULT '';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerTwitter" VARCHAR(200) DEFAULT '';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerYoutube" VARCHAR(200) DEFAULT '';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerTiktok" VARCHAR(200) DEFAULT '';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerWhatsapp" VARCHAR(100) DEFAULT '';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerLinkedin" VARCHAR(200) DEFAULT '';

-- Footer Links Columns
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerLinksEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerColumn1Title" VARCHAR(100) DEFAULT 'Información';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerColumn1Links" JSONB DEFAULT '[{"text":"Sobre Nosotros","url":"/sobre-nosotros"},{"text":"Contacto","url":"/contacto"},{"text":"Blog","url":"/blog"}]'::jsonb;
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerColumn2Title" VARCHAR(100) DEFAULT 'Ayuda';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerColumn2Links" JSONB DEFAULT '[{"text":"Preguntas Frecuentes","url":"/faq"},{"text":"Envíos","url":"/envios"},{"text":"Devoluciones","url":"/devoluciones"}]'::jsonb;
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerColumn3Title" VARCHAR(100) DEFAULT 'Legal';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerColumn3Links" JSONB DEFAULT '[{"text":"Términos y Condiciones","url":"/terminos"},{"text":"Política de Privacidad","url":"/privacidad"},{"text":"Política de Cookies","url":"/cookies"}]'::jsonb;

-- Footer Bottom
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerCopyrightText" VARCHAR(200) DEFAULT '© 2025 E-Commerce. Todos los derechos reservados.';
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerShowPaymentMethods" BOOLEAN DEFAULT true;
ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "footerPaymentMethods" JSONB DEFAULT '["visa","mastercard","amex","mercadopago"]'::jsonb;

-- Update existing record if exists
UPDATE "HomeSettings" 
SET 
  "footerEnabled" = COALESCE("footerEnabled", true),
  "footerContactEnabled" = COALESCE("footerContactEnabled", true),
  "footerSocialEnabled" = COALESCE("footerSocialEnabled", true),
  "footerLinksEnabled" = COALESCE("footerLinksEnabled", true),
  "footerShowPaymentMethods" = COALESCE("footerShowPaymentMethods", true)
WHERE id = '00000000-0000-0000-0000-000000000001';
