import { loadSettings, getSettings, saveSettings } from "./settings";
import {
  loadVideos,
  playVideo,
  getVideos,
  getCurrentIndex,
  setCurrentIndex,
} from "./video";
import {
  getRandomImageUrl,
  getNextImageUrl,
  setBackgroundImage,
  loadWallpapers,
} from "./background";
import { updateTime } from "./clock";
import { initSearch } from "./search";
import { loadQuote } from "./quotes";
import { loadWeather } from "./weather";
import { getQuickLinks, saveQuickLinks } from "./quickLinks";

const videoEl = document.getElementById("bgVideo") as HTMLVideoElement | null;
const bgImageEl = document.getElementById("bgImage");
const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const greetingEl = document.getElementById("greeting");
const dailyFocusEl = document.getElementById("dailyFocusDisplay");
const searchInput = document.getElementById("searchInput") as HTMLInputElement | null;
const searchLogo = document.getElementById("searchLogo");
const quoteEl = document.getElementById("quote");
const quickLinksEl = document.getElementById("quickLinks");

// Network Monitor Elements
const networkWidget = document.getElementById("networkWidget");
const pingValue = document.getElementById("pingValue");
const netStatus = document.getElementById("netStatus");
let pingInterval: number | null = null;

loadSettings();

function applyTheme(): void {
  // If the new premium-dark is selected, add it as a class to body, otherwise clear it
  const theme = getSettings().theme || "default";
  if (theme === "premium-dark") {
    document.body.classList.add("theme-premium-dark");
    document.documentElement.setAttribute("data-theme", "default"); // reset colors
  } else {
    document.body.classList.remove("theme-premium-dark");
    document.documentElement.setAttribute("data-theme", theme);
  }
}

function applyBgMode(): void {
  const { bgMode } = getSettings();
  if (videoEl) videoEl.style.display = bgMode === "video" ? "block" : "none";
  if (bgImageEl) {
    bgImageEl.classList.toggle("bg-active", bgMode === "image");
    if (bgMode === "image" && !bgImageEl.classList.contains("bg-loaded")) {
      loadWallpapers().then(() => {
        const url = getRandomImageUrl();
        setBackgroundImage(bgImageEl as HTMLDivElement, url, getSettings().blurLevel || 0);
      });
    }
  }
}

async function reloadVideos(): Promise<void> {
  if (!videoEl) return;
  await loadVideos(videoEl);
}

function applyFocusMode(): void {
  const { focusMode, zenMode, showQuickLinks, showQuote } = getSettings();
  const show = !focusMode && !zenMode;
  if (quoteEl) quoteEl.style.display = show && showQuote ? "block" : "none";
  if (quickLinksEl) quickLinksEl.style.display = show && showQuickLinks ? "flex" : "none";
  if (dailyFocusEl) dailyFocusEl.style.display = show ? "block" : "none";
  document.body.classList.toggle("zen-mode", zenMode);
}

function applySearchVisibility(): void {
  const { showSearch } = getSettings();
  const searchContainer = document.getElementById("searchContainer");
  if (searchContainer) {
    searchContainer.style.display = showSearch ? "flex" : "none";
  }
}

// --- NEW: Network Monitoring Logic ---
async function measurePing() {
  if (!navigator.onLine) {
    if (pingValue) pingValue.textContent = "-- ms";
    if (netStatus) {
      netStatus.textContent = "Offline";
      netStatus.className = "net-value offline";
    }
    return;
  }

  const start = performance.now();
  try {
    // Ping a tiny, highly available resource using no-cors to prevent console errors
    await fetch('https://www.google.com/favicon.ico?_=' + Date.now(), { mode: 'no-cors', cache: 'no-store' });
    const ping = Math.round(performance.now() - start);

    if (pingValue) pingValue.textContent = `${ping} ms`;
    if (netStatus) {
      if (ping < 100) {
        netStatus.textContent = "Optimal";
        netStatus.className = "net-value online";
      } else if (ping < 250) {
        netStatus.textContent = "Slow";
        netStatus.className = "net-value warning";
      } else {
        netStatus.textContent = "Lagging";
        netStatus.className = "net-value offline";
      }
    }
  } catch (e) {
    if (pingValue) pingValue.textContent = "ERR";
    if (netStatus) {
      netStatus.textContent = "Unreachable";
      netStatus.className = "net-value offline";
    }
  }
}

