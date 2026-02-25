const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const REMOTE_VIDEOS_URL = "https://raw.githubusercontent.com/ash-kernel/Zetonic/main/sup/videos.json";
const DB_NAME = 'ZetonicDB';
const DB_VERSION = 2;
const WEATHER_CACHE_DURATION = 30 * 60 * 1000;

const THEMES = {
  anime: { font: 'Sora', accent: '#4299E1', glass: 0.35, blur: 16 },
  cyberpunk: { font: 'Orbitron', accent: '#FF00FF', glass: 0.2, blur: 8, neon: true },
  minimal: { font: 'Inter', accent: '#000000', glass: 0.1, blur: 4 },
  nature: { font: 'Merriweather', accent: '#48BB78', glass: 0.3, blur: 12 },
  retro: { font: 'Sora', accent: '#FF6B6B', glass: 0.25, blur: 10 }
};

const ACHIEVEMENTS = {
  firstDay: { name: 'First Day', desc: 'Opened Zetonic for the first time', icon: '🎉', target: 1 },
  weekStreak: { name: 'Week Warrior', desc: '7 day streak', icon: '🔥', target: 7 },
  curator: { name: 'Video Curator', desc: 'Added 10 custom videos', icon: '🎥', target: 10 },
  focused: { name: 'Focused Mind', desc: 'Completed 50 pomodoros', icon: '🧠', target: 50 },
  searcher: { name: 'Knowledge Seeker', desc: '100 searches performed', icon: '🔍', target: 100 },
  earlyBird: { name: 'Early Bird', desc: 'Opened before 6 AM', icon: '🌅', target: 1 },
  nightOwl: { name: 'Night Owl', desc: 'Opened after midnight', icon: '🦉', target: 1 },
  themeCollector: { name: 'Style Master', desc: 'Used all themes', icon: '🎨', target: 5 },
  productive: { name: 'Productivity King', desc: '24 hours of focus time', icon: '👑', target: 1440 },
  consistent: { name: 'Consistency', desc: '30 day streak', icon: '💪', target: 30 }
};

const COMMANDS = [
  { name: '🌤️ Toggle Weather', action: 'toggleWeather' },
  { name: '🕐 Toggle Clock', action: 'toggleClock' },
  { name: '💬 Toggle Quote', action: 'toggleQuote' },
  { name: '🎨 Change Theme', action: 'openTheme' },
  { name: '🎥 Add Video', action: 'openVideo' },
  { name: '🍅 Start Focus', action: 'startPomodoro' },
  { name: '⚙️ Settings', action: 'openSettings' },
  { name: '🔗 Add Link', action: 'addLink' },
  { name: '📝 Toggle Notes', action: 'toggleNotes' },
  { name: '🔀 Shuffle Video', action: 'shuffleVideo' },
  { name: '🔇 Mute', action: 'toggleMute' },
  { name: '📊 Analytics', action: 'openAnalytics' },
  { name: '🏆 Achievements', action: 'openAchievements' }
];

class ZetonicCore {
  constructor() {
    this.settings = {
      showClock: true, showDate: true, showQuote: true, showWeather: true,
      showGreeting: true, showMood: true, format24: true, theme: 'anime',
      bgMode: 'video', particleType: 'snow', particleDensity: 50,
      pomoWork: 25, pomoBreak: 5
    };
    this.analytics = { opens: 0, searches: 0, focusTime: 0, lastOpen: null, streak: 0, dailyOpens: [] };
    this.achievements = {};
    this.quickLinks = [];
    this.videos = [];
    this.currentVideoIndex = 0;
    this.pomodoroTimer = null;
    this.pomodoroSeconds = 0;
    this.pomodoroActive = false;
    this.activeBlobUrls = [];
    
    Object.keys(ACHIEVEMENTS).forEach(key => {
      this.achievements[key] = { unlocked: false, progress: 0 };
    });
    
    this.init();
  }

  async init() {
    await this.loadAllData();
    this.trackAnalytics();
    this.setupEventListeners();
    this.loadVideos();
    this.loadWeather();
    this.loadQuote();
    this.updateTime();
    this.updateGreeting();
    this.renderQuickLinks();
    this.applyTheme();
    this.initBackground();
    this.checkAchievements();
    this.renderAchievements();
    this.updateAnalytics();
    setInterval(() => this.updateTime(), 1000);
    setInterval(() => this.loadWeather(), WEATHER_CACHE_DURATION);
  }

