# Push AWS SES SMTP from local .env to production server .env and restart PM2.
#
# Usage (PowerShell, from repo root):
#   .\deploy\set-production-smtp.ps1 -HostIp 15.206.19.156 -IdentityFile "C:\path\to\Lightsail.pem"
#
# Requires: OpenSSH (ssh/scp), local .env with SMTP_* set.

param(
    [Parameter(Mandatory = $true)][string]$HostIp,
    [string]$User = "bitnami",
    [string]$RemoteDir = "/home/bitnami/projects/ecomm-multi-vendor",
    [string]$IdentityFile = "",
    [string]$LocalEnvFile = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not $LocalEnvFile) {
    $LocalEnvFile = Join-Path $root ".env"
}

if (-not (Test-Path -LiteralPath $LocalEnvFile)) {
    Write-Error "Local env not found: $LocalEnvFile"
}

function Get-EnvValue([string]$Key) {
    foreach ($line in Get-Content -LiteralPath $LocalEnvFile) {
        $t = $line.Trim()
        if ($t -match "^#\s*" -or $t -notmatch '=') { continue }
        if ($t -match "^$([regex]::Escape($Key))=(.*)$") {
            $v = $Matches[1].Trim()
            if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
                $v = $v.Substring(1, $v.Length - 2)
            }
            return $v
        }
    }
    return $null
}

$vars = @('SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'APP_URL', 'NEXT_PUBLIC_APP_URL')
$values = @{}
foreach ($k in $vars) {
    $v = Get-EnvValue $k
    if (-not $v -and $k -in @('SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM')) {
        Write-Error "Missing $k in $LocalEnvFile"
    }
    if ($v) { $values[$k] = $v }
}
if (-not $values['APP_URL']) { $values['APP_URL'] = 'https://www.indovyapar.com' }
if (-not $values['NEXT_PUBLIC_APP_URL']) { $values['NEXT_PUBLIC_APP_URL'] = 'https://www.indovyapar.com' }

$sshOpts = @('-o', 'StrictHostKeyChecking=accept-new')
if ($IdentityFile) {
    $pem = (Resolve-Path $IdentityFile).Path
    $sshOpts += @('-i', $pem)
}
$target = "${User}@${HostIp}"

$remoteScript = Join-Path $root "deploy\set-production-smtp.sh"
if (-not (Test-Path -LiteralPath $remoteScript)) {
    Write-Error "Missing $remoteScript"
}

Write-Host "Uploading set-production-smtp.sh to $target ..."
& scp.exe @sshOpts $remoteScript "${target}:/tmp/set-production-smtp.sh"

$exportLines = @()
foreach ($k in $values.Keys) {
    $escaped = $values[$k] -replace "'", "'\\''"
    $exportLines += "export $k='$escaped'"
}
$remoteCmd = ($exportLines -join '; ') + "; bash /tmp/set-production-smtp.sh '$RemoteDir'"

Write-Host "Updating production SMTP and restarting PM2 ..."
& ssh.exe @sshOpts $target $remoteCmd

Write-Host "Done. Test: register a new customer on the app or https://www.indovyapar.com/register"
