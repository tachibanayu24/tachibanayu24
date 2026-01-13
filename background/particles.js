/**
 * Background Animation System - Particles Module
 *
 * Creates soft, bokeh-like ambient light effects with parallax depth.
 * Designed for a modern, artistic atmosphere rather than distinct particles.
 */

import { TIME_PERIOD } from "./time.js";
import { CONFIG } from "./config.js";

/**
 * @typedef {Object} DepthLayerConfig
 * @property {number} sizeMultiplier - Size multiplier for this layer
 * @property {number} speedMultiplier - Speed multiplier for this layer
 * @property {number} opacityMultiplier - Opacity multiplier for this layer
 * @property {number} count - Fraction of total orbs in this layer
 */

/**
 * @typedef {Object} OrbConfig
 * @property {{min: number, max: number}} size - Size range
 * @property {number} speed - Base movement speed
 * @property {string} color - RGBA color string
 * @property {number} baseOpacity - Base opacity value
 */

// Cached offscreen canvas for gradient rendering (shared across all orbs)
const GRADIENT_CACHE_SIZE = 128;
let gradientCanvas = null;
let gradientCtx = null;

/**
 * Initialize or get the shared gradient cache canvas
 */
function getGradientCache() {
  if (!gradientCanvas) {
    gradientCanvas = document.createElement("canvas");
    gradientCanvas.width = GRADIENT_CACHE_SIZE;
    gradientCanvas.height = GRADIENT_CACHE_SIZE;
    gradientCtx = gradientCanvas.getContext("2d");

    // Draw the gradient once - a soft radial falloff
    const center = GRADIENT_CACHE_SIZE / 2;
    const gradient = gradientCtx.createRadialGradient(
      center,
      center,
      0,
      center,
      center,
      center,
    );

    // Soft falloff pattern (will be tinted with globalAlpha)
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.15, "rgba(255, 255, 255, 0.7)");
    gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.4)");
    gradient.addColorStop(0.55, "rgba(255, 255, 255, 0.15)");
    gradient.addColorStop(0.75, "rgba(255, 255, 255, 0.05)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    gradientCtx.fillStyle = gradient;
    gradientCtx.fillRect(0, 0, GRADIENT_CACHE_SIZE, GRADIENT_CACHE_SIZE);
  }
  return gradientCanvas;
}

/**
 * Depth layer configuration for parallax
 * Fewer, larger, softer elements for artistic effect
 */
const DEPTH_LAYERS = {
  // Far background - very large, very subtle
  far: {
    sizeMultiplier: 0.6,
    speedMultiplier: 0.2,
    opacityMultiplier: 0.5,
    count: 0.35,
  },
  // Middle layer
  middle: {
    sizeMultiplier: 1.0,
    speedMultiplier: 0.5,
    opacityMultiplier: 0.7,
    count: 0.4,
  },
  // Front/close - largest, most visible
  front: {
    sizeMultiplier: 1.4,
    speedMultiplier: 0.8,
    opacityMultiplier: 1.0,
    count: 0.25,
  },
};

/**
 * Soft bokeh-like light orb
 * Large, diffuse, and very subtle
 */
class LightOrb {
  /**
   * @param {Object} config - Orb configuration
   * @param {Object} depthLayer - Depth layer configuration
   * @param {ParticleSystem} parent - Parent system for dimension access
   */
  constructor(config, depthLayer, parent) {
    this.config = config;
    this.depthLayer = depthLayer;
    this.parent = parent;
    this.reset(true);
  }

  reset(initial = false) {
    const { min, max } = this.config.size;
    const layer = this.depthLayer;

    // Large, soft orbs
    const baseSize = min + Math.random() * (max - min);
    this.size = baseSize * layer.sizeMultiplier;

    // Position - spread across viewport (use cached dimensions from parent)
    const w = this.parent.width;
    const h = this.parent.height;
    this.x = Math.random() * w;
    this.y = initial ? Math.random() * h : h + this.size * 0.5;

    // Very slow, organic movement
    this.phase = Math.random() * Math.PI * 2;
    this.phaseY = Math.random() * Math.PI * 2;
    this.phaseSize = Math.random() * Math.PI * 2;

    // Gentle drift parameters
    this.amplitude = (20 + Math.random() * 30) * layer.sizeMultiplier;
    this.frequency = 0.00008 + Math.random() * 0.00004;

    // Very slow upward drift
    this.speed =
      this.config.speed * (0.3 + Math.random() * 0.4) * layer.speedMultiplier;

    // Base opacity - very subtle
    this.baseOpacity = this.config.baseOpacity * layer.opacityMultiplier;

    this.time = 0;
  }

