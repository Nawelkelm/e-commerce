-- Agregar columnas AFIP a la tabla Invoices

-- CAE y fecha de vencimiento
ALTER TABLE "Invoices" ADD COLUMN IF NOT EXISTS cae VARCHAR(14);
ALTER TABLE "Invoices" ADD COLUMN IF NOT EXISTS "caeDueDate" DATE;

-- Tipo de factura (ENUM)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Invoices_invoiceType') THEN
        CREATE TYPE "enum_Invoices_invoiceType" AS ENUM ('A', 'B', 'C', 'E', 'M');
    END IF;
END $$;

ALTER TABLE "Invoices" ADD COLUMN IF NOT EXISTS "invoiceType" "enum_Invoices_invoiceType" DEFAULT 'B' NOT NULL;

-- Punto de venta
ALTER TABLE "Invoices" ADD COLUMN IF NOT EXISTS "pointOfSale" INTEGER DEFAULT 1 NOT NULL;

-- Estado AFIP (ENUM)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Invoices_afipStatus') THEN
        CREATE TYPE "enum_Invoices_afipStatus" AS ENUM ('pending', 'authorized', 'rejected', 'error', 'not_required');
    END IF;
END $$;

ALTER TABLE "Invoices" ADD COLUMN IF NOT EXISTS "afipStatus" "enum_Invoices_afipStatus" DEFAULT 'pending' NOT NULL;

-- Respuesta AFIP
ALTER TABLE "Invoices" ADD COLUMN IF NOT EXISTS "afipResponse" JSONB;

-- Fecha de solicitud AFIP
ALTER TABLE "Invoices" ADD COLUMN IF NOT EXISTS "afipRequestDate" TIMESTAMP WITH TIME ZONE;

-- Categoría tributaria del cliente (ENUM)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Invoices_customerTaxCategory') THEN
        CREATE TYPE "enum_Invoices_customerTaxCategory" AS ENUM (
            'responsable_inscripto',
            'responsable_monotributo',
            'exento',
            'no_responsable',
            'consumidor_final'
        );
    END IF;
END $$;

ALTER TABLE "Invoices" ADD COLUMN IF NOT EXISTS "customerTaxCategory" "enum_Invoices_customerTaxCategory" DEFAULT 'consumidor_final' NOT NULL;

-- CUIT del cliente
ALTER TABLE "Invoices" ADD COLUMN IF NOT EXISTS "customerCuit" VARCHAR(11);

-- Observaciones
ALTER TABLE "Invoices" ADD COLUMN IF NOT EXISTS observations TEXT;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS "invoices_cae_idx" ON "Invoices" (cae);
CREATE INDEX IF NOT EXISTS "invoices_afip_status_idx" ON "Invoices" ("afipStatus");
CREATE INDEX IF NOT EXISTS "invoices_point_type_idx" ON "Invoices" ("pointOfSale", "invoiceType");

-- Comentarios en las columnas
COMMENT ON COLUMN "Invoices".cae IS 'Código de Autorización Electrónica de AFIP';
COMMENT ON COLUMN "Invoices"."caeDueDate" IS 'Fecha de vencimiento del CAE';
COMMENT ON COLUMN "Invoices"."invoiceType" IS 'Tipo de comprobante fiscal: A=Factura A, B=Factura B, C=Factura C, E=Factura E, M=Factura M';
COMMENT ON COLUMN "Invoices"."pointOfSale" IS 'Punto de venta de AFIP';
COMMENT ON COLUMN "Invoices"."afipStatus" IS 'Estado de autorización en AFIP';
COMMENT ON COLUMN "Invoices"."afipResponse" IS 'Respuesta completa de AFIP al solicitar CAE';
COMMENT ON COLUMN "Invoices"."afipRequestDate" IS 'Fecha y hora de solicitud a AFIP';
COMMENT ON COLUMN "Invoices"."customerTaxCategory" IS 'Categoría tributaria del cliente';
COMMENT ON COLUMN "Invoices"."customerCuit" IS 'CUIT/CUIL del cliente (obligatorio para Factura A y B con RI)';
COMMENT ON COLUMN "Invoices".observations IS 'Observaciones o comentarios en la factura';
