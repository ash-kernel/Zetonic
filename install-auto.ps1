Add-Type -AssemblyName PresentationFramework

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

# ---------- UI ----------
$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        Title="Zetonic Installer"
        Height="420"
        Width="550"
        ResizeMode="NoResize"
        WindowStartupLocation="CenterScreen"
        Background="#1e1e1e">

    <Grid Margin="20">
        <StackPanel>

            <TextBlock Text="ZETONIC INSTALLER"
                       FontSize="22"
                       Foreground="White"
                       HorizontalAlignment="Center"
                       Margin="0,0,0,20"/>

            <Button Name="InstallButton"
                    Content="Install Zetonic"
                    Height="40"
                    Margin="0,0,0,15"
                    Background="#0078D7"
                    Foreground="White"/>

            <TextBlock Text="Installation Log:"
                       Foreground="White"
                       Margin="0,0,0,5"/>

            <TextBox Name="LogBox"
                     Height="180"
                     IsReadOnly="True"
                     VerticalScrollBarVisibility="Auto"
                     Background="#111"
                     Foreground="#00ff88"
                     FontFamily="Consolas"/>

        </StackPanel>
    </Grid>
</Window>
"@

# Load window
$reader = (New-Object System.Xml.XmlNodeReader ([xml]$xaml))
$window = [Windows.Markup.XamlReader]::Load($reader)

$installButton = $window.FindName("InstallButton")
$logBox = $window.FindName("LogBox")

function Log($text) {
    $logBox.AppendText("$text`r`n")
    $logBox.ScrollToEnd()
}

# ---------- Install Logic ----------
$installButton.Add_Click({

    try {
        Log "Starting installation..."

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

            Log "Downloading $file..."
            Start-BitsTransfer -Source $url -Destination $destination -ErrorAction Stop
            Log "OK"
        }

        Log ""
        Log "Installation complete!"
        Log "Opening Chrome..."

        # Open Chrome Extensions page
        Start-Process "chrome://extensions/"

        # Open extension folder
        Start-Process $installDir

        # Popup instructions
        [System.Windows.MessageBox]::Show(
"Next Steps:

1. Enable Developer Mode (top right)
2. Click 'Load unpacked'
3. Select the opened Zetonic folder

You're done!",
"Zetonic Installed",
"OK",
"Information"
)

    }
    catch {
        Log ""
        Log "FAILED:"
        Log $_.Exception.Message
    }

})

$window.ShowDialog() | Out-Null
