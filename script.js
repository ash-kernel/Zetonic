const video = document.getElementById("bg");
let videos = [];
let currentIndex = 0;
const REMOTE_VIDEOS_URL = "https://raw.githubusercontent.com/ash-kernel/Zetonic/main/sup/videos.json";

// LOAD VIDEO LIST
async function loadVideos() {
  try {
    const response = await fetch(REMOTE_VIDEOS_URL);
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw "No videos";
    videos = data;
  } catch {
    console.error("Failed to load remote videos.");
    return;
  }

  currentIndex = Math.floor(Math.random() * videos.length);
  video.src = videos[currentIndex];
}

loadVideos();

// LOOP VIDEO
video.addEventListener("ended", () => {
  if (!videos.length) return;
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * videos.length);
  } while (nextIndex === currentIndex);
  currentIndex = nextIndex;
  video.src = videos[currentIndex];
  video.play();
});

// SETTINGS
let settings = { showClock: true, showQuote: true, format24: true };
const saved = JSON.parse(localStorage.getItem("zetonicSettings"));
if (saved) settings = saved;

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const quoteEl = document.getElementById("quote");

function updateTime() {
  if (!settings.showClock) {
    timeEl.textContent = "";
    dateEl.textContent = "";
    return;
  }
  const now = new Date();
  let hours = now.getHours();
  let suffix = "";
  if (!settings.format24) {
    suffix = hours >= 12 ? " PM" : " AM";
    hours = hours % 12 || 12;
  }
  const minutes = now.getMinutes().toString().padStart(2, "0");
  timeEl.textContent = hours.toString().padStart(2, "0") + ":" + minutes + suffix;

  dateEl.textContent = now.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric"
  });
}

setInterval(updateTime, 1000);
updateTime();

// SEARCH
const searchInput = document.querySelector("#searchContainer input");
const googleLogo = document.getElementById("googleLogo");
searchInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const query = this.value.trim();
    if (query) window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(query);
  }
});
searchInput.addEventListener("focus", () => googleLogo.style.transform = "scale(1.1)");
searchInput.addEventListener("blur", () => googleLogo.style.transform = "scale(1)");

// QUOTES
const fallbackQuotes = [
  "The journey of a thousand miles begins with one step.",
  "Dream big and dare to fail.",
  "Stay focused and never give up.",
  "Simplicity is the ultimate sophistication."
];
function loadQuote() {
  if (!settings.showQuote) { quoteEl.textContent = ""; return; }
  fetch("https://api.adviceslip.com/advice")
    .then(res => res.json())
    .then(data => quoteEl.textContent = `"${data.slip.advice}"`)
    .catch(() => {
      quoteEl.textContent = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    });
}
loadQuote();

// SETTINGS PANEL
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const toggleClock = document.getElementById("toggleClock");
const toggleQuote = document.getElementById("toggleQuote");
const timeFormat = document.getElementById("timeFormat");

toggleClock.checked = settings.showClock;
toggleQuote.checked = settings.showQuote;
timeFormat.value = settings.format24 ? "24" : "12";

settingsBtn.addEventListener("click", () => {
  settingsPanel.style.display = settingsPanel.style.display === "flex" ? "none" : "flex";
});

toggleClock.addEventListener("change", function() {
  settings.showClock = this.checked;
  localStorage.setItem("zetonicSettings", JSON.stringify(settings));
  updateTime();
});

toggleQuote.addEventListener("change", function() {
  settings.showQuote = this.checked;
  localStorage.setItem("zetonicSettings", JSON.stringify(settings));
  loadQuote();
});

timeFormat.addEventListener("change", function() {
  settings.format24 = this.value === "24";
  localStorage.setItem("zetonicSettings", JSON.stringify(settings));
  updateTime();
});