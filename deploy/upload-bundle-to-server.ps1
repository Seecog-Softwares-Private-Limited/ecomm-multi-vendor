# Upload Linux Next.js bundle FROM YOUR WINDOWS PC to Lightsail.
# Do NOT run this on the server — the server has no .next to copy yet.
#
# 1) GitHub repo → Actions → "Deploy to server" → pick a run with green "Upload Linux bundle"
# 2) Summary → Artifacts → download ecomm-linux-bundle.zip → unzip (folder must contain .next + node_modules)
# 3) PowerShell (as Administrator not required):
#      cd path\to\ecomm-multi-vendor
#      .\deploy\upload-bundle-to-server.ps1 -HostIp 15.206.19.156 -BundlePath "C:\path\to\unzipped\folder"
# 4) SSH to Lightsail:
#      cd ~/projects/ecomm-multi-vendor && test -f .next/BUILD_ID && bash server-restart.sh --restart-only
#
# Optional: Lightsail .pem key
#   .\deploy\upload-bundle-to-server.ps1 -HostIp ... -BundlePath ... -IdentityFile "C:\keys\LightsailDefaultKey.pem"

param(
    [Parameter(Mandatory = $true)][string]$HostIp,
    [string]$User = "bitnami",
    [Parameter(Mandatory = $true)][string]$BundlePath,
    [string]$RemoteDir = "/home/bitnami/projects/ecomm-multi-vendor",
    [string]$IdentityFile = ""
)

$ErrorActionPreference = "Stop"
$bundle = (Resolve-Path $BundlePath).Path
if (-not (Test-Path -LiteralPath (Join-Path $bundle ".next\BUILD_ID"))) {
    Write-Error "No .next\BUILD_ID under: $bundle`nUnzip ecomm-linux-bundle.zip fully (use 'Extract All')."
}

$scp = "scp.exe"
if (-not (Get-Command $scp -ErrorAction SilentlyContinue)) {
    Write-Error "OpenSSH scp not found. Install: Windows Settings → Apps → Optional features → OpenSSH Client"
}

$opts = @("-o", "StrictHostKeyChecking=accept-new")
if ($IdentityFile) {
    $pem = (Resolve-Path $IdentityFile).Path
    $opts += "-i"
    $opts += $pem
}
$opts += "-r"

$sources = @(
    ".next",
    "node_modules",
    "package.json",
    "package-lock.json",
    "prisma",
    "app",
    "src",
    "public",
    "app.js",
    "server-restart.sh",
    "ecosystem.config.cjs",
    "next.config.ts",
    "postcss.config.mjs",
    "tsconfig.json",
    "next-env.d.ts",
    "swagger-ui-react.d.ts"
)

$dest = "${User}@${HostIp}:${RemoteDir}/"
Write-Host "Uploading from: $bundle"
Write-Host "Destination:    $dest"
Write-Host ""

$present = [System.Collections.ArrayList]@()
foreach ($name in $sources) {
    if (Test-Path -LiteralPath (Join-Path $bundle $name)) {
        [void]$present.Add($name)
    }
    else {
        Write-Warning "Missing in bundle (skip): $name"
    }
}
if ($present.Count -eq 0) {
    Write-Error "Nothing to upload — check BundlePath points inside the unzipped artifact folder."
}

Push-Location $bundle
try {
    $allArgs = $opts + [string[]]$present + $dest
    & $scp @allArgs
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "Done. On the server run:"
Write-Host "  cd $RemoteDir && test -f .next/BUILD_ID && bash server-restart.sh --restart-only"
