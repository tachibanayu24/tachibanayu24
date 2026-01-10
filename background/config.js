/**
 * Background Animation System - Configuration
 *
 * Centralized configuration for colors, timing, and particle behaviors.
 * Modify this file to customize the visual appearance.
 */

export const CONFIG = {
  // OpenWeatherMap API (free tier available)
  // Get your API key at: https://openweathermap.org/api
  WEATHER_API_KEY: "", // Leave empty to skip weather features

  // Time periods (24-hour format)
  TIME_PERIODS: {
    MORNING: { start: 5, end: 11 },
    NOON: { start: 11, end: 17 },
    EVENING: { start: 17, end: 20 },
    NIGHT: { start: 20, end: 5 },
  },

  // Animation settings
  ANIMATION: {
    PARTICLE_COUNT: 50,
    PARTICLE_SIZE: { min: 2, max: 8 },
    PARTICLE_SPEED: { min: 0.2, max: 1.0 },
    BLOB_COUNT: 5,
    BLOB_SIZE: { min: 100, max: 300 },
    TRANSITION_DURATION: 2000, // ms for color transitions
    FPS: 60,
  },

  // Neumorphism shadow adjustments per time period
  SHADOWS: {
    MORNING: {
      light: "rgba(255, 255, 255, 0.9)",
      dark: "rgba(200, 180, 160, 0.4)",
    },
    NOON: {
      light: "rgba(255, 255, 255, 0.95)",
      dark: "rgba(180, 195, 210, 0.45)",
    },
    EVENING: {
      light: "rgba(255, 220, 200, 0.7)",
      dark: "rgba(150, 100, 80, 0.5)",
    },
    NIGHT: {
      light: "rgba(60, 80, 120, 0.4)",
      dark: "rgba(10, 20, 40, 0.6)",
    },
  },

  // Weather-specific particle configurations
  WEATHER_PARTICLES: {
    CLEAR: {
      type: "float",
      count: 60,
      color: "rgba(255, 220, 120, 0.85)",
      speed: 0.12,
      size: { min: 8, max: 20 },
    },
    CLOUDS: {
      type: "blob",
      count: 15,
      color: "rgba(180, 190, 210, 0.4)",
      speed: 0.05,
      size: { min: 150, max: 350 },
    },
    RAIN: {
      type: "fall",
      count: 150,
      color: "rgba(100, 140, 200, 0.6)",
      speed: 4,
      size: { min: 2, max: 4 },
    },
    SNOW: {
      type: "fall",
      count: 80,
      color: "rgba(255, 255, 255, 0.9)",
      speed: 0.6,
      size: { min: 3, max: 8 },
    },
    DEFAULT: {
      type: "float",
      count: 35,
      color: "rgba(120, 140, 180, 0.5)",
      speed: 0.2,
      size: { min: 4, max: 10 },
    },
  },
};
