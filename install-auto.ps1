$repo = "ash-kernel/Zetonic"
$branch = "main"

$zipUrl = "https://github.com/$repo/archive/refs/heads/$branch.zip"

# Target directory
$documents = [Environment]::GetFolderPath("MyDocuments")
$extensionsDir = Join-Path $documents "extensions"
$installDir = Join-Path $extensionsDir "Zetonic"

$zipPath = "$env:TEMP\zetonic.zip"

Write-Host "[INFO] Preparing installation..." -ForegroundColor Cyan

# Create extensions folder if missing
if (-not (Test-Path $extensionsDir)) {
    New-Item -ItemType Directory -Path $extensionsDir -Force | Out-Null
}

# Download ZIP
Write-Host "[INFO] Downloading Zetonic..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

# Remove old install if exists
if (Test-Path $installDir) {
    Write-Host "[INFO] Removing old version..." -ForegroundColor Yellow
    Remove-Item $installDir -Recurse -Force
}

# Extract ZIP to Documents/extensions
Write-Host "[INFO] Extracting..." -ForegroundColor Cyan
Expand-Archive -Path $zipPath -DestinationPath $extensionsDir -Force

# GitHub extracts as Zetonic-main → rename it
$extracted = Join-Path $extensionsDir "Zetonic-$branch"
Rename-Item $extracted $installDir

# Cleanup
Remove-Item $zipPath -Force

Write-Host ""
Write-Host "[SUCCESS] Installed to:" -ForegroundColor Green
Write-Host "$installDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Load it in chrome://extensions/" -ForegroundColor Gray
