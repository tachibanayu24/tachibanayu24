/**
 * Background Animation System - Special Effects Module
 *
 * Time-specific visual effects:
 * - MORNING: Rising mist from bottom
 * - NOON: God rays + floating dust particles
 * - EVENING: Drifting sunset clouds
 * - NIGHT: Fireflies
 */

import { TIME_PERIOD } from "./time.js";

// ============================================
// MORNING: Rising Mist Effect
// ============================================

// Mist color constants
const MIST_WHITE = "250, 255, 220";
const MIST_CREAM = "245, 255, 210";

/**
 * Morning Mist - Soft fog rising from the bottom
 * Creates an ethereal, peaceful morning atmosphere
 */
export class MorningMist {
  constructor(canvas) {
    this.canvas = canvas;
    this.time = 0;
    this.isActive = false;
    this.wisps = [];
    this.init();
  }

  init() {
    this.wisps = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      this.wisps.push({
        x: Math.random() * window.innerWidth,
        baseY: window.innerHeight * (0.5 + Math.random() * 0.5),
        width: 300 + Math.random() * 400,
        height: 150 + Math.random() * 200,
        speed: 0.0004 + Math.random() * 0.0003,
        riseSpeed: 0.06 + Math.random() * 0.04,
        opacity: 0.3 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  setTimePeriod(timePeriod) {
    const wasActive = this.isActive;
    this.isActive = timePeriod === TIME_PERIOD.MORNING;
    if (this.isActive && !wasActive) {
      this.init();
    }
  }

  update(deltaTime) {
    if (!this.isActive) return;
    this.time += deltaTime;

    for (const wisp of this.wisps) {
      // Slow upward drift
      wisp.baseY -= wisp.riseSpeed * deltaTime * 0.1;

      // Reset when too high
      if (wisp.baseY < -wisp.height) {
        wisp.baseY = window.innerHeight + wisp.height * 0.5;
        wisp.x = Math.random() * window.innerWidth;
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

      // Main wisp gradient - soft white
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

    // Base fog layer - clean, soft white blanket
    const baseGradient = ctx.createLinearGradient(0, h * 0.3, 0, h);
    baseGradient.addColorStop(0, "transparent");
    baseGradient.addColorStop(0.2, `rgba(${MIST_WHITE}, 0.1)`);
    baseGradient.addColorStop(0.45, `rgba(${MIST_CREAM}, 0.2)`);
    baseGradient.addColorStop(0.7, `rgba(${MIST_WHITE}, 0.25)`);
    baseGradient.addColorStop(1, `rgba(${MIST_CREAM}, 0.3)`);
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, h * 0.3, w, h * 0.7);
  }

  resize() {
    if (this.isActive) {
      this.init();
    }
  }
}

// ============================================
// NOON: God Rays + Dust Particles
// ============================================

/**
 * God Rays - Light beams streaming from above
 */
export class GodRays {
  constructor(canvas) {
    this.canvas = canvas;
    this.time = 0;
    this.isActive = false;
    this.rays = [];
    this.init();
  }

  init() {
    this.rays = [];
    // Reduce count on narrow screens
    const baseCount = 7;
    const screenFactor = Math.min(1, window.innerWidth / 800);
    const count = Math.max(2, Math.floor(baseCount * screenFactor));

    for (let i = 0; i < count; i++) {
      this.rays.push({
        x: window.innerWidth * (0.1 + (i / count) * 0.8),
        width: 150 + Math.random() * 250,
        angle: -20 + Math.random() * 40, // degrees from vertical
        opacity: 0.1 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0003 + Math.random() * 0.0002,
      });
    }
  }

  setTimePeriod(timePeriod) {
    const wasActive = this.isActive;
    this.isActive = timePeriod === TIME_PERIOD.NOON;
    if (this.isActive && !wasActive) {
      this.init();
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

    // Reduce opacity on narrow screens (mobile)
    const screenFactor = Math.min(1, w / 800);

    // Warm sunlight color - soft pale yellow
    const lightColor = "255, 248, 200";

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
      rayGradient.addColorStop(0, `rgba(${lightColor}, ${currentOpacity})`);
      rayGradient.addColorStop(
        0.3,
        `rgba(${lightColor}, ${currentOpacity * 0.7})`,
      );
      rayGradient.addColorStop(
        0.6,
        `rgba(${lightColor}, ${currentOpacity * 0.3})`,
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

  resize() {
    if (this.isActive) {
      this.init();
    }
  }
}

/**
 * Light Streak - A single ray of light falling from above
 * Like sunlight streaming through trees or windows
 */
class LightStreak {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.x = Math.random() * w;
    this.y = initial ? Math.random() * h : -50;

    // Vertical streak dimensions
    this.length = 60 + Math.random() * 120;
    this.width = 1 + Math.random() * 2;

    // Falling speed
    this.speed = 0.08 + Math.random() * 0.06;

    // Slight angle (mostly vertical)
    this.angle = (Math.random() - 0.5) * 0.15;

    // Opacity and fade
    this.opacity = 0.12 + Math.random() * 0.1;
    this.fadePhase = Math.random() * Math.PI * 2;
    this.fadeSpeed = 0.001 + Math.random() * 0.001;

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
    // Reduce opacity on narrow screens (mobile)
    const screenFactor = Math.min(1, window.innerWidth / 800);

    // Gentle fade in/out
    const fade =
      0.6 + Math.sin(this.time * this.fadeSpeed + this.fadePhase) * 0.4;
    const currentOpacity = this.opacity * fade * screenFactor;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Draw the light streak as a soft gradient line - soft pale yellow
    const gradient = ctx.createLinearGradient(
      0,
      -this.length / 2,
      0,
      this.length / 2,
    );
    gradient.addColorStop(0, `rgba(255, 252, 220, 0)`);
    gradient.addColorStop(0.2, `rgba(255, 250, 200, ${currentOpacity * 0.5})`);
    gradient.addColorStop(0.5, `rgba(255, 250, 200, ${currentOpacity})`);
    gradient.addColorStop(0.8, `rgba(255, 250, 200, ${currentOpacity * 0.5})`);
    gradient.addColorStop(1, `rgba(255, 252, 220, 0)`);

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

    // Draw brighter center - soft pale core
    const centerGradient = ctx.createLinearGradient(
      0,
      -this.length / 2,
      0,
      this.length / 2,
    );
    centerGradient.addColorStop(0, `rgba(255, 255, 240, 0)`);
    centerGradient.addColorStop(
      0.3,
      `rgba(255, 253, 230, ${currentOpacity * 0.6})`,
    );
    centerGradient.addColorStop(
      0.5,
      `rgba(255, 253, 230, ${currentOpacity * 0.8})`,
    );
    centerGradient.addColorStop(
      0.7,
      `rgba(255, 253, 230, ${currentOpacity * 0.6})`,
    );
    centerGradient.addColorStop(1, `rgba(255, 255, 240, 0)`);

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

export class DustParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.streaks = [];
    this.isActive = false;
  }

  init() {
    this.streaks = [];
    // Reduce count on narrow screens
    const baseCount = 25;
    const screenFactor = Math.min(1, window.innerWidth / 800);
    const count = Math.max(5, Math.floor(baseCount * screenFactor));

    for (let i = 0; i < count; i++) {
      this.streaks.push(new LightStreak());
    }
  }

  setTimePeriod(timePeriod) {
    const wasActive = this.isActive;
    this.isActive = timePeriod === TIME_PERIOD.NOON;
    if (this.isActive && !wasActive) {
      this.init();
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

  resize() {
    if (this.isActive) {
      this.init();
    }
  }
}

// ============================================
// EVENING: Horizontal Light Rays (Sunset Glow)
// ============================================

/**
 * Evening Light Rays - Horizontal light beams from setting sun
 * Creates a warm, golden hour atmosphere
 */
export class EveningClouds {
  constructor(canvas) {
    this.canvas = canvas;
    this.time = 0;
    this.isActive = false;
    this.rays = [];
    this.init();
  }

  init() {
    this.rays = [];
    const h = window.innerHeight;

    // Create horizontal rays at different heights
    const count = 5;
    for (let i = 0; i < count; i++) {
      this.rays.push({
        y: h * (0.1 + (i / count) * 0.6), // Spread across upper portion
        height: 40 + Math.random() * 80,
        opacity: 0.2 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.0008,
      });
    }
  }

  setTimePeriod(timePeriod) {
    const wasActive = this.isActive;
    this.isActive = timePeriod === TIME_PERIOD.EVENING;
    if (this.isActive && !wasActive) {
      this.init();
    }
  }

  update(deltaTime) {
    if (!this.isActive) return;
    this.time += deltaTime;
  }

  draw(ctx, palette) {
    if (!this.isActive || !palette) return;

    const w = window.innerWidth;

    // Reduce opacity on narrow screens
    const screenFactor = Math.min(1, w / 800);

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

  resize() {
    if (this.isActive) {
      this.init();
    }
  }
}

/**
 * Firefly - Single firefly with organic movement and glow
 */
class Firefly {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;

    // Very small size
    this.size = 2 + Math.random() * 3;

    // Random movement parameters
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;

    // Glow parameters
    this.glowSize = 15 + Math.random() * 20;
    this.glowPhase = Math.random() * Math.PI * 2;
    this.glowSpeed = 0.002 + Math.random() * 0.002;

    // Blink parameters - fireflies have distinct on/off cycles
    this.blinkPhase = Math.random() * Math.PI * 2;
    this.blinkSpeed = 0.001 + Math.random() * 0.001;
    this.blinkDuration = 0.3 + Math.random() * 0.2; // How long the "on" phase is

    // Movement variation
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderSpeed = 0.002;

    this.time = 0;
  }

  update(deltaTime) {
    this.time += deltaTime;

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
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (this.x < margin) this.vx += 0.01;
    if (this.x > w - margin) this.vx -= 0.01;
    if (this.y < margin) this.vy += 0.01;
    if (this.y > h - margin) this.vy -= 0.01;
  }

  draw(ctx) {
    // Calculate blink state (fireflies have distinct on/off)
    const blinkCycle = Math.sin(this.time * this.blinkSpeed + this.blinkPhase);
    const isOn = blinkCycle > 1 - this.blinkDuration * 2;

    if (!isOn) return; // Don't draw when "off"

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
 * Firefly System - Manages multiple fireflies
 * Only active during NIGHT
 */
export class FireflySystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.fireflies = [];
    this.isActive = false;
    this.count = 12;
  }

  init() {
    this.fireflies = [];
    for (let i = 0; i < this.count; i++) {
      this.fireflies.push(new Firefly());
    }
  }

  /**
   * Update active state based on time period
   */
  setTimePeriod(timePeriod) {
    const wasActive = this.isActive;
    this.isActive = timePeriod === TIME_PERIOD.NIGHT;

    // Initialize fireflies when becoming active
    if (this.isActive && !wasActive) {
      this.init();
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

  resize() {
    if (this.isActive) {
      this.init();
    }
  }
}
