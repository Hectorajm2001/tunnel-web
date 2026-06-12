param (
    [string]$Message = "Update website"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "1. Subiendo cambios a GitHub..." -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

git add .
git commit -m $Message
git push origin master

if ($LASTEXITCODE -ne 0) {
    Write-Host "Advertencia: Posible error al hacer git push. Continuando de todas formas..." -ForegroundColor Yellow
} else {
    Write-Host "GitHub actualizado exitosamente." -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "2. Compilando aplicacion web (Vite)..." -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en el proceso de compilacion (build). Abortando despliegue." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "3. Desplegando en Cloudflare Pages..." -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

npx wrangler pages deploy dist --project-name polished-field-8469

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al desplegar en Cloudflare." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE COMPLETADO CON EXITO" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
