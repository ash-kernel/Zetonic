$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$repo = "ash-kernel/Zetonic"
$branch = "master"
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

        $response = Invoke-WebRequest -Uri $url -OutFile $destination -UseBasicParsing -ErrorAction Stop

        if ($response.StatusCode -ne 200) {
            throw "HTTP Status: $($response.StatusCode)"
        }

        Write-Host "[OK]" -ForegroundColor Green
    }
    catch {
        Write-Host ""
        Write-Host "[FAILED] $file" -ForegroundColor Red
        Write-Host "URL: $url" -ForegroundColor Yellow
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "SUCCESS! Zetonic installed." -ForegroundColor Green
Write-Host ""
Write-Host "Location:" -ForegroundColor Yellow
Write-Host "$installDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Load in Chrome:" -ForegroundColor Yellow
Write-Host "1. Open chrome://extensions/"
Write-Host "2. Enable Developer Mode"
Write-Host "3. Click Load unpacked"
Write-Host "4. Select the Zetonic folder"
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
