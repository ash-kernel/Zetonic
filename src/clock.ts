import { getSettings } from "./settings";
import { getGreeting } from "./greeting";

export function updateTime(
  timeEl: HTMLElement | null,
  dateEl: HTMLElement | null,
  greetingEl?: HTMLElement | null
): void {
  if (!timeEl || !dateEl) return;

  const settings = getSettings();
  if (!settings.showClock) {
    timeEl.style.display = "none";
    dateEl.style.display = "none";
    if (greetingEl) greetingEl.style.display = "none";
    return;
  }

  timeEl.style.display = "block";
  dateEl.style.display = "block";
  if (greetingEl) {
    greetingEl.style.display = "block";
    greetingEl.textContent = getGreeting();
  }

  const now = new Date();
  let hours = now.getHours();
  let suffix = "";

  if (!settings.format24) {
    suffix = hours >= 12 ? " PM" : " AM";
    hours = hours % 12 || 12;
  }

  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  timeEl.textContent = `${hours.toString().padStart(2, "0")}:${minutes}:${seconds}${suffix}`;

  dateEl.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function startClock(
  timeEl: HTMLElement | null,
  dateEl: HTMLElement | null
): () => void {
  updateTime(timeEl, dateEl);
  const interval = setInterval(() => updateTime(timeEl, dateEl), 1000);
  return () => clearInterval(interval);
}
