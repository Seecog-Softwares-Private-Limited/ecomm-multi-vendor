#!/bin/bash
# server-restart.sh - Run this on AWS after git pull
# Usage: bash server-restart.sh

set -e

export PATH="/opt/bitnami/node/bin:$HOME/.nvm/versions/node/v24.11.1/bin:$HOME/.nvm/versions/node/v22.18.0/bin:$PATH"

cd ~/projects/ecomm-multi-vendor

echo ""
echo "=== Indovyapar Server Update ==="

echo "Node: $(node --version 2>/dev/null || echo NOT FOUND)"
echo "npm:  $(npm --version 2>/dev/null || echo NOT FOUND)"
echo "pm2:  $(pm2 --version 2>/dev/null || echo NOT FOUND)"
echo ""

echo "[1/4] Pulling latest code..."
git fetch origin
git reset --hard origin/lakshya/cart-page

# If .next was committed from an older tree, stale /product/[productId] artifacts can
# coexist with /product/[slug] and crash Next.js: "different slug names for the same dynamic path".
echo "      Cleaning stale PDP route in .next (if any)..."
rm -rf ".next/server/app/(main)/product/[productId]" 2>/dev/null || true
rm -rf ".next/static/chunks/app/(main)/product/[productId]" 2>/dev/null || true
if [ -f ".next/server/app-paths-manifest.json" ]; then
  node -e "
    const fs = require('fs');
    const p = '.next/server/app-paths-manifest.json';
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    const k = '/(main)/product/[productId]/page';
    if (j[k]) { delete j[k]; fs.writeFileSync(p, JSON.stringify(j)); console.log('      Removed', k, 'from app-paths-manifest'); }
  " 2>/dev/null || true
fi

CHANGED=$(git diff HEAD@{1} HEAD --name-only 2>/dev/null || echo "")

if echo "$CHANGED" | grep -q "package.json"; then
    echo "[2/4] package.json changed - running npm install..."
    npm install --legacy-peer-deps
else
    echo "[2/4] No package changes - skipping npm install."
fi

# Always align DB schema + Prisma client with repo (e.g. new columns like product.slug).
# Skipping migrate when only migrations/ changed in an older deploy caused live 500s on RSC pages.
echo "[3/4] Database migrations + Prisma client..."
npx prisma migrate deploy
npx prisma generate

echo "[4/4] Restarting app..."
pm2 restart 0

sleep 2
echo ""
echo "=== Done! ==="
pm2 status