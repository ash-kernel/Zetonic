
const video = document.getElementById("bg");
let videos = [];
let currentIndex = 0;
const REMOTE_VIDEOS_URL = "https://raw.githubusercontent.com/ash-kernel/Zetonic/main/sup/videos.json";

async function loadVideos() {
  try {
 
    const response = await fetch(REMOTE_VIDEOS_URL);
    if (!response.ok) throw new Error("Failed to fetch videos");
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid video data");
    }
    
    videos = [...data];
    
   
    const userVideos = getUserVideos();
    if (userVideos.length > 0) {
      videos = [...videos, ...userVideos];
    }
    
    
    currentIndex = Math.floor(Math.random() * videos.length);
    await playVideo(currentIndex);
    
  } catch (error) {
    console.error("Video loading error:", error);
    
    const userVideos = getUserVideos();
    if (userVideos.length > 0) {
      videos = userVideos;
      currentIndex = 0;
      await playVideo(currentIndex);
    }
  }
}



async function playVideo(index) {
  try {
    video.src = videos[index];
    await video.play();
  } catch (error) {
    console.error("Video playback error:", error);
  }
}


function getUserVideos() {
  try {
    const stored = localStorage.getItem("zetonicUserVideos");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error loading user videos:", error);
    return [];
  }
}

function saveUserVideos(videoList) {
  try {
    localStorage.setItem("zetonicUserVideos", JSON.stringify(videoList));
  } catch (error) {
    console.error("Error saving user videos:", error);
  }
}


function addUserVideo(url) {
  if (!isValidVideoUrl(url)) {
    return { success: false, message: "Invalid video URL" };
  }
  
  const userVideos = getUserVideos();
  
  
  if (userVideos.includes(url)) {
    return { success: false, message: "Video already exists" };
  }
  
  userVideos.push(url);
  saveUserVideos(userVideos);
  
  
  videos.push(url);
  
  return { success: true, message: "Video added successfully!" };
}


function removeUserVideo(url) {
  const userVideos = getUserVideos();
  const filtered = userVideos.filter(v => v !== url);
  saveUserVideos(filtered);
  
  loadVideos();
}


function isValidVideoUrl(url) {
  try {
    const parsed = new URL(url);
   
    const validExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    const hasValidExtension = validExtensions.some(ext => 
      parsed.pathname.toLowerCase().endsWith(ext)
    );
    
    const validHosts = ['pexels.com', 'pixabay.com', 'catbox.moe', 'youtube.com', 'vimeo.com'];
    const isKnownHost = validHosts.some(host => parsed.hostname.includes(host));
    
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && 
           (hasValidExtension || isKnownHost);
  } catch {
    return false;
  }
}


loadVideos();


video.addEventListener("ended", () => {
  if (!videos.length) return;
  
  let nextIndex;
  
  do {
    nextIndex = Math.floor(Math.random() * videos.length);
  } while (nextIndex === currentIndex && videos.length > 1);
  
  currentIndex = nextIndex;
  playVideo(currentIndex);
});


video.addEventListener("error", (e) => {
  console.error("Video error:", e);

  if (videos.length > 1) {
    currentIndex = (currentIndex + 1) % videos.length;
    playVideo(currentIndex);
  }
});


let settings = {
  showClock: true,
  showQuote: true,
  format24: true
};


function loadSettings() {
  try {
    const saved = localStorage.getItem("zetonicSettings");
    if (saved) {
      settings = { ...settings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}


function saveSettings() {
  try {
    localStorage.setItem("zetonicSettings", JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}


loadSettings();

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");

function updateTime() {
  if (!settings.showClock) {
    timeEl.style.display = "none";
    dateEl.style.display = "none";
    return;
  }
  
  timeEl.style.display = "block";
  dateEl.style.display = "block";
  
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
    year: "numeric"
  });
}

setInterval(updateTime, 1000);
updateTime();

const searchInput = document.querySelector("#searchContainer input");
const googleLogo = document.getElementById("googleLogo");

searchInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const query = this.value.trim();
    if (query) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  }
});

