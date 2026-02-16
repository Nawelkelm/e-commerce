-- Insertar factura de prueba directamente
INSERT INTO "Invoices" (
  id,
  "invoiceNumber",
  "orderId",
  "userId",
  "customerName",
  "customerEmail",
  "subtotal",
  "tax",
  "total",
  "items",
  "paymentMethod",
  "status"
) VALUES (
  gen_random_uuid(),
  'INV-2025-00001',
  'db30c1f2-892a-44e3-bd27-f19af5dbb122',
  'db30c1f2-892a-44e3-bd27-f19af5dbb122',
  'Admin User',
  'admin@ecommerce.com',
  1000.00,
  160.00,
  1160.00,
  '[{"productId": "test-001", "name": "Producto de Prueba", "sku": "TEST-001", "quantity": 1, "unitPrice": 1000.00, "subtotal": 1000.00}]'::jsonb,
  'MercadoPago',
  'paid'
);

-- Verificar
SELECT "invoiceNumber", "customerName", total, status, "createdAt"
FROM "Invoices";
