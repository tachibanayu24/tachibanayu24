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

  // Light orb (bokeh) settings for particle system
  LIGHT_ORBS: {
    COUNT: 22,
    SIZE: { min: 60, max: 140 },
    SPEED: 0.08,
    BASE_OPACITY: 0.15,
    NIGHT_OPACITY: 0.1,
    FREQUENCY: { base: 0.00008, variance: 0.00004 },
    AMPLITUDE: { base: 30, variance: 20 },
  },

  // Neumorphism shadow adjustments per time period
  // Softer shadows that blend with transparent card background
  SHADOWS: {
    MORNING: {
      light: "rgba(255, 255, 248, 0.6)",
      dark: "rgba(180, 175, 150, 0.35)",
    },
    NOON: {
      light: "rgba(255, 255, 255, 0.65)",
      dark: "rgba(160, 175, 190, 0.35)",
    },
    EVENING: {
      light: "rgba(255, 220, 200, 0.5)",
      dark: "rgba(140, 100, 80, 0.4)",
    },
    NIGHT: {
      light: "rgba(60, 80, 120, 0.4)",
      dark: "rgba(10, 20, 40, 0.6)",
    },
  },

  // Background gradient animation
  ANIMATION: {
    BREATH_CYCLE_SPEED: 0.00008,
    BREATH_INTENSITY: 0.02,
    ANGLE_OSCILLATION: 2, // degrees
    POSITION_DRIFT: { x: 20, y: 15 },
  },

  // Abstract geometric shapes
  SHAPES: {
    COUNT: { min: 3, max: 6 },
    SIZE: { min: 100, max: 300 },
    OPACITY: { min: 0.02, max: 0.05 },
    ROTATION_SPEED: 0.0002,
    VELOCITY: 0.02,
  },

  // Celestial body (sun/moon) settings
  CELESTIAL: {
    REACH_FACTOR: 1.2,
    ACCENT_REACH_FACTOR: 0.6,
    MOON_INTENSITY: 0.6,
    OFFSET_FACTOR: 0.5,
  },

  // Time-specific visual effects
  EFFECTS: {
    // Morning mist rising from bottom
    MIST: {
      COUNT: 12,
      WIDTH: { min: 300, max: 700 },
      HEIGHT: { min: 150, max: 350 },
      SPEED: { min: 0.0005, max: 0.0009 },
      RISE_SPEED: { min: 0.08, max: 0.12 },
      OPACITY: { min: 0.35, max: 0.55 },
    },

    // Noon god rays from above
    GOD_RAYS: {
      BASE_COUNT: 4,
      WIDTH: { min: 150, max: 400 },
      ANGLE: { min: -20, max: 20 },
      OPACITY: { min: 0.14, max: 0.24 },
      SPEED: { min: 0.0004, max: 0.0007 },
    },

    // Noon dust/light streaks
    DUST: {
      BASE_COUNT: 20,
      LENGTH: { min: 70, max: 200 },
      WIDTH: { min: 1.5, max: 4 },
      SPEED: { min: 0.1, max: 0.18 },
      OPACITY: { min: 0.16, max: 0.28 },
      ANGLE_VARIANCE: 0.15,
      FADE_SPEED: { min: 0.0012, max: 0.0025 },
    },

    // Evening horizontal light rays
    EVENING_RAYS: {
      COUNT: 6,
      HEIGHT: { min: 50, max: 140 },
      OPACITY: { min: 0.25, max: 0.42 },
      SPEED: { min: 0.0012, max: 0.0022 },
    },

    // Night fireflies
    FIREFLY: {
      COUNT: 12,
      SIZE: { min: 2, max: 5 },
      GLOW_SIZE: { min: 15, max: 35 },
      VELOCITY: 0.3,
      WANDER_SPEED: 0.002,
      GLOW_SPEED: { min: 0.002, max: 0.004 },
      BLINK_SPEED: { min: 0.001, max: 0.002 },
      BLINK_DURATION: { min: 0.3, max: 0.5 },
    },

    // Rabbit character (always visible)
    RABBIT: {
      // Size in pixels (adjusted for mobile)
      SIZE: { desktop: 60, mobile: 45 },
      // Position from bottom-left corner
      POSITION: {
        desktop: { left: 40, bottom: 40 },
        mobile: { left: 20, bottom: 20 },
      },
      // Animation speeds
      JUMP_SPEED: 0.003,
      JUMP_HEIGHT: 8,
      EAR_TWITCH_SPEED: 0.008,
      BREATHE_SPEED: 0.001,
      // Interaction
      CLICK_JUMP_HEIGHT: 25,
      CLICK_JUMP_DURATION: 400,
      HEART_DURATION: 1000,
      // Colors per time period - Hokori's actual coloring
      // Body: white/cream, Ears: light gray (subtle), Nose: pink/beige
      COLORS: {
        MORNING: {
          body: "rgba(255, 252, 248, 0.95)",
          accent: "rgba(210, 205, 200, 0.5)",
          nose: "rgba(235, 190, 180, 0.85)",
        },
        NOON: {
          body: "rgba(255, 253, 250, 0.9)",
          accent: "rgba(205, 200, 195, 0.45)",
          nose: "rgba(230, 185, 175, 0.8)",
        },
        EVENING: {
          body: "rgba(252, 245, 238, 0.9)",
          accent: "rgba(200, 190, 180, 0.5)",
          nose: "rgba(225, 175, 165, 0.85)",
        },
        NIGHT: {
          body: "rgba(220, 225, 235, 0.85)",
          accent: "rgba(190, 195, 205, 0.5)",
          nose: "rgba(195, 175, 180, 0.75)",
        },
      },
    },
  },

  // Screen adaptation
  SCREEN: {
    MOBILE_BREAKPOINT: 800,
    // Minimum opacity factor for mobile (prevents effects from becoming too faint)
    MOBILE_MIN_OPACITY_FACTOR: 0.75,
  },
};
