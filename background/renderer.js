/**
 * Background Animation System - Renderer Module
 *
 * Handles canvas setup, animation loop, and compositing of all visual layers.
 * Creates a modern art-inspired abstract background.
 */

import { ParticleSystem } from "./particles.js";
import { createGradientString } from "./colors.js";
import { CONFIG } from "./config.js";

/**
 * Background Renderer
 * Manages the canvas and animation loop
 */
export class BackgroundRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particleSystem = null;
    this.animationId = null;
    this.lastTime = 0;
    this.isRunning = false;
    this.currentPalette = null;

    // Geometric shapes for abstract art effect
    this.shapes = [];
    this.shapeTime = 0;

    // Bind methods
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
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
   * Create and insert canvas element
   */
  createCanvas() {
    // Remove existing canvas if any
    const existing = document.getElementById("bg-canvas");
    if (existing) {
      existing.remove();
    }

    // Create new canvas
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

    // Insert as first child of body
    document.body.insertBefore(this.canvas, document.body.firstChild);

    // Get context
    this.ctx = this.canvas.getContext("2d");

    // Set size
    this.resize();

    // Initialize particle system
    this.particleSystem = new ParticleSystem(this.canvas);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    window.addEventListener("resize", this.handleResize);

    // Visibility change - pause when hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  /**
   * Handle window resize
   */
  handleResize() {
    this.resize();
    if (this.particleSystem) {
      this.particleSystem.resize();
    }
    this.initShapes();
  }

  /**
   * Resize canvas to window size
   */
  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Initialize abstract geometric shapes
   */
  initShapes() {
    this.shapes = [];
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      this.shapes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
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
  updateConditions(weatherType, timePeriod, season, palette) {
    this.currentPalette = palette;

    if (this.particleSystem) {
      this.particleSystem.init(weatherType, timePeriod, season);
    }
  }

  /**
   * Main animation loop
   */
  animate(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Clear canvas
    this.clear();

    // Draw background gradient
    this.drawBackground();

    // Draw abstract shapes
    this.drawShapes(deltaTime);

    // Draw weather overlay
    this.drawWeatherOverlay();

    // Update and draw particles
    if (this.particleSystem) {
      this.particleSystem.update(deltaTime);
      this.particleSystem.draw(this.ctx);
    }

    // Continue animation
    this.animationId = requestAnimationFrame(this.animate);
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  /**
   * Draw the background gradient
   */
  drawBackground() {
    if (!this.currentPalette) return;

    const { gradient } = this.currentPalette;

    // Create a smooth multi-stop gradient
    const bgGradient = this.ctx.createLinearGradient(
      0,
      0,
      window.innerWidth * 0.5,
      window.innerHeight,
    );

    gradient.forEach((color, index) => {
      bgGradient.addColorStop(index / (gradient.length - 1), color);
    });

    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
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
      if (shape.x < -shape.size) shape.x = window.innerWidth + shape.size;
      if (shape.x > window.innerWidth + shape.size) shape.x = -shape.size;
      if (shape.y < -shape.size) shape.y = window.innerHeight + shape.size;
      if (shape.y > window.innerHeight + shape.size) shape.y = -shape.size;

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
   * Draw weather overlay effect
   */
  drawWeatherOverlay() {
    if (!this.currentPalette?.weatherOverlay) return;

    const { opacity, color } = this.currentPalette.weatherOverlay;
    if (opacity > 0) {
      this.ctx.fillStyle = color;
      this.ctx.globalAlpha = opacity;
      this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      this.ctx.globalAlpha = 1;
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

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;
    this.particleSystem = null;
  }
}
