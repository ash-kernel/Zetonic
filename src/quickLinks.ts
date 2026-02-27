export interface QuickLink {
  name: string;
  url: string;
}

const KEY = "zetonicQuickLinks";
const DEFAULT_LINKS: QuickLink[] = [
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "YouTube", url: "https://youtube.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "Reddit", url: "https://reddit.com" },
  { name: "Twitter", url: "https://x.com" },
  { name: "ChatGPT", url: "https://chat.openai.com" },
];

export function getQuickLinks(): QuickLink[] {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return [...DEFAULT_LINKS];
    const parsed = JSON.parse(s) as QuickLink[];
    if (!Array.isArray(parsed)) return [...DEFAULT_LINKS];
    return parsed.map((l) => ({
      name: String(l.name || "Link").slice(0, 20),
      url: String(l.url || "#").slice(0, 500),
    }));
  } catch {
    return [...DEFAULT_LINKS];
  }
}

export function saveQuickLinks(links: QuickLink[]): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(links.slice(0, 12).map((l) => ({
        name: String(l.name || "").slice(0, 20),
        url: String(l.url || "").slice(0, 500),
      })))
    );
  } catch {}
}
