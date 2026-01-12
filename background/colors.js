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
 * Parse rgba color string to components
 * @param {string} rgba - RGBA color string (e.g., 'rgba(255, 0, 0, 0.5)' or '#FF0000')
 * @returns {{r: number, g: number, b: number, a: number}} RGBA components
 */
function parseRgbaColor(rgba) {
  // Handle hex colors
  if (rgba.startsWith("#")) {
    const rgb = hexToRgb(rgba);
    return { ...rgb, a: 1 };
  }

  // Handle rgba() format
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
  }

  console.warn("[Colors] Could not parse color:", rgba);
  return { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Interpolate between two rgba colors
 * @param {string} color1 - First rgba color string
 * @param {string} color2 - Second rgba color string
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {string} Interpolated rgba color string
 */
function interpolateRgbaColor(color1, color2, factor) {
  const c1 = parseRgbaColor(color1);
  const c2 = parseRgbaColor(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  const a = c1.a + (c2.a - c1.a) * factor;

  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
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
  let palette = { ...TIME_PALETTES[timePeriod], timePeriod };

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

  // Add shadows based on time (with interpolation)
  if (previousTimePeriod && transitionFactor > 0 && transitionFactor < 1) {
    const fromShadows =
      CONFIG.SHADOWS[previousTimePeriod] || CONFIG.SHADOWS.NOON;
    const toShadows = CONFIG.SHADOWS[timePeriod] || CONFIG.SHADOWS.NOON;
    palette.shadows = {
      light: interpolateRgbaColor(
        fromShadows.light,
        toShadows.light,
        transitionFactor,
      ),
      dark: interpolateRgbaColor(
        fromShadows.dark,
        toShadows.dark,
        transitionFactor,
      ),
    };

    // Interpolate gradient angle
    const fromAngle = TIME_PALETTES[previousTimePeriod].gradientAngle;
    const toAngle = TIME_PALETTES[timePeriod].gradientAngle;
    palette.gradientAngle =
      fromAngle + (toAngle - fromAngle) * transitionFactor;

    // Interpolate celestial position
    const fromCelestial = TIME_PALETTES[previousTimePeriod].celestial;
    const toCelestial = TIME_PALETTES[timePeriod].celestial;
    palette.celestial = {
      type: toCelestial.type,
      x: fromCelestial.x + (toCelestial.x - fromCelestial.x) * transitionFactor,
      y: fromCelestial.y + (toCelestial.y - fromCelestial.y) * transitionFactor,
      color: interpolateRgbaColor(
        fromCelestial.color,
        toCelestial.color,
        transitionFactor,
      ),
      glowColor: interpolateRgbaColor(
        fromCelestial.glowColor,
        toCelestial.glowColor,
        transitionFactor,
      ),
    };
  } else {
    palette.shadows = CONFIG.SHADOWS[timePeriod] || CONFIG.SHADOWS.NOON;
    palette.celestial = TIME_PALETTES[timePeriod].celestial;
    palette.gradientAngle = TIME_PALETTES[timePeriod].gradientAngle;
  }

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

  // Update theme-color meta tag for Android system UI
  const themeColorMeta = document.getElementById("theme-color");
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", palette.bg);
  }
  root.style.setProperty("--card-bg", palette.cardBg);
  // Slightly visible card background (very transparent)
  root.style.setProperty("--card-bg-glass", hexToRgba(palette.cardBg, 0.075));
  // Semi-transparent background for neumorphic buttons (blends with background)
  root.style.setProperty("--button-bg", hexToRgba(palette.cardBg, 0.45));
  root.style.setProperty("--text", palette.text);
  root.style.setProperty("--text-muted", palette.textMuted);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--shadow-light", palette.shadows.light);
  root.style.setProperty("--shadow-dark", palette.shadows.dark);

  // Glass border - adapt to time period
  const borderColor = hexToRgba(palette.cardBg, 0.3);
  root.style.setProperty("--glass-border", borderColor);
  // Glass shadow - soft drop shadow
  root.style.setProperty("--glass-shadow", "rgba(0, 0, 0, 0.1)");

  // Card edge colors for plastic thickness effect
  const cardBgRgb = hexToRgb(palette.cardBg);
  const edgeLight = `rgba(${Math.min(255, cardBgRgb.r + 40)}, ${Math.min(255, cardBgRgb.g + 40)}, ${Math.min(255, cardBgRgb.b + 40)}, 0.25)`;
  const edgeDark = `rgba(${Math.max(0, cardBgRgb.r - 40)}, ${Math.max(0, cardBgRgb.g - 40)}, ${Math.max(0, cardBgRgb.b - 40)}, 0.5)`;
  const edgeDarker = `rgba(${Math.max(0, cardBgRgb.r - 60)}, ${Math.max(0, cardBgRgb.g - 60)}, ${Math.max(0, cardBgRgb.b - 60)}, 0.6)`;
  root.style.setProperty("--card-edge-light", edgeLight);
  root.style.setProperty("--card-edge-dark", edgeDark);
  root.style.setProperty("--card-edge-darker", edgeDarker);

  // Light reflection based on celestial position (sun/moon)
  if (palette.celestial) {
    const { x, y, type, color } = palette.celestial;

    // Convert celestial position to highlight position on card
    // Clamp to 0-100% range for gradient positioning
    const highlightX = Math.max(0, Math.min(100, x * 100));
    const highlightY = Math.max(0, Math.min(100, y * 100));

    // Adjust reflection intensity based on celestial type (stronger values)
    const isMoon = type === "moon";
    const baseOpacity = isMoon ? 0.15 : 0.25;

    // Parse celestial color for highlight tint
    const celestialRgba = parseRgbaColor(color);
    const highlightColor = `rgba(${celestialRgba.r}, ${celestialRgba.g}, ${celestialRgba.b}, ${baseOpacity})`;

    // Create radial gradient from light source position (larger and more visible)
    const highlightGradient = `radial-gradient(
      ellipse 150% 100% at ${highlightX}% ${highlightY}%,
      ${highlightColor} 0%,
      transparent 65%
    )`;
    root.style.setProperty("--card-highlight", highlightGradient);

    // Edge highlight intensity based on light direction (stronger values)
    // Brighter edge on the side facing the light
    const topEdgeOpacity = y < 0.5 ? 0.5 : 0.25;
    const leftEdgeOpacity = x < 0.5 ? 0.45 : 0.2;
    root.style.setProperty(
      "--edge-highlight-top",
      `rgba(255, 255, 255, ${topEdgeOpacity})`,
    );
    root.style.setProperty(
      "--edge-highlight-left",
      `rgba(255, 255, 255, ${leftEdgeOpacity})`,
    );

    // Oil slick angle follows light direction
    const oilslickAngle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 90;
    root.style.setProperty("--oilslick-angle", `${oilslickAngle}deg`);

    // Shimmer intensity per time period (brighter backgrounds need stronger shimmer)
    const shimmerIntensity = {
      MORNING: 0.35,
      NOON: 0.25,
      EVENING: 0.3,
      NIGHT: 0.15,
    };
    root.style.setProperty(
      "--shimmer-intensity",
      shimmerIntensity[palette.timePeriod] || 0.25,
    );

    // Oil slick intensity per time period (night is subtle, others are stronger)
    const oilslickIntensity = {
      MORNING: 0.12,
      NOON: 0.14,
      EVENING: 0.15,
      NIGHT: 0.04,
    };
    const intensity = oilslickIntensity[palette.timePeriod] || 0.1;

    const oilslickGradient = `linear-gradient(
      ${oilslickAngle}deg,
      transparent 0%,
      rgba(255, 100, 100, ${intensity * 0.7}) 12%,
      rgba(255, 200, 100, ${intensity}) 24%,
      rgba(200, 255, 100, ${intensity}) 36%,
      rgba(100, 255, 200, ${intensity}) 48%,
      rgba(100, 200, 255, ${intensity}) 60%,
      rgba(150, 100, 255, ${intensity * 0.7}) 72%,
      rgba(255, 100, 200, ${intensity * 0.5}) 84%,
      transparent 100%
    )`;
    root.style.setProperty("--oilslick-gradient", oilslickGradient);

    // Text shadow colors per time period
    // Light modes: white highlight above, dark shadow below (emboss)
    // Night mode: subtle glow effect with dark shadow above (inverted for light text)
    const textShadowConfig = {
      MORNING: {
        highlightColor: "rgba(255, 255, 255, 0.8)",
        shadowColor: "rgba(0, 0, 0, 0.15)",
        highlightOffset: "0 2px 1px",
        shadowOffset: "0 -1px 1px",
        // Subtle for body text
        highlightColorSubtle: "rgba(255, 255, 255, 0.35)",
        shadowColorSubtle: "rgba(0, 0, 0, 0.06)",
        highlightOffsetSubtle: "0 1px 0",
        shadowOffsetSubtle: "0 -1px 0",
      },
      NOON: {
        highlightColor: "rgba(255, 255, 255, 0.8)",
        shadowColor: "rgba(0, 0, 0, 0.12)",
        highlightOffset: "0 2px 1px",
        shadowOffset: "0 -1px 1px",
        highlightColorSubtle: "rgba(255, 255, 255, 0.35)",
        shadowColorSubtle: "rgba(0, 0, 0, 0.05)",
        highlightOffsetSubtle: "0 1px 0",
        shadowOffsetSubtle: "0 -1px 0",
      },
      EVENING: {
        highlightColor: "rgba(255, 240, 220, 0.7)",
        shadowColor: "rgba(0, 0, 0, 0.18)",
        highlightOffset: "0 2px 1px",
        shadowOffset: "0 -1px 1px",
        highlightColorSubtle: "rgba(255, 240, 220, 0.3)",
        shadowColorSubtle: "rgba(0, 0, 0, 0.08)",
        highlightOffsetSubtle: "0 1px 0",
        shadowOffsetSubtle: "0 -1px 0",
      },
      NIGHT: {
        // Night uses glow + drop shadow instead of emboss
        highlightColor: "rgba(80, 120, 180, 0.5)",
        shadowColor: "rgba(0, 0, 0, 0.7)",
        highlightOffset: "0 0 8px",
        shadowOffset: "0 2px 4px",
        highlightColorSubtle: "rgba(80, 120, 180, 0.3)",
        shadowColorSubtle: "rgba(0, 0, 0, 0.5)",
        highlightOffsetSubtle: "0 0 4px",
        shadowOffsetSubtle: "0 1px 2px",
      },
    };

    const tsConfig =
      textShadowConfig[palette.timePeriod] || textShadowConfig.NOON;
    root.style.setProperty("--text-highlight-color", tsConfig.highlightColor);
    root.style.setProperty("--text-shadow-color", tsConfig.shadowColor);
    root.style.setProperty("--text-highlight-offset", tsConfig.highlightOffset);
    root.style.setProperty("--text-shadow-offset", tsConfig.shadowOffset);
    // Subtle variants for body text
    root.style.setProperty(
      "--text-highlight-color-subtle",
      tsConfig.highlightColorSubtle,
    );
    root.style.setProperty(
      "--text-shadow-color-subtle",
      tsConfig.shadowColorSubtle,
    );
    root.style.setProperty(
      "--text-highlight-offset-subtle",
      tsConfig.highlightOffsetSubtle,
    );
    root.style.setProperty(
      "--text-shadow-offset-subtle",
      tsConfig.shadowOffsetSubtle,
    );

    // Icon deboss colors per time period
    const iconDebossConfig = {
      MORNING: {
        shadow: "rgba(0, 0, 0, 0.3)",
        highlight: "rgba(255, 255, 255, 0.7)",
      },
      NOON: {
        shadow: "rgba(0, 0, 0, 0.25)",
        highlight: "rgba(255, 255, 255, 0.7)",
      },
      EVENING: {
        shadow: "rgba(0, 0, 0, 0.35)",
        highlight: "rgba(255, 240, 220, 0.65)",
      },
      NIGHT: {
        // Night: swap roles - subtle glow on top, drop shadow below
        shadow: "rgba(80, 120, 180, 0.25)",
        highlight: "rgba(0, 0, 0, 0.6)",
      },
    };

    const iconConfig =
      iconDebossConfig[palette.timePeriod] || iconDebossConfig.NOON;
    root.style.setProperty("--icon-shadow-color", iconConfig.shadow);
    root.style.setProperty("--icon-highlight-color", iconConfig.highlight);
  }
}
