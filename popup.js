(function() {
  "use strict";

  const STORAGE_KEY = "zetonicSettings";
  const QUICK_LINKS_KEY = "zetonicQuickLinks";
  const USER_VIDEOS_KEY = "zetonicUserVideos";
  
  const DB_NAME = "ZetonicVideoDB";
  const DB_VERSION = 1;
  const STORE_NAME = "localVideos";

  const defaultSettings = {
    showClock: true,
    showQuote: true,
    showWeather: true,
    showSearch: true,
    showQuickLinks: true,
    format24: true,
    localVideosOnly: false,
    focusMode: false,
    zenMode: false,
    searchEngine: "google",
    bgMode: "video",
    imageSource: "curated",
    customBgUrl: "",
    imageRotation: 10,
    blurLevel: 0,
    theme: "default",
    userName: "",
    dailyFocus: ""
  };

  let currentSettings = { ...defaultSettings };
  let quickLinks = [];
  let userVideos = [];

  // --- IndexedDB Database Helpers ---

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };
    });
  }

  async function saveLocalVideoToDB(file) {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.add({
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
        addedAt: Date.now(),
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getLocalVideosFromDB() {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function removeLocalVideoFromDB(id) {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Settings & LocalStorage Helpers ---

  function getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    }
    return { ...defaultSettings };
  }

  function saveSettings(settings) {
    try {
      currentSettings = { ...currentSettings, ...settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  }

  function getQuickLinks() {
    try {
      const stored = localStorage.getItem(QUICK_LINKS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading quick links:", e);
    }
    return [
      { name: "YouTube", url: "https://youtube.com" },
      { name: "GitHub", url: "https://github.com" },
      { name: "Gmail", url: "https://gmail.com" }
    ];
  }

  function saveQuickLinks(links) {
    try {
      quickLinks = links;
      localStorage.setItem(QUICK_LINKS_KEY, JSON.stringify(quickLinks));
    } catch (e) {
      console.error("Error saving quick links:", e);
    }
  }

  function getUserVideos() {
    try {
      const stored = localStorage.getItem(USER_VIDEOS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error loading user videos:", e);
    }
    return [];
  }

  function saveUserVideos(videos) {
    try {
      userVideos = videos;
      localStorage.setItem(USER_VIDEOS_KEY, JSON.stringify(userVideos));
    } catch (e) {
      console.error("Error saving user videos:", e);
    }
  }

  function truncateUrl(url, maxLen) {
    if (!url) return "";
    if (url.length <= maxLen) return url;
    return url.substring(0, maxLen - 3) + "…";
  }

  // --- Form & UI Setup ---

  function populateForm(settings) {
    const map = {
      userName: settings.userName || "",
      dailyFocus: settings.dailyFocus || "",
      toggleClock: settings.showClock,
      toggleQuote: settings.showQuote,
      toggleWeather: settings.showWeather,
      toggleSearch: settings.showSearch,
      toggleQuickLinks: settings.showQuickLinks,
      toggleFocus: settings.focusMode,
      toggleZen: settings.zenMode,
      toggleNetworkMonitor: settings.showNetworkMonitor ?? true,
      toggleLocalOnly: settings.localVideosOnly,
      timeFormat: settings.format24 ? "24" : "12",
      theme: settings.theme || "default",
      searchEngine: settings.searchEngine || "google",
      bgMode: settings.bgMode || "video",
      imageSource: settings.imageSource || "curated",
      customBgUrl: settings.customBgUrl || "",
      imageRotation: settings.imageRotation || 0,
      blurLevel: settings.blurLevel || 0
    };

    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const value = map[id];
      if (el.type === "checkbox") {
        el.checked = !!value;
      } else if (el.type === "range" || el.type === "number") {
        el.value = value;
      } else if (el.tagName === "SELECT") {
        el.value = value;
      } else {
        el.value = value || "";
      }
    });

    const imageSourceLabel = document.getElementById("imageSourceLabel");
    const customUrlLabel = document.getElementById("customUrlLabel");
    const bgMode = settings.bgMode || "video";

    if (imageSourceLabel) {
      imageSourceLabel.style.display = bgMode === "image" ? "flex" : "none";
    }
    if (customUrlLabel) {
      customUrlLabel.style.display = settings.imageSource === "custom" ? "flex" : "none";
    }
  }

  function collectFormData() {
    return {
      userName: document.getElementById("userName")?.value || "",
      dailyFocus: document.getElementById("dailyFocus")?.value || "",
      showClock: document.getElementById("toggleClock")?.checked ?? true,
      showQuote: document.getElementById("toggleQuote")?.checked ?? true,
      showWeather: document.getElementById("toggleWeather")?.checked ?? true,
      showSearch: document.getElementById("toggleSearch")?.checked ?? true,
      showQuickLinks: document.getElementById("toggleQuickLinks")?.checked ?? true,
      focusMode: document.getElementById("toggleFocus")?.checked ?? false,
      zenMode: document.getElementById("toggleZen")?.checked ?? false,
      showNetworkMonitor: document.getElementById("toggleNetworkMonitor")?.checked ?? true,
      localVideosOnly: document.getElementById("toggleLocalOnly")?.checked ?? false,
      format24: document.getElementById("timeFormat")?.value === "24",
      theme: document.getElementById("theme")?.value || "default",
      searchEngine: document.getElementById("searchEngine")?.value || "google",
      bgMode: document.getElementById("bgMode")?.value || "video",
      imageSource: document.getElementById("imageSource")?.value || "curated",
      customBgUrl: document.getElementById("customBgUrl")?.value || "",
      imageRotation: parseInt(document.getElementById("imageRotation")?.value || "0", 10),
      blurLevel: parseInt(document.getElementById("blurLevel")?.value || "0", 10)
    };
  }


const newTabBtn = document.getElementById("openNewTabBtn");
  if (newTabBtn) {
    newTabBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Stops the weird HTML file behavior
      
      // Tells Chrome to open a proper New Tab
      chrome.tabs.create({ url: "chrome://newtab/" }); 
    });
  }

  function setupSectionToggles() {
    document.querySelectorAll(".section-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const section = btn.closest(".settings-section");
        if (!section) return;
        const isCollapsed = section.getAttribute("data-collapsed") === "true";
        section.setAttribute("data-collapsed", String(!isCollapsed));
        btn.setAttribute("aria-expanded", String(isCollapsed));
      });
    });
  }

  function setupBgModeToggle() {
    const bgMode = document.getElementById("bgMode");
    const imageSourceLabel = document.getElementById("imageSourceLabel");

    if (bgMode && imageSourceLabel) {
      bgMode.addEventListener("change", () => {
        imageSourceLabel.style.display = bgMode.value === "image" ? "flex" : "none";
      });
    }
  }

  function setupImageSourceToggle() {
    const imageSource = document.getElementById("imageSource");
    const customUrlLabel = document.getElementById("customUrlLabel");

    if (imageSource && customUrlLabel) {
      imageSource.addEventListener("change", () => {
        customUrlLabel.style.display = imageSource.value === "custom" ? "flex" : "none";
      });
    }
  }

  // --- Video Management ---

  async function renderUserVideos() {
    const container = document.getElementById("userVideosList");
    if (!container) return;

    const urlVideos = getUserVideos() || [];
    const localVideos = await getLocalVideosFromDB();

    if (urlVideos.length === 0 && localVideos.length === 0) {
      container.innerHTML = '<p class="no-videos">No videos added</p>';
      return;
    }

    let html = "";
    if (urlVideos.length > 0) {
      html += '<div class="video-category">URLs</div>';
      urlVideos.forEach((url) => {
        const displayUrl = typeof url === 'string' ? url : url.url; 
        html += `
          <div class="video-item">
            <span class="video-url" title="${displayUrl}">${truncateUrl(displayUrl, 30)}</span>
            <button class="remove-btn" data-url="${displayUrl}" data-type="url">×</button>
          </div>
        `;
      });
    }
    
    if (localVideos.length > 0) {
      html += '<div class="video-category">Local</div>';
      localVideos.forEach((v) => {
        html += `
          <div class="video-item">
            <span class="video-url" title="${v.name}">${truncateUrl(v.name, 30)}</span>
            <button class="remove-btn" data-id="${v.id}" data-type="local">×</button>
          </div>
        `;
      });
    }

    container.innerHTML = html;

    container.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const type = btn.getAttribute("data-type");
        if (confirm("Remove this video?")) {
          if (type === "url") {
            const targetUrl = btn.getAttribute("data-url");
            const videos = getUserVideos().filter(v => v !== targetUrl && v.url !== targetUrl);
            saveUserVideos(videos);
          } else if (type === "local") {
            const id = parseInt(btn.getAttribute("data-id") || "0", 10);
            await removeLocalVideoFromDB(id);
          }
          await renderUserVideos();
        }
      });
    });
  }

  function setupVideoManagement() {
    const addInput = document.getElementById("addVideoInput");
    const addBtn = document.getElementById("addVideoBtn");
    const uploadInput = document.getElementById("uploadVideoInput");

    const handleAddUrl = async () => {
      const url = addInput.value.trim();
      if (!url) return;

      const videos = getUserVideos();
      if (!videos.some(v => v === url || v.url === url)) {
        videos.push(url);
        saveUserVideos(videos);
        addInput.value = "";
        await renderUserVideos();
      }
    };

    if (addBtn && addInput) {
      addBtn.addEventListener("click", handleAddUrl);
      addInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleAddUrl();
      });
    }

    if (uploadInput) {
      uploadInput.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 100 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          alert("File too large. Max 100MB.");
          return;
        }

        const validTypes = ["video/mp4", "video/webm", "video/ogg"];
        if (!validTypes.includes(file.type)) {
          alert("Invalid file type. Use .mp4, .webm, or .ogg");
          return;
        }

        try {
          await saveLocalVideoToDB(file);
          await renderUserVideos();
          uploadInput.value = "";
        } catch (err) {
          console.error("Upload error:", err);
          alert("Failed to upload video");
        }
      });
    }

    renderUserVideos();
  }

  // --- Quick Links ---

  function setupQuickLinksEditor(container) {
    if (!container) return;

    const links = getQuickLinks();
    let selectedIndex = 0;

    function render() {
      const validLinks = links.filter(l => l.name && l.url);

      container.innerHTML = `
        <div class="ql-dropdown">
          <div class="ql-selected">${validLinks.length ? validLinks[selectedIndex]?.name : "Select link"}</div>
          <div class="ql-options">
            ${validLinks.map((l, i) => `<div class="ql-option" data-idx="${i}">${l.name}</div>`).join("")}
          </div>
        </div>
        <div class="ql-inputs">
          <input type="text" id="qlName" placeholder="Name" value="${validLinks[selectedIndex]?.name || ""}">
          <input type="text" id="qlUrl" placeholder="URL" value="${validLinks[selectedIndex]?.url || ""}">
        </div>
        <div class="ql-actions">
          <button type="button" id="qlAdd" class="ql-btn">+</button>
          <button type="button" id="qlRemove" class="ql-btn ql-remove" ${validLinks.length ? "" : "disabled"}>×</button>
        </div>
      `;

      const dropdown = container.querySelector(".ql-dropdown");
      const selected = container.querySelector(".ql-selected");
      const options = container.querySelector(".ql-options");
      const nameInput = container.querySelector("#qlName");
      const urlInput = container.querySelector("#qlUrl");
      const addBtn = container.querySelector("#qlAdd");
      const removeBtn = container.querySelector("#qlRemove");

      if (dropdown && selected) {
        dropdown.addEventListener("click", e => {
          e.stopPropagation();
          dropdown.classList.toggle("open");
        });
      }

      document.addEventListener("click", () => {
        container.querySelectorAll(".ql-dropdown").forEach(d => d.classList.remove("open"));
      });

      container.querySelectorAll(".ql-option").forEach(opt => {
        opt.addEventListener("click", e => {
          e.stopPropagation();
          const idx = parseInt(opt.getAttribute("data-idx") || "0", 10);
          selectedIndex = idx;
          const link = validLinks[idx];
          if (link) {
            nameInput.value = link.name;
            urlInput.value = link.url;
            selected.textContent = link.name;
          }
          dropdown.classList.remove("open");
        });
      });

      if (nameInput && urlInput) {
        nameInput.addEventListener("change", () => {
          const validLinks = links.filter(l => l.name && l.url);
          if (validLinks[selectedIndex]) {
            validLinks[selectedIndex].name = nameInput.value.trim();
            validLinks[selectedIndex].url = urlInput.value.trim();
            saveQuickLinks(validLinks);
            render();
          }
        });

        urlInput.addEventListener("change", () => {
          const validLinks = links.filter(l => l.name && l.url);
          if (validLinks[selectedIndex]) {
            validLinks[selectedIndex].name = nameInput.value.trim();
            validLinks[selectedIndex].url = urlInput.value.trim();
            saveQuickLinks(validLinks);
            render();
          }
        });
      }

      if (addBtn) {
        addBtn.addEventListener("click", () => {
          links.push({ name: "New Link", url: "https://" });
          saveQuickLinks(links);
          selectedIndex = links.length - 1;
          render();
          const newNameInput = container.querySelector("#qlName");
          if (newNameInput) {
            newNameInput.focus();
          }
        });
      }

      if (removeBtn) {
        removeBtn.addEventListener("click", () => {
          const validLinks = links.filter(l => l.name && l.url);
          if (validLinks[selectedIndex]) {
            const actualIdx = links.findIndex(l => l.name === validLinks[selectedIndex].name && l.url === validLinks[selectedIndex].url);
            if (actualIdx > -1) {
              links.splice(actualIdx, 1);
              saveQuickLinks(links);
              selectedIndex = Math.max(0, selectedIndex - 1);
              render();
            }
          }
        });
      }
    }

    render();
  }

  function setupAutoSave() {
    // Select every input and dropdown in the popup
    const allInputs = document.querySelectorAll("input, select");
    
    allInputs.forEach(input => {
      // Listen for any changes (typing, checking a box, selecting a dropdown)
      input.addEventListener("change", () => {
        const data = collectFormData();
        saveSettings(data);
      });
      
      // For text inputs and sliders, save instantly as they type/drag
      if (input.type === "text" || input.type === "range" || input.type === "number") {
        input.addEventListener("input", () => {
          const data = collectFormData();
          saveSettings(data);
        });
      }
    });
  }

  function init() {
    currentSettings = getSettings();
    quickLinks = getQuickLinks();
    userVideos = getUserVideos();

    populateForm(currentSettings);
    setupSectionToggles();
    setupBgModeToggle();
    setupImageSourceToggle();
    setupVideoManagement();
    setupQuickLinksEditor(document.getElementById("quickLinksEditor"));
    setupSaveButton();
  }

  document.body.addEventListener("change", () => saveSettings(collectFormData()));
  document.body.addEventListener("input", () => saveSettings(collectFormData()));

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();