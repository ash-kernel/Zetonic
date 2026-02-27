import type { Settings } from "./types";
import { getSettings, saveSettings } from "./settings";
import {
  addUserVideo,
  removeUserVideo,
  removeLocalVideo,
  getUserVideos,
  getLocalVideos,
} from "./video";
import { getQuickLinks, saveQuickLinks } from "./quickLinks";
import { showToast } from "./toast";
import { initImageBackground, getRandomImageUrl, setBackgroundImage, loadWallpapers } from "./background";

function truncate(s: string, max = 32): string {
  return s.length <= max ? s : s.slice(0, max) + "…";
}

export async function displayUserVideos(
  listEl: HTMLElement | null,
  onReload: () => void
): Promise<void> {
  if (!listEl) return;

  const userVideos = getUserVideos();
  const localVideos = await getLocalVideos();

  if (!userVideos.length && !localVideos.length) {
    listEl.innerHTML = '<p class="no-videos">No videos yet</p>';
    return;
  }

  let html = "";
  if (userVideos.length) {
    html += '<div class="video-category">URL</div>';
    html += userVideos
      .map(
        (url) => `
      <div class="video-item">
        <span class="video-url" title="${url.replace(/"/g, "&quot;")}">${truncate(url)}</span>
        <button class="remove-btn" data-url="${url.replace(/"/g, "&quot;")}" data-type="url">×</button>
      </div>
    `
      )
      .join("");
  }
  if (localVideos.length) {
    html += '<div class="video-category">Local</div>';
    html += localVideos
      .map(
        (v) => `
      <div class="video-item">
        <span class="video-url" title="${v.name.replace(/"/g, "&quot;")}">${truncate(v.name, 24)}</span>
        <button class="remove-btn" data-id="${v.id}" data-type="local">×</button>
      </div>
    `
      )
      .join("");
  }

  listEl.innerHTML = html;

  listEl.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const type = target.getAttribute("data-type");
      if (!confirm("Remove this video?")) return;

      try {
        if (type === "url") {
          const url = target.getAttribute("data-url");
          if (url) removeUserVideo(url, onReload);
        } else if (type === "local") {
          const id = parseInt(target.getAttribute("data-id") ?? "0", 10);
          await removeLocalVideo(id);
          await onReload();
        }
        await displayUserVideos(listEl, onReload);
        showToast("Removed", "success");
      } catch {
        showToast("Failed to remove", "error");
      }
    });
  });
}

function initCollapsible(panel: HTMLElement): void {
  panel.querySelectorAll(".section-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = (btn as HTMLElement).closest(".settings-section");
      if (!section) return;
      const collapsed = section.getAttribute("data-collapsed") === "true";
      section.setAttribute("data-collapsed", String(!collapsed));
      btn.setAttribute("aria-expanded", String(collapsed));
    });
  });
}

function renderQuickLinksEditor(container: HTMLElement | null, onUpdate: () => void): void {
  if (!container) return;
  let links = getQuickLinks();
  while (links.length < 6) links.push({ name: "", url: "" });
  links = links.slice(0, 6);
  container.innerHTML = links
    .map(
      (l, i) => `
    <div class="quick-link-edit">
      <input type="text" data-i="${i}" data-field="name" value="${(l.name || "").replace(/"/g, "&quot;")}" placeholder="Name">
      <input type="text" data-i="${i}" data-field="url" value="${(l.url || "").replace(/"/g, "&quot;")}" placeholder="URL">
    </div>
  `
    )
    .join("");

  container.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      const i = parseInt(input.getAttribute("data-i") ?? "0", 10);
      const field = input.getAttribute("data-field") as "name" | "url";
      const arr = getQuickLinks();
      while (arr.length <= i) arr.push({ name: "", url: "" });
      arr[i] = arr[i] || { name: "", url: "" };
      arr[i][field] = (input as HTMLInputElement).value.trim();
      saveQuickLinks(arr);
      onUpdate();
    });
  });
}

