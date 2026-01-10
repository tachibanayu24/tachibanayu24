/**
 * Background Animation System - Firefly Effect
 *
 * Fireflies with organic movement and blinking glow.
 * Active during NIGHT time period.
 */

import { TIME_PERIOD } from "../time.js";
import { CONFIG } from "../config.js";
import { BaseEffect } from "./base-effect.js";

/**
 * Single firefly with organic movement and glow
 */
class Firefly {
  constructor() {
    this.reset();
  }

  reset() {
    const { FIREFLY } = CONFIG.EFFECTS;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.x = Math.random() * w;
    this.y = Math.random() * h;

    // Very small size
    this.size =
      FIREFLY.SIZE.min + Math.random() * (FIREFLY.SIZE.max - FIREFLY.SIZE.min);

    // Random movement parameters
    this.vx = (Math.random() - 0.5) * FIREFLY.VELOCITY;
    this.vy = (Math.random() - 0.5) * FIREFLY.VELOCITY;

    // Glow parameters
    this.glowSize =
      FIREFLY.GLOW_SIZE.min +
      Math.random() * (FIREFLY.GLOW_SIZE.max - FIREFLY.GLOW_SIZE.min);
    this.glowPhase = Math.random() * Math.PI * 2;
    this.glowSpeed =
      FIREFLY.GLOW_SPEED.min +
      Math.random() * (FIREFLY.GLOW_SPEED.max - FIREFLY.GLOW_SPEED.min);

    // Blink parameters
    this.blinkPhase = Math.random() * Math.PI * 2;
    this.blinkSpeed =
      FIREFLY.BLINK_SPEED.min +
      Math.random() * (FIREFLY.BLINK_SPEED.max - FIREFLY.BLINK_SPEED.min);
    this.blinkDuration =
      FIREFLY.BLINK_DURATION.min +
      Math.random() * (FIREFLY.BLINK_DURATION.max - FIREFLY.BLINK_DURATION.min);

    // Movement variation
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderSpeed = FIREFLY.WANDER_SPEED;

    this.time = 0;
  }

  update(deltaTime) {
    this.time += deltaTime;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Organic wandering movement
    this.wanderAngle +=
      (Math.random() - 0.5) * this.wanderSpeed * deltaTime * 0.1;
    this.vx += Math.cos(this.wanderAngle) * 0.0001 * deltaTime;
    this.vy += Math.sin(this.wanderAngle) * 0.0001 * deltaTime;

    // Apply velocity with damping
    this.x += this.vx * deltaTime * 0.05;
    this.y += this.vy * deltaTime * 0.05;
    this.vx *= 0.99;
    this.vy *= 0.99;

    // Soft bounds - gently push back into view
    const margin = 50;
    if (this.x < margin) this.vx += 0.01;
    if (this.x > w - margin) this.vx -= 0.01;
    if (this.y < margin) this.vy += 0.01;
    if (this.y > h - margin) this.vy -= 0.01;
  }

  draw(ctx) {
    // Calculate blink state
    const blinkCycle = Math.sin(this.time * this.blinkSpeed + this.blinkPhase);
    const isOn = blinkCycle > 1 - this.blinkDuration * 2;

    if (!isOn) return;

    // Glow intensity varies even when "on"
    const glowIntensity =
      (blinkCycle - (1 - this.blinkDuration * 2)) / (this.blinkDuration * 2);
    const intensity = Math.max(0, Math.min(1, glowIntensity));

    // Soft pulsing when on
    const pulse =
      0.7 + Math.sin(this.time * this.glowSpeed + this.glowPhase) * 0.3;
    const finalIntensity = intensity * pulse;

    // Warm yellow-green glow (typical firefly color)
    const glowColor = `rgba(200, 230, 150, ${finalIntensity * 0.4})`;
    const coreColor = `rgba(255, 255, 200, ${finalIntensity * 0.9})`;

    // Draw outer glow
    const outerGlow = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.glowSize * finalIntensity,
    );
    outerGlow.addColorStop(0, glowColor);
    outerGlow.addColorStop(
      0.4,
      `rgba(180, 220, 130, ${finalIntensity * 0.15})`,
    );
    outerGlow.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.glowSize * finalIntensity, 0, Math.PI * 2);
    ctx.fillStyle = outerGlow;
    ctx.fill();

    // Draw bright core
    const coreGlow = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.size * 2,
    );
    coreGlow.addColorStop(0, coreColor);
    coreGlow.addColorStop(0.5, `rgba(230, 250, 180, ${finalIntensity * 0.5})`);
    coreGlow.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = coreGlow;
    ctx.fill();
  }
}

/**
 * Firefly System Effect
 * @extends BaseEffect
 */
export class FireflySystem extends BaseEffect {
  constructor() {
    super(TIME_PERIOD.NIGHT);
    /** @type {Firefly[]} */
    this.fireflies = [];
  }

  init() {
    this.fireflies = [];
    const { FIREFLY } = CONFIG.EFFECTS;
    for (let i = 0; i < FIREFLY.COUNT; i++) {
      this.fireflies.push(new Firefly());
    }
  }

  update(deltaTime) {
    if (!this.isActive) return;
    for (const firefly of this.fireflies) {
      firefly.update(deltaTime);
    }
  }

  draw(ctx) {
    if (!this.isActive) return;
    for (const firefly of this.fireflies) {
      firefly.draw(ctx);
    }
  }
}
