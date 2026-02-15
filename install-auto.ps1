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
Write-Host "███████╗███████╗████████╗ ██████╗ ██╗   ██╗██╗ ██████╗" -ForegroundColor Cyan
Write-Host "╚════██║██╔════╝╚══██╔══╝██╔═══██╗██║   ██║██║██╔════╝" -ForegroundColor Cyan
Write-Host "    ██║█████╗     ██║   ██║   ██║██║   ██║██║██║     " -ForegroundColor Cyan
Write-Host "    ██║██╔══╝     ██║   ██║   ██║██║   ██║██║██║     " -ForegroundColor Cyan
Write-Host "███████║███████╗   ██║   ╚██████╔╝╚██████╔╝██║╚██████╗" -ForegroundColor Cyan
Write-Host "╚══════╝╚══════╝   ╚═╝    ╚═════╝  ╚═════╝ ╚═╝ ╚═════╝ " -ForegroundColor Cyan
Write-Host ""
Write-Host "ZETONIC Auto-Installer v1.0" -ForegroundColor Yellow
Write-Host "Minimalist Anime New Tab Experience" -ForegroundColor Green
Write-Host ""

# Create install directory
Write-Host "→ Setting up installation folder..." -ForegroundColor Cyan
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    Write-Host "✓ Created: $installDir" -ForegroundColor Green
} else {
    Write-Host "✓ Folder exists: $installDir" -ForegroundColor Green
}

# Download files
Write-Host ""
Write-Host "→ Downloading extension files..." -ForegroundColor Cyan

foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $destination = Join-Path $installDir $file
    $folder = Split-Path $destination -Parent

    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }

    try {
        Write-Host "  ⤓ Downloading $file..." -ForegroundColor Cyan
        Start-BitsTransfer -Source $url -Destination $destination -ErrorAction Stop
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Failed: $file" -ForegroundColor Red
        Write-Host "    URL: $url" -ForegroundColor Red
        Write-Host "    $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✓ Zetonic installed successfully!" -ForegroundColor Green
Write-Host "Folder: $installDir" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "→ Open Chrome and go to chrome://extensions/" -ForegroundColor Yellow

Write-Host "→ Opening extension folder..." -ForegroundColor Yellow
Start-Process $installDir

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Magenta
Write-Host "1. Enable Developer Mode (top right in Chrome)"
Write-Host "2. Click 'Load unpacked'"
Write-Host "3. Select the Zetonic folder that opened"
Write-Host "4. Enjoy your new minimal anime new tab!" -ForegroundColor Green
Write-Host ""
