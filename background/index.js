/**
 * Background Animation System - Main Entry Point
 *
 * Orchestrates all modules to create a dynamic, context-aware background.
 * Responds to time of day and season.
 *
 * Usage:
 *   import { initBackground } from './background/index.js';
 *   initBackground();
 */

import { getTimePeriod, getTimeTransition } from "./time.js";
import { getSeason } from "./season.js";
import { getColorPalette, applyPaletteToCss } from "./colors.js";
import { BackgroundRenderer } from "./renderer.js";

// Global state
let renderer = null;
let updateInterval = null;
let currentState = {
  timePeriod: null,
  season: null,
  palette: null,
};

/**
 * Initialize the background animation system
 * @returns {Object} API for controlling the background
 */
export async function initBackground() {
  console.log("[Background] Initializing dynamic background system...");

  // Create and initialize renderer
  renderer = new BackgroundRenderer();
  renderer.init();

  // Get initial conditions
  updateConditions();

  // Start animation
  renderer.start();

  // Setup periodic updates
  startPeriodicUpdates();

  console.log("[Background] Background system initialized", {
    timePeriod: currentState.timePeriod,
    season: currentState.season,
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
function updateConditions() {
  // Get time-based info
  const timePeriod = getTimePeriod();
  const timeTransition = getTimeTransition();

  // Get season
  const season = getSeason();

  // Get color palette based on conditions
  const palette = getColorPalette(
    timeTransition.to,
    season,
    timeTransition.factor,
    timeTransition.from !== timeTransition.to ? timeTransition.from : null,
  );

  // Check if anything changed
  const changed =
    currentState.timePeriod !== timePeriod || currentState.season !== season;

  // Update state
  currentState = {
    timePeriod,
    season,
    palette,
  };

  // Apply CSS variables for neumorphic elements
  applyPaletteToCss(palette);

  // Update renderer
  if (renderer) {
    renderer.updateConditions(timePeriod, season, palette);
  }

  if (changed) {
    console.log("[Background] Conditions updated", {
      timePeriod,
      season,
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

  const { timePeriod = currentState.timePeriod, season = currentState.season } =
    options;

  const palette = getColorPalette(timePeriod, season);

  currentState = {
    timePeriod,
    season,
    palette,
  };

  applyPaletteToCss(palette);
  renderer.updateConditions(timePeriod, season, palette);

  console.log("[Background] Debug conditions set", options);
}

// Export constants for external use
export { TIME_PERIOD } from "./time.js";
export { SEASON } from "./season.js";

// Auto-initialize when script loads (can be disabled by setting window.BACKGROUND_MANUAL_INIT)
if (typeof window !== "undefined" && !window.BACKGROUND_MANUAL_INIT) {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initBackground());
  } else {
    initBackground();
  }
}
