/**
 * Background Animation System - Morning Mist Effect
 *
 * Soft fog rising from the bottom, creating an ethereal morning atmosphere.
 * Active during MORNING time period.
 */

import { TIME_PERIOD } from "../time.js";
import { CONFIG } from "../config.js";
import { BaseEffect } from "./base-effect.js";

// Mist color constants
const MIST_WHITE = "250, 255, 220";
const MIST_CREAM = "245, 255, 210";

/**
 * @typedef {Object} Wisp
 * @property {number} x - X position
 * @property {number} baseY - Base Y position
 * @property {number} width - Wisp width
 * @property {number} height - Wisp height
 * @property {number} speed - Horizontal drift speed
 * @property {number} riseSpeed - Vertical rise speed
 * @property {number} opacity - Opacity
 * @property {number} phase - Animation phase offset
 * @property {number} driftPhase - Drift animation phase offset
 */

/**
 * Morning Mist Effect
 * @extends BaseEffect
 */
export class MorningMist extends BaseEffect {
  constructor() {
    super(TIME_PERIOD.MORNING);
    /** @type {Wisp[]} */
    this.wisps = [];
  }

  init() {
    this.wisps = [];
    const { MIST } = CONFIG.EFFECTS;
    const count = MIST.COUNT;
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < count; i++) {
      this.wisps.push({
        x: Math.random() * w,
        baseY: h * (0.5 + Math.random() * 0.5),
        width:
          MIST.WIDTH.min + Math.random() * (MIST.WIDTH.max - MIST.WIDTH.min),
        height:
          MIST.HEIGHT.min + Math.random() * (MIST.HEIGHT.max - MIST.HEIGHT.min),
        speed:
          MIST.SPEED.min + Math.random() * (MIST.SPEED.max - MIST.SPEED.min),
        riseSpeed:
          MIST.RISE_SPEED.min +
          Math.random() * (MIST.RISE_SPEED.max - MIST.RISE_SPEED.min),
        opacity:
          MIST.OPACITY.min +
          Math.random() * (MIST.OPACITY.max - MIST.OPACITY.min),
        phase: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(deltaTime) {
    if (!this.isActive) return;
    this.time += deltaTime;
    const h = window.innerHeight;
    const w = window.innerWidth;

    for (const wisp of this.wisps) {
      // Slow upward drift
      wisp.baseY -= wisp.riseSpeed * deltaTime * 0.1;

      // Reset when too high
      if (wisp.baseY < -wisp.height) {
        wisp.baseY = h + wisp.height * 0.5;
        wisp.x = Math.random() * w;
      }
    }
  }

  draw(ctx, palette) {
    if (!this.isActive || !palette) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    for (const wisp of this.wisps) {
      // Organic horizontal drift
      const drift = Math.sin(this.time * wisp.speed + wisp.driftPhase) * 30;
      const verticalWobble =
        Math.sin(this.time * wisp.speed * 0.7 + wisp.phase) * 15;

      const x = wisp.x + drift;
      const y = wisp.baseY + verticalWobble;

      // Main wisp gradient
      const gradient = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        wisp.width * 0.8,
      );
      gradient.addColorStop(0, `rgba(${MIST_WHITE}, ${wisp.opacity})`);
      gradient.addColorStop(0.3, `rgba(${MIST_CREAM}, ${wisp.opacity * 0.6})`);
      gradient.addColorStop(0.6, `rgba(${MIST_WHITE}, ${wisp.opacity * 0.3})`);
      gradient.addColorStop(1, "transparent");

      ctx.save();
      // Stretch horizontally for wispy look
      ctx.scale(1.5, 0.6);
      ctx.beginPath();
      ctx.arc(x / 1.5, y / 0.6, wisp.width * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    }

    // Base fog layer
    const baseGradient = ctx.createLinearGradient(0, h * 0.3, 0, h);
    baseGradient.addColorStop(0, "transparent");
    baseGradient.addColorStop(0.2, `rgba(${MIST_WHITE}, 0.1)`);
    baseGradient.addColorStop(0.45, `rgba(${MIST_CREAM}, 0.2)`);
    baseGradient.addColorStop(0.7, `rgba(${MIST_WHITE}, 0.25)`);
    baseGradient.addColorStop(1, `rgba(${MIST_CREAM}, 0.3)`);
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, h * 0.3, w, h * 0.7);
  }
}
