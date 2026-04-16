# Runs the Linux bundle script inside WSL (required — Windows cannot produce a valid Linux node_modules).
#
# Prerequisites: WSL2 + Ubuntu, Node 22 + npm inside that Ubuntu, repo on a Windows drive (/mnt/c/...).
#
# Usage (PowerShell from repo root OR any folder — script finds repo):
#   .\scripts\build-linux-server-bundle.ps1

$ErrorActionPreference = "Stop"
if (-not (Get-Command wsl -ErrorAction SilentlyContinue)) {
    Write-Error "WSL is not installed. Install WSL2 + Ubuntu, then open Ubuntu and run: bash scripts/build-linux-server-bundle.sh from your repo path under /mnt/c/..."
    exit 1
}

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$unixRepo = (wsl wslpath -a $repo).Trim()

Write-Host "Repo (Windows): $repo"
Write-Host "Repo (WSL):     $unixRepo"
Write-Host ""

wsl bash -lc "set -e; cd '$unixRepo'; chmod +x scripts/build-linux-server-bundle.sh; ./scripts/build-linux-server-bundle.sh"

Write-Host ""
Write-Host "Archive (Windows path): $(Join-Path $repo 'dist\ecomm-linux-server-bundle.tar.gz')"
