SELECT id, code, description, "discountType", "discountValue", "isActive", "startDate", "endDate" 
FROM "Coupons" 
ORDER BY "createdAt" DESC 
LIMIT 5;
