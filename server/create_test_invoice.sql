-- Crear una factura de prueba
INSERT INTO "Invoices" (
  "invoiceNumber",
  "orderId",
  "userId",
  "customerName",
  "customerEmail",
  "subtotal",
  "tax",
  "taxRate",
  "discount",
  "shipping",
  "total",
  "items",
  "paymentMethod",
  "paymentId",
  "status"
) 
SELECT 
  'INV-2025-00001',
  o.id,
  o."userId",
  u."firstName" || ' ' || u."lastName",
  u.email,
  o.subtotal,
  o."taxAmount",
  16.00,
  o."discountAmount",
  o."shippingAmount",
  o.total,
  '[{"productId": "test", "name": "Producto de prueba", "quantity": 1, "unitPrice": 1000, "subtotal": 1000}]'::jsonb,
  'Test',
  'TEST-001',
  'issued'
FROM "Orders" o
JOIN "Users" u ON u.id = o."userId"
LIMIT 1;

-- Verificar
SELECT "invoiceNumber", "customerName", "customerEmail", total, status
FROM "Invoices";
