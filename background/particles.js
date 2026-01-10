/**
 * Background Animation System - Particles Module
 *
 * Creates soft, bokeh-like ambient light effects with parallax depth.
 * Designed for a modern, artistic atmosphere rather than distinct particles.
 */

import { CONFIG } from "./config.js";
import { TIME_PERIOD } from "./time.js";
import { SEASON } from "./season.js";

/**
 * Depth layer configuration for parallax
 * Fewer, larger, softer elements for artistic effect
 */
const DEPTH_LAYERS = {
  // Far background - very large, very subtle
  far: {
    depth: 0,
    sizeMultiplier: 0.6,
    speedMultiplier: 0.2,
    opacityMultiplier: 0.5,
    count: 0.35,
  },
  // Middle layer
  middle: {
    depth: 1,
    sizeMultiplier: 1.0,
    speedMultiplier: 0.5,
    opacityMultiplier: 0.7,
    count: 0.4,
  },
  // Front/close - largest, most visible
  front: {
    depth: 2,
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
  constructor(canvas, config, depthLayer, timePeriod) {
    this.canvas = canvas;
    this.config = config;
    this.depthLayer = depthLayer;
    this.timePeriod = timePeriod;
    this.reset(true);
  }

  reset(initial = false) {
    const { min, max } = this.config.size;
    const layer = this.depthLayer;

    // Large, soft orbs
    const baseSize = min + Math.random() * (max - min);
    this.size = baseSize * layer.sizeMultiplier;

    // Position - spread across canvas with some margin
    this.x = Math.random() * this.canvas.width;
    this.y = initial
      ? Math.random() * this.canvas.height
      : this.canvas.height + this.size * 0.5;

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
    // Create ultra-soft radial gradient (bokeh effect)
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.currentSize,
    );

    // Extract base color and create gradient stops
    const baseColor = this.config.color;
    const opacity = this.opacity;

    // Soft falloff - visible but not harsh
    gradient.addColorStop(0, this.adjustOpacity(baseColor, opacity));
    gradient.addColorStop(0.15, this.adjustOpacity(baseColor, opacity * 0.7));
    gradient.addColorStop(0.35, this.adjustOpacity(baseColor, opacity * 0.4));
    gradient.addColorStop(0.55, this.adjustOpacity(baseColor, opacity * 0.15));
    gradient.addColorStop(0.75, this.adjustOpacity(baseColor, opacity * 0.05));
    gradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  /**
   * Adjust opacity of rgba color string
   */
  adjustOpacity(color, newOpacity) {
    return color.replace(/[\d.]+\)$/, `${Math.max(0, newOpacity)})`);
  }
}

/**
 * Ambient Light System with Parallax Depth
 */
export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.layers = {
      far: [],
      middle: [],
      front: [],
    };
    this.timePeriod = TIME_PERIOD.NOON;
    this.season = SEASON.SUMMER;
  }

  /**
   * Initialize ambient light orbs
   */
  init(timePeriod, season) {
    this.timePeriod = timePeriod;
    this.season = season;

    // Clear existing
    this.layers = {
      far: [],
      middle: [],
      front: [],
    };

    // Base configuration for soft light orbs
    const baseConfig = {
      size: { min: 60, max: 140 },
      speed: 0.08,
      color: "rgba(120, 140, 180, 1)",
      baseOpacity: 0.15,
    };

    // Adjust for night
    if (timePeriod === TIME_PERIOD.NIGHT) {
      baseConfig.baseOpacity = 0.1;
    }

    // Total orb count
    const totalCount = 22;

    // Create orbs for each depth layer
    for (const [layerName, layerConfig] of Object.entries(DEPTH_LAYERS)) {
      const count = Math.floor(totalCount * layerConfig.count);

      for (let i = 0; i < count; i++) {
        this.layers[layerName].push(
          new LightOrb(this.canvas, baseConfig, layerConfig, timePeriod),
        );
      }
    }

    // Add season-specific accent orbs
    const seasonAccent = CONFIG.SEASON_ACCENTS[season];
    if (seasonAccent) {
      const accentConfig = {
        ...baseConfig,
        color: seasonAccent,
        size: { min: 70, max: 160 },
        baseOpacity: 0.12,
      };

      // Add accent orbs to middle and front layers
      const accentCount = 6;
      const accentLayers = ["middle", "front"];

      for (let i = 0; i < accentCount; i++) {
        const layerName = accentLayers[i % accentLayers.length];
        this.layers[layerName].push(
          new LightOrb(
            this.canvas,
            accentConfig,
            DEPTH_LAYERS[layerName],
            timePeriod,
          ),
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
   */
  resize() {
    this.init(this.timePeriod, this.season);
  }
}
