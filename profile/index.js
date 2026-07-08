/**
 * Profile Content Manager
 *
 * Main entry point for profile module.
 * Handles loading and rendering of profile data with multilingual support.
 */

import { loadProfileData } from "./data.js";
import { render } from "./renderer.js";
import {
  getOtherLang,
  getLangUrl,
  updateLanguageToggleState,
} from "./language.js";
import { setupFlipToggle } from "./flip.js";

/**
 * Setup language toggle button event listener (both front and back)
 */
function setupLanguageToggle() {
  const toggleBtn = document.getElementById("lang-toggle");
  const toggleBtnBack = document.getElementById("lang-toggle-back");

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking language toggle
    // Language is per-URL; navigate to the other language's page.
    location.assign(getLangUrl(getOtherLang()));
  };

  if (toggleBtn) {
    toggleBtn.addEventListener("click", handleToggle);
  }

  if (toggleBtnBack) {
    toggleBtnBack.addEventListener("click", handleToggle);
  }

  // Update initial state
  updateLanguageToggleState(toggleBtn);
  updateLanguageToggleState(toggleBtnBack);
}

/**
 * Load profile data and initialize UI
 * @returns {Promise<void>}
 */
async function loadContent() {
  // Prerendered pages already contain content in the correct language, so skip
  // re-rendering (and the icon CDN fetches) entirely. loadProfileData()/render()
  // remain as a fallback for the non-prerendered (dev/template) case.
  const prerendered = document.documentElement.hasAttribute("data-prerendered");
  try {
    if (!prerendered) {
      await loadProfileData();
      await render();
    }
    setupLanguageToggle();
    setupFlipToggle(document.querySelector(".card"));
  } catch (error) {
    const bioEl = document.getElementById("bio");
    const linksEl = document.getElementById("links");
    if (bioEl) {
      bioEl.innerHTML = '<span class="error">Failed to load content</span>';
    }
    if (linksEl) {
      linksEl.innerHTML = "";
    }
    console.error("[Profile] Error loading me.json:", error);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadContent);
} else {
  loadContent();
}
