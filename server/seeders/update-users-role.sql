-- Actualizar usuarios para asignar roleId
UPDATE "Users" 
SET "roleId" = (SELECT id FROM "Roles" WHERE name = 'admin') 
WHERE role = 'admin';
