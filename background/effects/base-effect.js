/**
 * Background Animation System - Base Effect Module
 *
 * Abstract base class for time-specific visual effects.
 * Provides common functionality for effect lifecycle management.
 */

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
