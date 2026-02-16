SELECT id, "orderNumber", "paymentStatus", total, "userId"
FROM "Orders" 
WHERE "paymentStatus" = 'paid' 
LIMIT 1;
