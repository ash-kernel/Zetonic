# Zetonic Auto-Installer for Chrome
# Safe Version - Fixed Repo + Debug + UTF8 + TLS

$ErrorActionPreference = "Stop"

# Force TLS 1.2 (Prevents GitHub download issues)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Fix UTF-8 characters
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Colors
$Green  = [System.ConsoleColor]::Green
$Red    = [System.ConsoleColor]::Red
$Cyan   = [System.ConsoleColor]::Cyan
$Yellow = [System.ConsoleColor]::Yellow

Clear-Host
Write-Host ""
Write-Host "███████╗███████╗████████╗ ██████╗ ███╗   ██╗██╗ ██████╗" -ForegroundColor Cyan
Write-Host "╚══███╔╝██╔════╝╚══██╔══╝██╔═══██╗████╗  ██║██║██╔════╝" -ForegroundColor Cyan
Write-Host "  ███╔╝ █████╗     ██║   ██║   ██║██╔██╗ ██║██║██║     " -ForegroundColor Cyan
Write-Host " ███╔╝  ██╔══╝     ██║   ██║   ██║██║╚██╗██║██║██║     " -ForegroundColor Cyan
Write-Host "███████╗███████╗   ██║   ╚██████╔╝██║ ╚████║██║╚██████╗" -ForegroundColor Cyan
Write-Host "╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "ZETONIC Auto-Installer v1.0" -ForegroundColor Yellow
Write-Host "Minimalist Anime New Tab Experience" -ForegroundColor Green
Write-Host ""

# Correct GitHub Repo
$githubRepo   = "ash-kernel/Zetonic"
$githubBranch = "main"
$rawGitHubUrl = "https://raw.githubusercontent.com/$githubRepo/$githubBranch"

# Extension location
$extensionDir = "$env:LOCALAPPDATA\Zetonic"

Write-Host "→ Setting up Zetonic..." -ForegroundColor $Cyan

# Check Chrome
Write-Host "→ Checking for Chrome..." -ForegroundColor $Cyan
$chromePath = $null

if (Test-Path "$env:ProgramFiles\Google\Chrome\Application\chrome.exe") {
    $chromePath = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
} elseif (Test-Path "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe") {
    $chromePath = "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe"
}

if (-not $chromePath) {
    Write-Host "✗ Chrome not found!" -ForegroundColor $Red
    Write-Host "Install Chrome first." -ForegroundColor $Yellow
    pause
    exit 1
}

Write-Host "✓ Chrome found" -ForegroundColor $Green

# Create directory
Write-Host "→ Creating extension directory..." -ForegroundColor $Cyan

if (-not (Test-Path $extensionDir)) {
    New-Item -ItemType Directory -Path $extensionDir -Force | Out-Null
}

Write-Host "✓ Directory ready: $extensionDir" -ForegroundColor $Green

# Files to download
$files = @(
    "index.html",
    "script.js",
    "style.css",
    "manifest.json",
    "sup/videos.json"
)

Write-Host ""
Write-Host "→ Downloading extension files..." -ForegroundColor $Cyan
Write-Host "Base URL: $rawGitHubUrl" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {

    $url = "$rawGitHubUrl/$file"
    $destination = Join-Path $extensionDir $file
    $destinationFolder = Split-Path $destination -Parent

    if (-not (Test-Path $destinationFolder)) {
        New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null
    }

    try {
        Write-Host "  ⤓ $file" -ForegroundColor $Cyan
        Write-Host "    $url" -ForegroundColor DarkGray

        Invoke-WebRequest -Uri $url -OutFile $destination -UseBasicParsing

        Write-Host "  ✓ Downloaded" -ForegroundColor $Green
    }
    catch {
        Write-Host ""
        Write-Host "✗ Failed to download: $file" -ForegroundColor $Red
        Write-Host "URL Tried: $url" -ForegroundColor $Yellow
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor $Red
        pause
        exit 1
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host "✓ Extension downloaded successfully!" -ForegroundColor $Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor $Yellow
Write-Host ""
Write-Host "1. Chrome will open to Extensions page" -ForegroundColor $Green
Write-Host "2. Enable Developer Mode (top-right toggle)" -ForegroundColor $Green
Write-Host "3. Click Load Unpacked" -ForegroundColor $Green
Write-Host "4. Select this folder:" -ForegroundColor $Green
Write-Host "   $extensionDir" -ForegroundColor $Cyan
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host ""

Start-Process $chromePath "chrome://extensions/"

Write-Host "✓ All set! Enjoy Zetonic 🔥" -ForegroundColor $Green
Write-Host ""
