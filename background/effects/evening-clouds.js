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
    const { MOBILE_BREAKPOINT, MOBILE_MIN_OPACITY_FACTOR } = CONFIG.SCREEN;

    // Reduce opacity on narrow screens, but keep minimum visibility
    const rawFactor = w / MOBILE_BREAKPOINT;
    const screenFactor = Math.max(
      MOBILE_MIN_OPACITY_FACTOR,
      Math.min(1, rawFactor),
    );

    for (const ray of this.rays) {
      // More dynamic breathing effect
      const breathe =
        0.6 + Math.sin(this.time * ray.speed * 1.4 + ray.phase) * 0.4;
      const currentOpacity = ray.opacity * breathe * screenFactor;

      // More noticeable vertical drift
      const drift = Math.sin(this.time * ray.speed * 0.7 + ray.phase) * 18;
      const y = ray.y + drift;

      // Create horizontal gradient - light from right (sunset direction)
      const gradient = ctx.createLinearGradient(w, y, 0, y);

      // Richer sunset colors - deeper orange/pink for visibility
      gradient.addColorStop(0, `rgba(255, 170, 100, ${currentOpacity * 1.15})`);
      gradient.addColorStop(
        0.25,
        `rgba(255, 150, 110, ${currentOpacity * 0.85})`,
      );
      gradient.addColorStop(
        0.5,
        `rgba(245, 130, 120, ${currentOpacity * 0.55})`,
      );
      gradient.addColorStop(1, "transparent");

      // Draw the ray as a soft horizontal band
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y - ray.height / 2, w, ray.height);
    }
  }
}
