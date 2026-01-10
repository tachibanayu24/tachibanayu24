/**
 * Background Animation System - Colors Module
 *
 * Defines color palettes for different times of day.
 * Provides smooth color interpolation and CSS variable updates.
 */

import { TIME_PERIOD } from "./time.js";
import { CONFIG } from "./config.js";

/**
 * Color palettes for each time period
 */
const TIME_PALETTES = {
  [TIME_PERIOD.MORNING]: {
    // Sunrise: soft pink/peach horizon fading to light blue sky
    gradient: ["#FFE5D4", "#FFDCC8", "#FFD4B8", "#E8F0F8"],
    bg: "#F5EDE4",
    cardBg: "#F5EDE4",
    text: "#4A4035",
    textMuted: "#7D7165",
    accent: "#C4956A",
    // Sunrise light from lower left (off-screen)
    celestial: {
      type: "sun",
      x: -0.1,
      y: 0.9,
      color: "rgba(255, 200, 130, 0.5)",
      glowColor: "rgba(255, 180, 120, 0.2)",
    },
    gradientAngle: 135,
  },
  [TIME_PERIOD.NOON]: {
    // Midday: clear blue sky with subtle cloud wisps
    gradient: ["#87CEEB", "#A8D8F0", "#C5E5F5", "#E8F4FC", "#F5FAFF"],
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
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
 * Get the complete color palette for current time
 * @param {string} timePeriod
 * @param {number} transitionFactor - 0-1 for time transitions
 * @param {string} nextTimePeriod - Next time period for transitions
 * @returns {Object} Color palette
 */
export function getColorPalette(
  timePeriod,
  transitionFactor = 1,
  nextTimePeriod = null,
) {
  let palette = { ...TIME_PALETTES[timePeriod] };

  // Apply time transition if needed
  if (nextTimePeriod && transitionFactor < 1) {
    const nextPalette = TIME_PALETTES[nextTimePeriod];
    palette = {
      ...palette,
      gradient: palette.gradient.map((c, i) =>
        interpolateColor(
          c,
          nextPalette.gradient[i % nextPalette.gradient.length],
          transitionFactor,
        ),
      ),
      bg: interpolateColor(palette.bg, nextPalette.bg, transitionFactor),
      cardBg: interpolateColor(
        palette.cardBg,
        nextPalette.cardBg,
        transitionFactor,
      ),
      text: interpolateColor(palette.text, nextPalette.text, transitionFactor),
      textMuted: interpolateColor(
        palette.textMuted,
        nextPalette.textMuted,
        transitionFactor,
      ),
      accent: interpolateColor(
        palette.accent,
        nextPalette.accent,
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
 * Convert hex color to rgba with opacity
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
  root.style.setProperty("--card-bg-glass", hexToRgba(palette.cardBg, 0.4));
  root.style.setProperty("--text", palette.text);
  root.style.setProperty("--text-muted", palette.textMuted);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--shadow-light", palette.shadows.light);
  root.style.setProperty("--shadow-dark", palette.shadows.dark);

  // Glass border - subtle edge that matches the theme
  const glassBorder = hexToRgba(palette.cardBg, 0.3);
  root.style.setProperty("--glass-border", glassBorder);
}
