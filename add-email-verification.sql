-- Add email verification columns to Users table
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "verificationToken" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "verificationTokenExpires" TIMESTAMP WITH TIME ZONE;

-- Update existing users to be verified (optional - comment out if you want existing users to verify too)
UPDATE "Users" SET "emailVerified" = true WHERE "emailVerified" IS NULL OR "emailVerified" = false;
