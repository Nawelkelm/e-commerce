-- Corregir nombres de permisos con acentos correctos
UPDATE "Permissions" SET "displayName" = 'Ver Estadísticas', description = 'Permite ver estadísticas y análisis' WHERE name = 'analytics.read';
UPDATE "Permissions" SET description = 'Permite ver análisis de ventas' WHERE name = 'analytics.sales';
UPDATE "Permissions" SET "displayName" = 'Crear Categorías', description = 'Permite crear categorías' WHERE name = 'categories.create';
UPDATE "Permissions" SET "displayName" = 'Eliminar Categorías', description = 'Permite eliminar categorías' WHERE name = 'categories.delete';
UPDATE "Permissions" SET "displayName" = 'Ver Categorías', description = 'Permite ver categorías' WHERE name = 'categories.read';
UPDATE "Permissions" SET "displayName" = 'Editar Categorías', description = 'Permite editar categorías' WHERE name = 'categories.update';
UPDATE "Permissions" SET "displayName" = 'Eliminar Órdenes', description = 'Permite eliminar órdenes' WHERE name = 'orders.delete';
UPDATE "Permissions" SET "displayName" = 'Ver Órdenes', description = 'Permite ver órdenes' WHERE name = 'orders.read';
UPDATE "Permissions" SET "displayName" = 'Editar Órdenes', description = 'Permite editar estado de órdenes' WHERE name = 'orders.update';
UPDATE "Permissions" SET "displayName" = 'Ver Configuración', description = 'Permite ver configuración del sitio' WHERE name = 'settings.read';
UPDATE "Permissions" SET "displayName" = 'Editar Configuración', description = 'Permite editar configuración del sitio' WHERE name = 'settings.update';
