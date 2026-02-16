-- Eliminar TODOS los cupones de ejemplo
DELETE FROM "Coupons";

-- Verificar que no haya cupones
SELECT COUNT(*) as total_cupones FROM "Coupons";
