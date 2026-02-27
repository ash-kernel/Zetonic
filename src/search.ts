import { getSettings } from "./settings";

const SEARCH_URLS: Record<string, (q: string) => string> = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo: (q) =>
    `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
};

export function initSearch(
  searchInput: HTMLInputElement | null,
  searchLogo: HTMLElement | null
): void {
  if (!searchInput) return;

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        const engine = getSettings().searchEngine;
        const url = SEARCH_URLS[engine]?.(query) ?? SEARCH_URLS.google(query);
        window.location.href = url;
      }
    }
  });

  if (searchLogo) {
    searchInput.addEventListener("focus", () => {
      searchLogo.style.transform = "scale(1.1)";
    });
    searchInput.addEventListener("blur", () => {
      searchLogo.style.transform = "scale(1)";
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
      e.preventDefault();
      searchInput.focus();
    }
  });
}
