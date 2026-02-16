-- Crear tabla Invoices
CREATE TABLE IF NOT EXISTS "Invoices" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoiceNumber" VARCHAR(255) UNIQUE NOT NULL,
  "orderId" UUID REFERENCES "Orders"(id) ON DELETE RESTRICT,
  "userId" UUID REFERENCES "Users"(id) ON DELETE RESTRICT,
  "customerName" VARCHAR(255) NOT NULL,
  "customerEmail" VARCHAR(255) NOT NULL,
  "customerPhone" VARCHAR(255),
  "customerAddress" TEXT,
  "customerTaxId" VARCHAR(255),
  subtotal DECIMAL(10,2) DEFAULT 0 NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0 NOT NULL,
  "taxRate" DECIMAL(5,2) DEFAULT 16.00 NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0 NOT NULL,
  shipping DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  items JSONB NOT NULL,
  "paymentMethod" VARCHAR(255) NOT NULL,
  "paymentId" VARCHAR(255),
  "paymentDate" TIMESTAMP DEFAULT NOW() NOT NULL,
  status VARCHAR(50) DEFAULT 'issued' NOT NULL,
  "issueDate" TIMESTAMP DEFAULT NOW() NOT NULL,
  "dueDate" TIMESTAMP,
  notes TEXT,
  "customerNotes" TEXT,
  "pdfUrl" VARCHAR(255),
  "cancelledAt" TIMESTAMP,
  "cancelledBy" UUID REFERENCES "Users"(id),
  "cancellationReason" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Crear índices
CREATE INDEX IF NOT EXISTS "invoices_invoice_number" ON "Invoices"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "invoices_order_id" ON "Invoices"("orderId");
CREATE INDEX IF NOT EXISTS "invoices_user_id" ON "Invoices"("userId");
CREATE INDEX IF NOT EXISTS "invoices_status" ON "Invoices"(status);
CREATE INDEX IF NOT EXISTS "invoices_issue_date" ON "Invoices"("issueDate");
CREATE INDEX IF NOT EXISTS "invoices_created_at" ON "Invoices"("createdAt");

-- Agregar columnas a Orders si no existen
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='Orders' AND column_name='paidAt') THEN
    ALTER TABLE "Orders" ADD COLUMN "paidAt" TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='Orders' AND column_name='invoiceId') THEN
    ALTER TABLE "Orders" ADD COLUMN "invoiceId" UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='Orders' AND column_name='invoiceNumber') THEN
    ALTER TABLE "Orders" ADD COLUMN "invoiceNumber" VARCHAR(255);
  END IF;
END $$;

-- Crear índice en invoiceNumber de Orders
CREATE INDEX IF NOT EXISTS "orders_invoice_number" ON "Orders"("invoiceNumber");

-- Verificar creación
SELECT 'Tabla Invoices creada exitosamente' as resultado;
