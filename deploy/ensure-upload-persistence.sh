#!/bin/bash
# ensure-upload-persistence.sh — one-time / safe re-run on Lightsail.
#
# Fixes the production issue where GitHub Actions `rsync --delete` wiped
# `public/uploads/` on every deploy (product images → HTTP 404).
#
# What this does:
#   1. Creates a persistent upload directory OUTSIDE the app deploy tree
#   2. Copies any remaining files from <app>/public/uploads into that dir
#   3. Ensures PUBLIC_UPLOAD_ROOT is set in the app .env (without printing secrets)
#   4. Reloads PM2 with ecosystem.config.cjs so the app reads the new root
#
# Usage (on the server):
#   cd /home/bitnami/projects/ecomm-multi-vendor
#   bash deploy/ensure-upload-persistence.sh
#
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/projects/ecomm-multi-vendor}"
# Sibling of the app folder — never deleted by rsync of the app tree
PERSIST_DIR="${PUBLIC_UPLOAD_ROOT:-$(dirname "$APP_DIR")/data/ecomm-uploads}"
LEGACY_DIR="$APP_DIR/public/uploads"

echo "=== Ensure upload persistence ==="
echo "App dir:       $APP_DIR"
echo "Persist dir:   $PERSIST_DIR"
echo "Legacy dir:    $LEGACY_DIR"
echo ""

mkdir -p "$PERSIST_DIR"/{kyc,vendor-docs,avatars}

# Preserve any files that still exist under the old path (do not delete legacy).
if [[ -d "$LEGACY_DIR" ]]; then
  echo "Copying any remaining legacy uploads into persist dir (no overwrite of newer files)..."
  # -n: do not overwrite existing destination files
  cp -an "$LEGACY_DIR"/. "$PERSIST_DIR"/ 2>/dev/null || true
  echo "Legacy copy step done."
else
  echo "No legacy public/uploads directory found (already empty or never created)."
fi

ENV_FILE="$APP_DIR/.env"
if [[ -f "$ENV_FILE" ]]; then
  if grep -qE '^[[:space:]]*PUBLIC_UPLOAD_ROOT=' "$ENV_FILE"; then
    # Replace existing line in place without echoing the value in logs beyond path we already printed
    tmp="$(mktemp)"
    sed -E "s|^[[:space:]]*PUBLIC_UPLOAD_ROOT=.*$|PUBLIC_UPLOAD_ROOT=${PERSIST_DIR}|" "$ENV_FILE" > "$tmp"
    mv "$tmp" "$ENV_FILE"
    echo "Updated PUBLIC_UPLOAD_ROOT in .env"
  else
    printf '\n# Persistent product/KYC uploads (outside rsync deploy tree)\nPUBLIC_UPLOAD_ROOT=%s\n' "$PERSIST_DIR" >> "$ENV_FILE"
    echo "Appended PUBLIC_UPLOAD_ROOT to .env"
  fi
else
  echo "WARNING: $ENV_FILE not found — set PUBLIC_UPLOAD_ROOT manually before restart."
fi

cd "$APP_DIR"
export PATH="/opt/bitnami/node/bin:$HOME/.nvm/versions/node/v24.11.1/bin:$HOME/.nvm/versions/node/v22.18.0/bin:$PATH"

if command -v pm2 >/dev/null 2>&1; then
  echo "Reloading PM2 with ecosystem.config.cjs..."
  # Ensure PUBLIC_UPLOAD_ROOT is visible when ecosystem resolves the path
  export PUBLIC_UPLOAD_ROOT="$PERSIST_DIR"
  pm2 startOrReload ecosystem.config.cjs --update-env
  pm2 save || true
  pm2 status || true
else
  echo "pm2 not found — restart the app manually after setting PUBLIC_UPLOAD_ROOT."
fi

echo ""
echo "=== Done ==="
echo "New uploads will be written under: $PERSIST_DIR"
echo "Served via: GET /uploads/<filename> → /api/uploads/<filename>"
echo ""
echo "NOTE: Product image URLs that already 404 mean the files were deleted earlier."
echo "Those products need a vendor re-upload (or restore from backup)."
echo "After this script + deploy exclude, NEW uploads will survive future deploys."
