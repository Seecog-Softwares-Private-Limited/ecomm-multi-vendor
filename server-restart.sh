#!/bin/bash
# server-restart.sh — Run this on AWS after pushing a new build
# Usage: bash server-restart.sh

set -e
cd ~/projects/ecomm-multi-vendor

echo ""
echo "=== Indovyapar Server Update ==="

echo "[1/3] Pulling latest code + build..."
git pull

# Only run npm install if package.json changed in this pull
if git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -q "package.json"; then
    echo "[2/3] package.json changed — running npm install..."
    npm install --legacy-peer-deps
    npx prisma generate
else
    echo "[2/3] No package changes — skipping npm install."
fi

# Only run migrations if schema changed
if git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -q "prisma/"; then
    echo "      Prisma schema changed — running migrations..."
    npx prisma migrate deploy
    npx prisma generate
fi

echo "[3/3] Restarting app..."
pm2 restart 0

echo ""
echo "=== Done! Site is live ==="
pm2 status
