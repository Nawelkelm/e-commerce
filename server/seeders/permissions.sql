-- Insertar permisos para usuarios
INSERT INTO "Permissions" (id, name, resource, action, "displayName", description, category, "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'users.read', 'users', 'read', 'Ver Usuarios', 'Permite ver la lista de usuarios', 'users', NOW(), NOW()),
(gen_random_uuid(), 'users.create', 'users', 'create', 'Crear Usuarios', 'Permite crear nuevos usuarios', 'users', NOW(), NOW()),
(gen_random_uuid(), 'users.update', 'users', 'update', 'Editar Usuarios', 'Permite editar usuarios existentes', 'users', NOW(), NOW()),
(gen_random_uuid(), 'users.delete', 'users', 'delete', 'Eliminar Usuarios', 'Permite eliminar usuarios', 'users', NOW(), NOW()),

-- Insertar permisos para productos
(gen_random_uuid(), 'products.read', 'products', 'read', 'Ver Productos', 'Permite ver la lista de productos', 'products', NOW(), NOW()),
(gen_random_uuid(), 'products.create', 'products', 'create', 'Crear Productos', 'Permite crear nuevos productos', 'products', NOW(), NOW()),
(gen_random_uuid(), 'products.update', 'products', 'update', 'Editar Productos', 'Permite editar productos existentes', 'products', NOW(), NOW()),
(gen_random_uuid(), 'products.delete', 'products', 'delete', 'Eliminar Productos', 'Permite eliminar productos', 'products', NOW(), NOW()),

-- Insertar permisos para órdenes
(gen_random_uuid(), 'orders.read', 'orders', 'read', 'Ver Órdenes', 'Permite ver órdenes', 'orders', NOW(), NOW()),
(gen_random_uuid(), 'orders.update', 'orders', 'update', 'Editar Órdenes', 'Permite editar estado de órdenes', 'orders', NOW(), NOW()),
(gen_random_uuid(), 'orders.delete', 'orders', 'delete', 'Eliminar Órdenes', 'Permite eliminar órdenes', 'orders', NOW(), NOW()),

-- Insertar permisos para categorías
(gen_random_uuid(), 'categories.read', 'categories', 'read', 'Ver Categorías', 'Permite ver categorías', 'categories', NOW(), NOW()),
(gen_random_uuid(), 'categories.create', 'categories', 'create', 'Crear Categorías', 'Permite crear categorías', 'categories', NOW(), NOW()),
(gen_random_uuid(), 'categories.update', 'categories', 'update', 'Editar Categorías', 'Permite editar categorías', 'categories', NOW(), NOW()),
(gen_random_uuid(), 'categories.delete', 'categories', 'delete', 'Eliminar Categorías', 'Permite eliminar categorías', 'categories', NOW(), NOW()),

-- Insertar permisos para configuración
(gen_random_uuid(), 'settings.read', 'settings', 'read', 'Ver Configuración', 'Permite ver configuración del sitio', 'settings', NOW(), NOW()),
(gen_random_uuid(), 'settings.update', 'settings', 'update', 'Editar Configuración', 'Permite editar configuración del sitio', 'settings', NOW(), NOW());

-- Crear o actualizar rol admin
DO $$
DECLARE
    admin_role_id uuid;
    perm record;
BEGIN
    -- Obtener o crear el rol admin
    SELECT id INTO admin_role_id FROM "Roles" WHERE name = 'admin';
    
    IF admin_role_id IS NULL THEN
        INSERT INTO "Roles" (id, name, "displayName", description, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'admin', 'Administrador', 'Acceso completo al sistema', NOW(), NOW())
        RETURNING id INTO admin_role_id;
    END IF;

    -- Asignar todos los permisos al rol admin
    FOR perm IN SELECT id FROM "Permissions"
    LOOP
        INSERT INTO "RolePermissions" (id, "roleId", "permissionId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), admin_role_id, perm.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
