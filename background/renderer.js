/**
 * Background Animation System - Renderer Module
 *
 * Handles canvas setup, animation loop, and compositing of all visual layers.
 * Creates a modern art-inspired abstract background.
 */

import { ParticleSystem } from "./particles.js";
import {
  MorningMist,
  GodRays,
  DustParticles,
  EveningClouds,
  FireflySystem,
} from "./effects.js";

/**
 * Background Renderer
 * Manages the canvas and animation loop
 */
export class BackgroundRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    // Overlay canvas for effects that should appear above the card
    this.overlayCanvas = null;
    this.overlayCtx = null;
    this.particleSystem = null;
    this.animationId = null;
    this.lastTime = 0;
    this.isRunning = false;
    this.currentPalette = null;
    this.currentTimePeriod = null;

    // Cached window dimensions (updated on resize)
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Time-specific effects (rendered on overlay canvas)
    this.morningMist = null;
    this.godRays = null;
    this.dustParticles = null;
    this.eveningClouds = null;
    this.fireflySystem = null;

    // Geometric shapes for abstract art effect
    this.shapes = [];
    this.shapeTime = 0;

    // Gradient breathing effect
    this.gradientTime = 0;

    // Bind methods
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
  }

  /**
   * Initialize the renderer
   */
  init() {
    this.createCanvas();
    this.setupEventListeners();
    this.initShapes();
    return this;
  }

  /**
   * Create and insert canvas elements
   */
  createCanvas() {
    // Remove existing canvases if any
    const existing = document.getElementById("bg-canvas");
    if (existing) {
      existing.remove();
    }
    const existingOverlay = document.getElementById("overlay-canvas");
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create background canvas (behind content)
    this.canvas = document.createElement("canvas");
    this.canvas.id = "bg-canvas";
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
    `;

    // Create overlay canvas (in front of content, for time-specific effects)
    this.overlayCanvas = document.createElement("canvas");
    this.overlayCanvas.id = "overlay-canvas";
    this.overlayCanvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      pointer-events: none;
    `;

    // Insert canvases
    document.body.insertBefore(this.canvas, document.body.firstChild);
    document.body.appendChild(this.overlayCanvas);

    // Get contexts
    this.ctx = this.canvas.getContext("2d");
    this.overlayCtx = this.overlayCanvas.getContext("2d");

    // Set size
    this.resize();

    // Initialize particle system (on background canvas)
    this.particleSystem = new ParticleSystem(this.canvas);

    // Initialize time-specific effects (on overlay canvas)
    this.morningMist = new MorningMist(this.overlayCanvas);
    this.godRays = new GodRays(this.overlayCanvas);
    this.dustParticles = new DustParticles(this.overlayCanvas);
    this.eveningClouds = new EveningClouds(this.overlayCanvas);
    this.fireflySystem = new FireflySystem(this.overlayCanvas);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("visibilitychange", this.handleVisibility);
  }

  /**
   * Handle visibility change - pause when hidden
   */
  handleVisibility() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    this.resize();
    this.particleSystem.resize();
    // Resize all time-specific effects
    this.morningMist.resize();
    this.godRays.resize();
    this.dustParticles.resize();
    this.eveningClouds.resize();
    this.fireflySystem.resize();
    this.initShapes();
  }

  /**
   * Resize canvases to window size
   */
  resize() {
    // Update cached dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    const dpr = window.devicePixelRatio || 1;

    // Resize background canvas
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    // Resize overlay canvas
    this.overlayCanvas.width = this.width * dpr;
    this.overlayCanvas.height = this.height * dpr;
    this.overlayCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.overlayCtx.scale(dpr, dpr);
  }

  /**
   * Initialize abstract geometric shapes
   */
  initShapes() {
    this.shapes = [];
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      this.shapes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 100 + Math.random() * 200,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.0002,
        type: Math.random() > 0.5 ? "circle" : "polygon",
        sides: 3 + Math.floor(Math.random() * 4),
        opacity: 0.02 + Math.random() * 0.03,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
      });
    }
  }

  /**
   * Update particle system with new conditions
   */
  updateConditions(timePeriod, palette) {
    this.currentPalette = palette;
    this.currentTimePeriod = timePeriod;

    this.particleSystem.init(timePeriod);

    // Update all time-specific effects
    this.morningMist.setTimePeriod(timePeriod);
    this.godRays.setTimePeriod(timePeriod);
    this.dustParticles.setTimePeriod(timePeriod);
    this.eveningClouds.setTimePeriod(timePeriod);
    this.fireflySystem.setTimePeriod(timePeriod);
  }

  /**
   * Main animation loop
   */
  animate(currentTime) {
    if (!this.isRunning) return;

    // Prevent huge deltaTime on first frame or after pause
    const rawDelta = currentTime - this.lastTime;
    const deltaTime = this.lastTime === 0 || rawDelta > 100 ? 16 : rawDelta;
    this.lastTime = currentTime;

    // Update gradient time for breathing effect
    this.gradientTime += deltaTime;

    // Clear canvas
    this.clear();

    // Draw background gradient with subtle breathing
    this.drawBackground();

    // Draw celestial body (sun/moon)
    this.drawCelestial();

    // Draw abstract shapes (on background canvas)
    this.drawShapes(deltaTime);

    // Update and draw particles (on background canvas)
    this.particleSystem.update(deltaTime);
    this.particleSystem.draw(this.ctx);

    // ===== OVERLAY CANVAS: Time-specific effects (visible above card) =====
    // MORNING: Rising mist
    this.morningMist.update(deltaTime);
    this.morningMist.draw(this.overlayCtx, this.currentPalette);

    // NOON: God rays
    this.godRays.update(deltaTime);
    this.godRays.draw(this.overlayCtx, this.currentPalette);

    // NOON: Dust particles / Light streaks
    this.dustParticles.update(deltaTime);
    this.dustParticles.draw(this.overlayCtx);

    // EVENING: Drifting clouds/haze
    this.eveningClouds.update(deltaTime);
    this.eveningClouds.draw(this.overlayCtx, this.currentPalette);

    // NIGHT: Fireflies
    this.fireflySystem.update(deltaTime);
    this.fireflySystem.draw(this.overlayCtx);

    // Continue animation
    this.animationId = requestAnimationFrame(this.animate);
  }

  /**
   * Clear both canvases
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.overlayCtx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Draw the background gradient with time-appropriate angle and subtle breathing
   */
  drawBackground() {
    if (!this.currentPalette) return;

    const { gradient, gradientAngle = 180 } = this.currentPalette;
    const w = this.width;
    const h = this.height;

    // Subtle breathing effect - very slow oscillation
    const breathCycle = this.gradientTime * 0.00008;
    const breathIntensity = 0.02; // 2% variation

    // Calculate gradient start and end points based on angle
    // Add subtle angle oscillation for organic feel
    const angleOffset = Math.sin(breathCycle * 0.7) * 2; // ±2 degrees
    const angleRad = ((gradientAngle + angleOffset) * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // Gradient line through center of canvas
    const cx = w / 2;
    const cy = h / 2;
    const length = Math.sqrt(w * w + h * h) / 2;

    // Add subtle position drift
    const driftX = Math.sin(breathCycle * 1.1) * 20;
    const driftY = Math.cos(breathCycle * 0.9) * 15;

    const x0 = cx - cos * length + driftX;
    const y0 = cy - sin * length + driftY;
    const x1 = cx + cos * length + driftX;
    const y1 = cy + sin * length + driftY;

    const bgGradient = this.ctx.createLinearGradient(x0, y0, x1, y1);

    // Apply breathing to gradient colors
    gradient.forEach((color, index) => {
      const adjustedColor = this.breatheColor(
        color,
        breathCycle,
        index,
        breathIntensity,
      );
      bgGradient.addColorStop(index / (gradient.length - 1), adjustedColor);
    });

    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, w, h);
  }

  /**
   * Subtly adjust color brightness for breathing effect
   */
  breatheColor(hexColor, time, index, intensity) {
    // Parse hex to RGB
    const hex = hexColor.replace("#", "");
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);

    // Different phase for each color stop for wave effect
    const phase = index * 0.5;
    const adjustment = 1 + Math.sin(time + phase) * intensity;

    // Apply adjustment
    r = Math.min(255, Math.max(0, Math.round(r * adjustment)));
    g = Math.min(255, Math.max(0, Math.round(g * adjustment)));
    b = Math.min(255, Math.max(0, Math.round(b * adjustment)));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  /**
   * Draw ambient light effect - light rays coming from off-screen
   * Creates the feeling of sunlight or moonlight illuminating the scene
   */
  drawCelestial() {
    if (!this.currentPalette || !this.currentPalette.celestial) return;

    const { celestial } = this.currentPalette;
    const w = this.width;
    const h = this.height;

    // Light source is OFF-SCREEN, we only see the light rays entering
    // Position is where the light originates (can be outside canvas)
    const sourceX = w * celestial.x;
    const sourceY = h * celestial.y;

    // Extend the source further off-screen for more natural light rays
    const offsetX = (celestial.x - 0.5) * w * 0.5;
    const offsetY = (celestial.y - 0.5) * h * 0.5;
    const lightX = sourceX + offsetX;
    const lightY = sourceY + offsetY;

    // Calculate how far the light reaches into the scene
    const reach = Math.max(w, h) * 1.2;

    // Primary light ray - large, soft ambient light
    const ambientLight = this.ctx.createRadialGradient(
      lightX,
      lightY,
      0,
      lightX,
      lightY,
      reach,
    );

    const isMoon = celestial.type === "moon";
    const intensity = isMoon ? 0.6 : 1.0;

    ambientLight.addColorStop(
      0,
      celestial.glowColor.replace(/[\d.]+\)$/, `${0.25 * intensity})`),
    );
    ambientLight.addColorStop(
      0.2,
      celestial.glowColor.replace(/[\d.]+\)$/, `${0.12 * intensity})`),
    );
    ambientLight.addColorStop(
      0.5,
      celestial.glowColor.replace(/[\d.]+\)$/, `${0.05 * intensity})`),
    );
    ambientLight.addColorStop(1, "transparent");

    this.ctx.fillStyle = ambientLight;
    this.ctx.fillRect(0, 0, w, h);

    // Secondary warm/cool accent near the light source edge
    const accentReach = reach * 0.6;
    const accentLight = this.ctx.createRadialGradient(
      lightX,
      lightY,
      0,
      lightX,
      lightY,
      accentReach,
    );

    accentLight.addColorStop(
      0,
      celestial.color.replace(/[\d.]+\)$/, `${0.15 * intensity})`),
    );
    accentLight.addColorStop(
      0.3,
      celestial.color.replace(/[\d.]+\)$/, `${0.06 * intensity})`),
    );
    accentLight.addColorStop(
      0.6,
      celestial.color.replace(/[\d.]+\)$/, `${0.02 * intensity})`),
    );
    accentLight.addColorStop(1, "transparent");

    this.ctx.fillStyle = accentLight;
    this.ctx.fillRect(0, 0, w, h);
  }

  /**
   * Draw abstract geometric shapes
   */
  drawShapes(deltaTime) {
    if (!this.currentPalette) return;

    this.shapeTime += deltaTime * 0.001;

    for (const shape of this.shapes) {
      // Update position
      shape.x += shape.vx * deltaTime;
      shape.y += shape.vy * deltaTime;
      shape.rotation += shape.rotationSpeed * deltaTime;

      // Wrap around edges
      if (shape.x < -shape.size) shape.x = this.width + shape.size;
      if (shape.x > this.width + shape.size) shape.x = -shape.size;
      if (shape.y < -shape.size) shape.y = this.height + shape.size;
      if (shape.y > this.height + shape.size) shape.y = -shape.size;

      // Draw shape
      this.ctx.save();
      this.ctx.translate(shape.x, shape.y);
      this.ctx.rotate(shape.rotation);
      this.ctx.globalAlpha = shape.opacity;

      // Use accent color from palette
      const shapeColor = this.currentPalette.accent || "#4A6FA5";

      if (shape.type === "circle") {
        // Draw soft circle
        const gradient = this.ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          shape.size,
        );
        gradient.addColorStop(0, shapeColor);
        gradient.addColorStop(1, "transparent");

        this.ctx.beginPath();
        this.ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      } else {
        // Draw polygon
        this.ctx.beginPath();
        for (let i = 0; i <= shape.sides; i++) {
          const angle = (i / shape.sides) * Math.PI * 2;
          const x = Math.cos(angle) * shape.size;
          const y = Math.sin(angle) * shape.size;
          if (i === 0) {
            this.ctx.moveTo(x, y);
          } else {
            this.ctx.lineTo(x, y);
          }
        }
        this.ctx.closePath();

        const gradient = this.ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          shape.size,
        );
        gradient.addColorStop(0, shapeColor);
        gradient.addColorStop(1, "transparent");

        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }

  /**
   * Start the animation
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.animate);
  }

  /**
   * Pause the animation
   */
  pause() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Resume the animation
   */
  resume() {
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Stop and cleanup
   */
  destroy() {
    this.pause();
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("visibilitychange", this.handleVisibility);

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    if (this.overlayCanvas && this.overlayCanvas.parentNode) {
      this.overlayCanvas.parentNode.removeChild(this.overlayCanvas);
    }

    this.canvas = null;
    this.ctx = null;
    this.overlayCanvas = null;
    this.overlayCtx = null;
    this.particleSystem = null;
    this.morningMist = null;
    this.godRays = null;
    this.dustParticles = null;
    this.eveningClouds = null;
    this.fireflySystem = null;
  }
}
