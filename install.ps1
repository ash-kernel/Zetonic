$baseUrl = "https://raw.githubusercontent.com/ash-kernel/Zetonic/main"
$dest = Join-Path $env:USERPROFILE "Documents\extensions\Zetonic"

Write-Host "[>] Installing..."

if (-not (Test-Path $dest)) { 
    New-Item -ItemType Directory -Path $dest -Force | Out-Null 
}

if (-not (Test-Path "$dest\sup")) { 
    New-Item -ItemType Directory -Path "$dest\sup" -Force | Out-Null 
}

$files = @(
    "index.html",
    "popup.html",
    "popup.css",
    "popup.js",
    "dist\script.js",
    "style.css",
    "manifest.json",
    "icon.png",
    "sup\videos.json",
    "sup\wallpapers.json"
)

foreach ($f in $files) {
    Write-Host "  $f"
    $url = "$baseUrl/$f"
    $out = Join-Path $dest $f
    try { 
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop 
    } catch { 
        Write-Host "    Failed: $f" -ForegroundColor Red
    }
}

if (Test-Path (Join-Path $dest "index.html")) {
    Write-Host ""
    Write-Host "[OK] Installed to: $dest" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. chrome://extensions/" -ForegroundColor Cyan
    Write-Host "2. Developer Mode" -ForegroundColor Cyan
    Write-Host "3. Load unpacked" -ForegroundColor Cyan
    Write-Host "4. Select folder" -ForegroundColor Cyan
} else {
    Write-Host "[FAIL] Check internet connection" -ForegroundColor Red
}