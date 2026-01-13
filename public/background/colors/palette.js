/**
 * Background Animation System - Color Palettes
 *
 * Defines color palettes for different times of day.
 */

import { TIME_PERIOD } from "../time.js";

/**
 * @typedef {Object} CelestialConfig
 * @property {'sun'|'moon'} type - Type of celestial body
 * @property {number} x - X position (0-1, can be outside 0-1 for off-screen)
 * @property {number} y - Y position (0-1, can be outside 0-1 for off-screen)
 * @property {string} color - Primary color (rgba format)
 * @property {string} glowColor - Glow color (rgba format)
 */

/**
 * @typedef {Object} ShadowConfig
 * @property {string} light - Light shadow color
 * @property {string} dark - Dark shadow color
 */

/**
 * @typedef {Object} ColorPalette
 * @property {string[]} gradient - Array of gradient colors (hex)
 * @property {string} bg - Background color (hex)
 * @property {string} cardBg - Card background color (hex)
 * @property {string} text - Text color (hex)
 * @property {string} textMuted - Muted text color (hex)
 * @property {string} accent - Accent color (hex)
 * @property {CelestialConfig} celestial - Celestial body configuration
 * @property {number} gradientAngle - Gradient angle in degrees
 * @property {ShadowConfig} shadows - Shadow colors
 */

/**
 * Color palettes for each time period
 */
export const TIME_PALETTES = {
  [TIME_PERIOD.MORNING]: {
    // Morning: clean white and soft yellow, like Sunday morning bed sheets
    gradient: ["#FFFEF5", "#FFFDE8", "#FFFBD5", "#F0F4FF"],
    bg: "#E8E6D6",
    cardBg: "#E8E6D6",
    text: "#3A3A35",
    textMuted: "#6E6E65",
    accent: "#B8AD45",
    // Morning sunlight from lower left (off-screen)
    celestial: {
      type: "sun",
      x: -0.1,
      y: 0.9,
      color: "rgba(255, 255, 180, 0.5)",
      glowColor: "rgba(255, 255, 150, 0.2)",
    },
    gradientAngle: 135,
  },
  [TIME_PERIOD.NOON]: {
    // Midday: clear blue sky - more blue coverage
    gradient: ["#6BC4E8", "#87CEEB", "#A8D8F0", "#B8E0F5", "#D0ECFA"],
    bg: "#E8EEF3",
    cardBg: "#E8EEF3",
    text: "#2D3748",
    textMuted: "#718096",
    accent: "#4A6FA5",
    // Overhead sunlight from above (off-screen top)
    celestial: {
      type: "sun",
      x: 0.5,
      y: -0.2,
      color: "rgba(255, 252, 230, 0.35)",
      glowColor: "rgba(255, 248, 220, 0.18)",
    },
    gradientAngle: 180,
  },
  [TIME_PERIOD.EVENING]: {
    // Sunset: muted, nostalgic golden hour
    gradient: ["#E8C4A8", "#DDBAA0", "#D4A99A", "#C9A0A0", "#B89AA8"],
    bg: "#E8E0DC",
    cardBg: "#E8E0DC",
    text: "#4A4040",
    textMuted: "#7A6B6B",
    accent: "#8F5A4A",
    // Sunset light from lower right (off-screen)
    celestial: {
      type: "sun",
      x: 1.1,
      y: 0.85,
      color: "rgba(230, 180, 140, 0.4)",
      glowColor: "rgba(220, 160, 120, 0.15)",
    },
    gradientAngle: 45,
  },
  [TIME_PERIOD.NIGHT]: {
    // Night sky: deep blues and purples
    gradient: ["#0F1628", "#162035", "#1A2540", "#0D1A30"],
    bg: "#1E2430",
    cardBg: "#252D3A",
    text: "#E0E5EC",
    textMuted: "#8B95A5",
    accent: "#5B7DB1",
    // Moonlight from upper right (off-screen)
    celestial: {
      type: "moon",
      x: 1.0,
      y: -0.1,
      color: "rgba(200, 220, 255, 0.4)",
      glowColor: "rgba(150, 180, 230, 0.12)",
    },
    gradientAngle: 180,
  },
};