function applyNetworkMonitor(): void {
  const { showNetworkMonitor, zenMode } = getSettings();
  const shouldShow = showNetworkMonitor && !zenMode;

  if (networkWidget) {
    networkWidget.style.display = shouldShow ? "flex" : "none";
  }

  if (shouldShow) {
    measurePing(); // Check immediately
    if (!pingInterval) {
      pingInterval = window.setInterval(measurePing, 5000); // Check every 5s
    }
  } else {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  }
}
// -------------------------------------

function renderQuickLinks(): void {
  if (!quickLinksEl) return;
  const links = getQuickLinks();
  quickLinksEl.innerHTML = links
    .filter((l) => l.name && l.url)
    .map(
      (l) =>
        `<a class="quick-link" href="${l.url}" target="_blank" rel="noopener">${l.name}</a>`
    )
    .join("");
}

function updateDailyFocus(): void {
  if (dailyFocusEl) {
    // @ts-ignore
    const f = getSettings().dailyFocus?.trim();
    dailyFocusEl.textContent = f ? `— ${f} —` : "";
  }
}

(async () => {
  const { bgMode, imageRotation } = getSettings();
  applyBgMode();
  applyTheme();

  if (bgMode === "video" && videoEl) {
    reloadVideos().catch(console.error);
    videoEl.addEventListener("ended", () => {
      const vs = getVideos();
      if (!vs.length) return;
      let next: number;
      do {
        next = Math.floor(Math.random() * vs.length);
      } while (next === getCurrentIndex() && vs.length > 1);
      setCurrentIndex(next);
      playVideo(videoEl!, next);
    });
    videoEl.addEventListener("error", () => {
      const vs = getVideos();
      if (vs.length > 1) {
        const next = (getCurrentIndex() + 1) % vs.length;
        setCurrentIndex(next);
        playVideo(videoEl!, next);
      }
    });
  } else if (bgMode === "image" && bgImageEl) {
    await loadWallpapers();
    const url = getRandomImageUrl();
    setBackgroundImage(bgImageEl as HTMLDivElement, url, getSettings().blurLevel || 0);
    // @ts-ignore
    if (imageRotation > 0) {
      setInterval(() => {
        const next = getNextImageUrl();
        (bgImageEl as HTMLElement).style.opacity = "0";
        setTimeout(() => {
          setBackgroundImage(bgImageEl as HTMLDivElement, next, getSettings().blurLevel || 0);
          (bgImageEl as HTMLElement).style.opacity = "1";
        }, 400);
      // @ts-ignore
      }, imageRotation * 60 * 1000);
    }
  }
})();

updateTime(timeEl, dateEl, greetingEl);
setInterval(() => updateTime(timeEl, dateEl, greetingEl), 1000);

initSearch(searchInput, searchLogo);
loadQuote(quoteEl).catch(console.error);

const settings = getSettings();
if (settings.showWeather !== false) {
  import("./weather").then(({ loadWeather }) => {
    const weatherWidget = document.getElementById("weatherWidget");
    const weatherIcon = document.querySelector(".weather-icon");
    const weatherTemp = document.querySelector(".weather-temp");
    const weatherDesc = document.querySelector(".weather-desc");
    const weatherLocation = document.querySelector(".weather-location");
    const weatherEls = {
      widget: weatherWidget,
      icon: weatherIcon as HTMLElement | null,
      temp: weatherTemp as HTMLElement | null,
      desc: weatherDesc as HTMLElement | null,
      location: weatherLocation as HTMLElement | null,
    };
    loadWeather(weatherEls).catch(console.error);
    setInterval(() => loadWeather(weatherEls).catch(console.error), 30 * 60 * 1000);
  });
} else {
  const weatherWidget = document.getElementById("weatherWidget");
  if (weatherWidget) weatherWidget.style.display = "none";
}

// --- LIVE SETTINGS UPDATER ---
window.addEventListener("storage", (event) => {
  if (event.key === "zetonicSettings") {
    loadSettings();
    applyTheme();
    applyBgMode();
    applyFocusMode();
    applySearchVisibility();
    updateDailyFocus();
    
    if (typeof applyNetworkMonitor === "function") {
      applyNetworkMonitor();
    }
  }
});

renderQuickLinks();
updateDailyFocus();
applyFocusMode();
applySearchVisibility();
applyNetworkMonitor(); // <-- NEW: Kick off the monitor logic