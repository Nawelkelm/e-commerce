-- Check Users and Roles
SELECT u.email, u."firstName", u."lastName", u."isActive", u."emailVerified", r.name as role 
FROM "Users" u 
LEFT JOIN "Roles" r ON u."roleId" = r.id 
LIMIT 5;

-- Check Products
SELECT COUNT(*) as total_products, 
       COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_products 
FROM "Products";

-- Check Categories
SELECT name, slug, "isActive" 
FROM "Categories" 
ORDER BY "sortOrder" 
LIMIT 10;

-- Check Orders
SELECT COUNT(*) as total_orders,
       COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
       COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
FROM "Orders";

-- Check HomeSettings
SELECT "footerEnabled", "footerAboutTitle", "heroEnabled", "heroTitle" 
FROM "HomeSettings" 
LIMIT 1;

-- Check Permissions
SELECT COUNT(*) as total_permissions 
FROM "Permissions";

-- Check RolePermissions
SELECT r.name as role, COUNT(rp.id) as permissions_count
FROM "Roles" r
LEFT JOIN "RolePermissions" rp ON r.id = rp."roleId"
GROUP BY r.name;
