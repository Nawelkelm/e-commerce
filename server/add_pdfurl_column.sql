-- Agregar columna pdfUrl a la tabla Invoices si no existe

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'Invoices' 
    AND column_name = 'pdfUrl'
  ) THEN
    ALTER TABLE "Invoices" ADD COLUMN "pdfUrl" VARCHAR(255);
    RAISE NOTICE 'Columna pdfUrl agregada exitosamente';
  ELSE
    RAISE NOTICE 'Columna pdfUrl ya existe';
  END IF;
END $$;
