/**
 * Background Animation System - Morning Mist Effect
 *
 * Soft fog rising from the bottom, creating an ethereal morning atmosphere.
 * Active during MORNING time period.
 */

import { TIME_PERIOD } from "../time.js";
import { CONFIG } from "../config.js";
import { BaseEffect } from "./base-effect.js";

// Mist color constants - slightly more golden for morning sun
const MIST_WHITE = "255, 252, 220";
const MIST_CREAM = "255, 248, 200";
const MIST_GOLD = "255, 240, 180";

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

    // Use cached dimensions from base class
    for (let i = 0; i < count; i++) {
      this.wisps.push({
        x: Math.random() * this.width,
        baseY: this.height * (0.5 + Math.random() * 0.5),
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

    // Use cached dimensions from base class
    for (const wisp of this.wisps) {
      // Slow upward drift
      wisp.baseY -= wisp.riseSpeed * deltaTime * 0.1;

      // Reset when too high
      if (wisp.baseY < -wisp.height) {
        wisp.baseY = this.height + wisp.height * 0.5;
        wisp.x = Math.random() * this.width;
      }
    }
  }

  draw(ctx, palette) {
    if (!this.isActive || !palette) return;

    // Use cached dimensions from base class
    const w = this.width;
    const h = this.height;

    for (const wisp of this.wisps) {
      // More dynamic horizontal drift
      const drift =
        Math.sin(this.time * wisp.speed * 1.3 + wisp.driftPhase) * 45;
      const verticalWobble =
        Math.sin(this.time * wisp.speed * 0.9 + wisp.phase) * 20;

      const x = wisp.x + drift;
      const y = wisp.baseY + verticalWobble;

      // Main wisp gradient with golden tint
      const gradient = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        wisp.width * 0.8,
      );
      gradient.addColorStop(0, `rgba(${MIST_GOLD}, ${wisp.opacity * 1.1})`);
      gradient.addColorStop(0.25, `rgba(${MIST_CREAM}, ${wisp.opacity * 0.8})`);
      gradient.addColorStop(0.5, `rgba(${MIST_WHITE}, ${wisp.opacity * 0.4})`);
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

    // Base fog layer with golden glow
    const baseGradient = ctx.createLinearGradient(0, h * 0.3, 0, h);
    baseGradient.addColorStop(0, "transparent");
    baseGradient.addColorStop(0.15, `rgba(${MIST_GOLD}, 0.12)`);
    baseGradient.addColorStop(0.35, `rgba(${MIST_CREAM}, 0.22)`);
    baseGradient.addColorStop(0.6, `rgba(${MIST_WHITE}, 0.28)`);
    baseGradient.addColorStop(1, `rgba(${MIST_CREAM}, 0.35)`);
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, h * 0.3, w, h * 0.7);
  }
}
