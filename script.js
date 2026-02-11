
const video = document.getElementById("bg");
let videos = [];
let currentIndex = 0;


const REMOTE_VIDEOS_URL = "https://raw.githubusercontent.com/ash-kernel/Zetonic/refs/heads/main/sup/videos.json"; 
async function loadVideos() {
  try {
    let data;
    if (REMOTE_VIDEOS_URL) {
      const r = await fetch(REMOTE_VIDEOS_URL);
      if (!r.ok) throw new Error(`Remote fetch failed: ${r.status}`);
      data = await r.json();
    } else {
      const r = await fetch(chrome.runtime.getURL("sup/videos.json"));
      if (!r.ok) throw new Error(`Local fetch failed: ${r.status}`);
      data = await r.json();
    }

    if (!Array.isArray(data) || data.length === 0) throw new Error('No videos found');
    videos = data;
    currentIndex = Math.floor(Math.random() * videos.length);
    video.src = videos[currentIndex];
    video.load();
  } catch (err) {
    console.error('Error loading videos (remote/local):', err);
 
    try {
      const r = await fetch(chrome.runtime.getURL("sup/videos.json"));
      const localData = await r.json();
      if (Array.isArray(localData) && localData.length) {
        videos = localData;
        currentIndex = Math.floor(Math.random() * videos.length);
        video.src = videos[currentIndex];
        video.load();
      }
    } catch (fallbackErr) {
      console.error('Fallback local videos failed:', fallbackErr);
    }
  }
}

loadVideos();

video.addEventListener("ended", () => {
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * videos.length);
  } while(nextIndex === currentIndex);

  currentIndex = nextIndex;
  video.src = videos[currentIndex];
  video.load();
  video.play();
});


const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");

function updateTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");

  timeEl.textContent = `${h}:${m}:${s}`;
  dateEl.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

setInterval(updateTime, 1000);
updateTime();


const googleLogo = document.getElementById("googleLogo");
const searchInput = document.querySelector("#searchContainer input");

searchInput.addEventListener("focus", () => {
  googleLogo.style.transform = "scale(1.1)";
});

searchInput.addEventListener("blur", () => {
  googleLogo.style.transform = "scale(1)";
});


const quotes = [
  "“The journey of a thousand miles begins with one step.”",
  "“Dream big and dare to fail.”",
  "“Stay focused and never give up.”",
  "“Simplicity is the ultimate sophistication.”"
];

const quoteEl = document.getElementById("quote");


async function loadQuote() {
  try {
    const response = await fetch("https://api.adviceslip.com/advice");
    const data = await response.json();
    quoteEl.textContent = `"${data.slip.advice}"`;
  } catch (error) {
    console.error("Error loading quote:", error);

    quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  }
}

loadQuote();