searchInput.addEventListener("focus", () => {
  googleLogo.style.transform = "scale(1.1)";
});

searchInput.addEventListener("blur", () => {
  googleLogo.style.transform = "scale(1)";
});

const quoteEl = document.getElementById("quote");

const fallbackQuotes = [
  "The journey of a thousand miles begins with one step.",
  "Dream big and dare to fail.",
  "Stay focused and never give up.",
  "Simplicity is the ultimate sophistication.",
  "Believe you can and you're halfway there.",
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal.",
  "Every moment is a fresh beginning."
];

async function loadQuote() {
  if (!settings.showQuote) {
    quoteEl.style.display = "none";
    return;
  }
  
  quoteEl.style.display = "block";
  
  try {
    const response = await fetch("https://api.adviceslip.com/advice");
    if (!response.ok) throw new Error("API request failed");
    
    const data = await response.json();
    quoteEl.textContent = `"${data.slip.advice}"`;
  } catch (error) {
    
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    quoteEl.textContent = `"${randomQuote}"`;
  }
}

loadQuote();

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const toggleClock = document.getElementById("toggleClock");
const toggleQuote = document.getElementById("toggleQuote");
const timeFormat = document.getElementById("timeFormat");
const addVideoInput = document.getElementById("addVideoInput");
const addVideoBtn = document.getElementById("addVideoBtn");
const videoFeedback = document.getElementById("videoFeedback");
const userVideosList = document.getElementById("userVideosList");

toggleClock.checked = settings.showClock;
toggleQuote.checked = settings.showQuote;
timeFormat.value = settings.format24 ? "24" : "12";

settingsBtn.addEventListener("click", () => {
  const isVisible = settingsPanel.style.display === "flex";
  settingsPanel.style.display = isVisible ? "none" : "flex";
  
  if (!isVisible) {
    displayUserVideos();
  }
});

document.addEventListener("click", (e) => {
  if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
    settingsPanel.style.display = "none";
  }
});

toggleClock.addEventListener("change", function() {
  settings.showClock = this.checked;
  saveSettings();
  updateTime();
});

toggleQuote.addEventListener("change", function() {
  settings.showQuote = this.checked;
  saveSettings();
  loadQuote();
});

timeFormat.addEventListener("change", function() {
  settings.format24 = this.value === "24";
  saveSettings();
  updateTime();
});

addVideoBtn.addEventListener("click", () => {
  const url = addVideoInput.value.trim();
  
  if (!url) {
    showFeedback("Please enter a video URL", "error");
    return;
  }
  
  const result = addUserVideo(url);
  
  if (result.success) {
    showFeedback(result.message, "success");
    addVideoInput.value = "";
    displayUserVideos();
  } else {
    showFeedback(result.message, "error");
  }
});

addVideoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addVideoBtn.click();
  }
});

function showFeedback(message, type) {
  videoFeedback.textContent = message;
  videoFeedback.className = `feedback ${type}`;
  videoFeedback.style.display = "block";
  
  setTimeout(() => {
    videoFeedback.style.display = "none";
  }, 3000);
}

function displayUserVideos() {
  const userVideos = getUserVideos();
  
  if (userVideos.length === 0) {
    userVideosList.innerHTML = '<p class="no-videos">No custom videos yet</p>';
    return;
  }
  
  userVideosList.innerHTML = userVideos.map((url, index) => `
    <div class="video-item">
      <span class="video-url" title="${url}">${truncateUrl(url)}</span>
      <button class="remove-btn" data-url="${url}">✕</button>
    </div>
  `).join("");

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const url = this.getAttribute("data-url");
      if (confirm("Remove this video?")) {
        removeUserVideo(url);
        displayUserVideos();
        showFeedback("Video removed", "success");
      }
    });
  });
}

function truncateUrl(url, maxLength = 35) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
}