export function initSettingsPanel(
  elements: Record<string, HTMLElement | HTMLInputElement | HTMLSelectElement | null>,
  callbacks: Record<string, () => void>
): void {
  const s = getSettings();
  const set = (el: HTMLInputElement | HTMLSelectElement | null, val: unknown) => {
    if (!el) return;
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox") el.checked = !!val;
      else if (el.type === "range" || el.type === "number") el.value = String(val ?? 0);
      else el.value = String(val ?? "");
    } else {
      (el as HTMLSelectElement).value = String(val ?? "");
    }
  };

  set(elements.toggleClock as HTMLInputElement, s.showClock);
  set(elements.toggleQuote as HTMLInputElement, s.showQuote);
  set(elements.toggleWeather as HTMLInputElement, s.showWeather);
  set(elements.toggleQuickLinks as HTMLInputElement, s.showQuickLinks);
  set(elements.toggleFocus as HTMLInputElement, s.focusMode);
  set(elements.toggleZen as HTMLInputElement, s.zenMode);
  set(elements.toggleLocalOnly as HTMLInputElement, s.localVideosOnly);
  set(elements.timeFormat as HTMLSelectElement, s.format24 ? "24" : "12");
  set(elements.theme as HTMLSelectElement, s.theme);
  set(elements.searchEngine as HTMLSelectElement, s.searchEngine);
  set(elements.bgMode as HTMLSelectElement, s.bgMode);
  set(elements.imageSource as HTMLSelectElement, s.imageSource);
  set(elements.customBgUrl as HTMLInputElement, s.customBgUrl);
  set(elements.imageRotation as HTMLInputElement, s.imageRotation ?? 0);
  set(elements.blurLevel as HTMLInputElement, s.blurLevel ?? 0);
  set(elements.userName as HTMLInputElement, s.userName);
  set(elements.dailyFocus as HTMLInputElement, s.dailyFocus);

  const settingsPanel = elements.settingsPanel as HTMLElement;
  if (settingsPanel) initCollapsible(settingsPanel);

  const open = () => {
    settingsPanel?.setAttribute("data-open", "true");
    callbacks.onDisplayVideos?.();
    renderQuickLinksEditor(elements.quickLinksEditor as HTMLElement, callbacks.onQuickLinksChange!);
  };
  const close = () => settingsPanel?.removeAttribute("data-open");

  elements.settingsBtn?.addEventListener("click", () => {
    if (settingsPanel?.getAttribute("data-open") === "true") close();
    else open();
  });
  elements.closeSettings?.addEventListener("click", close);

  document.addEventListener("click", (e) => {
    if (
      settingsPanel &&
      !settingsPanel.contains(e.target as Node) &&
      e.target !== elements.settingsBtn
    ) {
      close();
    }
  });

  elements.toggleClock?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ showClock: this.checked });
    callbacks.onUpdateTime?.();
  });
  elements.toggleQuote?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ showQuote: this.checked });
    callbacks.onLoadQuote?.();
  });
  elements.toggleWeather?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ showWeather: this.checked });
    callbacks.onLoadWeather?.();
  });
  elements.toggleQuickLinks?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ showQuickLinks: this.checked });
    callbacks.onFocusModeChange?.();
  });
  elements.toggleFocus?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ focusMode: this.checked });
    callbacks.onFocusModeChange?.();
  });
  elements.toggleZen?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ zenMode: this.checked });
    callbacks.onFocusModeChange?.();
  });
  elements.toggleLocalOnly?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ localVideosOnly: this.checked });
    callbacks.onReloadVideos?.();
  });
  elements.timeFormat?.addEventListener("change", function (this: HTMLSelectElement) {
    saveSettings({ format24: this.value === "24" });
    callbacks.onUpdateTime?.();
  });
  elements.theme?.addEventListener("change", function (this: HTMLSelectElement) {
    saveSettings({ theme: this.value as Settings["theme"] });
    callbacks.onThemeChange?.();
  });
  elements.searchEngine?.addEventListener("change", function (this: HTMLSelectElement) {
    saveSettings({ searchEngine: this.value as "google" | "duckduckgo" });
  });
  elements.bgMode?.addEventListener("change", function (this: HTMLSelectElement) {
    saveSettings({ bgMode: this.value as "video" | "image" });
    callbacks.onBgModeChange?.();
  });
  elements.imageSource?.addEventListener("change", function (this: HTMLSelectElement) {
    saveSettings({ imageSource: this.value as "curated" | "picsum" | "custom" });
  });
  elements.customBgUrl?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ customBgUrl: this.value.trim() });
  });
  elements.imageRotation?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ imageRotation: Math.max(0, parseInt(this.value, 10) || 0) });
  });
  elements.blurLevel?.addEventListener("input", function (this: HTMLInputElement) {
    const v = parseInt(this.value, 10) || 0;
    saveSettings({ blurLevel: v });
    const bgImage = document.getElementById("bgImage");
    if (bgImage?.classList.contains("bg-loaded")) {
      const url = (bgImage.style.backgroundImage || "").match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      if (url) setBackgroundImage(bgImage as HTMLDivElement, url, v);
    }
  });
  elements.userName?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ userName: this.value.trim() });
    callbacks.onUpdateTime?.();
  });
  elements.dailyFocus?.addEventListener("change", function (this: HTMLInputElement) {
    saveSettings({ dailyFocus: this.value.trim() });
    callbacks.onDailyFocusChange?.();
  });

  elements.addVideoBtn?.addEventListener("click", () => {
    const url = (elements.addVideoInput as HTMLInputElement)?.value.trim() ?? "";
    if (!url) {
      showToast("Enter a URL", "error");
      return;
    }
    const r = addUserVideo(url);
    if (r.success) {
      showToast(r.message, "success");
      if (elements.addVideoInput) (elements.addVideoInput as HTMLInputElement).value = "";
      callbacks.onDisplayVideos?.();
    } else {
      showToast(r.message, "error");
    }
  });

  elements.addVideoInput?.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") elements.addVideoBtn?.click();
  });

  elements.uploadLabel?.addEventListener("click", () =>
    (elements.uploadVideoInput as HTMLInputElement)?.click()
  );

  elements.uploadVideoInput?.addEventListener("change", async function (e) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      showToast("Invalid file", "error");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      showToast("Max 100MB", "error");
      return;
    }
    try {
      showToast("Uploading…", "success");
      const { saveLocalVideo } = await import("./video");
      await saveLocalVideo(file);
      showToast("Added", "success");
      await callbacks.onReloadVideos?.();
      callbacks.onDisplayVideos?.();
      if (elements.uploadVideoInput) (elements.uploadVideoInput as HTMLInputElement).value = "";
    } catch {
      showToast("Upload failed", "error");
    }
  });
}
