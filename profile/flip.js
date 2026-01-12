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
 * Check if hint animation is currently playing
 * @returns {boolean}
 */
export function isHintActive() {
  return isHintAnimating;
}

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
    // Don't flip during hint animation
    if (isHintAnimating) return;

    // Add flipping class for shimmer effect
    card.classList.add("flipping");
    card.classList.toggle("flipped");

    // Remove flipping class after animation completes
    setTimeout(() => {
      card.classList.remove("flipping");
    }, 600);
  });

  // Show hint animation on first visit
  showFlipHint(card);
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