  async loadAllData() {
    try {
      const stored = localStorage.getItem('zetonicData');
      if (stored) {
        const data = JSON.parse(stored);
        this.settings = { ...this.settings, ...data.settings };
        this.analytics = { ...this.analytics, ...data.analytics };
        this.achievements = { ...this.achievements, ...data.achievements };
        this.quickLinks = data.quickLinks || [];
      }
      
      const notes = localStorage.getItem('zetonicNotes');
      if (notes) $('#notePad textarea').value = notes;
      
      this.applySettings();
    } catch (error) {
      console.error('Load error:', error);
    }
  }

  saveAllData() {
    try {
      localStorage.setItem('zetonicData', JSON.stringify({
        settings: this.settings,
        analytics: this.analytics,
        achievements: this.achievements,
        quickLinks: this.quickLinks
      }));
    } catch (error) {
      console.error('Save error:', error);
    }
  }

  trackAnalytics() {
    this.analytics.opens++;
    const today = new Date().toDateString();
    
    if (this.analytics.lastOpen !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (this.analytics.lastOpen === yesterday.toDateString()) {
        this.analytics.streak++;
      } else if (this.analytics.lastOpen) {
        this.analytics.streak = 1;
      } else {
        this.analytics.streak = 1;
      }
      
      this.analytics.lastOpen = today;
    }
    
    if (!this.analytics.dailyOpens) this.analytics.dailyOpens = [];
    const todayData = this.analytics.dailyOpens.find(d => d.date === today);
    if (todayData) {
      todayData.count++;
    } else {
      this.analytics.dailyOpens.push({ date: today, count: 1 });
      if (this.analytics.dailyOpens.length > 30) this.analytics.dailyOpens.shift();
    }
    
    this.saveAllData();
  }

  applySettings() {
    $('#toggleClock').checked = this.settings.showClock;
    $('#toggleDate').checked = this.settings.showDate;
    $('#toggleQuote').checked = this.settings.showQuote;
    $('#toggleWeather').checked = this.settings.showWeather;
    $('#toggleGreeting').checked = this.settings.showGreeting;
    $('#toggleMood').checked = this.settings.showMood;
    $('#timeFormat').value = this.settings.format24 ? '24' : '12';
    $('#bgMode').value = this.settings.bgMode;
    $('#particleType').value = this.settings.particleType;
    $('#particleDensity').value = this.settings.particleDensity;
    $('#pomoWork').value = this.settings.pomoWork;
    $('#pomoBreak').value = this.settings.pomoBreak;
    
    $('#time').style.display = this.settings.showClock ? 'block' : 'none';
    $('#date').style.display = this.settings.showDate ? 'block' : 'none';
    $('#quote').style.display = this.settings.showQuote ? 'block' : 'none';
    $('#weatherWidget').style.display = this.settings.showWeather ? 'flex' : 'none';
    $('#greeting').style.display = this.settings.showGreeting ? 'block' : 'none';
    $('#moodTracker').style.display = this.settings.showMood ? 'flex' : 'none';
  }

