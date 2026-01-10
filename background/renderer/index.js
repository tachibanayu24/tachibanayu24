/**
 * Background Animation System - Renderer Module
 *
 * Main renderer that orchestrates all visual layers.
 * Handles canvas setup, animation loop, and compositing.
 */

import { ParticleSystem } from "../particles.js";
import {
  MorningMist,
  GodRays,
  DustParticles,
  EveningClouds,
  FireflySystem,
  RabbitCharacter,
} from "../effects/index.js";
import {
  createCanvas,
  removeExistingCanvas,
  resizeCanvas,
  clearCanvas,
} from "./canvas.js";
import {
  createGradientState,
  updateGradientCache,
  drawGradient,
} from "./gradient.js";
import { drawCelestial } from "./celestial.js";
import { createShapesState, initShapes, drawShapes } from "./shapes.js";

/**
 * Background Renderer
 * Manages the canvas and animation loop
 */
export class BackgroundRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.overlayCanvas = null;
    this.overlayCtx = null;
    this.rabbitCanvas = null;
    this.rabbitCtx = null;
    this.particleSystem = null;
    this.animationId = null;
    this.lastTime = 0;
    this.isRunning = false;
    this.currentPalette = null;
    this.currentTimePeriod = null;

    // Cached dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Module states
    this.gradientState = createGradientState();
    this.shapesState = createShapesState();

    // Time-specific effects
    this.morningMist = null;
    this.godRays = null;
    this.dustParticles = null;
    this.eveningClouds = null;
    this.fireflySystem = null;

    // Rabbit character (always visible)
    this.rabbitCharacter = null;

    // Bind methods
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
  }

  /**
   * Initialize the renderer
   */
  init() {
    this.createCanvases();
    this.setupEventListeners();
    initShapes(this.shapesState, this.width, this.height);
    return this;
  }

  /**
   * Create and insert canvas elements
   */
  createCanvases() {
    // Remove existing canvases
    removeExistingCanvas("bg-canvas");
    removeExistingCanvas("overlay-canvas");
    removeExistingCanvas("rabbit-canvas");

    // Create background canvas (behind content)
    const bg = createCanvas("bg-canvas", -2);
    this.canvas = bg.canvas;
    this.ctx = bg.ctx;

    // Create overlay canvas (behind card but in front of bg-canvas)
    const overlay = createCanvas("overlay-canvas", -1);
    this.overlayCanvas = overlay.canvas;
    this.overlayCtx = overlay.ctx;

    // Create rabbit canvas (in front of card)
    const rabbit = createCanvas("rabbit-canvas", 50);
    this.rabbitCanvas = rabbit.canvas;
    this.rabbitCtx = rabbit.ctx;

    // Insert canvases
    document.body.insertBefore(this.canvas, document.body.firstChild);
    document.body.appendChild(this.overlayCanvas);
    document.body.appendChild(this.rabbitCanvas);

    // Set size
    this.resize();

    // Initialize systems
    this.particleSystem = new ParticleSystem();
    this.morningMist = new MorningMist();
    this.godRays = new GodRays();
    this.dustParticles = new DustParticles();
    this.eveningClouds = new EveningClouds();
    this.fireflySystem = new FireflySystem();
    this.rabbitCharacter = new RabbitCharacter();
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
    this.morningMist.resize();
    this.godRays.resize();
    this.dustParticles.resize();
    this.eveningClouds.resize();
    this.fireflySystem.resize();
    this.rabbitCharacter.resize();
    initShapes(this.shapesState, this.width, this.height);
  }

  /**
   * Resize canvases to window size
   */
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    resizeCanvas(this.canvas, this.ctx, this.width, this.height);
    resizeCanvas(this.overlayCanvas, this.overlayCtx, this.width, this.height);
    resizeCanvas(this.rabbitCanvas, this.rabbitCtx, this.width, this.height);
  }

  /**
   * Update conditions (time period, palette)
   */
  updateConditions(timePeriod, palette) {
    this.currentPalette = palette;
    this.currentTimePeriod = timePeriod;

    // Update gradient cache
    updateGradientCache(this.gradientState, palette);

    // Update particle system
    this.particleSystem.init(timePeriod);

    // Update all effects
    this.morningMist.setTimePeriod(timePeriod);
    this.godRays.setTimePeriod(timePeriod);
    this.dustParticles.setTimePeriod(timePeriod);
    this.eveningClouds.setTimePeriod(timePeriod);
    this.fireflySystem.setTimePeriod(timePeriod);
    this.rabbitCharacter.setTimePeriod(timePeriod);
  }

  /**
   * Main animation loop
   */
  animate(currentTime) {
    if (!this.isRunning) return;

    // Calculate delta time
    const rawDelta = currentTime - this.lastTime;
    const deltaTime = this.lastTime === 0 || rawDelta > 100 ? 16 : rawDelta;
    this.lastTime = currentTime;

    // Clear canvases
    clearCanvas(this.ctx, this.width, this.height);
    clearCanvas(this.overlayCtx, this.width, this.height);
    clearCanvas(this.rabbitCtx, this.width, this.height);

    // Draw background layers
    drawGradient(
      this.ctx,
      this.gradientState,
      this.currentPalette,
      this.width,
      this.height,
      deltaTime,
    );
    drawCelestial(this.ctx, this.currentPalette, this.width, this.height);
    drawShapes(
      this.ctx,
      this.shapesState,
      this.currentPalette,
      this.width,
      this.height,
      deltaTime,
    );

    // Update and draw particles
    this.particleSystem.update(deltaTime);
    this.particleSystem.draw(this.ctx);

    // Draw overlay effects
    this.morningMist.update(deltaTime);
    this.morningMist.draw(this.overlayCtx, this.currentPalette);

    this.godRays.update(deltaTime);
    this.godRays.draw(this.overlayCtx, this.currentPalette);

    this.dustParticles.update(deltaTime);
    this.dustParticles.draw(this.overlayCtx);

    this.eveningClouds.update(deltaTime);
    this.eveningClouds.draw(this.overlayCtx, this.currentPalette);

    this.fireflySystem.update(deltaTime);
    this.fireflySystem.draw(this.overlayCtx);

    // Draw rabbit character (always visible, in front of card)
    this.rabbitCharacter.update(deltaTime);
    this.rabbitCharacter.draw(this.rabbitCtx);

    // Continue animation
    this.animationId = requestAnimationFrame(this.animate);
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

    if (this.rabbitCanvas && this.rabbitCanvas.parentNode) {
      this.rabbitCanvas.parentNode.removeChild(this.rabbitCanvas);
    }

    this.canvas = null;
    this.ctx = null;
    this.overlayCanvas = null;
    this.overlayCtx = null;
    this.rabbitCanvas = null;
    this.rabbitCtx = null;
    this.particleSystem = null;
    this.morningMist = null;
    this.godRays = null;
    this.dustParticles = null;
    this.eveningClouds = null;
    this.fireflySystem = null;
    this.rabbitCharacter = null;
  }
}
