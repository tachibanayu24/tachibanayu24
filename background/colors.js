/**
 * Background Animation System - Colors Module
 *
 * Defines color palettes for different times of day.
 * Provides smooth color interpolation and CSS variable updates.
 */

import { TIME_PERIOD } from "./time.js";
import { CONFIG } from "./config.js";

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
 * @typedef {Object} RGB
 * @property {number} r - Red (0-255)
 * @property {number} g - Green (0-255)
 * @property {number} b - Blue (0-255)
 */

// Pre-compiled regex for hex color parsing
const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

/**
 * Color palettes for each time period
 */
const TIME_PALETTES = {
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
    accent: "#B89080",
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

/**
 * Parse hex color to RGB
 * @param {string} hex - Hex color string (e.g., '#FF0000')
 * @returns {RGB} RGB color object
 */
function hexToRgb(hex) {
  if (typeof hex !== "string") {
    console.warn("[Colors] hexToRgb received non-string value:", hex);
    return { r: 0, g: 0, b: 0 };
  }
  const result = HEX_COLOR_REGEX.exec(hex);
  if (!result) {
    console.warn(`[Colors] Invalid hex color format: "${hex}"`);
  }
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string
 */
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Interpolate between two colors
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {string} Interpolated hex color
 */
function interpolateColor(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = c1.r + (c2.r - c1.r) * factor;
  const g = c1.g + (c2.g - c1.g) * factor;
  const b = c1.b + (c2.b - c1.b) * factor;

  return rgbToHex(r, g, b);
}

/**
 * Get the complete color palette for current time with optional transition blending
 * @param {string} timePeriod - Target time period
 * @param {number} transitionFactor - Transition progress (0 = previousTimePeriod, 1 = timePeriod)
 * @param {string} previousTimePeriod - Source time period for transitions
 * @returns {ColorPalette} Blended color palette
 */
export function getColorPalette(
  timePeriod,
  transitionFactor = 1,
  previousTimePeriod = null,
) {
  let palette = { ...TIME_PALETTES[timePeriod] };

  // Apply time transition if needed
  // transitionFactor: 0 = fully 'previous', 1 = fully 'current'
  if (previousTimePeriod && transitionFactor > 0 && transitionFactor < 1) {
    const fromPalette = TIME_PALETTES[previousTimePeriod];
    palette = {
      ...palette,
      gradient: palette.gradient.map((c, i) =>
        interpolateColor(
          fromPalette.gradient[i % fromPalette.gradient.length],
          c,
          transitionFactor,
        ),
      ),
      bg: interpolateColor(fromPalette.bg, palette.bg, transitionFactor),
      cardBg: interpolateColor(
        fromPalette.cardBg,
        palette.cardBg,
        transitionFactor,
      ),
      text: interpolateColor(fromPalette.text, palette.text, transitionFactor),
      textMuted: interpolateColor(
        fromPalette.textMuted,
        palette.textMuted,
        transitionFactor,
      ),
      accent: interpolateColor(
        fromPalette.accent,
        palette.accent,
        transitionFactor,
      ),
    };
  }

  // Add shadows based on time
  palette.shadows = CONFIG.SHADOWS[timePeriod] || CONFIG.SHADOWS.NOON;

  // Ensure celestial and gradientAngle are included
  palette.celestial = TIME_PALETTES[timePeriod].celestial;
  palette.gradientAngle = TIME_PALETTES[timePeriod].gradientAngle;

  return palette;
}

/**
 * Convert hex color to rgba with specified opacity
 * @param {string} hex - Hex color string (e.g., '#FF0000')
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string (e.g., 'rgba(255, 0, 0, 0.5)')
 */
function hexToRgba(hex, opacity) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Apply color palette to CSS variables
 */
export function applyPaletteToCss(palette) {
  const root = document.documentElement;

  root.style.setProperty("--bg", palette.bg);
  root.style.setProperty("--card-bg", palette.cardBg);
  root.style.setProperty("--card-bg-glass", hexToRgba(palette.cardBg, 0.65));
  root.style.setProperty("--text", palette.text);
  root.style.setProperty("--text-muted", palette.textMuted);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--shadow-light", palette.shadows.light);
  root.style.setProperty("--shadow-dark", palette.shadows.dark);

  // Glass border - subtle edge that matches the theme
  const glassBorder = hexToRgba(palette.cardBg, 0.3);
  root.style.setProperty("--glass-border", glassBorder);
}
