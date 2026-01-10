/**
 * Background Animation System - Configuration
 *
 * Centralized configuration for colors, timing, and particle behaviors.
 * Modify this file to customize the visual appearance.
 */

export const CONFIG = {
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

  // Floating particle configuration (distributed across 3 depth layers)
  PARTICLES: {
    count: 50,
    color: "rgba(120, 140, 180, 0.5)",
    speed: 0.12,
    size: { min: 8, max: 20 },
  },

  // Season-specific accent particle colors
  SEASON_ACCENTS: {
    SPRING: "rgba(255, 182, 193, 0.6)",
    SUMMER: "rgba(255, 220, 120, 0.5)",
    AUTUMN: "rgba(255, 140, 80, 0.55)",
    WINTER: "rgba(200, 220, 255, 0.5)",
  },
};
