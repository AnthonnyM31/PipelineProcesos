#!/usr/bin/env bash
# Script de Ejecución Selectiva para CircleCI
# Analiza los archivos modificados con git diff respecto a origin/main.
# Si solo hay cambios en documentacion (.md o carpeta docs/), detiene el job
# de forma exitosa usando 'circleci-agent step halt' para ahorrar tiempo y computo.

set -eo pipefail

RAMA="${CIRCLE_BRANCH:-main}"

echo "===================================================="
echo "Evaluando estrategia de Ejecucion Selectiva"
echo "Rama actual: ${RAMA}"
echo "===================================================="

# En rama main siempre se ejecutan todas las validaciones
if [ "${RAMA}" = "main" ]; then
  echo "Rama 'main' detectada: Ejecucion obligatoria de todas las etapas."
  exit 0
fi

# Asegurar referencias de git para comparacion
git fetch origin main --depth=50 2>/dev/null || true

# Obtener lista de archivos modificados respecto a main
DIFF_FILES=$(git diff --name-only origin/main...HEAD 2>/dev/null || git diff --name-only HEAD~1 2>/dev/null || true)

if [ -z "${DIFF_FILES}" ]; then
  echo "No se detectaron diferencias con git diff; continuando con la ejecucion por seguridad."
  exit 0
fi

echo "Archivos modificados detectados:"
echo "${DIFF_FILES}"

HAY_CAMBIOS_CODIGO=false

while IFS= read -r file; do
  [ -z "${file}" ] && continue
  
  # Si el archivo NO es un archivo markdown (.md) y NO está dentro de docs/
  if [[ ! "${file}" =~ \.md$ ]] && [[ ! "${file}" =~ ^docs/ ]]; then
    HAY_CAMBIOS_CODIGO=true
    echo "-> Cambio critico de codigo detectado en: ${file}"
    break
  fi
done <<< "${DIFF_FILES}"

if [ "${HAY_CAMBIOS_CODIGO}" = false ]; then
  echo "----------------------------------------------------"
  echo "OPTIMIZACION APLICADA: Solo se detectaron cambios en documentacion (.md / docs)."
  echo "Omitiendo etapas de calidad para ahorrar recursos de computo en CircleCI."
  echo "----------------------------------------------------"
  
  # Si el comando circleci-agent está disponible (entorno CircleCI), detener el job con éxito
  if command -v circleci-agent >/dev/null 2>&1; then
    circleci-agent step halt
  fi
  exit 10
else
  echo "Se detectaron cambios en codigo fuente o configuracion. Continuando ejecucion normal."
  exit 0
fi

