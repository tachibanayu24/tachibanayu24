/**
 * Background Animation System - Special Effects Module
 *
 * Contains fog/mist layers and firefly effects.
 */

import { TIME_PERIOD } from "./time.js";

/**
 * Simple Perlin-like noise for smooth organic movement
 */
class SimplexNoise {
  constructor() {
    this.perm = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = Math.floor(Math.random() * 256);
    }
  }

  noise2D(x, y) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.perm[this.perm[xi] + yi];
    const ab = this.perm[this.perm[xi] + yi + 1];
    const ba = this.perm[this.perm[xi + 1] + yi];
    const bb = this.perm[this.perm[xi + 1] + yi + 1];

    const x1 = this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u);
    const x2 = this.lerp(
      this.grad(ab, xf, yf - 1),
      this.grad(bb, xf - 1, yf - 1),
      u,
    );

    return this.lerp(x1, x2, v);
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  }
}

/**
 * Fog/Mist Layer - Creates ethereal, flowing mist
 * Active during MORNING and EVENING
 */
export class FogLayer {
  constructor(canvas) {
    this.canvas = canvas;
    this.noise = new SimplexNoise();
    this.time = 0;
    this.layers = [];
    this.isActive = false;
    this.init();
  }

  init() {
    // Create multiple fog layers for depth
    this.layers = [
      { scale: 0.002, speed: 0.00003, opacity: 0.08, yOffset: 0.6 },
      { scale: 0.003, speed: 0.00005, opacity: 0.05, yOffset: 0.4 },
      { scale: 0.001, speed: 0.00002, opacity: 0.06, yOffset: 0.8 },
    ];
  }

  /**
   * Update active state based on time period
   */
  setTimePeriod(timePeriod) {
    this.isActive =
      timePeriod === TIME_PERIOD.MORNING || timePeriod === TIME_PERIOD.EVENING;
  }

  update(deltaTime) {
    if (!this.isActive) return;
    this.time += deltaTime;
  }

  draw(ctx, palette) {
    if (!this.isActive || !palette) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Use accent color for fog tint
    const fogColor = palette.textMuted || "rgba(150, 150, 150, 1)";

    for (const layer of this.layers) {
      this.drawFogLayer(ctx, w, h, layer, fogColor);
    }
  }

  drawFogLayer(ctx, w, h, layer, baseColor) {
    const { scale, speed, opacity, yOffset } = layer;

    // Create horizontal fog bands
    const bandHeight = h * 0.4;
    const bandY = h * yOffset - bandHeight / 2;

    // Animate offset with noise
    const noiseOffset = this.noise.noise2D(this.time * speed, 0) * 50;

    // Create gradient for fog band
    const gradient = ctx.createLinearGradient(0, bandY, 0, bandY + bandHeight);

    // Parse base color to extract RGB
    const rgb = this.parseColor(baseColor);

    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.3, `rgba(${rgb}, ${opacity * 0.5})`);
    gradient.addColorStop(0.5, `rgba(${rgb}, ${opacity})`);
    gradient.addColorStop(0.7, `rgba(${rgb}, ${opacity * 0.5})`);
    gradient.addColorStop(1, "transparent");

    ctx.save();
    ctx.translate(noiseOffset, 0);
    ctx.fillStyle = gradient;
    ctx.fillRect(-100, bandY, w + 200, bandHeight);

    // Add subtle noise texture
    this.drawNoiseTexture(ctx, w, h, bandY, bandHeight, opacity * 0.3, rgb);

    ctx.restore();
  }

  drawNoiseTexture(ctx, w, h, bandY, bandHeight, opacity, rgb) {
    // Draw subtle noise patches for organic feel
    const patches = 8;
    for (let i = 0; i < patches; i++) {
      const px =
        (this.noise.noise2D(i * 0.5, this.time * 0.00002) + 1) * 0.5 * w;
      const py =
        bandY +
        (this.noise.noise2D(i * 0.7 + 100, this.time * 0.00003) + 1) *
          0.5 *
          bandHeight;
      const size =
        100 + this.noise.noise2D(i * 0.3, this.time * 0.00001) * 50 + 50;

      const patchGradient = ctx.createRadialGradient(px, py, 0, px, py, size);
      patchGradient.addColorStop(0, `rgba(${rgb}, ${opacity})`);
      patchGradient.addColorStop(0.5, `rgba(${rgb}, ${opacity * 0.3})`);
      patchGradient.addColorStop(1, "transparent");

      ctx.fillStyle = patchGradient;
      ctx.fillRect(px - size, py - size, size * 2, size * 2);
    }
  }

  parseColor(color) {
    // Extract RGB from various color formats
    if (color.startsWith("rgba")) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) return `${match[1]}, ${match[2]}, ${match[3]}`;
    }
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }
    return "200, 200, 200";
  }
}

/**
 * Firefly - Single firefly with organic movement and glow
 */
class Firefly {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;

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
      this.fireflies.push(new Firefly(this.canvas));
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