  setupEventListeners() {
    $('#settingsBtn').onclick = () => this.togglePanel('settingsPanel');
    $('#pomodoroWidget').onclick = () => this.togglePanel('pomodoroPanel');
    $('#achievementsBtn').onclick = () => this.togglePanel('achievementsPanel');
    $('#analyticsBtn').onclick = () => this.togglePanel('analyticsPanel');
    
    $$('.close-btn').forEach(btn => {
      btn.onclick = () => this.togglePanel(btn.dataset.close);
    });

    $$('[data-close-modal]').forEach(btn => {
      btn.onclick = () => this.closeModal(btn.dataset.closeModal);
    });

    $('#toggleClock').onchange = (e) => { this.settings.showClock = e.target.checked; $('#time').style.display = e.target.checked ? 'block' : 'none'; this.saveAllData(); };
    $('#toggleDate').onchange = (e) => { this.settings.showDate = e.target.checked; $('#date').style.display = e.target.checked ? 'block' : 'none'; this.saveAllData(); };
    $('#toggleQuote').onchange = (e) => { this.settings.showQuote = e.target.checked; $('#quote').style.display = e.target.checked ? 'block' : 'none'; this.saveAllData(); };
    $('#toggleWeather').onchange = (e) => { this.settings.showWeather = e.target.checked; $('#weatherWidget').style.display = e.target.checked ? 'flex' : 'none'; this.saveAllData(); };
    $('#toggleGreeting').onchange = (e) => { this.settings.showGreeting = e.target.checked; $('#greeting').style.display = e.target.checked ? 'block' : 'none'; this.saveAllData(); };
    $('#toggleMood').onchange = (e) => { this.settings.showMood = e.target.checked; $('#moodTracker').style.display = e.target.checked ? 'flex' : 'none'; this.saveAllData(); };
    $('#timeFormat').onchange = (e) => { this.settings.format24 = e.target.value === '24'; this.saveAllData(); };
    $('#bgMode').onchange = (e) => { this.settings.bgMode = e.target.value; this.initBackground(); this.saveAllData(); };
    $('#particleType').onchange = (e) => { this.settings.particleType = e.target.value; this.initBackground(); this.saveAllData(); };
    $('#particleDensity').oninput = (e) => { this.settings.particleDensity = e.target.value; this.initBackground(); this.saveAllData(); };
    $('#pomoWork').onchange = (e) => { this.settings.pomoWork = parseInt(e.target.value); this.saveAllData(); };
    $('#pomoBreak').onchange = (e) => { this.settings.pomoBreak = parseInt(e.target.value); this.saveAllData(); };

    $$('.theme-btn').forEach(btn => {
      btn.onclick = () => {
        this.settings.theme = btn.dataset.theme;
        this.applyTheme();
        this.checkAchievement('themeCollector');
        this.saveAllData();
      };
    });

    $('#addVideoBtn').onclick = () => this.addVideoUrl();
    $('#addVideoInput').onkeydown = (e) => { if (e.key === 'Enter') this.addVideoUrl(); };
    $('#uploadVideoInput').onchange = (e) => this.uploadVideo(e.target.files[0]);
    $('.upload-label').onclick = () => $('#uploadVideoInput').click();

    $('#pomodoroStart').onclick = () => this.togglePomodoro();
    $('#pomodoroReset').onclick = () => this.resetPomodoro();

    $$('.mood-btn').forEach(btn => {
      btn.onclick = () => this.trackMood(btn.dataset.mood);
    });

    $('#searchContainer input').onkeydown = (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
          this.analytics.searches++;
          this.checkAchievement('searcher');
          this.saveAllData();
          window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
      }
    };

    $('#notePad textarea').oninput = (e) => {
      localStorage.setItem('zetonicNotes', e.target.value);
    };

    $('.notepad-toggle').onclick = () => {
      const pad = $('#notePad');
      pad.classList.toggle('minimized');
      $('.notepad-toggle').textContent = pad.classList.contains('minimized') ? '+' : '−';
    };

    $('#videoShuffle').onclick = () => this.shuffleVideo();
    $('#videoMute').onclick = () => this.toggleMute();
    $('#videoFullscreen').onclick = () => this.toggleFullscreen();

    $('#saveLinkBtn').onclick = () => this.saveQuickLink();

    $$('[data-action="addLink"]').forEach(el => {
      el.onclick = () => this.openLinkModal();
    });

    $('#exportBtn').onclick = () => this.exportSettings();
    $('#importBtn').onclick = () => $('#importInput').click();
    $('#importInput').onchange = (e) => this.importSettings(e.target.files[0]);
    $('#resetBtn').onclick = () => {
      if (confirm('Reset all settings and data?')) {
        localStorage.clear();
        location.reload();
      }
    };

