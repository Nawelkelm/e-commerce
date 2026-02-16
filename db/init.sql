-- Script de inicialización de la base de datos
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear índices adicionales para mejorar performance
-- Estos se crearán después de que Sequelize cree las tablas

-- Función para crear índices después de la inicialización
CREATE OR REPLACE FUNCTION create_performance_indexes() 
RETURNS void AS $$
BEGIN
    -- Índices para productos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Products') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search 
        ON "Products" USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price_range 
        ON "Products" (price, "isActive") WHERE "isActive" = true;
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_active 
        ON "Products" ("categoryId", "isActive") WHERE "isActive" = true;
    END IF;

    -- Índices para pedidos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Orders') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_date 
        ON "Orders" ("userId", "createdAt");
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_date 
        ON "Orders" (status, "createdAt");
    END IF;

    -- Índices para carrito
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'CartItems') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cartitems_cart_product 
        ON "CartItems" ("cartId", "productId");
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Crear función para limpiar carritos expirados
CREATE OR REPLACE FUNCTION cleanup_expired_carts() 
RETURNS void AS $$
BEGIN
    DELETE FROM "CartItems" 
    WHERE "cartId" IN (
        SELECT id FROM "Carts" 
        WHERE "expiresAt" < NOW() AND "userId" IS NULL
    );
    
    DELETE FROM "Carts" 
    WHERE "expiresAt" < NOW() AND "userId" IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Programar limpieza automática (requiere pg_cron extension en producción)
-- SELECT cron.schedule('cleanup-carts', '0 2 * * *', 'SELECT cleanup_expired_carts();');