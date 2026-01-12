/**
 * Background Animation System - Base Effect Module
 *
 * Abstract base class for time-specific visual effects.
 * Provides common functionality for effect lifecycle management.
 */

import { CONFIG } from "../config.js";

/**
 * Calculate screen factor for responsive opacity adjustments
 * @param {number} [width] - Screen width (defaults to window.innerWidth)
 * @returns {number} Screen factor between MOBILE_MIN_OPACITY_FACTOR and 1
 */
export function getScreenFactor(width = window.innerWidth) {
  const { MOBILE_BREAKPOINT, MOBILE_MIN_OPACITY_FACTOR } = CONFIG.SCREEN;
  const rawFactor = width / MOBILE_BREAKPOINT;
  return Math.max(MOBILE_MIN_OPACITY_FACTOR, Math.min(1, rawFactor));
}

/**
 * Base class for time-specific effects
 * @abstract
 */
export class BaseEffect {
  /**
   * @param {string} targetTimePeriod - The time period when this effect is active
   */
  constructor(targetTimePeriod) {
    this.targetTimePeriod = targetTimePeriod;
    this.isActive = false;
    this.time = 0;
  }

  /**
   * Set the current time period and activate/deactivate accordingly
   * @param {string} timePeriod - Current time period
   */
  setTimePeriod(timePeriod) {
    const wasActive = this.isActive;
    this.isActive = timePeriod === this.targetTimePeriod;
    if (this.isActive && !wasActive) {
      this.init();
    }
  }

  /**
   * Handle window resize
   */
  resize() {
    if (this.isActive) {
      this.init();
    }
  }

  /**
   * Initialize or reinitialize the effect
   * @abstract
   */
  init() {
    throw new Error("Subclass must implement init()");
  }

  /**
   * Update the effect state
   * @abstract
   * @param {number} deltaTime - Time since last frame in milliseconds
   */
  update(deltaTime) {
    throw new Error("Subclass must implement update()");
  }

  /**
   * Draw the effect
   * @abstract
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} [palette] - Color palette
   */
  draw(ctx, palette) {
    throw new Error("Subclass must implement draw()");
  }
}
