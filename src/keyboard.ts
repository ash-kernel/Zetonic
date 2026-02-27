type ShortcutHandler = () => void;

const shortcuts: Array<{ key: string; ctrl?: boolean; handler: ShortcutHandler }> = [];

export function onShortcut(
  key: string,
  handler: ShortcutHandler,
  options?: { ctrl?: boolean }
): void {
  shortcuts.push({
    key: key.toLowerCase(),
    ctrl: options?.ctrl,
    handler,
  });
}

export function initKeyboard(): void {
  document.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement;
    if (target?.closest?.("input, textarea, select") && e.key !== "Escape") return;

    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;

    if (key === "escape") {
      document.getElementById("settingsPanel")?.removeAttribute("data-open");
      return;
    }

    for (const s of shortcuts) {
      if (s.key === key && (s.ctrl ? ctrl : !ctrl)) {
        e.preventDefault();
        s.handler();
        return;
      }
    }
  });
}
