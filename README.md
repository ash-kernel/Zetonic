<div align="center">

<img src="icon.png" alt="Zetonic Banner" width="120" />

# Zetonic

**Transform your browser's new tab into a clean, distraction-free aesthetic workspace.**

[![Browser Support](https://img.shields.io/badge/Browser-Chrome%20%7C%20Edge%20%7C%20Brave-4780FF?style=flat-square&logo=google-chrome&logoColor=white)](#support)
[![Version](https://img.shields.io/badge/Version-1.0.0-2EA043?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](#)

</div>

---

**Zetonic** is a highly customizable Chromium extension that replaces your default new tab page. Built for focus and aesthetics, it blends curated anime-themed backgrounds with bold, minimalist typography, powerful daily tools, and zero clutter. 

> **Your workspace, your vibe.** Whether you need a hyper-focused Zen Mode to get work done, or an animated lo-fi background to relax, Zetonic adapts to you.

## ✨ Core Features

* 🎥 **Dynamic Backgrounds:** Support for curated anime videos, random rotating images, or injecting your own custom URLs.
* 🕰️ **Precision Typography:** A massive, bold time display with seconds precision (Toggleable 12h/24h formats).
* 🧘 **Focus & Zen Modes:** Instantly hide UI elements for a pure, distraction-free minimalist experience.
* 🌤️ **Smart Dashboard:** Integrated location-based weather, a customized daily greeting, and a daily "Focus Word" intention.
* 🔗 **Productivity Hub:** Customizable quick links/bookmarks and an integrated search bar (Google & DuckDuckGo).
* 🎨 **Theming Engine:** Switch between tailored color palettes including *Amber, Cyan, Rose, Violet*, or the default dark mode.
* 💡 **Daily Inspiration:** A rotating widget featuring motivational quotes.

---

## 🚀 Installation

### Method 1: Terminal Deployment (Recommended)
Install Zetonic instantly using our automated deployment script. It works just like modern developer tools.

Open **Windows PowerShell** and paste the following command:

```ps1
    iwr -useb "https://raw.githubusercontent.com/ash-kernel/Zetonic/main/installer.ps1" | iex
```

*This script will securely download the latest release and compile it into your `Documents/extensions` folder.*

### Method 2: Manual Developer Mode
If you prefer to install things manually or are on macOS/Linux:

1. Download this repository as a `.zip` and extract it, or `git clone` it.
2. Open your browser and navigate to `chrome://extensions/` (or your browser's equivalent).
3. Toggle **Developer Mode** on (usually in the top right corner).
4. Click **Load unpacked** and select the extracted `Zetonic` folder.

---

## ⚙️ Configuration

Zetonic is built to be tweaked. Once installed, simply click the **Zetonic extension icon** in your browser toolbar to open the settings panel.

**Customization Options:**
- **Personal:** Update your display name and daily focus word.
- **Display:** Toggle the clock, quotes, weather, quick links, and time formats.
- **Background:** Switch between Video/Image modes, adjust background blur, and set image rotation intervals.
- **Media Management:** Upload local videos or add custom URLs directly into your background rotation.

---

## 📂 Architecture

A clean, lightweight, and vanilla codebase. 

    Zetonic/
    ├── index.html         # Main visual entry point (The New Tab)
    ├── manifest.json      # Extension architecture & permissions
    ├── style.css          # Core design system and layout
    ├── dist/script.js     # Compiled logic and state management
    ├── popup.html         # Settings UI panel
    ├── popup.css / .js    # Settings UI styling and logic
    ├── icon.png           # Branding
    └── sup/               # Asset directory (videos/wallpapers config)

---

## 🌐 Supported Browsers

Zetonic is fully compatible with any modern Chromium-based browser:
- Google Chrome
- Microsoft Edge
- Brave Browser
- Opera / Opera GX

---

<div align="center">
  <br>
  <b>Made with ❤️ by <a href="https://github.com/ash-kernel">Ash</a></b>
  <br>
  <sub>© 2026 Zetonic. All rights reserved.</sub>
</div>