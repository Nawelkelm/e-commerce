-- Create ENUM types if they don't exist
DO $$ BEGIN
    CREATE TYPE smtp_provider AS ENUM ('gmail', 'outlook', 'sendgrid', 'mailgun', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE smtp_test_status AS ENUM ('pending', 'success', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create SmtpSettings table
CREATE TABLE IF NOT EXISTS "SmtpSettings" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host VARCHAR(255) NOT NULL DEFAULT 'smtp.gmail.com',
  port INTEGER NOT NULL DEFAULT 587,
  secure BOOLEAN NOT NULL DEFAULT false,
  "user" VARCHAR(255),
  password VARCHAR(255),
  "fromName" VARCHAR(255) NOT NULL DEFAULT 'E-Commerce',
  "fromEmail" VARCHAR(255) NOT NULL DEFAULT 'noreply@example.com',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "testEmail" VARCHAR(255),
  provider smtp_provider NOT NULL DEFAULT 'gmail',
  "lastTestedAt" TIMESTAMP,
  "testStatus" smtp_test_status,
  "testError" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO "SmtpSettings" (host, port, secure, "fromName", "fromEmail", "isActive", provider)
VALUES ('smtp.gmail.com', 587, false, 'Mi Tienda', 'noreply@example.com', false, 'gmail')
ON CONFLICT DO NOTHING;
