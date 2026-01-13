/**
 * Background Animation System - Celestial Module
 *
 * Handles drawing of sun/moon light effects.
 * Creates ambient light rays from off-screen light sources.
 */

import { CONFIG } from "../config.js";

/**
 * Draw ambient light effect from celestial body (sun/moon)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} palette - Color palette with celestial config
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function drawCelestial(ctx, palette, width, height) {
  if (!palette || !palette.celestial) return;

  const { celestial } = palette;
  const { CELESTIAL } = CONFIG;

  // Light source position (can be off-screen)
  const sourceX = width * celestial.x;
  const sourceY = height * celestial.y;

  // Extend source further off-screen for natural light rays
  const offsetX = (celestial.x - 0.5) * width * CELESTIAL.OFFSET_FACTOR;
  const offsetY = (celestial.y - 0.5) * height * CELESTIAL.OFFSET_FACTOR;
  const lightX = sourceX + offsetX;
  const lightY = sourceY + offsetY;

  // Calculate light reach
  const reach = Math.max(width, height) * CELESTIAL.REACH_FACTOR;

  const isMoon = celestial.type === "moon";
  const intensity = isMoon ? CELESTIAL.MOON_INTENSITY : 1.0;

  // Primary ambient light
  const ambientLight = ctx.createRadialGradient(
    lightX,
    lightY,
    0,
    lightX,
    lightY,
    reach,
  );

  ambientLight.addColorStop(
    0,
    replaceOpacity(celestial.glowColor, 0.25 * intensity),
  );
  ambientLight.addColorStop(
    0.2,
    replaceOpacity(celestial.glowColor, 0.12 * intensity),
  );
  ambientLight.addColorStop(
    0.5,
    replaceOpacity(celestial.glowColor, 0.05 * intensity),
  );
  ambientLight.addColorStop(1, "transparent");

  ctx.fillStyle = ambientLight;
  ctx.fillRect(0, 0, width, height);

  // Secondary accent light near source edge
  const accentReach = reach * CELESTIAL.ACCENT_REACH_FACTOR;
  const accentLight = ctx.createRadialGradient(
    lightX,
    lightY,
    0,
    lightX,
    lightY,
    accentReach,
  );

  accentLight.addColorStop(
    0,
    replaceOpacity(celestial.color, 0.15 * intensity),
  );
  accentLight.addColorStop(
    0.3,
    replaceOpacity(celestial.color, 0.06 * intensity),
  );
  accentLight.addColorStop(
    0.6,
    replaceOpacity(celestial.color, 0.02 * intensity),
  );
  accentLight.addColorStop(1, "transparent");

  ctx.fillStyle = accentLight;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Replace opacity value in rgba color string
 * Optimized with string operations instead of regex for better performance
 * @param {string} color - rgba color string
 * @param {number} opacity - New opacity value
 * @returns {string} Modified color string
 */
function replaceOpacity(color, opacity) {
  // Find the last comma before the closing parenthesis
  // rgba(r, g, b, a) -> replace only the 'a' part
  const lastParen = color.lastIndexOf(")");
  const lastComma = color.lastIndexOf(",", lastParen);
  return color.substring(0, lastComma + 1) + ` ${opacity})`;
}
