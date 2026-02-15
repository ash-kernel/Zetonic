# Zetonic Auto-Installer for Chrome
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -Command "iwr -useb https://github.com/ash-kernel/Zetonic/install-auto.ps1 | iex"

$ErrorActionPreference = "Stop"

# Colors
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Cyan = [System.ConsoleColor]::Cyan
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


# GitHub repo info - UPDATE THIS WITH YOUR REPO
$githubRepo = "ash-kernal/zetonic"  # Change to your GitHub username and repo
$githubBranch = "main"
$rawGitHubUrl = "https://raw.githubusercontent.com/$githubRepo/$githubBranch"

# Extension destination
$extensionDir = "$env:LOCALAPPDATA\Zetonic"

Write-Host "→ Setting up Zetonic..." -ForegroundColor $Cyan

# Check Chrome
Write-Host "→ Checking for Chrome..." -ForegroundColor $Cyan
$chromePath = $null

if (Test-Path "$env:ProgramFiles\Google\Chrome\Application\chrome.exe") {
    $chromePath = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
    Write-Host "✓ Chrome found" -ForegroundColor $Green
} elseif (Test-Path "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe") {
    $chromePath = "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe"
    Write-Host "✓ Chrome found" -ForegroundColor $Green
} else {
    Write-Host "✗ Chrome not found!" -ForegroundColor $Red
    Write-Host "Please install Chrome: https://www.google.com/chrome/" -ForegroundColor $Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Create extension directory
Write-Host "→ Creating extension directory..." -ForegroundColor $Cyan
if (-not (Test-Path $extensionDir)) {
    New-Item -ItemType Directory -Path $extensionDir -Force | Out-Null
    Write-Host "✓ Directory created: $extensionDir" -ForegroundColor $Green
} else {
    Write-Host "✓ Directory exists: $extensionDir" -ForegroundColor $Green
}

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

foreach ($file in $files) {
    $url = "$rawGitHubUrl/$file"
    $destination = "$extensionDir\$file"
    $destinationFolder = Split-Path $destination -Parent
    
    # Create subdirectories if needed
    if (-not (Test-Path $destinationFolder)) {
        New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null
    }
    
    try {
        Write-Host "  ⤓ Downloading $file..." -ForegroundColor $Cyan
        Invoke-WebRequest -Uri $url -OutFile $destination -UseBasicParsing
        Write-Host "  ✓ $file" -ForegroundColor $Green
    } catch {
        Write-Host "  ✗ Failed to download $file" -ForegroundColor $Red
        Write-Host "    Error: $_" -ForegroundColor $Red
        exit 1
    }
}

Write-Host ""
Write-Host "✓ Extension downloaded successfully!" -ForegroundColor $Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor $Yellow
Write-Host ""
Write-Host "[1] Chrome will open to the Extensions page" -ForegroundColor $Green
Write-Host "[2] Enable "Developer mode" (toggle in top-right corner)" -ForegroundColor $Green
Write-Host "[3] Click "Load unpacked"" -ForegroundColor $Green
Write-Host "[4] Select this folder:" -ForegroundColor $Green
Write-Host "    $extensionDir" -ForegroundColor $Cyan
Write-Host "[5] Done! Refresh your browser and enjoy!" -ForegroundColor $Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host ""

# Open Chrome extensions page
Write-Host "→ Opening Chrome..." -ForegroundColor $Cyan
Start-Process $chromePath -ArgumentList "chrome://extensions/"

Write-Host ""
Write-Host "✓ All set!" -ForegroundColor $Green
Write-Host "  Extension location: $extensionDir" -ForegroundColor $Cyan
Write-Host ""
