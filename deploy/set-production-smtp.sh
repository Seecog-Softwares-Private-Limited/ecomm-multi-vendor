#!/usr/bin/env bash
# Run ON the production server (or via deploy/set-production-smtp.ps1 over SSH).
# Updates SMTP_* and email URL vars in .env without printing secrets.
set -euo pipefail

APP_DIR="${1:-/home/bitnami/projects/ecomm-multi-vendor}"
ENV_FILE="$APP_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

required=(SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS SMTP_FROM)
for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "Set env var $key before running (e.g. export SMTP_PASS=...)."
    exit 1
  fi
done

APP_URL="${APP_URL:-https://www.indovyapar.com}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://www.indovyapar.com}"

cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d%H%M%S)"

upsert() {
  local key="$1"
  local val="$2"
  local tmp
  tmp="$(mktemp)"
  if grep -q "^${key}=" "$ENV_FILE"; then
    grep -v "^${key}=" "$ENV_FILE" > "$tmp"
  else
    cp "$ENV_FILE" "$tmp"
  fi
  printf '%s=%s\n' "$key" "$val" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
}

upsert SMTP_HOST "$SMTP_HOST"
upsert SMTP_PORT "$SMTP_PORT"
upsert SMTP_USER "$SMTP_USER"
upsert SMTP_PASS "$SMTP_PASS"
upsert SMTP_FROM "$SMTP_FROM"
upsert APP_URL "$APP_URL"
upsert NEXT_PUBLIC_APP_URL "$NEXT_PUBLIC_APP_URL"

echo "Updated SMTP in $ENV_FILE (backup created)."
grep -E '^(SMTP_HOST|SMTP_PORT|SMTP_USER|SMTP_PASS|SMTP_FROM|APP_URL|NEXT_PUBLIC_APP_URL)=' "$ENV_FILE" | sed 's/=.*/=<set>/'

cd "$APP_DIR"
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart ecomm
  echo "pm2 restart ecomm — done."
else
  echo "pm2 not found; restart the app manually."
fi
