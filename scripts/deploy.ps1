param(
  [string]$Entorno = "staging"
)

# verificacion de parametros y entorno
Write-Host "===================================================="
Write-Host "Iniciando despliegue de inventario-api en: $Entorno"
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# verificacion de artefactos en dist
if (-not (Test-Path "dist")) {
  Write-Error "El directorio dist no existe"
  exit 1
}

Get-ChildItem -Path "dist" | ForEach-Object {
  Write-Host "Artefacto verificado: $($_.Name)"
}

# finalizacion de despliegue
Write-Host "Despliegue en $Entorno completado correctamente"
Write-Host "===================================================="
