/**
 * Background Animation System - Canvas Module
 *
 * Handles canvas element creation, sizing, and device pixel ratio support.
 */

/**
 * @typedef {Object} CanvasContext
 * @property {HTMLCanvasElement} canvas - The canvas element
 * @property {CanvasRenderingContext2D} ctx - The 2D rendering context
 */

/**
 * Create and configure a canvas element
 * @param {string} id - Canvas element ID
 * @param {number} zIndex - CSS z-index value
 * @returns {CanvasContext}
 */
export function createCanvas(id, zIndex) {
  const canvas = document.createElement("canvas");
  canvas.id = id;
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: ${zIndex};
    pointer-events: none;
  `;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error(`[Canvas] Failed to get 2D context for canvas: ${id}`);
    throw new Error(`Canvas 2D context not available for: ${id}`);
  }
  return { canvas, ctx };
}

/**
 * Remove existing canvas element by ID
 * @param {string} id - Canvas element ID
 */
export function removeExistingCanvas(id) {
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
}

/**
 * Get capped device pixel ratio for performance
 * Limits DPR to 2 to prevent excessive rendering on high-DPI displays
 * @returns {number}
 */
export function getDevicePixelRatio() {
  const dpr = window.devicePixelRatio || 1;
  // Cap at 2 for performance - 3x displays don't need full resolution for background effects
  return Math.min(dpr, 2);
}

/**
 * Resize canvas to match window dimensions with device pixel ratio support
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
 * @param {number} width - Target width
 * @param {number} height - Target height
 */
export function resizeCanvas(canvas, ctx, width, height) {
  const dpr = getDevicePixelRatio();

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

/**
 * Clear the canvas
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}
