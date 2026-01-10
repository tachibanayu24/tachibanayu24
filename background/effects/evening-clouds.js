/**
 * Background Animation System - Evening Clouds Effect
 *
 * Horizontal light rays from the setting sun, creating a warm golden hour.
 * Active during EVENING time period.
 */

import { TIME_PERIOD } from "../time.js";
import { CONFIG } from "../config.js";
import { BaseEffect } from "./base-effect.js";

/**
 * @typedef {Object} EveningRay
 * @property {number} y - Y position
 * @property {number} height - Ray height
 * @property {number} opacity - Base opacity
 * @property {number} phase - Animation phase offset
 * @property {number} speed - Animation speed
 */

/**
 * Evening Clouds (Horizontal Light Rays) Effect
 * @extends BaseEffect
 */
export class EveningClouds extends BaseEffect {
  constructor() {
    super(TIME_PERIOD.EVENING);
    /** @type {EveningRay[]} */
    this.rays = [];
  }

  init() {
    this.rays = [];
    const { EVENING_RAYS } = CONFIG.EFFECTS;
    const h = window.innerHeight;

    const count = EVENING_RAYS.COUNT;
    for (let i = 0; i < count; i++) {
      this.rays.push({
        y: h * (0.1 + (i / count) * 0.6),
        height:
          EVENING_RAYS.HEIGHT.min +
          Math.random() * (EVENING_RAYS.HEIGHT.max - EVENING_RAYS.HEIGHT.min),
        opacity:
          EVENING_RAYS.OPACITY.min +
          Math.random() * (EVENING_RAYS.OPACITY.max - EVENING_RAYS.OPACITY.min),
        phase: Math.random() * Math.PI * 2,
        speed:
          EVENING_RAYS.SPEED.min +
          Math.random() * (EVENING_RAYS.SPEED.max - EVENING_RAYS.SPEED.min),
      });
    }
  }

  update(deltaTime) {
    if (!this.isActive) return;
    this.time += deltaTime;
  }

  draw(ctx, palette) {
    if (!this.isActive || !palette) return;

    const w = window.innerWidth;
    const { MOBILE_BREAKPOINT } = CONFIG.SCREEN;

    // Reduce opacity on narrow screens
    const screenFactor = Math.min(1, w / MOBILE_BREAKPOINT);

    for (const ray of this.rays) {
      // Gentle breathing effect
      const breathe = 0.7 + Math.sin(this.time * ray.speed + ray.phase) * 0.3;
      const currentOpacity = ray.opacity * breathe * screenFactor;

      // Slight vertical drift
      const drift = Math.sin(this.time * ray.speed * 0.5 + ray.phase) * 10;
      const y = ray.y + drift;

      // Create horizontal gradient - light from right (sunset direction)
      const gradient = ctx.createLinearGradient(w, y, 0, y);

      // Warm sunset colors - orange/pink
      gradient.addColorStop(0, `rgba(255, 180, 120, ${currentOpacity})`);
      gradient.addColorStop(
        0.3,
        `rgba(255, 160, 130, ${currentOpacity * 0.7})`,
      );
      gradient.addColorStop(
        0.6,
        `rgba(240, 140, 130, ${currentOpacity * 0.4})`,
      );
      gradient.addColorStop(1, "transparent");

      // Draw the ray as a soft horizontal band
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y - ray.height / 2, w, ray.height);
    }
  }
}
