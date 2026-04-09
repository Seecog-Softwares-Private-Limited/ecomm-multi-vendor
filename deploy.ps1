# deploy.ps1 — Build locally and push to git so the server just needs git pull + pm2 restart
# Usage: .\deploy.ps1
# Usage with message: .\deploy.ps1 "your commit message"

param(
    [string]$Message = "deploy: production build $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host ""
Write-Host "=== Indovyapar Deploy Script ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot" -ForegroundColor Gray
Write-Host ""

# Step 1: Build
Write-Host "[1/4] Building production bundle..." -ForegroundColor Yellow
Set-Location $ProjectRoot
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build FAILED. Fix errors and try again." -ForegroundColor Red
    exit 1
}
Write-Host "Build complete." -ForegroundColor Green

# Step 2: Stage all changes including .next
Write-Host ""
Write-Host "[2/4] Staging files..." -ForegroundColor Yellow
git add -A
Write-Host "Staged." -ForegroundColor Green

# Step 3: Commit
Write-Host ""
Write-Host "[3/4] Committing with message: '$Message'" -ForegroundColor Yellow
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nothing to commit — build output unchanged." -ForegroundColor Gray
} else {
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Commit FAILED." -ForegroundColor Red
        exit 1
    }
    Write-Host "Committed." -ForegroundColor Green
}

# Step 4: Push
Write-Host ""
Write-Host "[4/4] Pushing to remote..." -ForegroundColor Yellow
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push FAILED." -ForegroundColor Red
    exit 1
}
Write-Host "Pushed." -ForegroundColor Green

Write-Host ""
Write-Host "=== Deploy complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now on your AWS server run:" -ForegroundColor White
Write-Host "  cd ~/projects/ecomm-multi-vendor && git pull && pm2 restart 0" -ForegroundColor Yellow
Write-Host ""