    document.onkeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      }
      if (e.key === 'Escape') {
        $('#commandPalette').classList.remove('active');
      }
    };

    $('#commandInput').oninput = (e) => this.filterCommands(e.target.value);
    $('#commandInput').onkeydown = (e) => {
      if (e.key === 'Enter') {
        const first = $('#commandResults .command-item');
        if (first) first.click();
      }
    };

    $('#bg').onended = () => this.playNextVideo();
    $('#bg').onerror = () => this.playNextVideo();

    window.onbeforeunload = () => {
      this.activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }

  togglePanel(panelId) {
    const panel = $(`#${panelId}`);
    const isActive = panel.classList.contains('active');
    $$('.panel').forEach(p => p.classList.remove('active'));
    if (!isActive) panel.classList.add('active');
  }

  openLinkModal() {
    $('#linkModal').classList.add('active');
    $('#linkName').value = '';
    $('#linkUrl').value = '';
    $('#linkIcon').value = '';
  }

  closeModal(modalId) {
    $(`#${modalId}`).classList.remove('active');
  }

  saveQuickLink() {
    const name = $('#linkName').value.trim();
    const url = $('#linkUrl').value.trim();
    const icon = $('#linkIcon').value.trim() || '🔗';
    
    if (!name || !url) {
      this.showFeedback('Name and URL required', 'error');
      return;
    }
    
    this.quickLinks.push({ name, url, icon });
    this.saveAllData();
    this.renderQuickLinks();
    this.closeModal('linkModal');
  }

  renderQuickLinks() {
    const container = $('#quickLinks');
    const links = this.quickLinks.map((link, i) => `
      <div class="quick-link" data-url="${link.url}">
        <div class="link-icon">${link.icon}</div>
        <div class="link-name">${link.name}</div>
        <button class="remove-link" data-index="${i}">×</button>
      </div>
    `).join('');
    
    container.innerHTML = links + '<div class="quick-link add-link" data-action="addLink"><div class="link-icon">+</div></div>';
    
    $$('.quick-link[data-url]').forEach(el => {
      el.onclick = (e) => {
        if (!e.target.classList.contains('remove-link')) {
          window.location.href = el.dataset.url;
        }
      };
    });
    
    $$('.remove-link').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.quickLinks.splice(btn.dataset.index, 1);
        this.saveAllData();
        this.renderQuickLinks();
      };
    });
    
    $$('[data-action="addLink"]').forEach(el => {
      el.onclick = () => this.openLinkModal();
    });
  }

  applyTheme() {
    const theme = THEMES[this.settings.theme];
    document.documentElement.style.setProperty('--font-main', theme.font);
    document.documentElement.style.setProperty('--accent-color', theme.accent);
    document.documentElement.style.setProperty('--glass-opacity', theme.glass);
    document.documentElement.style.setProperty('--blur-strength', `${theme.blur}px`);
    
    if (theme.neon) {
      document.body.classList.add('neon-mode');
    } else {
      document.body.classList.remove('neon-mode');
    }
  }

  initBackground() {
    const mode = this.settings.bgMode;
    $('#bg').style.display = mode === 'video' ? 'block' : 'none';
    $('#particleCanvas').style.display = mode === 'particles' ? 'block' : 'none';
    $('#gradientBg').style.display = mode === 'gradient' ? 'block' : 'none';
    
    if (mode === 'particles') {
      this.initParticles();
    } else if (mode === 'gradient') {
      this.initGradient();
    }
  }

  initParticles() {
    const canvas = $('#particleCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const density = parseInt(this.settings.particleDensity);
    
    for (let i = 0; i < density; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: Math.random() * 1 + 0.5
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        p.x += p.dx;
        p.y += p.dy;
        
        if (p.y > canvas.height) p.y = 0;
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  initGradient() {
    const grad = $('#gradientBg');
    grad.style.background = 'linear-gradient(45deg, #667eea, #764ba2, #f093fb)';
    grad.style.backgroundSize = '400% 400%';
    grad.style.animation = 'gradientShift 15s ease infinite';
  }

  updateTime() {
    if (!this.settings.showClock) return;
    
    const now = new Date();
    let hours = now.getHours();
    let suffix = '';
    
    if (!this.settings.format24) {
      suffix = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12 || 12;
    }
    
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    $('#time').textContent = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}${suffix}`;
    
    if (this.settings.showDate) {
      $('#date').textContent = now.toLocaleDateString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
    }
  }

  updateGreeting() {
    if (!this.settings.showGreeting) return;
    
    const hour = new Date().getHours();
    let greeting = 'Hello';
    
    if (hour < 6) { greeting = 'Good Night'; this.checkAchievement('nightOwl'); }
    else if (hour < 12) { greeting = 'Good Morning'; if (hour < 6) this.checkAchievement('earlyBird'); }
    else if (hour < 18) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';
    
    $('#greeting').textContent = greeting;
  }

  async loadQuote() {
    if (!this.settings.showQuote) return;
    
    const fallbacks = [
      'The journey of a thousand miles begins with one step.',
      'Dream big and dare to fail.',
      'Stay focused and never give up.',
      'Simplicity is the ultimate sophistication.',
      'Believe you can and you\'re halfway there.'
    ];
    
    try {
      const res = await fetch('https://api.adviceslip.com/advice');
      const data = await res.json();
      $('#quote').textContent = `"${data.slip.advice}"`;
    } catch {
      $('#quote').textContent = `"${fallbacks[Math.floor(Math.random() * fallbacks.length)]}"`;
    }
  }

  async loadWeather() {
    if (!this.settings.showWeather) return;
    
    const cached = localStorage.getItem('zetonicWeatherCache');
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < WEATHER_CACHE_DURATION) {
        this.updateWeatherUI(data.weather);
        return;
      }
    }
    
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,is_day&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        
        const weatherData = {
          temp: Math.round(data.current.temperature_2m),
          condition: this.getWeatherCondition(data.current.weathercode),
          location: geoData.address.city || geoData.address.town || 'Unknown',
          isDay: data.current.is_day === 1
        };
        
        localStorage.setItem('zetonicWeatherCache', JSON.stringify({
          weather: weatherData,
          timestamp: Date.now()
        }));
        
        this.updateWeatherUI(weatherData);
      } catch (error) {
        console.error('Weather error:', error);
      }
    });
  }

  getWeatherCondition(code) {
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Clouds';
    if (code <= 49) return 'Fog';
    if (code <= 69) return 'Rain';
    if (code <= 79) return 'Snow';
    return 'Storm';
  }

  updateWeatherUI(data) {
    const icons = {
      Clear: data.isDay ? '☀️' : '🌙',
      Clouds: '☁️',
      Rain: '🌧️',
      Snow: '❄️',
      Storm: '⛈️',
      Fog: '🌫️'
    };
    
    $('.weather-icon').textContent = icons[data.condition] || '🌤️';
    $('.weather-temp').textContent = `${data.temp}°C`;
    $('.weather-desc').textContent = data.condition;
  }

  async loadVideos() {
    try {
      const res = await fetch(REMOTE_VIDEOS_URL);
      const remote = await res.json();
      this.videos = [...remote];
      
      const userUrls = this.getUserVideos();
      if (userUrls.length) this.videos.push(...userUrls);
      
      const localVideos = await this.getLocalVideos();
      if (localVideos.length) this.videos.push(...localVideos);
      
      if (this.videos.length) {
        this.currentVideoIndex = Math.floor(Math.random() * this.videos.length);
        this.playVideo(this.currentVideoIndex);
      }
    } catch (error) {
      console.error('Video load error:', error);
    }
  }

  getUserVideos() {
    try {
      const stored = localStorage.getItem('zetonicUserVideos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async getLocalVideos() {
    try {
      const db = await this.openDB();
      const tx = db.transaction(['localVideos'], 'readonly');
      const store = tx.objectStore('localVideos');
      
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const videos = req.result.map(v => {
            const blobUrl = URL.createObjectURL(v.blob);
            this.activeBlobUrls.push(blobUrl);
            return { id: v.id, name: v.name, url: blobUrl, isLocal: true };
          });
          resolve(videos);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('localVideos')) {
          db.createObjectStore('localVideos', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  playVideo(index) {
    const videoData = this.videos[index];
    const url = typeof videoData === 'string' ? videoData : videoData.url;
    $('#bg').src = url;
    $('#bg').play().catch(() => this.playNextVideo());
  }

  playNextVideo() {
    if (!this.videos.length) return;
    let next = Math.floor(Math.random() * this.videos.length);
    while (next === this.currentVideoIndex && this.videos.length > 1) {
      next = Math.floor(Math.random() * this.videos.length);
    }
    this.currentVideoIndex = next;
    this.playVideo(this.currentVideoIndex);
  }

  shuffleVideo() {
    this.playNextVideo();
  }

  toggleMute() {
    const video = $('#bg');
    video.muted = !video.muted;
    $('#videoMute').textContent = video.muted ? '🔇' : '🔊';
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  async addVideoUrl() {
    const url = $('#addVideoInput').value.trim();
    if (!url) return;
    
    if (!this.isValidVideoUrl(url)) {
      this.showFeedback('Invalid video URL', 'error');
      return;
    }
    
    const userVideos = this.getUserVideos();
    if (userVideos.includes(url)) {
      this.showFeedback('Video already exists', 'error');
      return;
    }
    
    userVideos.push(url);
    localStorage.setItem('zetonicUserVideos', JSON.stringify(userVideos));
    this.videos.push(url);
    this.showFeedback('Video added!', 'success');
    $('#addVideoInput').value = '';
    this.checkAchievement('curator');
    this.displayUserVideos();
  }

  isValidVideoUrl(url) {
    try {
      const parsed = new URL(url);
      if (url.includes('<script') || url.includes('javascript:')) return false;
      const exts = ['.mp4', '.webm', '.ogg', '.mov'];
      return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && 
             exts.some(ext => parsed.pathname.toLowerCase().endsWith(ext));
    } catch {
      return false;
    }
  }

  async uploadVideo(file) {
    if (!file || !file.type.startsWith('video/')) {
      this.showFeedback('Invalid file', 'error');
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      this.showFeedback('File too large (max 100MB)', 'error');
      return;
    }
    
    try {
      const db = await this.openDB();
      const tx = db.transaction(['localVideos'], 'readwrite');
      const store = tx.objectStore('localVideos');
      
      await new Promise((resolve, reject) => {
        const req = store.add({ name: file.name, blob: file, addedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      
      this.showFeedback('Video uploaded!', 'success');
      await this.loadVideos();
      this.checkAchievement('curator');
      this.displayUserVideos();
    } catch (error) {
      this.showFeedback('Upload failed', 'error');
    }
  }

  async displayUserVideos() {
    const userUrls = this.getUserVideos();
    const localVideos = await this.getLocalVideos();
    
    let html = '';
    
    if (userUrls.length) {
      html += '<div class="video-category">📎 URL Videos</div>';
      html += userUrls.map(url => `
        <div class="video-item">
          <span class="video-url">${this.truncate(url, 30)}</span>
          <button class="remove-btn" data-url="${url}" data-type="url">×</button>
        </div>
      `).join('');
    }
    
    if (localVideos.length) {
      html += '<div class="video-category">📁 Local Videos</div>';
      html += localVideos.map(v => `
        <div class="video-item">
          <span class="video-url">${this.truncate(v.name, 25)}</span>
          <button class="remove-btn" data-id="${v.id}" data-type="local">×</button>
        </div>
      `).join('');
    }
    
    $('#userVideosList').innerHTML = html || '<p class="no-videos">No custom videos</p>';
    
    $$('.remove-btn').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Remove video?')) return;
        
        if (btn.dataset.type === 'url') {
          const userUrls = this.getUserVideos();
          const filtered = userUrls.filter(u => u !== btn.dataset.url);
          localStorage.setItem('zetonicUserVideos', JSON.stringify(filtered));
        } else {
          const db = await this.openDB();
          const tx = db.transaction(['localVideos'], 'readwrite');
          await new Promise(resolve => {
            const req = tx.objectStore('localVideos').delete(parseInt(btn.dataset.id));
            req.onsuccess = () => resolve();
          });
        }
        
        await this.loadVideos();
        this.displayUserVideos();
        this.showFeedback('Video removed', 'success');
      };
    });
  }

  truncate(str, len) {
    return str.length > len ? str.substring(0, len) + '...' : str;
  }

  showFeedback(msg, type) {
    const feedback = $('#videoFeedback');
    feedback.textContent = msg;
    feedback.className = `feedback ${type}`;
    feedback.style.display = 'block';
    setTimeout(() => feedback.style.display = 'none', 3000);
  }

  togglePomodoro() {
    if (this.pomodoroActive) {
      clearInterval(this.pomodoroTimer);
      this.pomodoroActive = false;
      $('#pomodoroStart').textContent = 'Start';
    } else {
      this.pomodoroActive = true;
      $('#pomodoroStart').textContent = 'Pause';
      
      if (this.pomodoroSeconds === 0) {
        this.pomodoroSeconds = this.settings.pomoWork * 60;
      }
      
      this.pomodoroTimer = setInterval(() => {
        this.pomodoroSeconds--;
        
        const mins = Math.floor(this.pomodoroSeconds / 60);
        const secs = this.pomodoroSeconds % 60;
        $('.pomodoro-time').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (this.pomodoroSeconds <= 0) {
          this.completePomodoro();
        }
      }, 1000);
    }
  }

  completePomodoro() {
    clearInterval(this.pomodoroTimer);
    this.pomodoroActive = false;
    this.pomodoroSeconds = 0;
    $('#pomodoroStart').textContent = 'Start';
    $('.pomodoro-time').textContent = `${this.settings.pomoWork}:00`;
    
    if (!this.analytics.pomoStats) this.analytics.pomoStats = { today: 0, total: 0 };
    this.analytics.pomoStats.today++;
    this.analytics.pomoStats.total++;
    this.analytics.focusTime += this.settings.pomoWork;
    
    this.checkAchievement('focused');
    this.checkAchievement('productive');
    this.saveAllData();
    this.updatePomodoroStats();
    
    this.showAchievement({ name: 'Focus Complete!', desc: 'Take a break', icon: '🎉' });
    
    new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBg==').play().catch(() => {});
  }

  resetPomodoro() {
    clearInterval(this.pomodoroTimer);
    this.pomodoroActive = false;
    this.pomodoroSeconds = 0;
    $('#pomodoroStart').textContent = 'Start';
    $('.pomodoro-time').textContent = `${this.settings.pomoWork}:00`;
  }

  updatePomodoroStats() {
    if (!this.analytics.pomoStats) this.analytics.pomoStats = { today: 0, total: 0 };
    $('#pomoToday').textContent = this.analytics.pomoStats.today;
    $('#pomoTotal').textContent = this.analytics.pomoStats.total;
  }

  trackMood(mood) {
    if (!this.analytics.moods) this.analytics.moods = [];
    this.analytics.moods.push({ mood, date: new Date().toDateString() });
    if (this.analytics.moods.length > 90) this.analytics.moods.shift();
    this.saveAllData();
    
    $$('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    $(`.mood-btn[data-mood="${mood}"]`).classList.add('selected');
    
    setTimeout(() => {
      $$('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    }, 2000);
  }

  checkAchievements() {
    this.checkAchievement('firstDay');
    this.checkAchievement('weekStreak');
    this.checkAchievement('consistent');
  }

  checkAchievement(key) {
    const ach = ACHIEVEMENTS[key];
    const progress = this.achievements[key];
    
    if (progress.unlocked) return;
    
    let currentProgress = 0;
    
    switch(key) {
      case 'firstDay': currentProgress = 1; break;
      case 'weekStreak': currentProgress = this.analytics.streak >= 7 ? 7 : this.analytics.streak; break;
      case 'consistent': currentProgress = this.analytics.streak >= 30 ? 30 : this.analytics.streak; break;
      case 'curator': currentProgress = this.getUserVideos().length + (this.analytics.localVideoCount || 0); break;
      case 'focused': currentProgress = this.analytics.pomoStats?.total || 0; break;
      case 'searcher': currentProgress = this.analytics.searches || 0; break;
      case 'earlyBird': currentProgress = new Date().getHours() < 6 ? 1 : 0; break;
      case 'nightOwl': currentProgress = new Date().getHours() >= 0 && new Date().getHours() < 3 ? 1 : 0; break;
      case 'themeCollector': currentProgress = this.analytics.themesUsed?.length || 0; break;
      case 'productive': currentProgress = this.analytics.focusTime >= 1440 ? 1440 : this.analytics.focusTime; break;
    }
    
    progress.progress = currentProgress;
    
    if (currentProgress >= ach.target && !progress.unlocked) {
      progress.unlocked = true;
      this.showAchievement(ach);
      this.saveAllData();
    }
  }

  showAchievement(ach) {
    const toast = $('#achievementToast');
    $('.achievement-icon', toast).textContent = ach.icon;
    $('.achievement-title', toast).textContent = ach.name;
    $('.achievement-desc', toast).textContent = ach.desc;
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }

  renderAchievements() {
    const html = Object.entries(ACHIEVEMENTS).map(([key, ach]) => {
      const prog = this.achievements[key];
      const percent = Math.min((prog.progress / ach.target) * 100, 100);
      
      return `
        <div class="achievement-card ${prog.unlocked ? 'unlocked' : ''}">
          <div class="ach-icon">${ach.icon}</div>
          <div class="ach-info">
            <div class="ach-name">${ach.name}</div>
            <div class="ach-desc">${ach.desc}</div>
            <div class="ach-progress">
              <div class="ach-bar" style="width: ${percent}%"></div>
              <span class="ach-text">${prog.progress}/${ach.target}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    $('#achievementsList').innerHTML = html;
  }

  updateAnalytics() {
    $('#totalOpens').textContent = this.analytics.opens;
    $('#totalSearches').textContent = this.analytics.searches;
    $('#totalFocusTime').textContent = `${Math.floor(this.analytics.focusTime / 60)}h`;
    $('#currentStreak').textContent = `${this.analytics.streak}d`;
    this.updatePomodoroStats();
  }

  openCommandPalette() {
    $('#commandPalette').classList.add('active');
    $('#commandInput').value = '';
    $('#commandInput').focus();
    this.filterCommands('');
  }

  filterCommands(query) {
    const filtered = COMMANDS.filter(cmd => 
      cmd.name.toLowerCase().includes(query.toLowerCase())
    );
    
    const html = filtered.map(cmd => `
      <div class="command-item" data-action="${cmd.action}">
        <span>${cmd.name}</span>
      </div>
    `).join('');
    
    $('#commandResults').innerHTML = html;
    
    $$('.command-item').forEach(item => {
      item.onclick = () => {
        this.executeCommand(item.dataset.action);
        $('#commandPalette').classList.remove('active');
      };
    });
  }

  executeCommand(action) {
    const actions = {
      toggleWeather: () => { this.settings.showWeather = !this.settings.showWeather; this.applySettings(); this.saveAllData(); },
      toggleClock: () => { this.settings.showClock = !this.settings.showClock; this.applySettings(); this.saveAllData(); },
      toggleQuote: () => { this.settings.showQuote = !this.settings.showQuote; this.applySettings(); this.saveAllData(); },
      openTheme: () => this.togglePanel('settingsPanel'),
      openVideo: () => this.togglePanel('settingsPanel'),
      startPomodoro: () => { this.togglePanel('pomodoroPanel'); this.togglePomodoro(); },
      openSettings: () => this.togglePanel('settingsPanel'),
      addLink: () => this.openLinkModal(),
      toggleNotes: () => $('#notePad').classList.toggle('minimized'),
      shuffleVideo: () => this.shuffleVideo(),
      toggleMute: () => this.toggleMute(),
      openAnalytics: () => this.togglePanel('analyticsPanel'),
      openAchievements: () => this.togglePanel('achievementsPanel')
    };
    
    if (actions[action]) actions[action]();
  }

  exportSettings() {
    const data = {
      settings: this.settings,
      quickLinks: this.quickLinks,
      achievements: this.achievements,
      analytics: this.analytics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zetonic-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async importSettings(file) {
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.settings) this.settings = { ...this.settings, ...data.settings };
      if (data.quickLinks) this.quickLinks = data.quickLinks;
      if (data.achievements) this.achievements = data.achievements;
      if (data.analytics) this.analytics = data.analytics;
      
      this.saveAllData();
      this.applySettings();
      this.renderQuickLinks();
      this.renderAchievements();
      this.updateAnalytics();
      
      alert('Settings imported successfully!');
    } catch (error) {
      alert('Import failed: Invalid file');
    }
  }
}

const app = new ZetonicCore();