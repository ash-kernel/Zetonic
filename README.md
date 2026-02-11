# Zetonic - Minimalist Anime New Tab

![Zetonic Banner](https://media.discordapp.net/attachments/1470985393708208323/1471048403046895649/readmebanner.png?ex=698d8416&is=698c3296&hm=59327cd044eea4ff7b87df9b2530580e08e7e9b9bf3a92c244dddf6ba77ecb6f&=&format=webp&quality=lossless)

A sleek Chrome extension that replaces your new tab with a minimalist anime scenery backdrop, real-time clock, and Google search integration.

## Features

✨ **Dynamic Video Background** - Stream random videos from online sources with smooth autoplay  
🕐 **Real-Time Clock** - Live time and date display  
🔍 **Google Search** - Quick access search bar on your new tab  
💬 **Inspirational Quotes** - Random motivational quotes displayed  
🌐 **Lightweight & Fast** - Streams high-quality videos with minimal data usage  
🎨 **Clean Minimalist Design** - Distraction-free new tab experience  

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked** and select this folder
5. Your new tab is ready!

📺 **Need help?** Watch this video: [How to Load Unpacked Extensions](https://www.youtube.com/watch?v=OCUJMCkAwDU)

Official Chrome docs: [Develeoper Expo](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)

## How It Works

**Video Management** - `script.js` loads video URLs from `videos.json` and streams them on demand. You can host `videos.json` in this repository (default local file), or host it as a GitHub file and point the extension to the raw URL for remote updates without reloading the extension.

### Use GitHub (recommended)

1. Create or update `sup/videos.json` in your repo with an array of URLs, e.g.:

```json
[
    "https://videos.pexels.com/video-files/3571213/3571213-sd_640_360_25fps.mp4",
    "https://videos.pexels.com/video-files/2808477/2808477-sd_640_360_24fps.mp4"
]
```

2. Open the file in GitHub, click "Raw" and copy the raw URL. It will look like:

```
https://raw.githubusercontent.com/<your-username>/<repo>/main/sup/videos.json
```

3. In `script.js`, set `REMOTE_VIDEOS_URL` at the top to that raw URL. Example:

```javascript
const REMOTE_VIDEOS_URL = "https://raw.githubusercontent.com/youruser/zetonic/main/sup/videos.json";
```

4. Reload the extension in `chrome://extensions/` — the extension will fetch the remote JSON first, with a local fallback.

**Clock & Date** - A real-time clock displays hours, minutes, and seconds that update every second. The date appears below with the full day name, month, and date (e.g., "Tuesday, February 11").

**Search Integration** - The Google logo and search input are integrated with Google's search engine. When you focus on the search box, the logo scales up slightly for visual feedback.

**Quotes Display** - A random inspirational quote is selected from an array and displayed on page load, giving you daily motivation.

**Smooth UI** - All interactions (logo scaling, video transitions, time updates) happen seamlessly in the background without interrupting your browsing.

## Project Structure

```
zetonic/
├── index.html          # Main HTML template
├── script.js           # JavaScript logic (time, videos, quotes, search)
├── style.css           # Styling
├── manifest.json       # Chrome extension config
└── sup/
    ├── video1.mp4      # Background videos
    ├── video2.mp4
    └── videos.json     # Video list
```

## Technologies

- HTML5 & CSS3
- Vanilla JavaScript
- Chrome Extension API.

## Author
```
Created By Ash
(give credits to the guy above)
```
---

Enjoy your new minimalist new tab experience!
