-- Update permission display names to be more user-friendly
UPDATE "Permissions" SET "displayName" = 'Ver Usuarios' WHERE name = 'users.read';
UPDATE "Permissions" SET "displayName" = 'Crear Usuarios' WHERE name = 'users.create';
UPDATE "Permissions" SET "displayName" = 'Editar Usuarios' WHERE name = 'users.update';
UPDATE "Permissions" SET "displayName" = 'Eliminar Usuarios' WHERE name = 'users.delete';

UPDATE "Permissions" SET "displayName" = 'Ver Productos' WHERE name = 'products.read';
UPDATE "Permissions" SET "displayName" = 'Crear Productos' WHERE name = 'products.create';
UPDATE "Permissions" SET "displayName" = 'Editar Productos' WHERE name = 'products.update';
UPDATE "Permissions" SET "displayName" = 'Eliminar Productos' WHERE name = 'products.delete';

UPDATE "Permissions" SET "displayName" = 'Ver Categorías' WHERE name = 'categories.read';
UPDATE "Permissions" SET "displayName" = 'Crear Categorías' WHERE name = 'categories.create';
UPDATE "Permissions" SET "displayName" = 'Editar Categorías' WHERE name = 'categories.update';
UPDATE "Permissions" SET "displayName" = 'Eliminar Categorías' WHERE name = 'categories.delete';

UPDATE "Permissions" SET "displayName" = 'Ver Pedidos' WHERE name = 'orders.read';
UPDATE "Permissions" SET "displayName" = 'Actualizar Pedidos' WHERE name = 'orders.update';

UPDATE "Permissions" SET "displayName" = 'Ver Roles' WHERE name = 'roles.read';
UPDATE "Permissions" SET "displayName" = 'Crear Roles' WHERE name = 'roles.create';
UPDATE "Permissions" SET "displayName" = 'Editar Roles' WHERE name = 'roles.update';
UPDATE "Permissions" SET "displayName" = 'Eliminar Roles' WHERE name = 'roles.delete';

UPDATE "Permissions" SET "displayName" = 'Ver Permisos' WHERE name = 'permissions.read';
UPDATE "Permissions" SET "displayName" = 'Crear Permisos' WHERE name = 'permissions.create';
UPDATE "Permissions" SET "displayName" = 'Editar Permisos' WHERE name = 'permissions.update';
UPDATE "Permissions" SET "displayName" = 'Eliminar Permisos' WHERE name = 'permissions.delete';
