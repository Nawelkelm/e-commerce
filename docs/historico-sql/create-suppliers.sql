-- Migration: Create suppliers table and add supplier reference to products
-- Created: 2025-10-24

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'México',
  postal_code VARCHAR(20),
  tax_id VARCHAR(50),
  website VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add supplier_id column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL;

-- Add is_own_production column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_own_production BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);

-- Insert default "Producción Propia" supplier
INSERT INTO suppliers (name, contact_person, is_active, notes)
VALUES ('Producción Propia', 'Interno', true, 'Productos fabricados internamente')
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON TABLE suppliers IS 'Tabla de proveedores para gestión de productos';
COMMENT ON COLUMN products.supplier_id IS 'Referencia al proveedor del producto';
COMMENT ON COLUMN products.is_own_production IS 'Indica si el producto es de fabricación propia';
