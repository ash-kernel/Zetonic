$ErrorActionPreference = "Stop"

$repo = "ash-kernel/Zetonic"
$branch = "main"
$baseUrl = "https://raw.githubusercontent.com/$repo/$branch"
$documents = [Environment]::GetFolderPath("MyDocuments")
$installDir = Join-Path $documents "extensions\Zetonic"

$files = @(
    "index.html",
    "popup.html",
    "popup.css",
    "popup.js",
    "dist/script.js",
    "style.css",
    "manifest.json",
    "icon.png",
    "sup/videos.json",
    "sup/wallpapers.json"
)

function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  ZETONIC - Extension Popup Installer" -ForegroundColor Cyan
    Write-Host "  =========================================" -ForegroundColor DarkGray
    Write-Host ""
}

function Test-Prerequisites {
    try {
        $null = [System.Net.WebRequest]::Create("https://github.com")
        return $true
    } catch {
        return $false
    }
}

function Install-Files {
    Write-Host "[>] Creating folder..." -ForegroundColor Cyan
    if (-not (Test-Path $installDir)) {
        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    }
    if (-not (Test-Path "$installDir\sup")) {
        New-Item -ItemType Directory -Path "$installDir\sup" -Force | Out-Null
    }

    $i = 0
    foreach ($file in $files) {
        $i++
        $percent = [math]::Round(($i / $files.Count) * 100)
        Write-Host "[$percent%] Downloading: $file" -ForegroundColor Yellow
        
        $url = "$baseUrl/$file"
        $dest = Join-Path $installDir $file
        
        try {
            Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
        } catch {
            Write-Host "  Failed: $file" -ForegroundColor Red
        }
    }
}

function Show-Complete {
    Write-Host ""
    Write-Host "[✓] Installation complete!" -ForegroundColor Green
    Write-Host "[>] Location: $installDir" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. Open chrome://extensions/" -ForegroundColor Gray
    Write-Host "  2. Enable Developer Mode" -ForegroundColor Gray
    Write-Host "  3. Click Load unpacked" -ForegroundColor Gray
    Write-Host "  4. Select: $installDir" -ForegroundColor Gray
    Write-Host ""
}

try {
    Show-Banner
    
    if (-not (Test-Prerequisites)) {
        Write-Host "[✗] No internet connection" -ForegroundColor Red
        exit 1
    }
    
    Install-Files
    Show-Complete
    
} catch {
    Write-Host "[✗] Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host