-- Create Settings table for site configuration
CREATE TABLE IF NOT EXISTS "Settings" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  "displayName" VARCHAR(255),
  description TEXT,
  type VARCHAR(50) DEFAULT 'text',
  category VARCHAR(100) DEFAULT 'general',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert initial settings
INSERT INTO "Settings" (key, value, "displayName", description, type, category) VALUES
('site_name', 'E-Commerce', 'Nombre del Sitio', 'Nombre de la tienda', 'text', 'general'),
('site_logo', '', 'Logo del Sitio', 'URL del logo (dejar vacío para usar el nombre)', 'image', 'general'),
('site_description', 'Tu tienda online de confianza', 'Descripción', 'Descripción de la tienda', 'textarea', 'general'),
('site_email', 'info@ecommerce.com', 'Email de Contacto', 'Email principal de contacto', 'email', 'general'),
('site_phone', '', 'Teléfono', 'Teléfono de contacto', 'text', 'general')
ON CONFLICT (key) DO NOTHING;
