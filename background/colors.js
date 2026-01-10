/**
 * Background Animation System - Colors Module
 *
 * Defines color palettes for different times and seasons.
 * Provides smooth color interpolation and CSS variable updates.
 */

import { TIME_PERIOD } from "./time.js";
import { SEASON } from "./season.js";
import { CONFIG } from "./config.js";

/**
 * Base color palettes for each time period
 * Each period has gradient colors and accent colors
 */
const TIME_PALETTES = {
  [TIME_PERIOD.MORNING]: {
    gradient: ["#FFF8E7", "#FFE4C4", "#FFDAB9"],
    bg: "#F5EDE4",
    cardBg: "#F5EDE4",
    text: "#4A4035",
    textMuted: "#7D7165",
    accent: "#C4956A",
  },
  [TIME_PERIOD.NOON]: {
    gradient: ["#E8F4FD", "#D4E8F5", "#C5DFF0"],
    bg: "#E8EEF3",
    cardBg: "#E8EEF3",
    text: "#2D3748",
    textMuted: "#718096",
    accent: "#4A6FA5",
  },
  [TIME_PERIOD.EVENING]: {
    gradient: ["#FFB088", "#FF8C69", "#E8707A", "#C9628F"],
    bg: "#E8DDD8",
    cardBg: "#E8DDD8",
    text: "#3D3535",
    textMuted: "#6B5959",
    accent: "#B5656B",
  },
  [TIME_PERIOD.NIGHT]: {
    gradient: ["#1A1A2E", "#16213E", "#1B2838", "#0F3460"],
    bg: "#1E2430",
    cardBg: "#252D3A",
    text: "#E0E5EC",
    textMuted: "#8B95A5",
    accent: "#5B7DB1",
  },
};

/**
 * Season color modifiers (applied as hue/saturation shifts)
 * More dramatic shifts to make seasons visually distinct
 */
const SEASON_MODIFIERS = {
  [SEASON.SPRING]: { hue: -15, saturation: 1.25, lightness: 1.05 },
  [SEASON.SUMMER]: { hue: 10, saturation: 1.35, lightness: 1.02 },
  [SEASON.AUTUMN]: { hue: 30, saturation: 1.1, lightness: 0.95 },
  [SEASON.WINTER]: { hue: -20, saturation: 0.7, lightness: 1.1 },
};

/**
 * Season-specific gradient tints (blended with base gradients)
 */
const SEASON_TINTS = {
  [SEASON.SPRING]: ["#FFE4EC", "#E8F5E9"],
  [SEASON.SUMMER]: ["#E3F2FD", "#FFF8E1"],
  [SEASON.AUTUMN]: ["#FBE9E7", "#FFF3E0"],
  [SEASON.WINTER]: ["#E8EAF6", "#ECEFF1"],
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
 * Convert RGB to HSL
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
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
 * Apply season modifier to a color
 */
function applySeasonModifier(hex, season) {
  const modifier = SEASON_MODIFIERS[season] || SEASON_MODIFIERS[SEASON.SUMMER];
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  hsl.h = (hsl.h + modifier.hue + 360) % 360;
  hsl.s = Math.max(0, Math.min(100, hsl.s * modifier.saturation));
  hsl.l = Math.max(0, Math.min(100, hsl.l * modifier.lightness));

  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Blend two colors with a given ratio
 */
function blendColors(color1, color2, ratio) {
  return interpolateColor(color1, color2, ratio);
}

/**
 * Get the complete color palette for current conditions
 * @param {string} timePeriod
 * @param {string} season
 * @param {number} transitionFactor - 0-1 for time transitions
 * @param {string} nextTimePeriod - Next time period for transitions
 * @returns {Object} Color palette
 */
export function getColorPalette(
  timePeriod,
  season,
  transitionFactor = 1,
  nextTimePeriod = null,
) {
  let palette = { ...TIME_PALETTES[timePeriod] };

  // Apply time transition if needed
  if (nextTimePeriod && transitionFactor < 1) {
    const nextPalette = TIME_PALETTES[nextTimePeriod];
    palette = {
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

  // Apply season modifiers (hue/saturation/lightness shifts)
  palette = {
    ...palette,
    gradient: palette.gradient.map((c) => applySeasonModifier(c, season)),
    bg: applySeasonModifier(palette.bg, season),
    cardBg: applySeasonModifier(palette.cardBg, season),
  };

  // Blend season tints into gradient for more visible seasonal effect
  const seasonTints = SEASON_TINTS[season];
  if (seasonTints) {
    const tintStrength = 0.25;
    palette.gradient = palette.gradient.map((c, i) => {
      const tintColor = seasonTints[i % seasonTints.length];
      return blendColors(c, tintColor, tintStrength);
    });
    palette.cardBg = blendColors(
      palette.cardBg,
      seasonTints[0],
      tintStrength * 0.5,
    );
  }

  // Add shadows based on time
  palette.shadows = CONFIG.SHADOWS[timePeriod] || CONFIG.SHADOWS.NOON;

  return palette;
}

/**
 * Apply color palette to CSS variables
 */
export function applyPaletteToCss(palette) {
  const root = document.documentElement;

  root.style.setProperty("--bg", palette.bg);
  root.style.setProperty("--card-bg", palette.cardBg);
  root.style.setProperty("--text", palette.text);
  root.style.setProperty("--text-muted", palette.textMuted);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--shadow-light", palette.shadows.light);
  root.style.setProperty("--shadow-dark", palette.shadows.dark);
}
