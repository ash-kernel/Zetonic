export interface Settings {
  showClock: boolean;
  showQuote: boolean;
  showWeather: boolean;
  format24: boolean;
  localVideosOnly: boolean;
  focusMode: boolean;
  zenMode: boolean;
  searchEngine: "google" | "duckduckgo";
  bgMode: "video" | "image";
  imageSource: "curated" | "picsum" | "custom";
  customBgUrl: string;
  imageRotation: number;
  blurLevel: number;
  theme: "default" | "amber" | "cyan" | "rose" | "violet";
  userName: string;
  dailyFocus: string;
  showQuickLinks: boolean;
}

export type VideoSource = string | LocalVideoData;

export interface LocalVideoData {
  id: number;
  name: string;
  url: string;
  isLocal: true;
}

export interface StoredLocalVideo {
  id: number;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  addedAt: number;
}

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  isDay: boolean;
}

export interface WeatherCache {
  weather: WeatherData;
  timestamp: number;
}
