# Script de prueba simple para facturas con PDF

Write-Host "=== PRUEBA DE SISTEMA DE FACTURAS CON PDF ===" -ForegroundColor Cyan

# 1. Health Check
Write-Host "1. Health check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:5000/api/health"
Write-Host "   OK: $($health.status)" -ForegroundColor Green

# 2. Login
Write-Host "2. Login..." -ForegroundColor Yellow
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
Write-Host "   OK: Token obtenido" -ForegroundColor Green

# 3. Obtener facturas
Write-Host "3. Obteniendo facturas..." -ForegroundColor Yellow
$headers = @{ "Authorization" = "Bearer $token" }

$invoices = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/invoices/my-invoices" `
  -Headers $headers

Write-Host "   OK: $($invoices.invoices.Count) factura(s) encontrada(s)" -ForegroundColor Green

if ($invoices.invoices.Count -gt 0) {
  foreach ($inv in $invoices.invoices) {
    Write-Host "   - $($inv.invoiceNumber) | $($inv.total) | $($inv.status)"
  }
}

# 4. Probar PDF si hay facturas
if ($invoices.invoices.Count -gt 0) {
  Write-Host "4. Generando PDF..." -ForegroundColor Yellow
  $testId = $invoices.invoices[0].id
  $invoiceNum = $invoices.invoices[0].invoiceNumber
  $pdfFile = "test_$invoiceNum.pdf"
  
  try {
    Invoke-WebRequest `
      -Uri "http://localhost:5000/api/invoices/$testId/pdf" `
      -Headers $headers `
      -OutFile $pdfFile
    
    $size = (Get-Item $pdfFile).Length
    Write-Host "   OK: PDF generado - $size bytes" -ForegroundColor Green
    
    $open = Read-Host "Abrir PDF? (S/N)"
    if ($open -eq "S") {
      Start-Process $pdfFile
    }
  } catch {
    Write-Host "   Error: $_" -ForegroundColor Red
  }
} else {
  Write-Host "4. Sin facturas para PDF" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Prueba completada" -ForegroundColor Cyan
