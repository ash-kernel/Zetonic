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
Write-Host "Installing Zetonic..."
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
        Write-Host "Downloading $file..."
        Start-BitsTransfer -Source $url -Destination $destination -ErrorAction Stop
        Write-Host "OK"
    }
    catch {
        Write-Host ""
        Write-Host "FAILED: $file"
        Write-Host "URL: $url"
        Write-Host $_.Exception.Message
        exit 1
    }
}

Write-Host ""
Write-Host "Zetonic installed at:"
Write-Host $installDir
Write-Host ""
