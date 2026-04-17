#!/usr/bin/env bash
# Build a self-contained Linux deploy bundle (NO npm commands needed on the server after upload).
#
# MUST run on Linux or WSL Ubuntu — NOT plain Windows CMD/PowerShell alone.
# Windows node_modules will NOT work on AWS Linux (bcrypt, sharp, etc. are native).
#
# Usage (from repo root, inside WSL):
#   chmod +x scripts/build-linux-server-bundle.sh
#   ./scripts/build-linux-server-bundle.sh
#
# Output:
#   dist/ecomm-linux-server-bundle.tar.gz
#
# New server (needs Node runtime only — use Bitnami Node image or install Node 22):
#   mkdir -p ~/ecomm && tar -xzf ecomm-linux-server-bundle.tar.gz -C ~/ecomm
#   cp your-production.env ~/ecomm/.env
#   cd ~/ecomm && node app.js start   # or: pm2 start ecosystem.config.cjs
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "ERROR: Run on Linux or WSL (Ubuntu). This script refuses to run on macOS/Windows"
  echo "       because node_modules must be Linux ELF binaries for AWS."
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: node or npm not found. Install Node 22 in this Linux/WSL environment, for example:"
  echo ""
  echo "  sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg"
  echo "  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -"
  echo "  sudo apt-get install -y nodejs"
  echo "  node -v && npm -v"
  echo ""
  exit 1
fi

export NEXT_TELEMETRY_DISABLED="1"

BUNDLE_DIR="$ROOT/dist/ecomm-server-bundle"
ARCHIVE="$ROOT/dist/ecomm-linux-server-bundle.tar.gz"

rm -rf "$BUNDLE_DIR" "$ARCHIVE"
mkdir -p "$BUNDLE_DIR"

echo "==> Node: $(node --version)  npm: $(npm --version)"
echo "==> npm ci"
npm ci

echo "==> npm run build"
npm run build

echo "==> Strip Next cache from bundle source"
rm -rf .next/cache 2>/dev/null || true

echo "==> Copy tree into $BUNDLE_DIR"
for path in \
  .next \
  node_modules \
  package.json \
  package-lock.json \
  prisma \
  app \
  src \
  public \
  app.js \
  ecosystem.config.cjs \
  server-restart.sh \
  next.config.ts \
  postcss.config.mjs \
  tsconfig.json \
  next-env.d.ts \
  swagger-ui-react.d.ts; do
  if [[ -e "$ROOT/$path" ]]; then
    cp -a "$ROOT/$path" "$BUNDLE_DIR/"
  else
    echo "WARN: skip missing path: $path"
  fi
done

if [[ -f "$ROOT/properties.env" ]]; then
  cp -a "$ROOT/properties.env" "$BUNDLE_DIR/"
fi

echo "==> Pack $ARCHIVE"
mkdir -p "$ROOT/dist"
tar -C "$BUNDLE_DIR" -czf "$ARCHIVE" .

echo ""
echo "DONE:"
ls -lh "$ARCHIVE"
echo ""
echo "Verify inside tarball:"
tar -tzf "$ARCHIVE" | head -20
echo "..."
echo ""
echo "Upload (from the machine that has the .tar.gz):"
echo "  scp -o StrictHostKeyChecking=accept-new \"$ARCHIVE\" bitnami@YOUR_SERVER_IP:~/"
echo ""
echo "On NEW server (Node 22 required — Bitnami Node image is fine; you do NOT run npm ci):"
echo "  mkdir -p ~/ecomm && tar -xzf ~/ecomm-linux-server-bundle.tar.gz -C ~/ecomm"
echo "  nano ~/ecomm/.env   # create PORT, DATABASE_URL, JWT_SECRET, etc."
echo "  cd ~/ecomm && node app.js start"
echo "  # or: pm2 start ecosystem.config.cjs && pm2 save"
