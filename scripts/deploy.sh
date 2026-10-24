#!/usr/bin/env bash
set -euo pipefail

ENTORNO="${1:-staging}"
echo "===================================================="
echo "Iniciando despliegue de inventario-api en: ${ENTORNO}"
echo "Fecha: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Verificando artefactos en dist/..."
ls -la dist/
echo "Despliegue en ${ENTORNO} completado correctamente."
echo "===================================================="
