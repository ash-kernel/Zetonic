# Zetonic - Minimalist Anime New Tab

![Zetonic Banner](https://media.discordapp.net/attachments/1470985393708208323/1471048403046895649/readmebanner.png?ex=698d8416&is=698c3296&hm=59327cd044eea4ff7b87df9b2530580e08e7e9b9bf3a92c244dddf6ba77ecb6f&=&format=webp&quality=lossless)

Zetonic replaces the browser new-tab experience with a clean, minimalist view that streams scenic anime-style background videos, displays a live clock and date, and offers a quick Google search input and a rotating inspirational quote.

## What it does

- Streams background videos from URLs listed in `sup/videos.json` (supports remote hosting, e.g., GitHub raw).
- Displays a real-time clock (HH:MM:SS) and a full weekday/date line.
- Shows a single, randomly fetched inspirational quote on each new tab (with a local fallback).
- Keeps UI interactions subtle and lightweight so the page feels fast and distraction-free.

## Installation

### Manual Installation
1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked** and select this folder
5. Your new tab is ready!

📺 **Need help?** Watch this video: [How to Load Unpacked Extensions](https://www.youtube.com/watch?v=OCUJMCkAwDU)

Official Chrome docs: [Developer Guide](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)

## Customization

### Adding Videos

1. Add your video files (`.mp4`, `.webm`, etc.) to the `sup/` folder (or host them remotely).
2. Edit `sup/videos.json` and add the filename or full URL. Example local list:

```json
[
	"video1.mp4",
	"video2.mp4"
]
```

Example remote list (host on GitHub, Pexels, etc.):

```json
[
	"https://videos.pexels.com/video-files/3571213/3571213-sd_640_360_25fps.mp4",
	"https://videos.pexels.com/video-files/2808477/2808477-sd_640_360_24fps.mp4"
]
```

3. If using a GitHub-hosted `videos.json`, copy the file's Raw URL and paste it into `REMOTE_VIDEOS_URL` at the top of `script.js`.

### Editing Quotes

Edit the fallback `quotes` array in `script.js` to customize the local quotes used when the quote API is unavailable.

### Styling

Modify `style.css` to change colors, fonts, layout, and visual appearance.

## How It Works (brief)

**Video Management** - `script.js` reads a JSON array of video URLs and selects one at random to stream as the background. When a video ends, a different random video is selected.

**Clock & Date** - A real-time clock updates every second and shows the full weekday, month, and day.

**Search Integration** - The search input sends queries directly to Google in a new tab.

**Quotes Display** - The extension fetches a single quote from a public API and shows it with a local fallback.

## Project files (overview)

- `index.html` — page markup and search input
- `script.js` — main behavior (video loading, clock, quotes)
- `style.css` — visual styling
- `manifest.json` — Chrome extension configuration
- `sup/videos.json` — JSON array of video URLs used by the extension

## Author

Created by Ash
