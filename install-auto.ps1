$ErrorActionPreference = "Stop"

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
Write-Host "            ZETONIC INSTALLER            " -ForegroundColor Cyan
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
        Write-Host "[DOWNLOADING] $file" -ForegroundColor Yellow
        Start-BitsTransfer -Source $url -Destination $destination -ErrorAction Stop
        Write-Host "[OK]" -ForegroundColor Green
    }
    catch {
        Write-Host ""
        Write-Host "[FAILED] $file" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "INSTALLATION COMPLETE" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Extension installed at:" -ForegroundColor White
Write-Host "$installDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening Chrome Extensions page..." -ForegroundColor Yellow

Start-Process "chrome://extensions/"
Start-Process $installDir

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Magenta
Write-Host "1. Enable Developer Mode (top right)"
Write-Host "2. Click 'Load unpacked'"
Write-Host "3. Select the Zetonic folder that just opened"
Write-Host ""
Write-Host "Thank you for installing Zetonic!" -ForegroundColor Green
Write-Host "If you have any issues, please report them at: https://github.com/ash-kernel/Zetonic/issues" -ForegroundColor White