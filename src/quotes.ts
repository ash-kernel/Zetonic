import { getSettings } from "./settings";

const FALLBACK_QUOTES = [
  "The journey of a thousand miles begins with one step.",
  "Dream big and dare to fail.",
  "Stay focused and never give up.",
  "Simplicity is the ultimate sophistication.",
  "Believe you can and you're halfway there.",
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal.",
  "Every moment is a fresh beginning.",
];

export async function loadQuote(quoteEl: HTMLElement | null): Promise<void> {
  if (!quoteEl) return;

  const settings = getSettings();
  if (!settings.showQuote) {
    quoteEl.style.display = "none";
    return;
  }

  quoteEl.style.display = "block";

  try {
    const response = await fetch("https://api.adviceslip.com/advice");
    if (!response.ok) throw new Error("API request failed");

    const data = (await response.json()) as { slip: { advice: string } };
    quoteEl.textContent = `"${data.slip.advice}"`;
  } catch (error) {
    const randomQuote =
      FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    quoteEl.textContent = `"${randomQuote}"`;
  }
}
