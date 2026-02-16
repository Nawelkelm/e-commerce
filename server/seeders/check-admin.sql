SELECT u.email, u.role, r.name as role_name, r."displayName" 
FROM "Users" u 
LEFT JOIN "Roles" r ON u."roleId" = r.id 
WHERE u.role = 'admin';
