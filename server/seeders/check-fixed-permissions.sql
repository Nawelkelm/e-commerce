SELECT name, "displayName", description 
FROM "Permissions" 
WHERE category IN ('categories', 'orders', 'settings')
ORDER BY name;
