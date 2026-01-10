/**
 * Background Animation System - Weather Module
 *
 * Fetches weather data using Geolocation API and OpenWeatherMap.
 * Gracefully degrades when API key is not provided or location is denied.
 */

import { CONFIG } from "./config.js";

export const WEATHER_TYPE = {
  CLEAR: "CLEAR",
  CLOUDS: "CLOUDS",
  RAIN: "RAIN",
  SNOW: "SNOW",
  DEFAULT: "DEFAULT",
};

// Cache weather data to avoid excessive API calls
let weatherCache = {
  data: null,
  timestamp: 0,
  coords: null,
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get user's geolocation
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function getGeolocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        resolve(null);
      },
      {
        timeout: 10000,
        maximumAge: CACHE_DURATION,
      },
    );
  });
}

/**
 * Fetch weather data from OpenWeatherMap API
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object | null>}
 */
async function fetchWeatherData(lat, lon) {
  const apiKey = CONFIG.WEATHER_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Failed to fetch weather:", error.message);
    return null;
  }
}

/**
 * Get current weather information
 * @returns {Promise<{ type: string, temperature: number, description: string, humidity: number } | null>}
 */
export async function getWeather() {
  // Check cache first
  const now = Date.now();
  if (weatherCache.data && now - weatherCache.timestamp < CACHE_DURATION) {
    return weatherCache.data;
  }

  // Get location
  const coords = await getGeolocation();
  if (!coords) {
    return createDefaultWeather();
  }

  // Fetch weather
  const data = await fetchWeatherData(coords.latitude, coords.longitude);
  if (!data) {
    return createDefaultWeather();
  }

  // Parse weather data
  const weather = parseWeatherData(data);

  // Update cache
  weatherCache = {
    data: weather,
    timestamp: now,
    coords,
  };

  return weather;
}

/**
 * Parse OpenWeatherMap response into simplified format
 * @param {Object} data
 * @returns {{ type: string, temperature: number, description: string, humidity: number }}
 */
function parseWeatherData(data) {
  const mainWeather = data.weather?.[0]?.main?.toLowerCase() || "";
  const description = data.weather?.[0]?.description || "";

  let type = WEATHER_TYPE.DEFAULT;

  if (mainWeather.includes("clear") || mainWeather.includes("sun")) {
    type = WEATHER_TYPE.CLEAR;
  } else if (mainWeather.includes("cloud")) {
    type = WEATHER_TYPE.CLOUDS;
  } else if (
    mainWeather.includes("rain") ||
    mainWeather.includes("drizzle") ||
    mainWeather.includes("thunderstorm")
  ) {
    type = WEATHER_TYPE.RAIN;
  } else if (mainWeather.includes("snow") || mainWeather.includes("sleet")) {
    type = WEATHER_TYPE.SNOW;
  }

  return {
    type,
    temperature: data.main?.temp || 20,
    description,
    humidity: data.main?.humidity || 50,
  };
}

/**
 * Create default weather when API is unavailable
 * @returns {{ type: string, temperature: number, description: string, humidity: number }}
 */
function createDefaultWeather() {
  return {
    type: WEATHER_TYPE.DEFAULT,
    temperature: 20,
    description: "default",
    humidity: 50,
  };
}

/**
 * Get weather type without async (uses cached data)
 * @returns {string}
 */
export function getCachedWeatherType() {
  return weatherCache.data?.type || WEATHER_TYPE.DEFAULT;
}

/**
 * Get user's latitude from cached coords
 * @returns {number | null}
 */
export function getCachedLatitude() {
  return weatherCache.coords?.latitude || null;
}
