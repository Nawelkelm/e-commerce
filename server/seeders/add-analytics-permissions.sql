-- Insertar permisos para analytics
INSERT INTO "Permissions" (id, name, resource, action, "displayName", description, category, "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'analytics.read', 'analytics', 'read', 'Ver Analytics', 'Permite ver estadísticas y análisis', 'analytics', NOW(), NOW()),
(gen_random_uuid(), 'analytics.sales', 'analytics', 'sales', 'Ver Ventas', 'Permite ver análisis de ventas', 'analytics', NOW(), NOW()),
(gen_random_uuid(), 'dashboard.read', 'dashboard', 'read', 'Ver Dashboard', 'Permite ver el dashboard principal', 'dashboard', NOW(), NOW());

-- Asignar los nuevos permisos al rol admin
DO $$
DECLARE
    admin_role_id uuid;
    perm record;
BEGIN
    SELECT id INTO admin_role_id FROM "Roles" WHERE name = 'admin';
    
    FOR perm IN SELECT id FROM "Permissions" WHERE name IN ('analytics.read', 'analytics.sales', 'dashboard.read')
    LOOP
        INSERT INTO "RolePermissions" (id, "roleId", "permissionId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), admin_role_id, perm.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
    