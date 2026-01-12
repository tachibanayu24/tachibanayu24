/**
 * Card Effects Module
 *
 * Realistic 3D card effects with mouse-tracking tilt and dynamic lighting.
 * Simulates physical card behavior like tilting, light reflection, and holographic effects.
 */

/**
 * Configuration for card effects
 */
const CARD_EFFECTS_CONFIG = {
  // Maximum tilt angle in degrees (subtle effect)
  maxTilt: 6,
  // Tilt easing speed (lower = smoother)
  tiltSpeed: 0.06,
  // Light reflection intensity
  lightIntensity: 0.35,
  // Whether to enable effects on touch devices
  enableOnTouch: true,
  // Perspective distance
  perspective: 1000,
  // Glare element size multiplier
  glareSize: 1.5,
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

    // Create effect elements
    this.createEffectElements();

    // Initialize
    this.init();
  }

  /**
   * Create DOM elements for effects
   */
  createEffectElements() {
    const frontFace = this.card.querySelector(".card-front");
    const backFace = this.card.querySelector(".card-back");

    // Create glare/light reflection element for front
    this.glareFront = document.createElement("div");
    this.glareFront.className = "card-glare";
    if (frontFace) {
      frontFace.appendChild(this.glareFront);
    }

    // Create glare element for back
    this.glareBack = document.createElement("div");
    this.glareBack.className = "card-glare";
    if (backFace) {
      backFace.appendChild(this.glareBack);
    }
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

    console.log("[CardEffects] Initialized", {
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
    this.card.style.transition = "transform 0.1s ease-out";
    this.startAnimation();
  }

  /**
   * Handle mouse leave
   */
  handleMouseLeave() {
    this.isActive = false;
    this.target = { x: 0.5, y: 0.5, rotateX: 0, rotateY: 0 };

    // Smooth return to neutral
    this.card.style.transition = "transform 0.5s ease-out";

    // Reset glare
    this.updateGlare(0.5, 0.5, 0);
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
    this.card.style.transition = "transform 0.1s ease-out";
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

    // Update effects
    const intensity = this.isActive ? CARD_EFFECTS_CONFIG.lightIntensity : 0;
    this.updateGlare(this.current.x, this.current.y, intensity);
    this.updateHoloRing(this.current.x, this.current.y);

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
   * Update glare/light reflection effect
   */
  updateGlare(x, y, intensity) {
    // Position glare based on "light source" opposite to mouse
    const glareX = x * 100;
    const glareY = y * 100;

    // Calculate distance from center for intensity falloff
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2),
    );
    const adjustedIntensity = intensity * (1 - distanceFromCenter * 0.5);

    const glareStyle = `
      radial-gradient(
        ellipse 80% 50% at ${glareX}% ${glareY}%,
        rgba(255, 255, 255, ${adjustedIntensity * 0.8}) 0%,
        rgba(255, 255, 255, ${adjustedIntensity * 0.4}) 20%,
        rgba(255, 255, 255, ${adjustedIntensity * 0.1}) 40%,
        transparent 70%
      )
    `;

    if (this.glareFront) {
      this.glareFront.style.background = glareStyle;
      this.glareFront.style.opacity = this.isFlipped ? "0" : "1";
    }

    if (this.glareBack) {
      this.glareBack.style.background = glareStyle;
      this.glareBack.style.opacity = this.isFlipped ? "1" : "0";
    }
  }

  /**
   * Update holographic ring reflection angle based on mouse position
   */
  updateHoloRing(x, y) {
    // Calculate angle from center to mouse position
    // This simulates light source direction
    const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
    // Offset by 180 to put highlight opposite to "light source"
    const highlightAngle = angle + 180;

    // Update CSS variable on the card
    this.card.style.setProperty("--holo-angle", `${highlightAngle}deg`);

    // Update avatar glare position (light comes from mouse direction)
    const glareX = x * 100;
    const glareY = y * 100;
    this.card.style.setProperty("--glare-x", `${glareX}%`);
    this.card.style.setProperty("--glare-y", `${glareY}%`);
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

    // Remove created elements
    this.glareFront?.remove();
    this.glareBack?.remove();
  }
}

// Initialize when DOM is ready
function initCardEffects() {
  const card = document.querySelector(".card");
  const container = document.querySelector(".card-container");

  if (card && container) {
    window.cardEffects = new CardEffects(card, container);
  }
}

// Auto-initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCardEffects);
} else {
  initCardEffects();
}

export { CardEffects, initCardEffects };
