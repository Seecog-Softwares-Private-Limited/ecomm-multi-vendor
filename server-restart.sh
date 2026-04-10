#!/bin/bash
# server-restart.sh — Run this on AWS after pushing a new build
# Usage: bash server-restart.sh

set -e

# Load Bitnami Node.js environment (fixes npm/pm2 not found)
export PATH="/opt/bitnami/node/bin:$HOME/.nvm/versions/node/v24.11.1/bin:$HOME/.nvm/versions/node/v22.18.0/bin:$PATH"

cd ~/projects/ecomm-multi-vendor

echo ""
echo "=== Indovyapar Server Update ==="

# Verify tools are available
echo "Node: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "npm:  $(npm --version 2>/dev/null || echo 'NOT FOUND')"
echo "pm2:  $(pm2 --version 2>/dev/null || echo 'NOT FOUND')"
echo ""

echo "[1/3] Pulling latest code + build..."
git pull

# Check if package.json or prisma schema changed in the last pull
CHANGED=$(git diff HEAD@{1} HEAD --name-only 2>/dev/null || echo "")

if echo "$CHANGED" | grep -q "package.json"; then
    echo "[2/3] package.json changed — running npm install..."
    npm install --legacy-peer-deps
    npx prisma generate
else
    echo "[2/3] No package changes — skipping npm install."
fi

if echo "$CHANGED" | grep -q "prisma/schema"; then
    echo "      Prisma schema changed — running migrations..."
    npx prisma migrate deploy
    npx prisma generate
fi

echo "[3/3] Restarting app..."
pm2 restart 0

sleep 2
echo ""
echo "=== Done! ==="
pm2 status
