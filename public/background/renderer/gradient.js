/**
 * Background Animation System - Gradient Module
 *
 * Handles background gradient drawing with breathing animation effect.
 */

import { CONFIG } from "../config.js";

/**
 * @typedef {Object} GradientState
 * @property {number} time - Animation time accumulator
 * @property {Array<{r: number, g: number, b: number}>|null} colorsCache - Cached RGB values
 */

/**
 * Create initial gradient state
 * @returns {GradientState}
 */
export function createGradientState() {
  return {
    time: 0,
    colorsCache: null,
  };
}

/**
 * Update gradient colors cache from palette
 * @param {GradientState} state - Gradient state
 * @param {Object} palette - Color palette
 */
export function updateGradientCache(state, palette) {
  if (!palette || !palette.gradient) return;

  state.colorsCache = palette.gradient.map((hex) => {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  });
}

/**
 * Draw the background gradient with breathing animation
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {GradientState} state - Gradient state
 * @param {Object} palette - Color palette
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} deltaTime - Time since last frame
 */
export function drawGradient(ctx, state, palette, width, height, deltaTime) {
  if (!palette) return;

  state.time += deltaTime;

  const { gradientAngle = 180 } = palette;
  const { ANIMATION } = CONFIG;

  // Breathing effect - slow oscillation
  const breathCycle = state.time * ANIMATION.BREATH_CYCLE_SPEED;

  // Calculate gradient endpoints with subtle angle oscillation
  const angleOffset = Math.sin(breathCycle * 0.7) * ANIMATION.ANGLE_OSCILLATION;
  const angleRad = ((gradientAngle + angleOffset) * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  // Gradient line through center
  const cx = width / 2;
  const cy = height / 2;
  const length = Math.sqrt(width * width + height * height) / 2;

  // Subtle position drift
  const driftX = Math.sin(breathCycle * 1.1) * ANIMATION.POSITION_DRIFT.x;
  const driftY = Math.cos(breathCycle * 0.9) * ANIMATION.POSITION_DRIFT.y;

  const x0 = cx - cos * length + driftX;
  const y0 = cy - sin * length + driftY;
  const x1 = cx + cos * length + driftX;
  const y1 = cy + sin * length + driftY;

  const bgGradient = ctx.createLinearGradient(x0, y0, x1, y1);

  // Apply breathing to gradient colors
  const colors = state.colorsCache;
  if (colors) {
    for (let i = 0; i < colors.length; i++) {
      const adjustedColor = breatheColor(
        colors[i],
        breathCycle,
        i,
        ANIMATION.BREATH_INTENSITY,
      );
      bgGradient.addColorStop(i / (colors.length - 1), adjustedColor);
    }
  }

  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Subtly adjust color brightness for breathing effect
 * @param {{r: number, g: number, b: number}} rgb - RGB color values
 * @param {number} time - Animation time
 * @param {number} index - Color stop index
 * @param {number} intensity - Breathing intensity
 * @returns {string} Hex color string
 */
function breatheColor(rgb, time, index, intensity) {
  // Different phase for each color stop for wave effect
  const phase = index * 0.5;
  const adjustment = 1 + Math.sin(time + phase) * intensity;

  const r = Math.min(255, Math.max(0, Math.round(rgb.r * adjustment)));
  const g = Math.min(255, Math.max(0, Math.round(rgb.g * adjustment)));
  const b = Math.min(255, Math.max(0, Math.round(rgb.b * adjustment)));

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
