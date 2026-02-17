-- Inicialización de roles y permisos para e-commerce

-- 1. Crear rol admin
INSERT INTO "Roles" (id, name, "displayName", description, "isActive", "isSystemRole", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'Administrador',
  'Rol administrador del sistema',
  true,
  true,
  NOW(),
  NOW()
);

-- 2. Asignar el rol admin al usuario admin
UPDATE "Users"
SET "roleId" = '00000000-0000-0000-0000-000000000001'
WHERE email = 'admin@ecommerce.com';

-- 3. Crear permiso total
INSERT INTO "Permissions" (id, name, resource, action, "displayName", description, category, "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'manage_all',
  '*',
  '*',
  'Todos los permisos',
  'Acceso completo a todas las funcionalidades',
  'general',
  NOW(),
  NOW()
);

-- 4. Asignar el permiso al rol admin
INSERT INTO "RolePermissions" (id, "roleId", "permissionId", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
);

-- 5. (Opcional) Verifica que otros usuarios tengan roleId si corresponde
-- UPDATE "Users" SET "roleId" = '<id-del-rol>' WHERE email = '<usuario@dominio.com>';
