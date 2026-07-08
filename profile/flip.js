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
 * Timeout ID for the pending (debounced) single-click flip.
 * Cancelled if the click turns out to be part of a double/triple-click
 * (word/paragraph text selection) rather than a tap-to-flip.
 * @type {number|null}
 */
let pendingFlipTimeoutId = null;

/**
 * Delay before a single click actually flips the card, giving a following
 * click (making it a double/triple-click for text selection) a chance to
 * cancel it first.
 * @type {number}
 */
const FLIP_DEBOUNCE_MS = 300;

/**
 * Setup card flip functionality (tap anywhere on card to flip)
 * @param {HTMLElement} card - Card element
 */
export function setupFlipToggle(card) {
  if (!card) return;

  // Flip on card tap/click
  card.addEventListener("click", (e) => {
    // Don't flip if clicking on interactive elements
    if (e.target.closest("a, button")) return;

    // A 2nd/3rd click in a double/triple-click means the user is selecting a
    // word or paragraph, not tapping to flip — cancel the pending flip from
    // the first click and let the browser's text selection proceed.
    if (e.detail > 1) {
      if (pendingFlipTimeoutId !== null) {
        clearTimeout(pendingFlipTimeoutId);
        pendingFlipTimeoutId = null;
      }
      return;
    }

    // Don't flip if the click ended a drag-to-select gesture
    if (window.getSelection()?.toString().length > 0) return;
    // Don't flip during hint animation
    if (isHintAnimating) return;

    // Defer the flip briefly so a following click (turning this into a
    // double-click) can still cancel it before anything visibly happens.
    pendingFlipTimeoutId = setTimeout(() => {
      pendingFlipTimeoutId = null;
      flip(card);
    }, FLIP_DEBOUNCE_MS);
  });

  // Show hint animation on first visit
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
