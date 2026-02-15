$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$repo = "ash-kernel/Zetonic"
$branch = "main"
$baseUrl = "https://raw.githubusercontent.com/$repo/$branch"

$documents = [Environment]::GetFolderPath("MyDocuments")
$installDir = Join-Path $documents "extensions\Zetonic"

$files = @(
    "index.html",
    "script.js",
    "style.css",
    "manifest.json",
    "icon.png",
    "sup/videos.json"
)


Clear-Host
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "              ZETONIC INSTALLER          " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

foreach ($file in $files) {

    $url = "$baseUrl/$file"
    $destination = Join-Path $installDir $file
    $folder = Split-Path $destination -Parent

    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }

    try {
        Write-Host "[DOWNLOADING] $file" -ForegroundColor Cyan
        Invoke-WebRequest -Uri $url -OutFile $destination -UseBasicParsing
        Write-Host "[OK]" -ForegroundColor Green
    }
    catch {
        Write-Host "[FAILED] $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "SUCCESS! Zetonic installed." -ForegroundColor Green
Write-Host ""
Write-Host "To load it in Chrome:" -ForegroundColor Yellow
Write-Host "1. Open Chrome"
Write-Host "2. Go to chrome://extensions/"
Write-Host "3. Enable Developer Mode (top right)"
Write-Host "4. Click 'Load unpacked'"
Write-Host "5. Select this folder:"
Write-Host "   $installDir" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
