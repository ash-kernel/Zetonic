import type { Settings } from "./types";

const WALLPAPERS_URL =
  "https://raw.githubusercontent.com/ash-kernel/Zetonic/main/sup/wallpapers.json";
const PICSUM = (s: string) => `https://picsum.photos/seed/${s}/1920/1080`;

const FALLBACK_WALLPAPERS = [
  PICSUM("city"), PICSUM("night"), PICSUM("nature"),
  PICSUM("sky"), PICSUM("ocean"), PICSUM("mountain"),
];

let wallpapers: string[] = [...FALLBACK_WALLPAPERS];
let currentImageIndex = 0;

export async function loadWallpapers(): Promise<string[]> {
  try {
    const r = await fetch(WALLPAPERS_URL);
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data) && data.length > 0) wallpapers = data;
    }
  } catch {
    /* use fallback */
  }
  return wallpapers;
}

function getSettings(): Partial<Settings> {
  try {
    const s = localStorage.getItem("zetonicSettings");
    return s ? (JSON.parse(s) as Partial<Settings>) : {};
  } catch {
    return {};
  }
}

export function getRandomImageUrl(): string {
  const { imageSource = "curated", customBgUrl = "" } = getSettings();
  if (imageSource === "custom" && customBgUrl) return customBgUrl;
  if (imageSource === "picsum") return PICSUM(`r${Math.floor(Math.random() * 9999)}`);
  const idx = Math.floor(Math.random() * wallpapers.length);
  currentImageIndex = idx;
  return wallpapers[idx];
}

export function getNextImageUrl(): string {
  const { imageSource = "curated", customBgUrl = "" } = getSettings();
  if (imageSource === "picsum") return PICSUM(`n${Date.now() % 99999}`);
  if (imageSource === "custom" && customBgUrl) return customBgUrl;
  currentImageIndex = (currentImageIndex + 1) % wallpapers.length;
  return wallpapers[currentImageIndex];
}

export function setBackgroundImage(
  el: HTMLDivElement | null,
  url: string,
  blur = 0
): void {
  if (!el) return;
  el.style.backgroundImage = `url(${url})`;
  el.style.filter = blur ? `blur(${blur}px)` : "none";
  el.classList.add("bg-loaded");
}

export async function initImageBackground(
  bgEl: HTMLElement | null,
  rotationMinutes: number
): Promise<void> {
  if (!bgEl) return;
  await loadWallpapers();
  const url = getRandomImageUrl();
  const { blurLevel = 0 } = getSettings();
  setBackgroundImage(bgEl as HTMLDivElement, url, blurLevel);

  if (rotationMinutes > 0) {
    setInterval(() => {
      const next = getNextImageUrl();
      bgEl.style.opacity = "0";
      setTimeout(() => {
        setBackgroundImage(bgEl as HTMLDivElement, next, getSettings().blurLevel ?? 0);
        bgEl.style.opacity = "1";
      }, 400);
    }, rotationMinutes * 60 * 1000);
  }
}
