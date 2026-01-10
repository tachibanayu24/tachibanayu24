/**
 * Background Animation System - Main Entry Point
 *
 * Orchestrates all modules to create a dynamic, context-aware background.
 * Responds to time of day, season, and weather conditions.
 *
 * Usage:
 *   import { initBackground } from './background/index.js';
 *   initBackground();
 */

import { getTimePeriod, getTimeTransition } from "./time.js";
import { getSeason, isSouthernHemisphere } from "./season.js";
import {
  getWeather,
  getCachedWeatherType,
  getCachedLatitude,
  WEATHER_TYPE,
} from "./weather.js";
import { getColorPalette, applyPaletteToCss } from "./colors.js";
import { BackgroundRenderer } from "./renderer.js";
import { CONFIG } from "./config.js";

// Global state
let renderer = null;
let updateInterval = null;
let currentState = {
  timePeriod: null,
  season: null,
  weatherType: WEATHER_TYPE.DEFAULT,
  palette: null,
};

/**
 * Initialize the background animation system
 * @param {Object} options - Configuration options
 * @returns {Object} API for controlling the background
 */
export async function initBackground(options = {}) {
  console.log("[Background] Initializing dynamic background system...");

  // Create and initialize renderer
  renderer = new BackgroundRenderer();
  renderer.init();

  // Get initial conditions
  await updateConditions();

  // Start animation
  renderer.start();

  // Setup periodic updates
  startPeriodicUpdates();

  console.log("[Background] Background system initialized", {
    timePeriod: currentState.timePeriod,
    season: currentState.season,
    weatherType: currentState.weatherType,
  });

  // Return public API
  return {
    pause: () => renderer?.pause(),
    resume: () => renderer?.resume(),
    destroy: () => {
      stopPeriodicUpdates();
      renderer?.destroy();
      renderer = null;
    },
    refresh: () => updateConditions(),
    getState: () => ({ ...currentState }),
  };
}

/**
 * Update all environmental conditions and apply changes
 */
async function updateConditions() {
  // Get time-based info
  const timePeriod = getTimePeriod();
  const timeTransition = getTimeTransition();

  // Get location-based info (may need async weather fetch)
  let latitude = getCachedLatitude();
  let weatherType = getCachedWeatherType();

  // Fetch weather if not cached
  if (!latitude || weatherType === WEATHER_TYPE.DEFAULT) {
    const weather = await getWeather();
    if (weather) {
      weatherType = weather.type;
      latitude = getCachedLatitude();
    }
  }

  // Determine hemisphere and season
  const isSouthern = isSouthernHemisphere(latitude);
  const season = getSeason(isSouthern);

  // Get color palette based on all conditions
  const palette = getColorPalette(
    timeTransition.to,
    season,
    weatherType,
    timeTransition.factor,
    timeTransition.from !== timeTransition.to ? timeTransition.from : null,
  );

  // Check if anything changed
  const changed =
    currentState.timePeriod !== timePeriod ||
    currentState.season !== season ||
    currentState.weatherType !== weatherType;

  // Update state
  currentState = {
    timePeriod,
    season,
    weatherType,
    palette,
  };

  // Apply CSS variables for neumorphic elements
  applyPaletteToCss(palette);

  // Update renderer
  if (renderer) {
    renderer.updateConditions(weatherType, timePeriod, season, palette);
  }

  if (changed) {
    console.log("[Background] Conditions updated", {
      timePeriod,
      season,
      weatherType,
    });
  }
}

/**
 * Start periodic updates for smooth transitions
 */
function startPeriodicUpdates() {
  // Update every minute for smooth time transitions
  updateInterval = setInterval(() => {
    updateConditions();
  }, 60000);

  // Also update weather every 30 minutes
  setInterval(async () => {
    const weather = await getWeather();
    if (weather && weather.type !== currentState.weatherType) {
      await updateConditions();
    }
  }, 30 * 60000);
}

/**
 * Stop periodic updates
 */
function stopPeriodicUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

/**
 * Debug mode - allows testing different conditions
 */
export function setDebugConditions(options = {}) {
  if (!renderer) {
    console.warn("[Background] Renderer not initialized");
    return;
  }

  const {
    timePeriod = currentState.timePeriod,
    season = currentState.season,
    weatherType = currentState.weatherType,
  } = options;

  const palette = getColorPalette(timePeriod, season, weatherType);

  currentState = {
    timePeriod,
    season,
    weatherType,
    palette,
  };

  applyPaletteToCss(palette);
  renderer.updateConditions(weatherType, timePeriod, season, palette);

  console.log("[Background] Debug conditions set", options);
}

// Export constants for external use
export { TIME_PERIOD } from "./time.js";
export { SEASON } from "./season.js";
export { WEATHER_TYPE } from "./weather.js";

// Auto-initialize when script loads (can be disabled by setting window.BACKGROUND_MANUAL_INIT)
if (typeof window !== "undefined" && !window.BACKGROUND_MANUAL_INIT) {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initBackground());
  } else {
    initBackground();
  }
}
