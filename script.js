// ============================================
// VIDEO MANAGEMENT
// ============================================

const video = document.getElementById("bg");
let videos = [];
let currentIndex = 0;
const REMOTE_VIDEOS_URL = "https://raw.githubusercontent.com/ash-kernel/Zetonic/main/sup/videos.json";

async function loadVideos() {
  try {
    // Load remote videos
    const response = await fetch(REMOTE_VIDEOS_URL);
    if (!response.ok) throw new Error("Failed to fetch videos");
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid video data");
    }
    
    videos = [...data];
    
    // Load user URL videos
    const userVideos = getUserVideos();
    if (userVideos.length > 0) {
      videos = [...videos, ...userVideos];
    }
    
    // Load local file videos
    const localVideos = await getLocalVideos();
    if (localVideos.length > 0) {
      videos = [...videos, ...localVideos];
    }
    
    // Start playing random video
    currentIndex = Math.floor(Math.random() * videos.length);
    await playVideo(currentIndex);
    
  } catch (error) {
    console.error("Video loading error:", error);
    
    // Fallback to user videos only
    const userVideos = getUserVideos();
    const localVideos = await getLocalVideos();
    videos = [...userVideos, ...localVideos];
    
    if (videos.length > 0) {
      currentIndex = 0;
      await playVideo(currentIndex);
    }
  }
}

async function playVideo(index) {
  try {
    const videoData = videos[index];
    
    // Handle both string URLs and objects with blob URLs
    if (typeof videoData === 'string') {
      video.src = videoData;
    } else if (videoData && videoData.url) {
      video.src = videoData.url;
    }
    
    await video.play();
  } catch (error) {
    console.error("Video playback error:", error);
  }
}

// ============================================
// USER URL VIDEOS (localStorage)
// ============================================

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

// ============================================
// LOCAL FILE VIDEOS (IndexedDB)
// ============================================

const DB_NAME = 'ZetonicVideoDB';
const DB_VERSION = 1;
const STORE_NAME = 'localVideos';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function saveLocalVideo(file) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const videoData = {
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file,
      addedAt: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(videoData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error saving local video:", error);
    throw error;
  }
}

async function getLocalVideos() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const videos = request.result.map(video => ({
          id: video.id,
          name: video.name,
          url: URL.createObjectURL(video.blob),
          isLocal: true
        }));
        resolve(videos);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error loading local videos:", error);
    return [];
  }
}

async function removeLocalVideo(id) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error removing local video:", error);
    throw error;
  }
}

// ============================================
// VIDEO EVENT HANDLERS
// ============================================

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

// ============================================
// SETTINGS
// ============================================

let settings = {
  showClock: true,
  showQuote: true,
  showWeather: true,
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

// ============================================
// CLOCK & DATE
// ============================================

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

// ============================================
// SEARCH
// ============================================

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

// ============================================
// QUOTES
// ============================================

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

// ============================================
// WEATHER
// ============================================

const weatherWidget = document.getElementById("weatherWidget");
const weatherIcon = document.querySelector(".weather-icon");
const weatherTemp = document.querySelector(".weather-temp");
const weatherDesc = document.querySelector(".weather-desc");
const weatherLocation = document.querySelector(".weather-location");

const WEATHER_API_KEY = ""; // Users can add their own OpenWeatherMap API key
const WEATHER_CACHE_KEY = "zetonicWeatherCache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getWeatherIcon(condition, isDay = true) {
  const icons = {
    'Clear': isDay ? '☀️' : '🌙',
    'Clouds': isDay ? '⛅' : '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️'
  };
  
  return icons[condition] || '🌤️';
}

