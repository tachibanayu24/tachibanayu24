/**
 * Background Animation System - Colors Module
 *
 * Re-exports all color-related functionality.
 */

// Palette definitions
export { TIME_PALETTES } from "./palette.js";

// Interpolation utilities
export {
  hexToRgb,
  rgbToHex,
  interpolateColor,
  parseRgbaColor,
  interpolateRgbaColor,
  hexToRgba,
} from "./interpolation.js";

// Theme management
export { getColorPalette, applyPaletteToCss } from "./theme.js";
