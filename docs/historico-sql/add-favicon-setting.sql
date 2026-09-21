-- Add favicon field to Settings table
INSERT INTO "Settings" (id, key, value, category, "displayName", description, "createdAt", "updatedAt") 
VALUES 
(gen_random_uuid(), 'site_favicon', '', 'general', 'Favicon', 'Icono que aparece en la pestaña del navegador', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
