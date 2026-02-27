import type { WeatherData, WeatherCache } from "./types";
import { getSettings } from "./settings";

const CACHE_KEY = "zetonicWeatherCache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const WEATHER_ICONS: Record<string, string> = {
  Clear: "☀️",
  Clouds: "⛅",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
};

const NIGHT_OVERRIDES: Record<string, string> = {
  Clear: "🌙",
  Clouds: "☁️",
};

export function getWeatherIcon(condition: string, isDay = true): string {
  if (!isDay && NIGHT_OVERRIDES[condition]) {
    return NIGHT_OVERRIDES[condition];
  }
  return WEATHER_ICONS[condition] ?? "🌤️";
}

function getWeatherCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Clouds";
  if (code <= 49) return "Fog";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 99) return "Thunderstorm";
  return "Clear";
}

export function updateWeatherUI(
  data: WeatherData,
  elements: {
    icon: HTMLElement | null;
    temp: HTMLElement | null;
    desc: HTMLElement | null;
    location: HTMLElement | null;
  }
): void {
  const { icon, temp, desc, location } = elements;
  if (icon) icon.textContent = getWeatherIcon(data.condition, data.isDay);
  if (temp) temp.textContent = `${data.temp}°C`;
  if (desc) desc.textContent = data.condition;
  if (location) location.textContent = `📍 ${data.location}`;
}

export function showWeatherError(elements: {
  icon: HTMLElement | null;
  temp: HTMLElement | null;
  desc: HTMLElement | null;
  location: HTMLElement | null;
}): void {
  const { icon, temp, desc, location } = elements;
  if (icon) icon.textContent = "🌡️";
  if (temp) temp.textContent = "--°";
  if (desc) desc.textContent = "Location unavailable";
  if (location) location.textContent = "📍 Enable location access";
}

export async function loadWeather(
  elements: {
    widget: HTMLElement | null;
    icon: HTMLElement | null;
    temp: HTMLElement | null;
    desc: HTMLElement | null;
    location: HTMLElement | null;
  }
): Promise<void> {
  const { widget, icon, temp, desc, location } = elements;

  if (!widget) return;
  const settings = getSettings();
  if (!settings.showWeather) {
    widget.style.display = "none";
    return;
  }

  widget.style.display = "flex";

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached) as WeatherCache;
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        updateWeatherUI(data.weather, { icon, temp, desc, location });
        return;
      }
    }
  } catch {
    /* ignore cache errors */
  }

  if (!navigator.geolocation) {
    showWeatherError({ icon, temp, desc, location });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,is_day&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather API failed");

        const data = (await response.json()) as {
          current: { temperature_2m: number; weathercode: number; is_day: number };
        };

        const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = (await geoResponse.json()) as {
          address?: { city?: string; town?: string; village?: string };
        };

        const addr = geoData.address ?? {};
        const locationName =
          addr.city ?? addr.town ?? addr.village ?? "Unknown";

        const weatherData: WeatherData = {
          temp: Math.round(data.current.temperature_2m),
          condition: getWeatherCondition(data.current.weathercode),
          location: locationName,
          isDay: data.current.is_day === 1,
        };

        const cache: WeatherCache = {
          weather: weatherData,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

        updateWeatherUI(weatherData, { icon, temp, desc, location });
      } catch (error) {
        console.error("Weather fetch error:", error);
        showWeatherError({ icon, temp, desc, location });
      }
    },
    () => {
      showWeatherError({ icon, temp, desc, location });
    }
  );
}
