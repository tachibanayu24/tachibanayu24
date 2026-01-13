/**
 * Background Animation System - Shapes Module
 *
 * Handles abstract geometric shapes that float in the background.
 */

import { CONFIG } from "../config.js";

/**
 * @typedef {Object} Shape
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} size - Shape size
 * @property {number} rotation - Current rotation angle
 * @property {number} rotationSpeed - Rotation speed
 * @property {'circle'|'polygon'} type - Shape type
 * @property {number} sides - Number of sides (for polygon)
 * @property {number} opacity - Shape opacity
 * @property {number} vx - X velocity
 * @property {number} vy - Y velocity
 */

/**
 * @typedef {Object} ShapesState
 * @property {Shape[]} shapes - Array of shapes
 * @property {number} time - Animation time
 */

/**
 * Create initial shapes state
 * @returns {ShapesState}
 */
export function createShapesState() {
  return {
    shapes: [],
    time: 0,
  };
}

/**
 * Initialize shapes based on screen dimensions
 * @param {ShapesState} state - Shapes state
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function initShapes(state, width, height) {
  const { SHAPES } = CONFIG;
  state.shapes = [];
  const count =
    SHAPES.COUNT.min +
    Math.floor(Math.random() * (SHAPES.COUNT.max - SHAPES.COUNT.min + 1));

  for (let i = 0; i < count; i++) {
    state.shapes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size:
        SHAPES.SIZE.min + Math.random() * (SHAPES.SIZE.max - SHAPES.SIZE.min),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * SHAPES.ROTATION_SPEED,
      type: Math.random() > 0.5 ? "circle" : "polygon",
      sides: 3 + Math.floor(Math.random() * 4),
      opacity:
        SHAPES.OPACITY.min +
        Math.random() * (SHAPES.OPACITY.max - SHAPES.OPACITY.min),
      vx: (Math.random() - 0.5) * SHAPES.VELOCITY,
      vy: (Math.random() - 0.5) * SHAPES.VELOCITY,
    });
  }
}

/**
 * Update and draw shapes
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {ShapesState} state - Shapes state
 * @param {Object} palette - Color palette
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} deltaTime - Time since last frame
 */
export function drawShapes(ctx, state, palette, width, height, deltaTime) {
  if (!palette) return;

  state.time += deltaTime * 0.001;
  const shapeColor = palette.accent || "#4A6FA5";

  for (const shape of state.shapes) {
    // Update position
    shape.x += shape.vx * deltaTime;
    shape.y += shape.vy * deltaTime;
    shape.rotation += shape.rotationSpeed * deltaTime;

    // Wrap around edges
    if (shape.x < -shape.size) shape.x = width + shape.size;
    if (shape.x > width + shape.size) shape.x = -shape.size;
    if (shape.y < -shape.size) shape.y = height + shape.size;
    if (shape.y > height + shape.size) shape.y = -shape.size;

    // Draw shape
    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.rotation);
    ctx.globalAlpha = shape.opacity;

    if (shape.type === "circle") {
      drawCircle(ctx, shape.size, shapeColor);
    } else {
      drawPolygon(ctx, shape.size, shape.sides, shapeColor);
    }

    ctx.restore();
  }
}

/**
 * Draw a soft circle with gradient
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Circle radius
 * @param {string} color - Fill color
 */
function drawCircle(ctx, size, color) {
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "transparent");

  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

/**
 * Draw a polygon with gradient
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Polygon radius
 * @param {number} sides - Number of sides
 * @param {string} color - Fill color
 */
function drawPolygon(ctx, size, sides, color) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const x = Math.cos(angle) * size;
    const y = Math.sin(angle) * size;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "transparent");

  ctx.fillStyle = gradient;
  ctx.fill();
}
