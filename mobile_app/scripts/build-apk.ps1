# Build Indovyapar Flutter APK
# Usage:
#   .\scripts\build-apk.ps1                    # prod release APK
#   .\scripts\build-apk.ps1 -Flavor dev        # dev APK (cleartext HTTP allowed)
#   .\scripts\build-apk.ps1 -Flavor dev -ApiUrl "http://192.168.1.10:3005"

param(
    [ValidateSet("dev", "prod")]
    [string]$Flavor = "prod",
    [string]$ApiUrl = ""
)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$defines = @("APP_FLAVOR=$Flavor")
if ($ApiUrl) {
    $defines += "BASE_URL=$ApiUrl"
}

$defineArgs = $defines | ForEach-Object { "--dart-define=$_" }

Write-Host "Building $Flavor release APK..." -ForegroundColor Cyan
if ($ApiUrl) {
    Write-Host "API URL: $ApiUrl" -ForegroundColor Yellow
} elseif ($Flavor -eq "dev") {
    Write-Host "Tip: pass -ApiUrl with your PC LAN IP so a physical phone can reach the API." -ForegroundColor Yellow
}

flutter build apk --release --flavor $Flavor @defineArgs

$apkDir = "build\app\outputs\flutter-apk"
Write-Host ""
Write-Host "Done. APK output:" -ForegroundColor Green
Get-ChildItem $apkDir -Filter "*.apk" | ForEach-Object { Write-Host "  $($_.FullName)" }
