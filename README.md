

<div align="center">

![Zetonic Banner](https://cdn.discordapp.com/attachments/1470985393708208323/1471048403046895649/readmebanner.png?ex=699ea796&is=699d5616&hm=dc4a03e1cf60905fea2a7bf336070d050d52bf5c755462e51ac42b4f6b44ab7c&)

**Transform your browser's new tab into a serene, anime-inspired experience**
</div>

---



**Zetonic** is a minimalist Chrome extension that replaces your default new tab with a beautiful, distraction-free experience. Featuring stunning anime-themed background videos, a clean interface, and productivity-focused tools, Zetonic helps you start each browsing session with inspiration and clarity.

<div align="centre">

![Demo](https://cdn.discordapp.com/attachments/1470985393708208323/1476913276825767936/Screenshot_2026-02-27_173400.png?ex=69a2da2c&is=69a188ac&hm=d79245ceb922cd371d29aeefbbeddb053e342fcc3b31c6c6d005e76a328c35a1&)

This is what you get!
</div>

---




- Curated collection of scenic anime-style videos
- Smooth transitions between videos
- **NEW:** Add your own custom video URLs
- Support for local and remote videos (Pexels, Pixabay, Catbox, etc.)


- Real-time clock with seconds precision
- Toggle between 12-hour and 24-hour formats
- Full date display with weekday
- Clean, readable typography


- Instant search bar with Google integration
- Minimalist design that stays out of your way
- Smooth animations and transitions


- Random motivational quotes on each new tab
- Powered by Advice Slip API with local fallbacks
- Toggle on/off based on preference


- Show/hide clock
- Show/hide quotes
- Time format preferences
- **NEW:** Manage custom video library
- All settings saved locally


- Minimalist aesthetic
- Smooth animations
- Responsive layout for all screen sizes
- Optimized for performance




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





**Option A: Download ZIP**
1. Click the green **Code** button on the [GitHub repository](https://github.com/ash-kernel/Zetonic)
2. Select **Download ZIP**
3. Extract the ZIP file to a permanent location (e.g., `Documents/extensions/Zetonic`)

**Option B: Clone with Git**
```bash
git clone https://github.com/ash-kernel/Zetonic 
cd Zetonic
```


Make sure the extracted/cloned folder contains these files:
- `manifest.json`
- `index.html`
- `dist/script.js`
- `style.css`
- `icon.png`
- `sup/` folder with `videos.json`



1. Open Google Chrome (or any Chromium-based browser)

2. Navigate to Extensions page:
   ```
   chrome:
   ```
   Or: Menu → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

4. Click **Load unpacked**

5. Select the Zetonic folder (the one containing `manifest.json`)

6. ✅ Done! Open a new tab to see Zetonic in action


- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Brave Browser
- ✅ Opera
- ✅ Any Chromium-based browser


1. Click the ⚙️ settings icon in the top-right
2. Scroll to "Custom Videos" section
3. Paste your video URL
4. Click the **+** button
5. Your video is now in rotation!

**Supported formats:** `.mp4`, `.webm`, `.ogg`, `.mov`

**Recommended sources:**
- [Pexels Videos](https://pixabay.com/)
- [Pixabay Videos](https://pixabay.com/)
- [Catbox.moe](https://catbox.moe/)
- Direct URLs from your own hosting

**Example URL:**
```
https:
```



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
- User-added videos are stored separately in localStorage

---



Edit the `FALLBACK_QUOTES` array in `src/quotes.ts`:

```typescript
const FALLBACK_QUOTES = [
  "The journey of a thousand miles begins with one step.",
  "Your custom quote here.",
  "Another inspiring message."
];
```

These quotes are used when the API is unavailable.


```
Zetonic/
├── index.html          
├── dist/
│   └── script.js       
├── style.css           
├── manifest.json       
├── icon.png            
├── install-auto.ps1    
├── src/                (TypeScript source)
└── sup/
    ├── videos.json     
    └── g-logo.png      
```

---



| Setting | Description | Default |
|---------|-------------|---------|
| **Show Clock** | Display/hide the time and date | On |
| **Show Quote** | Display/hide daily quotes | On |
| **Time Format** | 12-hour or 24-hour clock | 24-hour |
| **Custom Videos** | Add/remove personal video URLs | Empty |

![settings](https://cdn.discordapp.com/attachments/1470985393708208323/1477249843318620313/image.png?ex=69a413a0&is=69a2c220&hm=39a2e1b0e533ae5301345076ed628e1e311cd8ba6ab90ca6dd6db7bf3ac1bb68&)

![settings2](https://media.discordapp.net/attachments/1470985393708208323/1476913277496983685/Screenshot_2026-02-27_173422.png?ex=69a2da2d&is=69a188ad&hm=352c355e021f496e5f2f8240cf01312d9c96eeb522d785e86e9ec4867e792c4c&=&format=webp&quality=lossless)

![settings3](https://media.discordapp.net/attachments/1470985393708208323/1476913277966614650/Screenshot_2026-02-27_173429.png?ex=69a2da2d&is=69a188ad&hm=d012be00ebeef1be329c03679f9d549f6cb8648c38a04b17d00cb9216356e4a6&=&format=webp&quality=lossless)

![settings4](https://media.discordapp.net/attachments/1470985393708208323/1476913278327455804/Screenshot_2026-02-27_173446.png?ex=69a2da2d&is=69a188ad&hm=57030bd768f811c553b6f126f34ddee69ba347e4da16cc67b3433cdd96086a3c&=&format=webp&quality=lossless)


All settings are saved automatically in localStorage.

---



<details>
<summary><strong>Why isn't my custom video playing?</strong></summary>

Make sure:
- The URL is a direct link to a video file (ends in `.mp4`, `.webm`, etc.)
- The video is publicly accessible (no authentication required)
- The hosting service allows hotlinking
- Your internet connection is stable

Try testing the URL directly in your browser first.
</details>

<details>
<summary><strong>Can I use local video files?</strong></summary>

Not directly via the UI. However, you can:
1. Place video files in the `Zetonic` folder
2. Reference them in `sup/videos.json` like: `"video.mp4"`

Note: The extension needs to be reloaded after changes.
</details>

<details>
<summary><strong>How do I remove a custom video?</strong></summary>

1. Click the ⚙️ settings icon
2. Find the video in "Custom Videos" list
3. Click the **×** button next to it
4. Confirm removal
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
3. Go to `chrome:
4. Click the refresh icon ↻ on the Zetonic extension
</details>

<details>
<summary><strong>Is my data private?</strong></summary>

Yes! All settings and custom videos are stored locally in your browser's localStorage. Nothing is sent to external servers except:
- Video URLs (loaded from sources you choose)
- Quote API requests (can be disabled)
- Google searches (when you use the search bar)
</details>

---


1. Clone the repository
2. Run `npm install` and `npm run build`
3. Make your changes to the code in `src/`
4. Load the extension in Chrome developer mode
5. Run `npm run build` after edits, then reload the extension



Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

- ✨ **NEW:** Custom video URL support via UI
- ✨ **NEW:** Manage custom videos (add/remove)
- 🔧 Improved error handling
- 🎨 Enhanced settings panel design
- 🐛 Better video loading reliability
- 📱 Improved mobile responsiveness
- ⚡ Performance optimizations


- 🎉 Initial release
- 🎥 Video background support
- 🕐 Live clock & date
- 🔍 Google search integration
- 💬 Random quotes
- ⚙️ Basic settings

---

This project is licensed under the CC BY-NC 4.0- see the [LICENSE](LICENSE) file for details.

---

**Ash**

- GitHub: [@ash-kernel](https://github.com/ash-kernel)

---



- Video sources: Pexels
- Quotes API: Advice Slip
- Fonts: Google Fonts
- Icons: Catbox

---

<div align="center">

**Made with ❤️ by Ash**

⭐ Star this repo if you find it useful!

</div>
