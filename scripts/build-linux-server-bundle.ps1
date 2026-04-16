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

function Get-WslUnixPath {
    param([string]$WindowsPath)
    # wslpath expects forward slashes; avoid passing unquoted backslashes to wsl (they get eaten).
    $norm = ($WindowsPath.TrimEnd('\') -replace '\\', '/')
    $wslpath = Join-Path $env:SystemRoot "System32\wslpath.exe"
    if (Test-Path -LiteralPath $wslpath) {
        $out = & $wslpath -a $norm 2>$null
        if ($LASTEXITCODE -eq 0 -and $out) {
            return $out.Trim()
        }
    }
    # Fallback: standard WSL mount layout (C:\... -> /mnt/c/...)
    if ($WindowsPath -match '^([A-Za-z]):\\(.*)$') {
        $drive = $Matches[1].ToLower()
        $rest = ($Matches[2] -replace '\\', '/')
        return "/mnt/$drive/$rest"
    }
    throw "Could not map Windows path to WSL: $WindowsPath"
}

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$unixRepo = Get-WslUnixPath $repo

Write-Host "Repo (Windows): $repo"
Write-Host "Repo (WSL):     $unixRepo"
Write-Host ""

# Pass path via env so spaces/special chars in OneDrive paths do not break bash -lc quoting.
wsl env "ECCOMM_REPO_WSL=$unixRepo" bash -lc 'set -e; cd "$ECCOMM_REPO_WSL"; chmod +x scripts/build-linux-server-bundle.sh; ./scripts/build-linux-server-bundle.sh'

Write-Host ""
Write-Host "Archive (Windows path): $(Join-Path $repo 'dist\ecomm-linux-server-bundle.tar.gz')"
