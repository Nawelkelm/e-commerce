DO $$
DECLARE
    admin_role_id uuid;
    perm record;
BEGIN
    SELECT id INTO admin_role_id FROM "Roles" WHERE name = 'admin';
    
    IF admin_role_id IS NULL THEN
        INSERT INTO "Roles" (id, name, "displayName", description, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'admin', 'Administrador', 'Acceso completo al sistema', NOW(), NOW())
        RETURNING id INTO admin_role_id;
    END IF;

    FOR perm IN SELECT id FROM "Permissions"
    LOOP
        INSERT INTO "RolePermissions" (id, "roleId", "permissionId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), admin_role_id, perm.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
