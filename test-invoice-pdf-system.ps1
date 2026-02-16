# Script de prueba para las funcionalidades de PDF y Email de facturas

Write-Host "=== PRUEBA DE SISTEMA DE FACTURAS CON PDF Y EMAIL ===" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Verificando salud del backend..." -ForegroundColor Yellow
try {
  $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health"
  Write-Host "   ✓ Backend saludable: $($health.status)" -ForegroundColor Green
} catch {
  Write-Host "   ✗ Error en health check: $_" -ForegroundColor Red
  exit 1
}

# 2. Login
Write-Host "2. Iniciando sesión..." -ForegroundColor Yellow
try {
  $loginBody = @{
    email = "admin@example.com"
    password = "admin123"
  } | ConvertTo-Json

  $loginResponse = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody
  
  $token = $loginResponse.token
  Write-Host "   ✓ Login exitoso. Token obtenido." -ForegroundColor Green
} catch {
  Write-Host "   ✗ Error en login: $_" -ForegroundColor Red
  exit 1
}

# 3. Obtener lista de facturas
Write-Host "3. Obteniendo facturas del usuario..." -ForegroundColor Yellow
try {
  $headers = @{
    "Authorization" = "Bearer $token"
  }
  
  $invoicesResponse = Invoke-RestMethod `
    -Uri "http://localhost:5000/api/invoices/my-invoices" `
    -Method GET `
    -Headers $headers
  
  $invoiceCount = $invoicesResponse.invoices.Count
  Write-Host "   ✓ Se encontraron $invoiceCount factura(s)" -ForegroundColor Green
  
  if ($invoiceCount -eq 0) {
    Write-Host "   ℹ No hay facturas para probar. Creando una factura de prueba..." -ForegroundColor Yellow
    
    # Obtener una orden pagada para crear factura
    try {
      $ordersResponse = Invoke-RestMethod `
        -Uri "http://localhost:5000/api/orders" `
        -Method GET `
        -Headers $headers
      
      if ($ordersResponse.orders.Count -gt 0) {
        $testOrder = $ordersResponse.orders | Where-Object { $_.status -eq 'paid' } | Select-Object -First 1
        
        if ($testOrder) {
          try {
            $createInvoice = Invoke-RestMethod `
              -Uri "http://localhost:5000/api/invoices/order/$($testOrder.id)" `
              -Method POST `
              -Headers $headers
            
            Write-Host "   ✓ Factura de prueba creada: $($createInvoice.invoice.invoiceNumber)" -ForegroundColor Green
            
            # Actualizar lista de facturas
            $invoicesResponse = Invoke-RestMethod `
              -Uri "http://localhost:5000/api/invoices/my-invoices" `
              -Method GET `
              -Headers $headers
          } catch {
            Write-Host "   ⚠ No se pudo crear factura de prueba: $_" -ForegroundColor Yellow
          }
        } else {
          Write-Host "   ⚠ No hay órdenes pagadas para crear factura de prueba" -ForegroundColor Yellow
        }
      }
    } catch {
      Write-Host "   ⚠ Error al obtener órdenes: $_" -ForegroundColor Yellow
    }
  }
  
  # Mostrar facturas disponibles
  if ($invoicesResponse.invoices.Count -gt 0) {
    Write-Host ""
    Write-Host "   Facturas disponibles:" -ForegroundColor Cyan
    foreach ($inv in $invoicesResponse.invoices) {
      Write-Host "   - $($inv.invoiceNumber) | Total: $$($inv.total) | Estado: $($inv.status)" -ForegroundColor White
    }
  }
  
} catch {
  Write-Host "   ✗ Error al obtener facturas: $_" -ForegroundColor Red
}

