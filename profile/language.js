/**
 * Profile - Language Module
 *
 * Handles language switching and storage.
 */

/**
 * Get stored language from localStorage
 * @returns {string|null} Stored language or null
 */
function getStoredLang() {
  try {
    return localStorage.getItem("lang");
  } catch {
    return null;
  }
}

/**
 * Store language preference in localStorage
 * @param {string} lang - Language code ('en' or 'ja')
 */
function setStoredLang(lang) {
  try {
    localStorage.setItem("lang", lang);
  } catch {
    // Ignore storage errors in private browsing
  }
}

/**
 * Current language state
 * @type {'en'|'ja'}
 */
let currentLang = getStoredLang() || "en";

/**
 * Get the current language
 * @returns {'en'|'ja'}
 */
export function getCurrentLang() {
  return currentLang;
}

/**
 * Toggle the current language
 * @returns {'en'|'ja'} The new language
 */
export function toggleLang() {
  currentLang = currentLang === "en" ? "ja" : "en";
  setStoredLang(currentLang);
  return currentLang;
}

/**
 * Update language toggle button text and aria-label
 * @param {HTMLElement|null} toggleBtn - Language toggle button element
 */
export function updateLanguageToggleState(toggleBtn) {
  if (!toggleBtn) return;
  const ariaLabel = currentLang === "en" ? "言語を切り替え" : "Switch language";
  toggleBtn.textContent = currentLang.toUpperCase();
  toggleBtn.setAttribute("aria-label", ariaLabel);
}
