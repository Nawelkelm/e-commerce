-- Insertar permisos faltantes para roles y permisos
INSERT INTO "Permissions" (id, name, resource, action, "displayName", description, category, "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'roles.read', 'roles', 'read', 'Ver Roles', 'Permite ver la lista de roles', 'roles', NOW(), NOW()),
(gen_random_uuid(), 'roles.create', 'roles', 'create', 'Crear Roles', 'Permite crear nuevos roles', 'roles', NOW(), NOW()),
(gen_random_uuid(), 'roles.update', 'roles', 'update', 'Editar Roles', 'Permite editar roles existentes', 'roles', NOW(), NOW()),
(gen_random_uuid(), 'roles.delete', 'roles', 'delete', 'Eliminar Roles', 'Permite eliminar roles', 'roles', NOW(), NOW()),

(gen_random_uuid(), 'permissions.read', 'permissions', 'read', 'Ver Permisos', 'Permite ver la lista de permisos', 'permissions', NOW(), NOW()),
(gen_random_uuid(), 'permissions.create', 'permissions', 'create', 'Crear Permisos', 'Permite crear nuevos permisos', 'permissions', NOW(), NOW()),
(gen_random_uuid(), 'permissions.update', 'permissions', 'update', 'Editar Permisos', 'Permite editar permisos existentes', 'permissions', NOW(), NOW()),
(gen_random_uuid(), 'permissions.delete', 'permissions', 'delete', 'Eliminar Permisos', 'Permite eliminar permisos', 'permissions', NOW(), NOW());

-- Asignar los nuevos permisos al rol admin
DO $$
DECLARE
    admin_role_id uuid;
    perm record;
BEGIN
    SELECT id INTO admin_role_id FROM "Roles" WHERE name = 'admin';
    
    FOR perm IN SELECT id FROM "Permissions" WHERE name IN ('roles.read', 'roles.create', 'roles.update', 'roles.delete', 'permissions.read', 'permissions.create', 'permissions.update', 'permissions.delete')
    LOOP
        INSERT INTO "RolePermissions" (id, "roleId", "permissionId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), admin_role_id, perm.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
