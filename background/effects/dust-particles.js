/**
 * Background Animation System - Dust Particles Effect
 *
 * Light streaks falling from above, like sunlight through trees.
 * Active during NOON time period.
 */

import { TIME_PERIOD } from "../time.js";
import { CONFIG } from "../config.js";
import { BaseEffect } from "./base-effect.js";

/**
 * Single light streak falling from above
 */
class LightStreak {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    const { DUST } = CONFIG.EFFECTS;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.x = Math.random() * w;
    this.y = initial ? Math.random() * h : -50;

    // Vertical streak dimensions
    this.length =
      DUST.LENGTH.min + Math.random() * (DUST.LENGTH.max - DUST.LENGTH.min);
    this.width =
      DUST.WIDTH.min + Math.random() * (DUST.WIDTH.max - DUST.WIDTH.min);

    // Falling speed
    this.speed =
      DUST.SPEED.min + Math.random() * (DUST.SPEED.max - DUST.SPEED.min);

    // Slight angle (mostly vertical)
    this.angle = (Math.random() - 0.5) * DUST.ANGLE_VARIANCE;

    // Opacity and fade
    this.opacity =
      DUST.OPACITY.min + Math.random() * (DUST.OPACITY.max - DUST.OPACITY.min);
    this.fadePhase = Math.random() * Math.PI * 2;
    this.fadeSpeed =
      DUST.FADE_SPEED.min +
      Math.random() * (DUST.FADE_SPEED.max - DUST.FADE_SPEED.min);

    this.time = 0;
  }

  update(deltaTime) {
    this.time += deltaTime;
    this.y += this.speed * deltaTime;
    this.x += this.angle * this.speed * deltaTime;

    // Reset when below screen
    if (this.y > window.innerHeight + this.length) {
      this.reset();
    }
  }

  draw(ctx) {
    const { MOBILE_BREAKPOINT, MOBILE_MIN_OPACITY_FACTOR } = CONFIG.SCREEN;
    const w = window.innerWidth;

    // Reduce opacity on narrow screens, but keep minimum visibility
    const rawFactor = w / MOBILE_BREAKPOINT;
    const screenFactor = Math.max(
      MOBILE_MIN_OPACITY_FACTOR,
      Math.min(1, rawFactor),
    );

    // Gentle fade in/out
    const fade =
      0.6 + Math.sin(this.time * this.fadeSpeed + this.fadePhase) * 0.4;
    const currentOpacity = this.opacity * fade * screenFactor;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Draw the light streak with golden tint for visibility
    const gradient = ctx.createLinearGradient(
      0,
      -this.length / 2,
      0,
      this.length / 2,
    );
    gradient.addColorStop(0, `rgba(255, 245, 200, 0)`);
    gradient.addColorStop(0.2, `rgba(255, 235, 180, ${currentOpacity * 0.6})`);
    gradient.addColorStop(0.5, `rgba(255, 230, 170, ${currentOpacity})`);
    gradient.addColorStop(0.8, `rgba(255, 235, 180, ${currentOpacity * 0.6})`);
    gradient.addColorStop(1, `rgba(255, 245, 200, 0)`);

    // Draw soft glow around streak
    ctx.beginPath();
    ctx.roundRect(
      -this.width * 3,
      -this.length / 2,
      this.width * 6,
      this.length,
      this.width * 2,
    );
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw brighter golden center
    const centerGradient = ctx.createLinearGradient(
      0,
      -this.length / 2,
      0,
      this.length / 2,
    );
    centerGradient.addColorStop(0, `rgba(255, 250, 220, 0)`);
    centerGradient.addColorStop(
      0.3,
      `rgba(255, 240, 200, ${currentOpacity * 0.7})`,
    );
    centerGradient.addColorStop(
      0.5,
      `rgba(255, 235, 190, ${currentOpacity * 0.9})`,
    );
    centerGradient.addColorStop(
      0.7,
      `rgba(255, 240, 200, ${currentOpacity * 0.7})`,
    );
    centerGradient.addColorStop(1, `rgba(255, 250, 220, 0)`);

    ctx.beginPath();
    ctx.roundRect(
      -this.width,
      -this.length / 2,
      this.width * 2,
      this.length,
      this.width,
    );
    ctx.fillStyle = centerGradient;
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Dust Particles (Light Streaks) Effect
 * @extends BaseEffect
 */
export class DustParticles extends BaseEffect {
  constructor() {
    super(TIME_PERIOD.NOON);
    /** @type {LightStreak[]} */
    this.streaks = [];
  }

  init() {
    this.streaks = [];
    const { DUST } = CONFIG.EFFECTS;
    const { MOBILE_BREAKPOINT } = CONFIG.SCREEN;
    const w = window.innerWidth;

    // Reduce count on narrow screens
    const screenFactor = Math.min(1, w / MOBILE_BREAKPOINT);
    const count = Math.max(5, Math.floor(DUST.BASE_COUNT * screenFactor));

    for (let i = 0; i < count; i++) {
      this.streaks.push(new LightStreak());
    }
  }

  update(deltaTime) {
    if (!this.isActive) return;
    for (const streak of this.streaks) {
      streak.update(deltaTime);
    }
  }

  draw(ctx) {
    if (!this.isActive) return;
    for (const streak of this.streaks) {
      streak.draw(ctx);
    }
  }
}
