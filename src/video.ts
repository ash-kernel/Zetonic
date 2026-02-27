import type { VideoSource, LocalVideoData, StoredLocalVideo } from "./types";

const REMOTE_VIDEOS_URL =
  "https://raw.githubusercontent.com/ash-kernel/Zetonic/main/sup/videos.json";
const DB_NAME = "ZetonicVideoDB";
const DB_VERSION = 1;
const STORE_NAME = "localVideos";

let videos: VideoSource[] = [];
let currentIndex = 0;

export function getVideos(): VideoSource[] {
  return videos;
}

export function getCurrentIndex(): number {
  return currentIndex;
}

export function setVideos(list: VideoSource[]): void {
  videos = list;
}

export function setCurrentIndex(index: number): void {
  currentIndex = index;
}

export function getVideoUrl(videoData: VideoSource): string {
  if (typeof videoData === "string") return videoData;
  return (videoData as LocalVideoData).url;
}

// ---------- Remote & User Videos ----------

export async function loadVideos(videoEl: HTMLVideoElement): Promise<void> {
  const localOnly = (() => {
    try {
      const s = localStorage.getItem("zetonicSettings");
      return s ? (JSON.parse(s) as { localVideosOnly?: boolean }).localVideosOnly : false;
    } catch {
      return false;
    }
  })();

  if (localOnly) {
    const userVideos = getUserVideos();
    const localVideos = await getLocalVideos();
    videos = [...userVideos, ...localVideos];
    if (videos.length > 0) {
      currentIndex = Math.floor(Math.random() * videos.length);
      await playVideo(videoEl, currentIndex);
    }
    return;
  }

  try {
    const response = await fetch(REMOTE_VIDEOS_URL);
    if (!response.ok) throw new Error("Failed to fetch videos");

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid video data");
    }

    videos = [...data];
    const userVideos = getUserVideos();
    if (userVideos.length > 0) videos = [...videos, ...userVideos];

    const localVideos = await getLocalVideos();
    if (localVideos.length > 0) videos = [...videos, ...localVideos];

    currentIndex = Math.floor(Math.random() * videos.length);
    await playVideo(videoEl, currentIndex);
  } catch (error) {
    console.error("Video loading error:", error);
    const userVideos = getUserVideos();
    const localVideos = await getLocalVideos();
    videos = [...userVideos, ...localVideos];
    if (videos.length > 0) {
      currentIndex = 0;
      await playVideo(videoEl, currentIndex);
    }
  }
}

export async function playVideo(
  videoEl: HTMLVideoElement,
  index: number
): Promise<void> {
  try {
    const videoData = videos[index];
    videoEl.src = getVideoUrl(videoData);
    await videoEl.play();
  } catch (error) {
    console.error("Video playback error:", error);
  }
}

// ---------- User URL Videos (localStorage) ----------

export function getUserVideos(): string[] {
  try {
    const stored = localStorage.getItem("zetonicUserVideos");
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error loading user videos:", error);
    return [];
  }
}

export function saveUserVideos(videoList: string[]): void {
  try {
    localStorage.setItem("zetonicUserVideos", JSON.stringify(videoList));
  } catch (error) {
    console.error("Error saving user videos:", error);
  }
}

export interface AddVideoResult {
  success: boolean;
  message: string;
}

export function addUserVideo(url: string): AddVideoResult {
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

export function removeUserVideo(
  url: string,
  onReload: () => void
): void {
  const filtered = getUserVideos().filter((v) => v !== url);
  saveUserVideos(filtered);
  onReload();
}

export function isValidVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const validExtensions = [".mp4", ".webm", ".ogg", ".mov"];
    const hasValidExtension = validExtensions.some((ext) =>
      parsed.pathname.toLowerCase().endsWith(ext)
    );
    const validHosts = [
      "pexels.com",
      "pixabay.com",
      "catbox.moe",
      "youtube.com",
      "vimeo.com",
    ];
    const isKnownHost = validHosts.some((host) =>
      parsed.hostname.includes(host)
    );
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      (hasValidExtension || isKnownHost)
    );
  } catch {
    return false;
  }
}

// ---------- Local File Videos (IndexedDB) ----------

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
  });
}

export async function saveLocalVideo(file: File): Promise<number> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const videoData: Omit<StoredLocalVideo, "id"> = {
    name: file.name,
    type: file.type,
    size: file.size,
    blob: file,
    addedAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const request = store.add(videoData);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalVideos(): Promise<LocalVideoData[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result as StoredLocalVideo[];
        const items = results.map((video) => ({
          id: video.id,
          name: video.name,
          url: URL.createObjectURL(video.blob),
          isLocal: true as const,
        }));
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error loading local videos:", error);
    return [];
  }
}

export async function removeLocalVideo(id: number): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
