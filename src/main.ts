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
import { initSettingsPanel, displayUserVideos } from "./settingsPanel";
import { getQuickLinks } from "./quickLinks";
import { showToast } from "./toast";
import { onShortcut, initKeyboard } from "./keyboard";

const videoEl = document.getElementById("bgVideo") as HTMLVideoElement | null;
const bgImageEl = document.getElementById("bgImage");
const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const greetingEl = document.getElementById("greeting");
const dailyFocusEl = document.getElementById("dailyFocusDisplay");
const searchInput = document.getElementById("searchInput") as HTMLInputElement | null;
const searchLogo = document.getElementById("searchLogo");
const quoteEl = document.getElementById("quote");
const weatherWidget = document.getElementById("weatherWidget");
const weatherIcon = document.querySelector(".weather-icon");
const weatherTemp = document.querySelector(".weather-temp");
const weatherDesc = document.querySelector(".weather-desc");
const weatherLocation = document.querySelector(".weather-location");
const nextBgBtn = document.getElementById("nextBgBtn");
const quickLinksEl = document.getElementById("quickLinks");
const settingsPanel = document.getElementById("settingsPanel");

loadSettings();

function applyTheme(): void {
  document.documentElement.setAttribute("data-theme", getSettings().theme || "default");
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

async function showUserVideos(): Promise<void> {
  await displayUserVideos(document.getElementById("userVideosList"), reloadVideos);
}

function applyFocusMode(): void {
  const { focusMode, zenMode, showQuickLinks } = getSettings();
  const show = !focusMode && !zenMode;
  if (quoteEl) quoteEl.style.display = show ? "block" : "none";
  if (weatherWidget) weatherWidget.style.display = show ? "flex" : "none";
  if (quickLinksEl) quickLinksEl.style.display = show && showQuickLinks ? "flex" : "none";
  if (dailyFocusEl) dailyFocusEl.style.display = show ? "block" : "none";
  document.body.classList.toggle("zen-mode", zenMode);
}

function playNextBg(): void {
  const { bgMode } = getSettings();
  if (bgMode === "video") {
    const vs = getVideos();
    if (!vs.length || !videoEl) return;
    let next = (getCurrentIndex() + 1) % vs.length;
    if (next === getCurrentIndex() && vs.length > 1) next = 0;
    setCurrentIndex(next);
    playVideo(videoEl, next);
  } else {
    const url = getNextImageUrl();
    setBackgroundImage(bgImageEl as HTMLDivElement, url, getSettings().blurLevel || 0);
  }
}

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
    const f = getSettings().dailyFocus?.trim();
    dailyFocusEl.textContent = f ? `— ${f} —` : "";
  }
}

// Background init
(async () => {
  const { bgMode, imageSource, imageRotation } = getSettings();
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
    if (imageRotation > 0) {
      setInterval(() => {
        const next = getNextImageUrl();
        (bgImageEl as HTMLElement).style.opacity = "0";
        setTimeout(() => {
          setBackgroundImage(bgImageEl as HTMLDivElement, next, getSettings().blurLevel || 0);
          (bgImageEl as HTMLElement).style.opacity = "1";
        }, 400);
      }, imageRotation * 60 * 1000);
    }
  }
})();

nextBgBtn?.addEventListener("click", playNextBg);

// Clock
updateTime(timeEl, dateEl, greetingEl);
setInterval(() => updateTime(timeEl, dateEl, greetingEl), 1000);

// Search
initSearch(searchInput, searchLogo);

// Quote
loadQuote(quoteEl).catch(console.error);

// Weather
const weatherEls = {
  widget: weatherWidget,
  icon: weatherIcon as HTMLElement | null,
  temp: weatherTemp as HTMLElement | null,
  desc: weatherDesc as HTMLElement | null,
  location: weatherLocation as HTMLElement | null,
};
loadWeather(weatherEls).catch(console.error);
setInterval(() => loadWeather(weatherEls).catch(console.error), 30 * 60 * 1000);

// Quick links
renderQuickLinks();
updateDailyFocus();
applyFocusMode();

// Keyboard
onShortcut("n", playNextBg);
onShortcut("s", () => {
  const open = settingsPanel?.getAttribute("data-open") === "true";
  settingsPanel?.setAttribute("data-open", open ? "false" : "true");
  if (!open) showUserVideos().catch(console.error);
});
initKeyboard();

// Settings panel
initSettingsPanel(
  {
    settingsBtn: document.getElementById("settingsBtn"),
    settingsPanel,
    closeSettings: document.getElementById("closeSettings"),
    toggleClock: document.getElementById("toggleClock") as HTMLInputElement | null,
    toggleQuote: document.getElementById("toggleQuote") as HTMLInputElement | null,
    toggleWeather: document.getElementById("toggleWeather") as HTMLInputElement | null,
    toggleQuickLinks: document.getElementById("toggleQuickLinks") as HTMLInputElement | null,
    toggleFocus: document.getElementById("toggleFocus") as HTMLInputElement | null,
    toggleZen: document.getElementById("toggleZen") as HTMLInputElement | null,
    toggleLocalOnly: document.getElementById("toggleLocalOnly") as HTMLInputElement | null,
    timeFormat: document.getElementById("timeFormat") as HTMLSelectElement | null,
    theme: document.getElementById("theme") as HTMLSelectElement | null,
    searchEngine: document.getElementById("searchEngine") as HTMLSelectElement | null,
    bgMode: document.getElementById("bgMode") as HTMLSelectElement | null,
    imageSource: document.getElementById("imageSource") as HTMLSelectElement | null,
    customBgUrl: document.getElementById("customBgUrl") as HTMLInputElement | null,
    imageRotation: document.getElementById("imageRotation") as HTMLInputElement | null,
    blurLevel: document.getElementById("blurLevel") as HTMLInputElement | null,
    userName: document.getElementById("userName") as HTMLInputElement | null,
    dailyFocus: document.getElementById("dailyFocus") as HTMLInputElement | null,
    addVideoInput: document.getElementById("addVideoInput") as HTMLInputElement | null,
    addVideoBtn: document.getElementById("addVideoBtn"),
    uploadVideoInput: document.getElementById("uploadVideoInput") as HTMLInputElement | null,
    userVideosList: document.getElementById("userVideosList"),
    uploadLabel: document.querySelector(".upload-btn"),
    quickLinksEditor: document.getElementById("quickLinksEditor"),
  },
  {
    onUpdateTime: () => updateTime(timeEl, dateEl, greetingEl),
    onLoadQuote: () => loadQuote(quoteEl).catch(console.error),
    onLoadWeather: () => loadWeather(weatherEls).catch(console.error),
    onReloadVideos: () => reloadVideos().catch(console.error),
    onDisplayVideos: () => showUserVideos().catch(console.error),
    onFocusModeChange: () => {
      applyFocusMode();
      updateDailyFocus();
    },
    onBgModeChange: applyBgMode,
    onThemeChange: applyTheme,
    onQuickLinksChange: renderQuickLinks,
    onDailyFocusChange: updateDailyFocus,
  }
);
