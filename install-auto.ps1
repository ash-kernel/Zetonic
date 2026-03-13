
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"


$repo = "ash-kernel/Zetonic"
$branch = "main"
$baseUrl = "https://raw.githubusercontent.com/$repo/$branch"
$documents = [Environment]::GetFolderPath("MyDocuments")
$installDir = Join-Path $documents "extensions\Zetonic"

$files = @(
    "index.html",
    "dist/script.js",
    "style.css",
    "manifest.json",
    "icon.png",
    "sup/videos.json",
    "sup/wallpapers.json",
    "sup/g-logo.png",
    "sup/icon-banner.png"
)

$colors = @{
    Primary = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Magenta"
    Accent = "DarkCyan"
}


function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  ███████╗███████╗████████╗ ██████╗ ███╗   ██╗██╗ ██████╗" -ForegroundColor $colors.Primary
    Write-Host "  ╚══███╔╝██╔════╝╚══██╔══╝██╔═══██╗████╗  ██║██║██╔════╝" -ForegroundColor $colors.Primary
    Write-Host "    ███╔╝ █████╗     ██║   ██║   ██║██╔██╗ ██║██║██║     " -ForegroundColor $colors.Accent
    Write-Host "   ███╔╝  ██╔══╝     ██║   ██║   ██║██║╚██╗██║██║██║     " -ForegroundColor $colors.Accent
    Write-Host "  ███████╗███████╗   ██║   ╚██████╔╝██║ ╚████║██║╚██████╗" -ForegroundColor $colors.Info
    Write-Host "  ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝" -ForegroundColor $colors.Info
    Write-Host ""
    Write-Host "  ═══════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "     Minimalist Anime New Tab Experience - Installer v3.0" -ForegroundColor $colors.Warning
    Write-Host "  ═══════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host ""
}


function Show-Progress {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Status = "Processing"
    )
    
    $percent = [math]::Round(($Current / $Total) * 100)
    $barLength = 50
    $filled = [math]::Round(($percent / 100) * $barLength)
    $empty = $barLength - $filled
    
    $bar = "█" * $filled + "░" * $empty
    
    Write-Host -NoNewline "`r  ["
    Write-Host -NoNewline $bar -ForegroundColor $colors.Primary
    Write-Host -NoNewline "] $percent% - $Status"
}


function Test-Prerequisites {
    Write-Host "  ╔════════════════════════════════════════════╗" -ForegroundColor $colors.Primary
    Write-Host "  ║        Checking System Requirements        ║" -ForegroundColor $colors.Primary
    Write-Host "  ╚════════════════════════════════════════════╝" -ForegroundColor $colors.Primary
    Write-Host ""
    

    Write-Host "  → PowerShell Version: " -NoNewline -ForegroundColor $colors.Accent
    if ($PSVersionTable.PSVersion.Major -ge 5) {
        Write-Host "✓ $($PSVersionTable.PSVersion)" -ForegroundColor $colors.Success
    } else {
        Write-Host "✗ Too old (need 5.1+)" -ForegroundColor $colors.Error
        return $false
    }
    

    Write-Host "  → Internet Connection: " -NoNewline -ForegroundColor $colors.Accent
    try {
        $null = Test-Connection -ComputerName "github.com" -Count 1 -ErrorAction Stop
        Write-Host "✓ Connected" -ForegroundColor $colors.Success
    } catch {
        Write-Host "✗ No connection" -ForegroundColor $colors.Error
        return $false
    }
    

    Write-Host "  → Write Permissions: " -NoNewline -ForegroundColor $colors.Accent
    try {
        $testPath = Join-Path ([System.IO.Path]::GetTempPath()) "zetonic-test.tmp"
        [System.IO.File]::WriteAllText($testPath, "test")
        Remove-Item $testPath -Force
        Write-Host "✓ Granted" -ForegroundColor $colors.Success
    } catch {
        Write-Host "✗ Denied" -ForegroundColor $colors.Error
        return $false
    }
    
    Write-Host ""
    return $true
}


