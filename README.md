<div align="center">

![Zetonic Banner](https://cdn.discordapp.com/attachments/1470985393708208323/1471048403046895649/readmebanner.png?ex=699ea796&is=699d5616&hm=dc4a03e1cf60905fea2a7bf336070d050d52bf5c755462e51ac42b4f6b44ab7c&)

**Transform your browser's new tab into a serene, anime-inspired experience**
</div>

---

## 🎯 What is Zetonic?

**Zetonic** is a minimalist Chrome extension that replaces your default new tab with a beautiful, distraction-free experience. Featuring stunning anime-themed background videos, a clean interface, and productivity-focused tools, Zetonic helps you start each browsing session with inspiration and clarity.

<div align="centre">

![Demo](https://cdn.discordapp.com/attachments/1470985393708208323/1475817337499287644/Screenshot_2026-02-24_170054.png?ex=699edd80&is=699d8c00&hm=c4d39a76ecc0f9cd969ca97c99d0abf3a857293454b4dc6bbeb24435e46ffc88&)

This is what you get!
</div>

---

## ✨ Features

### 🎥 Dynamic Background Videos
- Curated collection of scenic anime-style videos
- Smooth transitions between videos
- **NEW:** Add your own custom video URLs
- **NEW:** Upload local video files (stored in IndexedDB)
- Support for remote videos (Pexels, Pixabay, Catbox, etc.)
- Auto-play next video with smart randomization

### ⏰ Live Clock & Date
- Real-time clock with seconds precision
- Toggle between 12-hour and 24-hour formats
- Full date display with weekday
- Clean, readable typography

### 🔍 Instant Google Search
- Instant search bar with Google integration
- Minimalist design that stays out of your way
- Smooth animations and transitions

### 💬 Daily Inspiration
- Random motivational quotes on each new tab
- Powered by Advice Slip API with local fallbacks
- Toggle on/off based on preference

### 🌤️ Live Weather Widget
- **NEW:** Real-time weather information
- Location-based temperature and conditions
- Beautiful blur effect design
- Auto-updates every 30 minutes
- Uses free Open-Meteo API (no API key needed)

### ⚙️ Customizable Settings
- Show/hide clock
- Show/hide quotes
- **NEW:** Show/hide weather widget
- Time format preferences
- **NEW:** Manage both URL and local video library
- All settings saved locally

### 🎨 Beautiful Design
- Minimalist aesthetic
- Smooth animations
- Responsive layout for all screen sizes
- Optimized for performance

---

## 🚀 Installation

### Automatic Installation (Windows)

Run this command in PowerShell:

```powershell
irm https://raw.githubusercontent.com/ash-kernel/Zetonic/main/install-auto.ps1 | iex
```

This automatically downloads and installs Zetonic to:
```
C:\Users\YourName\Documents\extensions\Zetonic
```
```
███████╗███████╗████████╗ ██████╗ ███╗   ██╗██╗ ██████╗
  ╚══███╔╝██╔════╝╚══██╔══╝██╔═══██╗████╗  ██║██║██╔════╝
    ███╔╝ █████╗     ██║   ██║   ██║██╔██╗ ██║██║██║     
   ███╔╝  ██╔══╝     ██║   ██║   ██║██║╚██╗██║██║██║     
  ███████╗███████╗   ██║   ╚██████╔╝██║ ╚████║██║╚██████╗
  ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝

  ═══════════════════════════════════════════════════════
     Minimalist Anime New Tab Experience - Installer v2.0
  ═══════════════════════════════════════════════════════

  ╔════════════════════════════════════════════╗
  ║        Checking System Requirements        ║
  ╚════════════════════════════════════════════╝

  → PowerShell Version: ✓ 7.4.0
  → Internet Connection: ✓ Connected
  → Write Permissions: ✓ Granted
```
Then follow step 3 from Manual Installation below.

---

### Manual Installation

#### Step 1: Download Zetonic

**Option A: Download ZIP**
1. Click the green **Code** button on the [GitHub repository](https://github.com/ash-kernel/Zetonic)
2. Select **Download ZIP**
3. Extract the ZIP file to a permanent location (e.g., `Documents/extensions/Zetonic`)

**Option B: Clone with Git**
```bash
git clone https://github.com/ash-kernel/Zetonic 
cd Zetonic
```

#### Step 2: Verify Files

Make sure the extracted/cloned folder contains these files:
- `manifest.json`
- `index.html`
- `script.js`
- `style.css`
- `icon.png`
- `sup/` folder with `videos.json`

#### Step 3: Install in Chrome

1. Open Google Chrome (or any Chromium-based browser)

2. Navigate to Extensions page:
   ```
   chrome://extensions
   ```
   Or: Menu → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

4. Click **Load unpacked**

5. Select the Zetonic folder (the one containing `manifest.json`)

6. ✅ Done! Open a new tab to see Zetonic in action

#### Compatible Browsers
- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Brave Browser
- ✅ Opera
- ✅ Any Chromium-based browser

---

## 📖 Usage Guide

### Adding Custom Videos

#### Method 1: Add Video URLs

1. Click the ⚙️ settings icon in the top-right
2. Scroll to "Custom Videos" section
3. Paste your video URL in the text field
4. Click the **+** button
5. Your video is now in rotation!

**Supported formats:** `.mp4`, `.webm`, `.ogg`, `.mov`

**Recommended sources:**
- [Pexels Videos](https://www.pexels.com/videos/)
- [Pixabay Videos](https://pixabay.com/)
- [Catbox.moe](https://catbox.moe/)
- Direct URLs from your own hosting

**Example URL:**
```
https://files.catbox.moe/vouj15.mp4
```

#### Method 2: Upload Local Videos (NEW!)

1. Click the ⚙️ settings icon
2. Scroll to "Custom Videos" section
3. Click **📁 Upload Local Video** button
4. Select a video file from your computer
5. Wait for upload to complete
6. Your local video is now stored and in rotation!

**File requirements:**
- Supported formats: `.mp4`, `.webm`, `.ogg`
- Maximum file size: 100MB
- Videos are stored in your browser's IndexedDB
- Persist across sessions

### Managing Videos

- **View all videos**: Open settings to see URL and local videos listed separately
- **Remove videos**: Click the **×** button next to any video
- **Mix and match**: Use both URL and local videos together

### Default Videos

Edit `sup/videos.json` to add default videos:

```json
[
  "https://files.catbox.moe/vouj15.mp4",
  "https://videos.pexels.com/video-files/3571213/3571213-sd_640_360_25fps.mp4",
  "video.mp4"
]
```

**Tips:**
- Use direct video URLs (must end in `.mp4`, `.webm`, etc.)
- For best performance, keep videos under 50MB
- Recommended resolution: 1920x1080 or lower

### Weather Widget

The weather widget automatically:
- Requests your location on first load
- Displays current temperature and conditions
- Updates every 30 minutes
- Uses free Open-Meteo API (no setup required)

**Privacy:**
- Location is only used for weather
- No data is sent to external servers
- Weather data is cached locally

To disable: Open settings and toggle "Show Weather" off

### Customizing Quotes

Edit the `fallbackQuotes` array in `script.js`:

```javascript
const fallbackQuotes = [
  "The journey of a thousand miles begins with one step.",
  "Your custom quote here.",
  "Another inspiring message."
];
```

These quotes are used when the API is unavailable.

---

## 📁 Project Structure

```
Zetonic/
├── index.html          # Main HTML structure
├── script.js           # JavaScript logic
├── style.css           # Styling and animations
├── manifest.json       # Chrome extension config
├── icon.png            # Extension icon
├── install-auto.ps1    # Automated installer
└── sup/
    ├── videos.json     # Default video URLs
    └── g-logo.png      # Google logo
```

---

## ⚙️ Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Show Clock** | Display/hide the time and date | On |
| **Show Quote** | Display/hide daily quotes | On |
| **Show Weather** | Display/hide weather widget | On |
| **Time Format** | 12-hour or 24-hour clock | 24-hour |
| **Custom Videos** | Add/remove URL or local videos | Empty |

![settings](https://cdn.discordapp.com/attachments/1470985393708208323/1475817819579875328/image.png?ex=699eddf3&is=699d8c73&hm=80abcac7ddbb1220a8637af2a03c9d5ada8039f9deb379658f73113d35226377&)

All settings are saved automatically in localStorage.

---

## 🐛 Troubleshooting

<details>
<summary><strong>Why isn't my custom video playing?</strong></summary>

**For URL videos:**
- Make sure the URL is a direct link to a video file (ends in `.mp4`, `.webm`, etc.)
- The video must be publicly accessible (no authentication required)
- The hosting service must allow hotlinking
- Your internet connection is stable

**For local videos:**
- File size must be under 100MB
- Supported formats: `.mp4`, `.webm`, `.ogg`
- Check browser console for errors

Try testing the URL directly in your browser first.
</details>

<details>
<summary><strong>Can I use video files from my computer?</strong></summary>

Yes! Use the new "Upload Local Video" feature:
1. Click ⚙️ settings
2. Click **📁 Upload Local Video**
3. Select your video file
4. Video is stored in IndexedDB and persists across sessions

Videos are stored in your browser and don't need to be kept in a specific folder.
</details>

<details>
<summary><strong>How do I remove a video?</strong></summary>

1. Click the ⚙️ settings icon
2. Find the video in "Custom Videos" list (URL or Local sections)
3. Click the **×** button next to it
4. Confirm removal

For local videos, this also removes them from IndexedDB.
</details>

<details>
<summary><strong>Weather isn't showing?</strong></summary>

Make sure:
- "Show Weather" is enabled in settings
- Location access is permitted in your browser
- You have an internet connection

The extension uses Open-Meteo's free API, which doesn't require an API key.
</details>

<details>
<summary><strong>Why isn't the quote changing?</strong></summary>

Quotes load once per new tab. Open a fresh tab to get a new quote. If quotes aren't showing at all, check:
- "Show Quote" is enabled in settings
- Your internet connection (for API quotes)
- Fallback quotes are always available offline
</details>

<details>
<summary><strong>Does this work on Firefox?</strong></summary>

Currently, Zetonic is designed for Chromium-based browsers only. Firefox support may come in a future version.
</details>

<details>
<summary><strong>How do I update to a new version?</strong></summary>

1. Download the latest version from GitHub
2. Replace the old Zetonic folder with the new one
3. Go to `chrome://extensions`
4. Click the refresh icon ↻ on the Zetonic extension

Your settings and videos will be preserved.
</details>

<details>
<summary><strong>Is my data private?</strong></summary>

Yes! All settings, videos, and weather data are stored locally in your browser. Nothing is sent to external servers except:
- Video URLs (loaded from sources you choose)
- Quote API requests (can be disabled)
- Weather API requests (can be disabled)
- Google searches (when you use the search bar)

Local videos are stored in IndexedDB in your browser.
</details>

<details>
<summary><strong>My local videos disappeared after browser update?</strong></summary>

Browser updates shouldn't affect IndexedDB, but if you experience issues:
1. Re-upload your local videos
2. Consider keeping backup copies of important videos
3. Use URL hosting for critical videos

</details>

---

## 🛠️ Development

### Local Development

1. Clone the repository
2. Make your changes to the code
3. Load the extension in Chrome developer mode
4. Test your changes
5. Reload the extension to see updates

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Changelog

### Version 2.1.0 (Latest)

- ✨ **NEW:** Local video file upload support
- ✨ **NEW:** Live weather widget with auto-location
- ✨ **NEW:** Weather toggle in settings
- 🗄️ Videos now stored in IndexedDB (persistent)
- 🎨 Enhanced UI with blur effects
- 📊 Separate URL and local video management
- 🔧 Improved error handling
- ⚡ Better performance optimizations

### Version 2.0.0

- ✨ Custom video URL support via UI
- ✨ Manage custom videos (add/remove)
- 🔧 Improved error handling
- 🎨 Enhanced settings panel design
- 🐛 Better video loading reliability
- 📱 Improved mobile responsiveness
- ⚡ Performance optimizations

### Version 1.0.0

- 🎉 Initial release
- 🎥 Video background support
- 🕐 Live clock & date
- 🔍 Google search integration
- 💬 Random quotes
- ⚙️ Basic settings

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Ash**

- GitHub: [@ash-kernel](https://github.com/ash-kernel)

---

## 🙏 Acknowledgments

- Video sources: Pexels, Pixabay
- Quotes API: Advice Slip
- Weather API: Open-Meteo
- Fonts: Google Fonts
- Icons: Catbox

---

<div align="center">

**Made with ❤️ by Ash**

⭐ Star this repo if you find it useful!

</div>