[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue' 
$CurrentYear = (Get-Date).Year

Clear-Host

$banner = @"

  ___ ___ ___ ___  _  _ ___ ___ 
 |_  | __|_ _/ _ \| \| |_ _/ __|
  / /| _| | | (_) | .` || | (__ 
 /___|___|___\___/|_|\_|___\___|

"@

Write-Host $banner -ForegroundColor Cyan
Write-Host "  Z E T O N I C   D E P L O Y M E N T" -ForegroundColor White
Write-Host "  © $CurrentYear Zetonic. All rights reserved.`n" -ForegroundColor DarkGray
Write-Host "------------------------------------------------" -ForegroundColor DarkGray

$repoOwner = "ash-kernel"
$repoName = "Zetonic"
$branch = "main"

$documentsPath = [Environment]::GetFolderPath("MyDocuments")
$targetDir = Join-Path -Path $documentsPath -ChildPath "extensions\Zetonic"

$files = @(
    "sup/videos.json",
    "sup/wallpapers.json",
    "dist/script.js",
    "dist/script.js.map",
    "icon.png",
    "index.html",
    "manifest.json",
    "popup.css",
    "popup.html",
    "popup.js",
    "style.css"
)

Write-Host " [i] Target Path: " -NoNewline -ForegroundColor DarkGray
Write-Host $targetDir -ForegroundColor Cyan

if (!(Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

Write-Host " [i] Mode: " -NoNewline -ForegroundColor DarkGray
Write-Host "Clean Install / Overwrite`n" -ForegroundColor Cyan

foreach ($file in $files) {
    $rawUrl = "https://raw.githubusercontent.com/$repoOwner/$repoName/$branch/$file"
    $destPath = Join-Path -Path $targetDir -ChildPath $file
    
    $parentDir = Split-Path -Path $destPath
    if (!(Test-Path -Path $parentDir)) {
        New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
    }

    if (Test-Path -Path $destPath) {
        Remove-Item -Path $destPath -Force -ErrorAction SilentlyContinue
    }

    $paddedFile = "     $file".PadRight(30, ' ')
    Write-Host $paddedFile -NoNewline -ForegroundColor White
    
    try {
        Invoke-WebRequest -Uri $rawUrl -OutFile $destPath -UseBasicParsing
        Write-Host "DONE" -ForegroundColor Cyan
    } catch {
        Write-Host "FAIL" -ForegroundColor Red
    }
}

Write-Host "------------------------------------------------" -ForegroundColor DarkGray
Write-Host " Deployment completed successfully." -ForegroundColor Green
Write-Host " Load the unpacked extension from the path above." -ForegroundColor Gray
Write-Host ""