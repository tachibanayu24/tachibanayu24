/**
 * Background Animation System - God Rays Effect
 *
 * Light beams streaming from above, creating a warm noon atmosphere.
 * Active during NOON time period.
 */

import { TIME_PERIOD } from "../time.js";
import { CONFIG } from "../config.js";
import { BaseEffect } from "./base-effect.js";

// Warm sunlight color
const LIGHT_COLOR = "255, 248, 200";

/**
 * @typedef {Object} Ray
 * @property {number} x - X position
 * @property {number} width - Ray width
 * @property {number} angle - Angle from vertical in degrees
 * @property {number} opacity - Base opacity
 * @property {number} phase - Animation phase offset
 * @property {number} speed - Animation speed
 */

/**
 * God Rays Effect
 * @extends BaseEffect
 */
export class GodRays extends BaseEffect {
  constructor() {
    super(TIME_PERIOD.NOON);
    /** @type {Ray[]} */
    this.rays = [];
  }

  init() {
    this.rays = [];
    const { GOD_RAYS } = CONFIG.EFFECTS;
    const { MOBILE_BREAKPOINT } = CONFIG.SCREEN;
    const w = window.innerWidth;

    // Reduce count on narrow screens
    const screenFactor = Math.min(1, w / MOBILE_BREAKPOINT);
    const count = Math.max(2, Math.floor(GOD_RAYS.BASE_COUNT * screenFactor));

    for (let i = 0; i < count; i++) {
      this.rays.push({
        x: w * (0.1 + (i / count) * 0.8),
        width:
          GOD_RAYS.WIDTH.min +
          Math.random() * (GOD_RAYS.WIDTH.max - GOD_RAYS.WIDTH.min),
        angle:
          GOD_RAYS.ANGLE.min +
          Math.random() * (GOD_RAYS.ANGLE.max - GOD_RAYS.ANGLE.min),
        opacity:
          GOD_RAYS.OPACITY.min +
          Math.random() * (GOD_RAYS.OPACITY.max - GOD_RAYS.OPACITY.min),
        phase: Math.random() * Math.PI * 2,
        speed:
          GOD_RAYS.SPEED.min +
          Math.random() * (GOD_RAYS.SPEED.max - GOD_RAYS.SPEED.min),
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
    const h = window.innerHeight;
    const { MOBILE_BREAKPOINT } = CONFIG.SCREEN;

    // Reduce opacity on narrow screens
    const screenFactor = Math.min(1, w / MOBILE_BREAKPOINT);

    for (const ray of this.rays) {
      // Subtle opacity breathing
      const breathe = 0.7 + Math.sin(this.time * ray.speed + ray.phase) * 0.3;
      const currentOpacity = ray.opacity * breathe * screenFactor;

      // Subtle position drift
      const drift = Math.sin(this.time * ray.speed * 0.5 + ray.phase) * 20;

      ctx.save();

      // Position at top of screen
      ctx.translate(ray.x + drift, -50);
      ctx.rotate((ray.angle * Math.PI) / 180);

      // Create ray gradient (fades from top to bottom)
      const rayGradient = ctx.createLinearGradient(0, 0, 0, h * 1.2);
      rayGradient.addColorStop(0, `rgba(${LIGHT_COLOR}, ${currentOpacity})`);
      rayGradient.addColorStop(
        0.3,
        `rgba(${LIGHT_COLOR}, ${currentOpacity * 0.7})`,
      );
      rayGradient.addColorStop(
        0.6,
        `rgba(${LIGHT_COLOR}, ${currentOpacity * 0.3})`,
      );
      rayGradient.addColorStop(1, "transparent");

      // Draw tapered ray shape
      ctx.beginPath();
      ctx.moveTo(-ray.width * 0.3, 0);
      ctx.lineTo(ray.width * 0.3, 0);
      ctx.lineTo(ray.width * 0.8, h * 1.2);
      ctx.lineTo(-ray.width * 0.8, h * 1.2);
      ctx.closePath();

      ctx.fillStyle = rayGradient;
      ctx.fill();

      ctx.restore();
    }
  }
}
