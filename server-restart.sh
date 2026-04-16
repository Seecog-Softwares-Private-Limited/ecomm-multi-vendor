#!/bin/bash
# server-restart.sh — restart the Next.js app without npm / npx on the server.
#
# Normal use (after you push code): SSH to the server and run:
#   bash server-restart.sh
# That updates git to the latest origin branch and restarts the process.
#
# Builds and node_modules are deployed by GitHub Actions (.github/workflows/deploy.yml).
# If you do not use that workflow, you must still get a Linux .next + node_modules onto
# this machine some other way — this script will not run npm or next build here.
#
# CI / rsync hook (do not run git pull after a fresh rsync):
#   bash server-restart.sh --restart-only
#
set -euo pipefail

RESTART_ONLY=0
if [[ "${1:-}" == "--restart-only" ]] || [[ "${SKIP_GIT_PULL:-}" == "1" ]]; then
  RESTART_ONLY=1
fi

# App directory (override if your path differs)
APP_DIR="${APP_DIR:-$HOME/projects/ecomm-multi-vendor}"
# Remote branch to track (override with env DEPLOY_GIT_BRANCH)
DEPLOY_GIT_BRANCH="${DEPLOY_GIT_BRANCH:-lakshya/cart-page}"

export PATH="/opt/bitnami/node/bin:$HOME/.nvm/versions/node/v24.11.1/bin:$HOME/.nvm/versions/node/v22.18.0/bin:$PATH"

cd "$APP_DIR"

echo ""
echo "=== Ecomm server restart ==="
echo "Directory: $APP_DIR"
echo "Node: $(node --version 2>/dev/null || echo 'NOT FOUND — add Node to PATH')"
echo ""

if [[ "$RESTART_ONLY" -eq 0 ]]; then
  echo "[1/3] Pulling latest code (origin/${DEPLOY_GIT_BRANCH})..."
  git fetch origin
  git reset --hard "origin/${DEPLOY_GIT_BRANCH}"
else
  echo "[1/3] Skipping git pull (--restart-only / SKIP_GIT_PULL)."
fi

# Stale dynamic route cleanup (PDP slug migration)
echo "[2/3] Cleaning stale PDP route artifacts in .next (if any)..."
rm -rf ".next/server/app/(main)/product/[productId]" 2>/dev/null || true
rm -rf ".next/static/chunks/app/(main)/product/[productId]" 2>/dev/null || true
if [[ -f ".next/server/app-paths-manifest.json" ]]; then
  node -e "
    const fs = require('fs');
    const p = '.next/server/app-paths-manifest.json';
    try {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      const k = '/(main)/product/[productId]/page';
      if (j[k]) { delete j[k]; fs.writeFileSync(p, JSON.stringify(j)); console.log('      Removed', k, 'from app-paths-manifest'); }
    } catch (e) { /* ignore */ }
  " 2>/dev/null || true
fi

if [[ ! -f ".next/BUILD_ID" ]]; then
  echo ""
  echo "ERROR: .next/BUILD_ID is missing — there is no production build in this directory."
  echo "Push your branch to GitHub so the \"Deploy to server\" workflow runs, or copy a Linux"
  echo "build (including .next/ and node_modules/) from your CI machine."
  exit 1
fi

if [[ ! -f "node_modules/next/dist/bin/next" ]]; then
  echo ""
  echo "ERROR: node_modules is incomplete (missing Next.js CLI)."
  echo "Use the GitHub Actions deploy workflow so node_modules is synced from the Linux runner."
  exit 1
fi

echo "[3/3] Restarting app (no npm / npx)..."
if [[ -f /etc/systemd/system/ecomm.service ]] || [[ -f /lib/systemd/system/ecomm.service ]] || [[ -f /usr/lib/systemd/system/ecomm.service ]]; then
  sudo systemctl restart ecomm.service
  sleep 1
  sudo systemctl --no-pager status ecomm.service || true
elif command -v pm2 >/dev/null 2>&1; then
  if pm2 describe ecomm >/dev/null 2>&1; then
    pm2 restart ecomm
  elif [[ -f ecosystem.config.cjs ]]; then
    pm2 restart ecosystem.config.cjs
  else
    pm2 restart 0
  fi
  sleep 2
  pm2 status || true
else
  echo "Neither systemd unit 'ecomm' nor pm2 found."
  echo "Start manually from this directory: node app.js start"
  exit 1
fi

echo ""
echo "=== Done ==="
