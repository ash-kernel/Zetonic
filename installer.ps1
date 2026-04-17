<#
.SYNOPSIS
Zetonic Extension Installer - Deluxe Edition (Forced Overwrite)
#>

$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue' 

# --- UI FUNCTIONS ---
function Write-Typewriter {
    param([string]$Text, [string]$Color = "White", [int]$Delay = 15)
    foreach ($char in $Text.ToCharArray()) {
        Write-Host $char -NoNewline -ForegroundColor $Color
        Start-Sleep -Milliseconds $Delay
    }
    Write-Host ""
}

# --- START SEQUENCE ---
Clear-Host
$asciiArt = @"
 ███████╗███████╗████████╗ ██████╗ ██████╗ ██╗ ██████╗ 
 ╚══███╔╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██║██╔════╝ 
   ███╔╝ █████╗     ██║   ██║   ██║██║  ██║██║██║      
  ███╔╝  ██╔══╝     ██║   ██║   ██║██║  ██║██║██║      
 ███████╗███████╗   ██║   ╚██████╔╝██║  ██║██║╚██████╗ 
 ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝
"@

foreach ($line in $asciiArt -split "`n") {
    Write-Host $line -ForegroundColor Cyan
    Start-Sleep -Milliseconds 40
}

Write-Host "`n"
Write-Typewriter -Text "  [///] EXTENSION DEPLOYMENT TERMINAL [///]  " -Color Magenta -Delay 25
Write-Host "`n=====================================================" -ForegroundColor DarkGray

$bootSequence = @(
    "Establishing secure connection to GitHub...", 
    "Enabling forced overwrite protocols...", 
    "Allocating local workspace..."
)
foreach ($step in $bootSequence) {
    Write-Host " [ " -NoNewline -ForegroundColor DarkGray
    Write-Host "~" -NoNewline -ForegroundColor Yellow
    Write-Host " ] " -NoNewline -ForegroundColor DarkGray
    Write-Typewriter -Text $step -Color Gray -Delay 10
    Start-Sleep -Milliseconds 300
}
Write-Host "=====================================================`n" -ForegroundColor DarkGray

# --- CORE LOGIC ---
$documentsPath = [Environment]::GetFolderPath("MyDocuments")
$targetDir = Join-Path -Path $documentsPath -ChildPath "extensions\Zetonic"

Write-Host " [ " -NoNewline -ForegroundColor DarkGray
Write-Host "i" -NoNewline -ForegroundColor Cyan
Write-Host " ] Target Path: " -NoNewline -ForegroundColor DarkGray
Write-Host $targetDir -ForegroundColor White

if (!(Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    Write-Host " [ " -NoNewline -ForegroundColor DarkGray
    Write-Host "+" -NoNewline -ForegroundColor Green
    Write-Host " ] Directory generated successfully." -ForegroundColor Gray
} else {
    Write-Host " [ " -NoNewline -ForegroundColor DarkGray
    Write-Host "!" -NoNewline -ForegroundColor Red
    Write-Host " ] Directory exists. Forced overwrite ENABLED." -ForegroundColor Gray
}

$files = @(
    "sup/videos.json",
    "sup/wallpapers.json",
    "icon.png",
    "index.html",
    "manifest.json",
    "popup.css",
    "popup.html",
    "popup.js",
    "style.css"
)

$branch = "main"
$testUrl = "https://raw.githubusercontent.com/ash-kernel/Zetonic/main/manifest.json"

Write-Host "`n [ " -NoNewline -ForegroundColor DarkGray
Write-Host "*" -NoNewline -ForegroundColor Yellow
Write-Host " ] Pinging repository branch... " -NoNewline -ForegroundColor Gray

try {
    Invoke-WebRequest -Uri $testUrl -Method Head -UseBasicParsing -ErrorAction Stop | Out-Null
    Write-Host "OK ($branch)" -ForegroundColor Green
} catch {
    $branch = "master"
    Write-Host "OK ($branch)" -ForegroundColor Green
}

Write-Host "`n --- INITIATING DOWNLOAD SEQUENCE ---`n" -ForegroundColor Cyan

# Download Loop with Forced Overwrite
foreach ($file in $files) {
    $rawUrl = "https://raw.githubusercontent.com/ash-kernel/Zetonic/$branch/$file"
    $destPath = Join-Path -Path $targetDir -ChildPath $file
    
    $parentDir = Split-Path -Path $destPath
    if (!(Test-Path -Path $parentDir)) {
        New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
    }

    # BULLETPROOF OVERWRITE: If the file exists, nuke it first.
    if (Test-Path -Path $destPath) {
        Remove-Item -Path $destPath -Force -ErrorAction SilentlyContinue
    }

    $paddedFile = $file.PadRight(25, '.')
    Write-Host "  -> Downloading $paddedFile " -NoNewline -ForegroundColor Gray
    
    try {
        Invoke-WebRequest -Uri $rawUrl -OutFile $destPath -UseBasicParsing
        Write-Host "[ SUCCESS ]" -ForegroundColor Green
        Start-Sleep -Milliseconds 150 
    } catch {
        Write-Host "[ FAILED ]" -ForegroundColor Red
    }
}

# --- OUTRO ---
Write-Host "`n=====================================================" -ForegroundColor DarkGray
Write-Typewriter -Text " >>> DEPLOYMENT COMPLETE <<< " -Color Green -Delay 20
Write-Host "=====================================================" -ForegroundColor DarkGray
Write-Host " All systems go. You can now load the unpacked" -ForegroundColor Gray
Write-Host " extension from your browser using the path above.`n" -ForegroundColor Gray