async function loadWeather() {
  if (!settings.showWeather) {
    weatherWidget.style.display = "none";
    return;
  }
  
  weatherWidget.style.display = "flex";
  
  // Check cache first
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        updateWeatherUI(data.weather);
        return;
      }
    }
  } catch (error) {
    console.error("Error reading weather cache:", error);
  }
  
  // Get location and fetch weather
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use free weather API (no key required)
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,is_day&timezone=auto`;
          
          const response = await fetch(url);
          if (!response.ok) throw new Error("Weather API failed");
          
          const data = await response.json();
          
          // Get location name using reverse geocoding
          const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
          const geoResponse = await fetch(geoUrl);
          const geoData = await geoResponse.json();
          
          const weatherData = {
            temp: Math.round(data.current.temperature_2m),
            condition: getWeatherCondition(data.current.weathercode),
            location: geoData.address.city || geoData.address.town || geoData.address.village || "Unknown",
            isDay: data.current.is_day === 1
          };
          
          // Cache the data
          localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
            weather: weatherData,
            timestamp: Date.now()
          }));
          
          updateWeatherUI(weatherData);
          
        } catch (error) {
          console.error("Weather fetch error:", error);
          showWeatherError();
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        showWeatherError();
      }
    );
  } else {
    showWeatherError();
  }
}

function getWeatherCondition(code) {
  // WMO Weather interpretation codes
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Clouds';
  if (code <= 49) return 'Fog';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 99) return 'Thunderstorm';
  return 'Clear';
}

function updateWeatherUI(data) {
  weatherIcon.textContent = getWeatherIcon(data.condition, data.isDay);
  weatherTemp.textContent = `${data.temp}°C`;
  weatherDesc.textContent = data.condition;
  weatherLocation.textContent = `📍 ${data.location}`;
}

function showWeatherError() {
  weatherIcon.textContent = "🌡️";
  weatherTemp.textContent = "--°";
  weatherDesc.textContent = "Location unavailable";
  weatherLocation.textContent = "📍 Enable location access";
}

loadWeather();
// Refresh weather every 30 minutes
setInterval(loadWeather, CACHE_DURATION);

// ============================================
// SETTINGS PANEL
// ============================================

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const toggleClock = document.getElementById("toggleClock");
const toggleQuote = document.getElementById("toggleQuote");
const toggleWeather = document.getElementById("toggleWeather");
const timeFormat = document.getElementById("timeFormat");
const addVideoInput = document.getElementById("addVideoInput");
const addVideoBtn = document.getElementById("addVideoBtn");
const uploadVideoInput = document.getElementById("uploadVideoInput");
const videoFeedback = document.getElementById("videoFeedback");
const userVideosList = document.getElementById("userVideosList");

toggleClock.checked = settings.showClock;
toggleQuote.checked = settings.showQuote;
toggleWeather.checked = settings.showWeather;
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

toggleWeather.addEventListener("change", function() {
  settings.showWeather = this.checked;
  saveSettings();
  loadWeather();
});

timeFormat.addEventListener("change", function() {
  settings.format24 = this.value === "24";
  saveSettings();
  updateTime();
});

// URL Video Add
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

// Local Video Upload
document.querySelector('.upload-label').addEventListener('click', () => {
  uploadVideoInput.click();
});

uploadVideoInput.addEventListener("change", async function(e) {
  const file = e.target.files[0];
  
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('video/')) {
    showFeedback("Please select a valid video file", "error");
    return;
  }
  
  // Validate file size (max 100MB)
  if (file.size > 100 * 1024 * 1024) {
    showFeedback("File too large (max 100MB)", "error");
    return;
  }
  
  try {
    showFeedback("Uploading video...", "success");
    await saveLocalVideo(file);
    showFeedback("Local video added successfully!", "success");
    await loadVideos();
    displayUserVideos();
    
    // Reset input
    uploadVideoInput.value = "";
  } catch (error) {
    console.error("Upload error:", error);
    showFeedback("Failed to upload video", "error");
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

async function displayUserVideos() {
  const userVideos = getUserVideos();
  const localVideos = await getLocalVideos();
  
  if (userVideos.length === 0 && localVideos.length === 0) {
    userVideosList.innerHTML = '<p class="no-videos">No custom videos yet</p>';
    return;
  }
  
  let html = '';
  
  // Display URL videos
  if (userVideos.length > 0) {
    html += '<div class="video-category">📎 URL Videos</div>';
    html += userVideos.map(url => `
      <div class="video-item">
        <span class="video-url" title="${url}">${truncateUrl(url)}</span>
        <button class="remove-btn" data-url="${url}" data-type="url">✕</button>
      </div>
    `).join("");
  }
  
  // Display local videos
  if (localVideos.length > 0) {
    html += '<div class="video-category">📁 Local Videos</div>';
    html += localVideos.map(video => `
      <div class="video-item">
        <span class="video-url" title="${video.name}">${truncateUrl(video.name, 25)}</span>
        <button class="remove-btn" data-id="${video.id}" data-type="local">✕</button>
      </div>
    `).join("");
  }
  
  userVideosList.innerHTML = html;

  // Add remove handlers
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", async function() {
      const type = this.getAttribute("data-type");
      
      if (!confirm("Remove this video?")) return;
      
      try {
        if (type === "url") {
          const url = this.getAttribute("data-url");
          removeUserVideo(url);
        } else if (type === "local") {
          const id = parseInt(this.getAttribute("data-id"));
          await removeLocalVideo(id);
          await loadVideos();
        }
        
        displayUserVideos();
        showFeedback("Video removed", "success");
      } catch (error) {
        console.error("Remove error:", error);
        showFeedback("Failed to remove video", "error");
      }
    });
  });
}

function truncateUrl(url, maxLength = 35) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
}