/**
 * Card Effects Module
 *
 * Realistic 3D card effects with mouse-tracking tilt and dynamic lighting.
 * Simulates physical card behavior like tilting, light reflection, and holographic effects.
 */

import { createLogger } from "./utils/logger.js";

const logger = createLogger("CardEffects");

/**
 * Configuration for card effects
 */
const CARD_EFFECTS_CONFIG = {
  // Maximum tilt angle in degrees (subtle effect)
  maxTilt: 6,
  // Tilt easing speed (lower = smoother)
  tiltSpeed: 0.06,
  // Whether to enable effects on touch devices
  enableOnTouch: true,
  // Perspective distance
  perspective: 1000,
};

/**
 * CardEffects class - handles all card interaction effects
 */
class CardEffects {
  constructor(cardElement, containerElement) {
    this.card = cardElement;
    this.container = containerElement;
    this.isActive = false;
    this.isFlipped = false;
    this.isTouchDevice = false;

    // Current and target values for smooth interpolation
    this.current = { x: 0, y: 0, rotateX: 0, rotateY: 0 };
    this.target = { x: 0, y: 0, rotateX: 0, rotateY: 0 };

    // Animation frame reference
    this.animationFrame = null;

    // Bound methods
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.animate = this.animate.bind(this);

    // Initialize
    this.init();
  }

  /**
   * Initialize event listeners
   */
  init() {
    // Detect touch device
    this.isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Mouse events
    this.container.addEventListener("mouseenter", this.handleMouseEnter);
    this.container.addEventListener("mouseleave", this.handleMouseLeave);
    this.container.addEventListener("mousemove", this.handleMouseMove);

    // Touch events (if enabled)
    if (CARD_EFFECTS_CONFIG.enableOnTouch) {
      this.container.addEventListener("touchstart", this.handleTouchStart, {
        passive: true,
      });
      this.container.addEventListener("touchmove", this.handleTouchMove, {
        passive: true,
      });
      this.container.addEventListener("touchend", this.handleTouchEnd, {
        passive: true,
      });
    }

    // Watch for flip state changes
    this.observeFlipState();

    logger.log("Initialized", {
      isTouchDevice: this.isTouchDevice,
    });
  }

  /**
   * Observe card flip state changes
   */
  observeFlipState() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          this.isFlipped = this.card.classList.contains("flipped");
        }
      });
    });

    observer.observe(this.card, { attributes: true });
  }

  /**
   * Handle mouse enter
   */
  handleMouseEnter() {
    this.isActive = true;
    this.startAnimation();
  }

  /**
   * Handle mouse leave
   */
  handleMouseLeave() {
    this.isActive = false;
    this.target = { x: 0.5, y: 0.5, rotateX: 0, rotateY: 0 };
  }

  /**
   * Handle mouse move
   */
  handleMouseMove(e) {
    if (!this.isActive) return;

    const rect = this.container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    this.updateTarget(x, y);
  }

  /**
   * Handle touch start
   */
  handleTouchStart(e) {
    if (e.touches.length !== 1) return;

    this.isActive = true;
    this.startAnimation();

    const touch = e.touches[0];
    const rect = this.container.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;

    this.updateTarget(x, y);
  }

  /**
   * Handle touch move
   */
  handleTouchMove(e) {
    if (!this.isActive || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = this.container.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;

    this.updateTarget(x, y);
  }

  /**
   * Handle touch end
   */
  handleTouchEnd() {
    this.handleMouseLeave();
  }

  /**
   * Update target values based on normalized coordinates
   */
  updateTarget(x, y) {
    // Clamp values
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    // Calculate rotation (centered at 0.5, 0.5)
    const rotateY = (x - 0.5) * CARD_EFFECTS_CONFIG.maxTilt * 2;
    const rotateX = (0.5 - y) * CARD_EFFECTS_CONFIG.maxTilt * 2;

    this.target = { x, y, rotateX, rotateY };
  }

  /**
   * Start animation loop
   */
  startAnimation() {
    if (this.animationFrame) return;
    this.animate();
  }

  /**
   * Animation loop with smooth interpolation
   */
  animate() {
    // Interpolate current values toward target
    const speed = CARD_EFFECTS_CONFIG.tiltSpeed;

    this.current.x += (this.target.x - this.current.x) * speed;
    this.current.y += (this.target.y - this.current.y) * speed;
    this.current.rotateX +=
      (this.target.rotateX - this.current.rotateX) * speed;
    this.current.rotateY +=
      (this.target.rotateY - this.current.rotateY) * speed;

    // Apply transform
    this.applyTransform();

    // Continue animation if active or not yet settled
    const isSettled =
      Math.abs(this.target.rotateX - this.current.rotateX) < 0.01 &&
      Math.abs(this.target.rotateY - this.current.rotateY) < 0.01;

    if (this.isActive || !isSettled) {
      this.animationFrame = requestAnimationFrame(this.animate);
    } else {
      this.animationFrame = null;
      // Reset to exact neutral when settled
      this.applyTransform(true);
    }
  }

  /**
   * Apply 3D transform to card
   */
  applyTransform(reset = false) {
    const isFlipping = this.card.classList.contains("flipping");

    // During flip animation, clear inline style so CSS transition works
    if (isFlipping) {
      this.card.style.transform = "";
      return;
    }

    if (reset) {
      // Clear inline transform to let CSS take over
      this.card.style.transform = "";
      return;
    }

    // Calculate base transform with tilt
    const baseFlip = this.isFlipped ? 180 : 0;
    const transform = `rotateX(${this.current.rotateX}deg) rotateY(${baseFlip + this.current.rotateY}deg)`;

    this.card.style.transform = transform;
  }

  /**
   * Cleanup
   */
  destroy() {
    this.container.removeEventListener("mouseenter", this.handleMouseEnter);
    this.container.removeEventListener("mouseleave", this.handleMouseLeave);
    this.container.removeEventListener("mousemove", this.handleMouseMove);
    this.container.removeEventListener("touchstart", this.handleTouchStart);
    this.container.removeEventListener("touchmove", this.handleTouchMove);
    this.container.removeEventListener("touchend", this.handleTouchEnd);

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

/**
 * Card effects instance (module-scoped, not global)
 * @type {CardEffects|null}
 */
let cardEffects = null;

/**
 * Initialize card effects when DOM is ready
 * @returns {CardEffects|null} The created CardEffects instance
 */
function initCardEffects() {
  const card = document.querySelector(".card");
  const container = document.querySelector(".card-container");

  if (card && container) {
    cardEffects = new CardEffects(card, container);
    return cardEffects;
  }
  return null;
}

/**
 * Get the current card effects instance
 * @returns {CardEffects|null}
 */
function getCardEffects() {
  return cardEffects;
}

// Auto-initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCardEffects);
} else {
  initCardEffects();
}

export { CardEffects, initCardEffects, getCardEffects };