function Initialize-InstallDirectory {
    Write-Host "  ╔════════════════════════════════════════════╗" -ForegroundColor $colors.Primary
    Write-Host "  ║          Preparing Installation            ║" -ForegroundColor $colors.Primary
    Write-Host "  ╚════════════════════════════════════════════╝" -ForegroundColor $colors.Primary
    Write-Host ""
    
    if (Test-Path $installDir) {
        Write-Host "  ⚠ Installation folder already exists!" -ForegroundColor $colors.Warning
        Write-Host "  Location: " -NoNewline
        Write-Host $installDir -ForegroundColor $colors.Info
        Write-Host ""
        Write-Host "  Do you want to:" -ForegroundColor $colors.Accent
        Write-Host "    [O]verwrite existing files" -ForegroundColor $colors.Warning
        Write-Host "    [U]pdate only (skip existing files)" -ForegroundColor $colors.Success
        Write-Host "    [C]ancel installation" -ForegroundColor $colors.Error
        Write-Host ""
        
        $choice = Read-Host "  Your choice (O/U/C)"
        
        switch ($choice.ToUpper()) {
            "O" { 
                Write-Host "  → Removing old installation..." -ForegroundColor $colors.Warning
                Remove-Item $installDir -Recurse -Force
                New-Item -ItemType Directory -Path $installDir -Force | Out-Null
                Write-Host "  ✓ Ready for fresh install" -ForegroundColor $colors.Success
                return "overwrite"
            }
            "U" { 
                Write-Host "  ✓ Will update existing files" -ForegroundColor $colors.Success
                return "update"
            }
            default { 
                Write-Host "  ✗ Installation cancelled" -ForegroundColor $colors.Error
                exit 0
            }
        }
    } else {
        Write-Host "  → Creating installation folder..." -ForegroundColor $colors.Accent
        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
        Write-Host "  ✓ Created: " -NoNewline -ForegroundColor $colors.Success
        Write-Host $installDir -ForegroundColor $colors.Info
        return "new"
    }
    Write-Host ""
}


function Install-Files {
    param([string]$Mode)
    
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════╗" -ForegroundColor $colors.Primary
    Write-Host "  ║          Downloading Components            ║" -ForegroundColor $colors.Primary
    Write-Host "  ╚════════════════════════════════════════════╝" -ForegroundColor $colors.Primary
    Write-Host ""
    
    $downloaded = 0
    $skipped = 0
    $failed = @()
    
    for ($i = 0; $i -lt $files.Count; $i++) {
        $file = $files[$i]
        $url = "$baseUrl/$file"
        $destination = Join-Path $installDir $file
        $folder = Split-Path $destination -Parent
        
      
        if (-not (Test-Path $folder)) {
            New-Item -ItemType Directory -Path $folder -Force | Out-Null
        }
        
      
        if ($Mode -eq "update" -and (Test-Path $destination)) {
            Show-Progress -Current ($i + 1) -Total $files.Count -Status "Skipped: $file"
            Write-Host ""
            $skipped++
            continue
        }
        
        Show-Progress -Current ($i + 1) -Total $files.Count -Status "Downloading: $file"
        
        try {
            $webClient = New-Object System.Net.WebClient
            $webClient.DownloadFile($url, $destination)
            $webClient.Dispose()
            Write-Host ""
            Write-Host "    ✓ $file" -ForegroundColor $colors.Success
            $downloaded++
        }
        catch {
            Write-Host ""
            Write-Host "    ✗ Failed: $file" -ForegroundColor $colors.Error
            $failed += $file
        }
    }
    
    Write-Host ""
    Write-Host "  ─────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "  Downloaded: " -NoNewline -ForegroundColor $colors.Accent
    Write-Host "$downloaded " -NoNewline -ForegroundColor $colors.Success
    Write-Host "| Skipped: " -NoNewline -ForegroundColor $colors.Accent
    Write-Host "$skipped " -NoNewline -ForegroundColor $colors.Warning
    Write-Host "| Failed: " -NoNewline -ForegroundColor $colors.Accent
    Write-Host "$($failed.Count)" -ForegroundColor $colors.Error
    Write-Host "  ─────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    
    if ($failed.Count -gt 0) {
        Write-Host "  ⚠ Some files failed to download:" -ForegroundColor $colors.Warning
        foreach ($f in $failed) {
            Write-Host "    • $f" -ForegroundColor $colors.Error
        }
        Write-Host ""
        return $false
    }
    
    return $true
}


