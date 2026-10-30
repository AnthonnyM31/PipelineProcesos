#!/usr/bin/env bash
# Script modular de notificaciones para CircleCI
# Soporta webhooks de Discord, Slack y actualización de estados en GitHub API.

set -eo pipefail

TIPO="${1:-info}"       # success | failure | pending | hold | info
MENSAJE="${2:-Notificación de pipeline}"
JOB_NAME="${CIRCLE_JOB:-local-job}"
BUILD_URL="${CIRCLE_BUILD_URL:-https://circleci.com}"
BRANCH="${CIRCLE_BRANCH:-main}"
SHA="${CIRCLE_SHA1:-HEAD}"
REPO_NAME="${CIRCLE_PROJECT_REPONAME:-inventario-api}"
USERNAME="${CIRCLE_PROJECT_USERNAME:-AnthonnyM31}"

echo "===================================================="
echo "Enviando notificación de CircleCI"
echo "Estado:  ${TIPO}"
echo "Job:     ${JOB_NAME}"
echo "Branch:  ${BRANCH}"
echo "Mensaje: ${MENSAJE}"
echo "===================================================="

# Configurar color y título según estado
case "${TIPO}" in
  "success")
    COLOR=3066993   # Verde
    ESTADO_TEXTO="✅ ÉXITO"
    GH_STATE="success"
    ;;
  "failure")
    COLOR=15158332  # Rojo
    ESTADO_TEXTO="❌ FALLO"
    GH_STATE="failure"
    ;;
  "hold"|"pending")
    COLOR=15844367  # Amarillo / Naranja
    ESTADO_TEXTO="⏳ ESPERANDO APROBACIÓN / EN CURSO"
    GH_STATE="pending"
    ;;
  *)
    COLOR=3447003   # Azul
    ESTADO_TEXTO="ℹ️ INFO"
    GH_STATE="pending"
    ;;
esac

# 1. Enviar notificación a Discord / Slack Webhook si la variable DISCORD_WEBHOOK_URL o SLACK_WEBHOOK_URL está definida
WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-${SLACK_WEBHOOK_URL:-}}"

if [ -n "${WEBHOOK_URL}" ]; then
  echo "Enviando notificación a Webhook..."

  # Payload compatible con Discord (y Slack si se usa webhook de Discord)
  if [[ "${WEBHOOK_URL}" =~ discord\.com ]]; then
    JSON_PAYLOAD=$(cat <<EOF
{
  "username": "CircleCI Bot",
  "avatar_url": "https://d3r49iyjzgaps9.cloudfront.net/circleci-icon.png",
  "embeds": [
    {
      "title": "${ESTADO_TEXTO} - Pipeline ${REPO_NAME}",
      "description": "${MENSAJE}",
      "url": "${BUILD_URL}",
      "color": ${COLOR},
      "fields": [
        { "name": "Job", "value": "${JOB_NAME}", "inline": true },
        { "name": "Rama", "value": "${BRANCH}", "inline": true },
        { "name": "Commit", "value": "\`${SHA:0:7}\`", "inline": true }
      ],
      "footer": { "text": "CircleCI CI/CD Pipeline - Procesos de Software" },
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
  ]
}
EOF
)
  else
    # Payload estándar de Slack
    JSON_PAYLOAD=$(cat <<EOF
{
  "text": "${ESTADO_TEXTO} en CircleCI (${REPO_NAME}) - Job: ${JOB_NAME} - Rama: ${BRANCH}\n${MENSAJE}\nVer build: ${BUILD_URL}"
}
EOF
)
  fi

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "${JSON_PAYLOAD}" "${WEBHOOK_URL}" || true)
  echo "Webhook respondio con codigo HTTP: ${HTTP_CODE}"
else
  echo "Aviso: No se configuro DISCORD_WEBHOOK_URL ni SLACK_WEBHOOK_URL. Se omite envio de webhook."
fi

# 2. Enviar estado a GitHub Commit Status API si GH_TOKEN está presente
GITHUB_TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"

if [ -n "${GITHUB_TOKEN}" ] && [ -n "${CIRCLE_SHA1}" ]; then
  echo "Enviando estado a GitHub Commit Status API..."
  GH_API_URL="https://api.github.com/repos/${USERNAME}/${REPO_NAME}/statuses/${CIRCLE_SHA1}"
  
  GH_PAYLOAD=$(cat <<EOF
{
  "state": "${GH_STATE}",
  "target_url": "${BUILD_URL}",
  "description": "${MENSAJE}",
  "context": "ci/circleci: ${JOB_NAME}"
}
EOF
)

  GH_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/json" \
    -d "${GH_PAYLOAD}" "${GH_API_URL}" || true)
  echo "GitHub Status API respondio con codigo HTTP: ${GH_HTTP_CODE}"
else
  echo "Aviso: No se configuro GITHUB_TOKEN / GH_TOKEN o no estamos en un commit de git. Se omite actualizacion en GitHub."
fi

echo "Proceso de notificacion finalizado."
exit 0

