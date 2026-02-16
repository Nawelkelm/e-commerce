SELECT COUNT(*) as total 
FROM "RolePermissions" 
WHERE "roleId" = (SELECT id FROM "Roles" WHERE name = 'admin');