function Show-Completion {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════╗" -ForegroundColor $colors.Success
    Write-Host "  ║     ✓ Installation Complete!               ║" -ForegroundColor $colors.Success
    Write-Host "  ╚════════════════════════════════════════════╝" -ForegroundColor $colors.Success
    Write-Host ""
    Write-Host "  📁 Extension Location:" -ForegroundColor $colors.Accent
    Write-Host "     $installDir" -ForegroundColor $colors.Info
    Write-Host ""
    Write-Host "  ┌────────────────────────────────────────────┐" -ForegroundColor $colors.Primary
    Write-Host "  │         Next Steps to Enable:              │" -ForegroundColor $colors.Primary
    Write-Host "  └────────────────────────────────────────────┘" -ForegroundColor $colors.Primary
    Write-Host ""
    Write-Host "  1️⃣  Open Chrome and navigate to:" -ForegroundColor $colors.Warning
    Write-Host "      chrome://extensions/" -ForegroundColor $colors.Info
    Write-Host ""
    Write-Host "  2️⃣  Enable " -NoNewline -ForegroundColor $colors.Warning
    Write-Host "'Developer Mode'" -NoNewline -ForegroundColor $colors.Success
    Write-Host " (toggle at top right)" -ForegroundColor $colors.Warning
    Write-Host ""
    Write-Host "  3️⃣  Click " -NoNewline -ForegroundColor $colors.Warning
    Write-Host "'Load unpacked'" -NoNewline -ForegroundColor $colors.Success
    Write-Host " button" -ForegroundColor $colors.Warning
    Write-Host ""
    Write-Host "  4️⃣  Select the Zetonic folder (opening now...)" -ForegroundColor $colors.Warning
    Write-Host ""
    Write-Host "  5️⃣  Enjoy your minimal anime new tab! 🎉" -ForegroundColor $colors.Success
    Write-Host ""
    Write-Host "  ════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host ""
    
    Write-Host "  Open extension folder now? (Y/n): " -NoNewline -ForegroundColor $colors.Accent
    $open = Read-Host
    
    if ($open -ne "n" -and $open -ne "N") {
        Write-Host "  → Opening folder..." -ForegroundColor $colors.Accent
        Start-Process $installDir
    }
    
    Write-Host ""
    Write-Host "  Thank you for using Zetonic! 🌸" -ForegroundColor $colors.Info
    Write-Host ""
}


try {
    Show-Banner
    
    if (-not (Test-Prerequisites)) {
        Write-Host "  ✗ Prerequisites check failed. Please resolve issues and try again." -ForegroundColor $colors.Error
        Write-Host ""
        Read-Host "  Press Enter to exit"
        exit 1
    }
    
    Start-Sleep -Milliseconds 500
    
    $mode = Initialize-InstallDirectory
    
    Start-Sleep -Milliseconds 300
    
    if (-not (Install-Files -Mode $mode)) {
        Write-Host "  ✗ Installation failed. Please check your internet connection and try again." -ForegroundColor $colors.Error
        Write-Host ""
        Read-Host "  Press Enter to exit"
        exit 1
    }
    
    Show-Completion
    
} catch {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════╗" -ForegroundColor $colors.Error
    Write-Host "  ║            ✗ Error Occurred                ║" -ForegroundColor $colors.Error
    Write-Host "  ╚════════════════════════════════════════════╝" -ForegroundColor $colors.Error
    Write-Host ""
    Write-Host "  Error Details:" -ForegroundColor $colors.Error
    Write-Host "  $($_.Exception.Message)" -ForegroundColor $colors.Warning
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}

Read-Host "  Press Enter to exit"