ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "categoryIcons" JSONB DEFAULT '{}'::jsonb;