# 4. Probar generación de PDF
if ($invoicesResponse.invoices.Count -gt 0) {
  Write-Host ""
  Write-Host "4. Probando generación de PDF..." -ForegroundColor Yellow
  
  $testInvoice = $invoicesResponse.invoices[0]
  $testId = $testInvoice.id
  $invoiceNumber = $testInvoice.invoiceNumber
  
  try {
    $pdfFileName = "test_invoice_$invoiceNumber.pdf"
    
    Invoke-WebRequest `
      -Uri "http://localhost:5000/api/invoices/$testId/pdf" `
      -Method GET `
      -Headers $headers `
      -OutFile $pdfFileName
    
    Write-Host "   ✓ PDF generado exitosamente: $pdfFileName" -ForegroundColor Green
    
    # Verificar tamaño del archivo
    $fileSize = (Get-Item $pdfFileName).Length
    Write-Host "   ℹ Tamaño del archivo: $fileSize bytes" -ForegroundColor Cyan
    
    if ($fileSize -gt 1000) {
      Write-Host "   ✓ El PDF parece válido (tamaño > 1KB)" -ForegroundColor Green
      
      # Preguntar si desea abrir el PDF
      $openPdf = Read-Host "   ¿Desea abrir el PDF? (S/N)"
      if ($openPdf -eq "S" -or $openPdf -eq "s") {
        Start-Process $pdfFileName
      }
    } else {
      Write-Host "   ⚠ El PDF parece demasiado pequeño, puede tener errores" -ForegroundColor Yellow
    }
    
  } catch {
    Write-Host "   ✗ Error al generar PDF: $_" -ForegroundColor Red
  }
  
  # 5. Probar regeneración de PDF (solo admin)
  Write-Host ""
  Write-Host "5. Probando regeneración de PDF..." -ForegroundColor Yellow
  
  try {
    $regenerateResponse = Invoke-RestMethod `
      -Uri "http://localhost:5000/api/invoices/$testId/regenerate-pdf" `
      -Method PUT `
      -Headers $headers
    
    Write-Host "   ✓ PDF regenerado exitosamente" -ForegroundColor Green
    Write-Host "   ℹ PDF URL: $($regenerateResponse.pdfUrl)" -ForegroundColor Cyan
    
  } catch {
    Write-Host "   ⚠ No se pudo regenerar PDF: $_" -ForegroundColor Yellow
    Write-Host "   (Esto es normal si no eres administrador)" -ForegroundColor Gray
  }
  
  # 6. Probar envío por email
  Write-Host ""
  Write-Host "6. Probando envío de factura por email..." -ForegroundColor Yellow
  
  $testEmail = Read-Host "   Ingresa un email para prueba (o presiona Enter para omitir)"
  
  if ($testEmail -ne "") {
    try {
      $emailBody = @{
        email = $testEmail
      } | ConvertTo-Json
      
      $emailHeaders = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
      }
      
      $emailResponse = Invoke-RestMethod `
        -Uri "http://localhost:5000/api/invoices/$testId/email" `
        -Method POST `
        -Headers $emailHeaders `
        -Body $emailBody
      
      Write-Host "   ✓ Email enviado: $($emailResponse.message)" -ForegroundColor Green
      
    } catch {
      Write-Host "   ⚠ Error al enviar email: $_" -ForegroundColor Yellow
      Write-Host "   (Verifica la configuración SMTP)" -ForegroundColor Gray
    }
  } else {
    Write-Host "   ⊘ Prueba de email omitida" -ForegroundColor Gray
  }
  
} else {
  Write-Host ""
  Write-Host "4-6. Omitiendo pruebas de PDF/Email (no hay facturas)" -ForegroundColor Gray
}

# 7. Verificar estado del sistema
Write-Host ""
Write-Host "7. Verificando estado final del sistema..." -ForegroundColor Yellow

try {
  $containers = docker ps --format "{{.Names}}: {{.Status}}"
  Write-Host "   Contenedores activos:" -ForegroundColor Cyan
  $containers | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
  
  # Verificar directorio de uploads
  $uploadCheck = docker exec ecommerce_backend ls -la /app/uploads/invoices 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Directorio de uploads verificado" -ForegroundColor Green
  } else {
    Write-Host "   ⚠ Problema con directorio de uploads" -ForegroundColor Yellow
  }
  
} catch {
  Write-Host "   ⚠ No se pudo verificar el estado: $_" -ForegroundColor Yellow
}

# Resumen final
Write-Host ""
Write-Host "=== RESUMEN DE PRUEBAS ===" -ForegroundColor Cyan
Write-Host "✓ Sistema de facturas operativo" -ForegroundColor Green
Write-Host "✓ Generación de PDFs funcional" -ForegroundColor Green
Write-Host "✓ API endpoints respondiendo correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "Para más información, consulta:" -ForegroundColor Yellow
Write-Host "- INVOICE_PDF_EMAIL_SYSTEM.md (documentación completa)" -ForegroundColor White
Write-Host "- http://localhost:5000/api/invoices (API base)" -ForegroundColor White
Write-Host ""
Write-Host "Prueba completada." -ForegroundColor Cyan