  update(deltaTime) {
    this.time += deltaTime;

    // Very gentle horizontal drift
    const swayX =
      Math.sin(this.time * this.frequency + this.phase) * this.amplitude;
    this.x += swayX * 0.0003 * deltaTime;

    // Slow upward float
    this.y -= this.speed * deltaTime * 0.003;

    // Gentle size breathing
    this.currentSize =
      this.size * (0.95 + Math.sin(this.time * 0.0003 + this.phaseSize) * 0.05);

    // Very slow opacity pulse
    const pulse = Math.sin(this.time * 0.0004 + this.phaseY) * 0.3;
    this.opacity = this.baseOpacity * (0.7 + pulse * 0.3);

    // Reset when off screen
    if (this.y < -this.size) {
      this.reset();
    }
  }

  draw(ctx) {
    // Use cached gradient canvas for performance
    const cache = getGradientCache();
    const diameter = this.currentSize * 2;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Draw the cached gradient scaled to current size
    ctx.drawImage(
      cache,
      this.x - this.currentSize,
      this.y - this.currentSize,
      diameter,
      diameter,
    );

    ctx.restore();
  }
}

/**
 * Ambient Light System with Parallax Depth
 */
export class ParticleSystem {
  constructor() {
    this.layers = {
      far: [],
      middle: [],
      front: [],
    };
    this.timePeriod = TIME_PERIOD.NOON;

    // Cached dimensions to avoid layout thrashing
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  /**
   * Initialize ambient light orbs
   */
  init(timePeriod) {
    this.timePeriod = timePeriod;

    // Clear existing
    this.layers = {
      far: [],
      middle: [],
      front: [],
    };

    const { LIGHT_ORBS } = CONFIG;

    // Base configuration for soft light orbs
    const baseConfig = {
      size: LIGHT_ORBS.SIZE,
      speed: LIGHT_ORBS.SPEED,
      color: "rgba(120, 140, 180, 1)",
      baseOpacity:
        timePeriod === TIME_PERIOD.NIGHT
          ? LIGHT_ORBS.NIGHT_OPACITY
          : LIGHT_ORBS.BASE_OPACITY,
    };

    // Total orb count
    const totalCount = LIGHT_ORBS.COUNT;

    // Create orbs for each depth layer
    for (const [layerName, layerConfig] of Object.entries(DEPTH_LAYERS)) {
      const count = Math.floor(totalCount * layerConfig.count);

      for (let i = 0; i < count; i++) {
        this.layers[layerName].push(
          new LightOrb(baseConfig, layerConfig, this),
        );
      }
    }
  }

  /**
   * Update all orbs
   */
  update(deltaTime) {
    for (const layer of Object.values(this.layers)) {
      for (const orb of layer) {
        orb.update(deltaTime);
      }
    }
  }

  /**
   * Draw all orbs (back to front)
   */
  draw(ctx) {
    const drawOrder = ["far", "middle", "front"];

    for (const layerName of drawOrder) {
      for (const orb of this.layers[layerName]) {
        orb.draw(ctx);
      }
    }
  }

  /**
   * Handle canvas resize
   * Adjusts existing particle positions to maintain visual continuity
   */
  resize() {
    const oldWidth = this.width;
    const oldHeight = this.height;

    // Update cached dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Adjust existing particle positions proportionally
    // This prevents visual discontinuity (particles jumping to new positions)
    for (const layer of Object.values(this.layers)) {
      for (const orb of layer) {
        // Scale positions based on new canvas dimensions
        orb.x = (orb.x / oldWidth) * this.width;
        orb.y = (orb.y / oldHeight) * this.height;
      }
    }
  }
}
