/**
 * Background Animation System - Color Interpolation Utilities
 *
 * Provides functions for color parsing and interpolation.
 */

/**
 * @typedef {Object} RGB
 * @property {number} r - Red (0-255)
 * @property {number} g - Green (0-255)
 * @property {number} b - Blue (0-255)
 */

/**
 * @typedef {Object} RGBA
 * @property {number} r - Red (0-255)
 * @property {number} g - Green (0-255)
 * @property {number} b - Blue (0-255)
 * @property {number} a - Alpha (0-1)
 */

// Pre-compiled regex for hex color parsing
const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

/**
 * Parse hex color to RGB
 * @param {string} hex - Hex color string (e.g., '#FF0000')
 * @returns {RGB} RGB color object
 */
export function hexToRgb(hex) {
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
export function rgbToHex(r, g, b) {
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
export function interpolateColor(color1, color2, factor) {
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
 * @returns {RGBA} RGBA components
 */
export function parseRgbaColor(rgba) {
  // Handle null/undefined
  if (!rgba || typeof rgba !== "string") {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

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
export function interpolateRgbaColor(color1, color2, factor) {
  const c1 = parseRgbaColor(color1);
  const c2 = parseRgbaColor(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  const a = c1.a + (c2.a - c1.a) * factor;

  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

/**
 * Convert hex color to rgba with specified opacity
 * @param {string} hex - Hex color string (e.g., '#FF0000')
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string (e.g., 'rgba(255, 0, 0, 0.5)')
 */
export function hexToRgba(hex, opacity) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}
