/**
 * Profile - Language Module
 *
 * With prerendered per-language URLs, the document's <html lang> is the single
 * source of truth. There is no in-page language switching and no localStorage —
 * the language toggle navigates between / (Japanese) and /en/ (English).
 */

/**
 * Current language, derived from the prerendered document.
 * @type {'en'|'ja'}
 */
let currentLang = document.documentElement.lang === "ja" ? "ja" : "en";

/**
 * Get the current language.
 * @returns {'en'|'ja'}
 */
export function getCurrentLang() {
  return currentLang;
}

/**
 * Get the other language (the toggle target).
 * @returns {'en'|'ja'}
 */
export function getOtherLang() {
  return currentLang === "ja" ? "en" : "ja";
}

/**
 * Map a language to its page URL.
 * @param {'en'|'ja'} lang
 * @returns {string}
 */
export function getLangUrl(lang) {
  return lang === "ja" ? "/" : "/en/";
}

/**
 * Update language toggle button text and aria-label.
 * The button shows the current language and switches to the other.
 * Prerendered pages already bake the correct label; this is used by the
 * non-prerendered fallback path.
 * @param {HTMLElement|null} toggleBtn - Language toggle button element
 */
export function updateLanguageToggleState(toggleBtn) {
  if (!toggleBtn) return;
  const ariaLabel = currentLang === "en" ? "言語を切り替え" : "Switch language";
  toggleBtn.textContent = currentLang.toUpperCase();
  toggleBtn.setAttribute("aria-label", ariaLabel);
}
