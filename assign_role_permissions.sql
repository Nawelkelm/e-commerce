-- Assign role and permission management permissions to super_admin
INSERT INTO "RolePermissions" (id, "roleId", "permissionId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid() as id,
  '1ad56286-fd97-49c9-aa69-c7682c8e46cb'::uuid as "roleId",
  id as "permissionId",
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "Permissions"
WHERE resource IN ('roles', 'permissions')
ON CONFLICT DO NOTHING;
