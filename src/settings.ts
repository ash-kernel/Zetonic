import type { Settings } from "./types";

const STORAGE_KEY = "zetonicSettings";

const defaults: Settings = {
  showClock: true,
  showQuote: true,
  showWeather: true,
  format24: true,
  localVideosOnly: false,
  focusMode: false,
  zenMode: false,
  searchEngine: "google",
  bgMode: "video",
  imageSource: "curated",
  customBgUrl: "",
  imageRotation: 10,
  blurLevel: 0,
  theme: "default",
  userName: "",
  dailyFocus: "",
  showQuickLinks: true,
};

let settings: Settings = { ...defaults };

export function getSettings(): Settings {
  return { ...settings };
}

export function loadSettings(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<Settings>;
      settings = { ...defaults, ...parsed };
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

export function saveSettings(updates: Partial<Settings>): void {
  try {
    settings = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}
