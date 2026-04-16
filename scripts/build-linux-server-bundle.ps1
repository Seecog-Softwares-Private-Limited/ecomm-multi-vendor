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

# CRLF in *.sh breaks bash under WSL ("set: pipefail" / invalid option). Normalize before run.
$shWin = Join-Path $repo "scripts\build-linux-server-bundle.sh"
if (Test-Path -LiteralPath $shWin) {
    $raw = [System.IO.File]::ReadAllText($shWin)
    if ($raw.Contains("`r`n")) {
        Write-Host "Normalizing scripts/build-linux-server-bundle.sh: CRLF -> LF (required for WSL)."
        [System.IO.File]::WriteAllText($shWin, ($raw -replace "`r`n", "`n"), [System.Text.UTF8Encoding]::new($false))
    }
}

# Build bash -c in PowerShell SINGLE quotes so `2>/dev/null` is not corrupted (`$null` expansion).
$bashLine = 'cd ''' + $unixRepo + ''' && test -f scripts/build-linux-server-bundle.sh || { echo MISSING_BUNDLE_SCRIPT_run_from_repo_root; ls -la scripts 2>/dev/null || true; exit 1; }; exec bash scripts/build-linux-server-bundle.sh'
wsl bash -lc "$bashLine"

Write-Host ""
Write-Host "Archive (Windows path): $(Join-Path $repo 'dist\ecomm-linux-server-bundle.tar.gz')"
