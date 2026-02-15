# Zetonic — Minimalist Anime New Tab

![Zetonic Banner](https://raw.githubusercontent.com/ash-kernel/Zetonic/main/assets/icon-banner.png)


**Zetonic** replaces your browser’s default new tab with a clean, immersive anime-inspired experience.  
It streams scenic background videos, displays a live clock and date, and provides a quick Google search bar with rotating inspirational quotes — all in a distraction-free minimalist layout.

---

## ✨ Features

- 🎥 Streams background videos from `sup/videos.json` (local or remote URLs supported)
- 🕒 Real-time clock (HH:MM:SS) with full weekday & date
- 🔎 Instant Google search input
- 💬 Random inspirational quote on each new tab (API + local fallback)
- ⚡ Lightweight and fast
- 🎨 Minimal aesthetic interface

---

## 📦 Installation

### ⚡ Quick Install (PowerShell)

```powershell
irm https://raw.githubusercontent.com/ash-kernel/Zetonic/main/install-auto.ps1 | iex
```

Installs to:

```
Documents/extensions/Zetonic
```

---

### 🧩 Manual Installation

1. Clone or download this repository  
2. Open Chrome and go to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the `Zetonic` folder

Done.

📺 Help video:  
https://www.youtube.com/watch?v=OCUJMCkAwDU  

Official docs:  
https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked

---

## 🎨 Customization

### 🎥 Adding Videos

Edit `sup/videos.json`:

```json
[
  "video1.mp4",
  "video2.mp4"
]
```

Remote example:

```json
[
  "https://videos.pexels.com/video-files/3571213/3571213-sd_640_360_25fps.mp4"
]
```

If hosting remotely, update `REMOTE_VIDEOS_URL` in `script.js`.

---

### 💬 Editing Quotes

Modify the `quotes` array in `script.js`.

---

### 🎨 Styling

Edit `style.css` to change layout, colors, and fonts.

---

## 📁 Project Structure

```
Zetonic/
├── index.html
├── script.js
├── style.css
├── manifest.json
└── sup/
    └── videos.json
```

---

## 👤 Author

Created by Ash
