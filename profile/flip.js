/**
 * Profile - Flip Module
 *
 * Handles card flip functionality and hint animation.
 */

/**
 * Flag to track if hint animation is playing
 * @type {boolean}
 */
let isHintAnimating = false;

/**
 * Flag to track if flip animation is in progress
 * @type {boolean}
 */
let isFlipping = false;

/**
 * Timeout ID for flip animation cleanup
 * @type {number|null}
 */
let flipTimeoutId = null;

/**
 * Setup card flip functionality (tap anywhere on card to flip)
 * @param {HTMLElement} card - Card element
 */
export function setupFlipToggle(card) {
  if (!card) return;

  // Card text is non-selectable, so a click anywhere is always a flip intent —
  // no need to disambiguate it from drag-select or double/triple-click.
  card.addEventListener("click", (e) => {
    // Don't flip when interacting with links/buttons (language toggle, view JSON)
    if (e.target.closest("a, button")) return;
    // Don't flip during the intro hint animation
    if (isHintAnimating) return;
    flip(card);
  });

  // Play the flip hint on load (skipped when the user prefers reduced motion)
  showFlipHint(card);
}

/**
 * Toggle the card's flipped state.
 * @param {HTMLElement} card - Card element
 */
function flip(card) {
  // Don't flip during flip animation (prevent race condition)
  if (isFlipping) return;

  isFlipping = true;

  // Clear any existing timeout (defensive)
  if (flipTimeoutId !== null) {
    clearTimeout(flipTimeoutId);
  }

  // Add flipping class for shimmer effect
  card.classList.add("flipping");
  card.classList.toggle("flipped");

  // Remove flipping class after animation completes
  flipTimeoutId = setTimeout(() => {
    card.classList.remove("flipping");
    isFlipping = false;
    flipTimeoutId = null;
  }, 600);
}

/**
 * Show flip hint animation on page load
 * @param {HTMLElement} card - Card element
 */
function showFlipHint(card) {
  // Reduced motion: skip the intro hint. This also avoids leaving
  // isHintAnimating stuck true — the hint animation is disabled via CSS, so its
  // animationend would never fire to clear the flag (which would block flips).
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    isHintAnimating = false;
    return;
  }

  // Block interactions during fadeIn + hint animation
  isHintAnimating = true;

  // Start hint after fadeIn animation completes (0.3s)
  setTimeout(() => {
    card.classList.add("hint");

    // Remove hint class after animation completes
    card.addEventListener(
      "animationend",
      () => {
        card.classList.remove("hint");
        isHintAnimating = false;
      },
      { once: true },
    );
  }, 300);
}
