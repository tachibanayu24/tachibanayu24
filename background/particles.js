/**
 * Background Animation System - Particles Module
 *
 * Creates and manages particle systems for different weather conditions.
 * Supports floating particles, falling particles (rain/snow), and organic blobs.
 */

import { CONFIG } from "./config.js";
import { WEATHER_TYPE } from "./weather.js";
import { TIME_PERIOD } from "./time.js";
import { SEASON, getSeasonCharacteristics } from "./season.js";

/**
 * Base Particle class
 */
class Particle {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.reset(true);
  }

  reset(initial = false) {
    const { min, max } = this.config.size;
    this.size = min + Math.random() * (max - min);
    this.x = Math.random() * this.canvas.width;
    this.y = initial ? Math.random() * this.canvas.height : -this.size;
    this.opacity = 0.3 + Math.random() * 0.5;
    this.speed = this.config.speed * (0.5 + Math.random() * 0.5);
  }

  update(deltaTime) {
    // Override in subclasses
  }

  draw(ctx) {
    // Override in subclasses
  }

  isOffScreen() {
    return (
      this.y > this.canvas.height + this.size ||
      this.x < -this.size ||
      this.x > this.canvas.width + this.size
    );
  }
}

/**
 * Floating particle - gently drifts upward with smooth movement
 */
class FloatingParticle extends Particle {
  constructor(canvas, config, timePeriod) {
    super(canvas, config);
    this.timePeriod = timePeriod;
    this.phase = Math.random() * Math.PI * 2;
    this.phaseY = Math.random() * Math.PI * 2;
    this.amplitude = 15 + Math.random() * 20;
    this.frequency = 0.0003 + Math.random() * 0.0002;
    this.time = 0;
  }

  reset(initial = false) {
    super.reset(initial);
    this.phase = Math.random() * Math.PI * 2;
    this.phaseY = Math.random() * Math.PI * 2;
    this.time = 0;
  }

  update(deltaTime) {
    this.time += deltaTime;

    // Smooth sine-based horizontal sway
    const swayX =
      Math.sin(this.time * this.frequency + this.phase) * this.amplitude;
    this.x += swayX * 0.001 * deltaTime;

    // Gentle upward float
    this.y -= this.speed * deltaTime * 0.008;

    // Slow opacity pulse
    this.opacity = 0.35 + Math.sin(this.time * 0.0008 + this.phaseY) * 0.15;

    if (this.y < -this.size * 2) {
      this.reset();
      this.y = this.canvas.height + this.size;
    }
  }

  draw(ctx) {
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.size,
    );

    const color = this.config.color.replace(/[\d.]+\)$/, `${this.opacity})`);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

/**
 * Falling particle - rain drops or snowflakes
 */
class FallingParticle extends Particle {
  constructor(canvas, config, type) {
    super(canvas, config);
    this.type = type; // 'rain' or 'snow'
    this.windOffset = (Math.random() - 0.5) * 1.5;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.003 + Math.random() * 0.002;
    this.targetFps = 60;
  }

  reset(initial = false) {
    super.reset(initial);
    this.x = Math.random() * (this.canvas.width + 100) - 50;
    this.windOffset = (Math.random() - 0.5) * 1.5;
  }

  update(deltaTime) {
    // Normalize deltaTime to target FPS for consistent speed
    const normalizedDelta = Math.min(deltaTime, 50) / (1000 / this.targetFps);

    if (this.type === "snow") {
      // Snow falls slowly and wobbles gently
      this.y += this.speed * normalizedDelta * 1.2;
      this.wobble += this.wobbleSpeed * deltaTime;
      this.x +=
        Math.sin(this.wobble) * 0.8 + this.windOffset * 0.05 * normalizedDelta;
    } else {
      // Rain falls faster and straighter
      this.y += this.speed * normalizedDelta * 2.5;
      this.x += this.windOffset * normalizedDelta * 0.3;
    }

    if (this.isOffScreen()) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.save();

    if (this.type === "rain") {
      // Draw rain as a longer, more visible line
      ctx.strokeStyle = this.config.color;
      ctx.lineWidth = this.size * 0.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.windOffset * 3, this.y + this.size * 8);
      ctx.stroke();
    } else {
      // Draw snow as a soft, more visible circle
      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.size,
      );
      gradient.addColorStop(0, this.config.color);
      gradient.addColorStop(
        0.6,
        this.config.color.replace(/[\d.]+\)$/, "0.5)"),
      );
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Organic blob - large, soft, slowly moving shapes
 */
