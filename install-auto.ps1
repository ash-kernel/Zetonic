# ==========================================
#           ZETONIC INSTALLER
# ==========================================

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Green  = "Green"
$Red    = "Red"
$Cyan   = "Cyan"
$Yellow = "Yellow"
$Gray   = "Gray"

Clear-Host
Write-Host ""
Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host "             Z E T O N I C              " -ForegroundColor $Cyan
Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host "Minimalist New Tab Extension Installer"
Write-Host ""

# Repo config
$githubRepo   = "ash-kernel/Zetonic"
$githubBranch = "main"
$baseUrl = "https://raw.githubusercontent.com/$githubRepo/$githubBranch"

# Install location
$installDir = "$env:LOCALAPPDATA\Zetonic"

# Files
$files = @(
    "index.html",
    "script.js",
    "style.css",
    "manifest.json",
    "sup/videos.json"
)

Write-Host "[INFO] Preparing installation..." -ForegroundColor $Cyan

if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

Write-Host "[OK] Directory ready: $installDir" -ForegroundColor $Green
Write-Host ""

foreach ($file in $files) {

    $url = "$baseUrl/$file"
    $destination = Join-Path $installDir $file
    $folder = Split-Path $destination -Parent

    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }

    try {
        Write-Host "[DOWNLOAD] $file" -ForegroundColor $Cyan
        Invoke-WebRequest -Uri $url -OutFile $destination -UseBasicParsing
        Write-Host "[OK] Saved" -ForegroundColor $Green
    }
    catch {
        Write-Host "[ERROR] Failed to download $file" -ForegroundColor $Red
        Write-Host "URL: $url" -ForegroundColor $Yellow
        exit 1
    }

    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host "[SUCCESS] Zetonic downloaded!" -ForegroundColor $Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor $Yellow
Write-Host "1. Open Chrome"
Write-Host "2. Go to chrome://extensions/"
Write-Host "3. Enable Developer Mode"
Write-Host "4. Click 'Load unpacked'"
Write-Host "5. Select:"
Write-Host "   $installDir" -ForegroundColor $Cyan
Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host ""
