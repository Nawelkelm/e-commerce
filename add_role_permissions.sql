-- Add roles and permissions management permissions
INSERT INTO "Permissions" (id, name, "displayName", resource, action, description, category, "createdAt", "updatedAt") VALUES 
(gen_random_uuid(), 'roles.read', 'Ver Roles', 'roles', 'read', 'View roles', 'general', NOW(), NOW()),
(gen_random_uuid(), 'roles.create', 'Crear Roles', 'roles', 'create', 'Create roles', 'general', NOW(), NOW()),
(gen_random_uuid(), 'roles.update', 'Actualizar Roles', 'roles', 'update', 'Update roles', 'general', NOW(), NOW()),
(gen_random_uuid(), 'roles.delete', 'Eliminar Roles', 'roles', 'delete', 'Delete roles', 'general', NOW(), NOW()),
(gen_random_uuid(), 'permissions.read', 'Ver Permisos', 'permissions', 'read', 'View permissions', 'general', NOW(), NOW()),
(gen_random_uuid(), 'permissions.create', 'Crear Permisos', 'permissions', 'create', 'Create permissions', 'general', NOW(), NOW()),
(gen_random_uuid(), 'permissions.update', 'Actualizar Permisos', 'permissions', 'update', 'Update permissions', 'general', NOW(), NOW()),
(gen_random_uuid(), 'permissions.delete', 'Eliminar Permisos', 'permissions', 'delete', 'Delete permissions', 'general', NOW(), NOW());