class BlobParticle extends Particle {
  constructor(canvas, config) {
    super(canvas, config);
    this.time = Math.random() * 1000;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  reset(initial = false) {
    const { min, max } = this.config.size;
    this.size = min + Math.random() * (max - min);
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.opacity = 0.08 + Math.random() * 0.12;
    this.speed = this.config.speed * (0.5 + Math.random() * 0.5);
    this.vx = (Math.random() - 0.5) * this.speed;
    this.vy = (Math.random() - 0.5) * this.speed;
  }

  update(deltaTime) {
    this.time += deltaTime;

    // Very slow drifting movement
    this.x += this.vx * deltaTime * 0.005;
    this.y += this.vy * deltaTime * 0.005;

    // Wrap around edges
    if (this.x < -this.size) this.x = this.canvas.width + this.size;
    if (this.x > this.canvas.width + this.size) this.x = -this.size;
    if (this.y < -this.size) this.y = this.canvas.height + this.size;
    if (this.y > this.canvas.height + this.size) this.y = -this.size;

    // Subtle size pulsing
    this.currentSize =
      this.size * (1 + Math.sin(this.time * 0.0005 + this.pulsePhase) * 0.08);
  }

  draw(ctx) {
    ctx.save();

    // Simple soft circle gradient
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.currentSize,
    );
    const color = this.config.color.replace(/[\d.]+\)$/, `${this.opacity})`);
    gradient.addColorStop(0, color);
    gradient.addColorStop(
      0.5,
      this.config.color.replace(/[\d.]+\)$/, `${this.opacity * 0.5})`),
    );
    gradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Particle System Manager
 */
export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.particles = [];
    this.weatherType = WEATHER_TYPE.DEFAULT;
    this.timePeriod = TIME_PERIOD.NOON;
    this.season = SEASON.SUMMER;
  }

  /**
   * Initialize or update particles based on current conditions
   */
  init(weatherType, timePeriod, season) {
    this.weatherType = weatherType;
    this.timePeriod = timePeriod;
    this.season = season;

    // Clear existing particles
    this.particles = [];

    // Get weather-specific config
    const weatherConfig =
      CONFIG.WEATHER_PARTICLES[weatherType] || CONFIG.WEATHER_PARTICLES.DEFAULT;
    const seasonChars = getSeasonCharacteristics(season);

    // Adjust color based on time of day
    let adjustedConfig = { ...weatherConfig };
    if (timePeriod === TIME_PERIOD.NIGHT) {
      // Make particles more subtle at night
      adjustedConfig.color = adjustedConfig.color.replace(/[\d.]+\)$/, "0.3)");
    }

    // Create particles based on type
    switch (weatherConfig.type) {
      case "float":
        for (let i = 0; i < weatherConfig.count; i++) {
          this.particles.push(
            new FloatingParticle(this.canvas, adjustedConfig, timePeriod),
          );
        }
        break;

      case "fall":
        const fallType = weatherType === WEATHER_TYPE.SNOW ? "snow" : "rain";
        for (let i = 0; i < weatherConfig.count; i++) {
          this.particles.push(
            new FallingParticle(this.canvas, adjustedConfig, fallType),
          );
        }
        break;

      case "blob":
        for (let i = 0; i < weatherConfig.count; i++) {
          this.particles.push(new BlobParticle(this.canvas, adjustedConfig));
        }
        break;

      default:
        // Default floating particles
        for (let i = 0; i < 20; i++) {
          this.particles.push(
            new FloatingParticle(this.canvas, adjustedConfig, timePeriod),
          );
        }
    }

    // Add season-specific accent particles
    if (seasonChars.colorAccent) {
      const accentConfig = {
        ...weatherConfig,
        color: seasonChars.colorAccent,
        count: Math.floor(weatherConfig.count * 0.3),
      };
      for (let i = 0; i < accentConfig.count; i++) {
        this.particles.push(
          new FloatingParticle(this.canvas, accentConfig, timePeriod),
        );
      }
    }
  }

  /**
   * Update all particles
   */
  update(deltaTime) {
    for (const particle of this.particles) {
      particle.update(deltaTime);
    }
  }

  /**
   * Draw all particles
   */
  draw(ctx) {
    for (const particle of this.particles) {
      particle.draw(ctx);
    }
  }

  /**
   * Handle canvas resize
   */
  resize() {
    // Reinitialize with current settings
    this.init(this.weatherType, this.timePeriod, this.season);
  }
}
