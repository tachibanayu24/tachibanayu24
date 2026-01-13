/**
 * Profile Content Manager
 *
 * Main entry point for profile module.
 * Handles loading and rendering of profile data with multilingual support.
 */

import { loadProfileData } from "./data.js";
import { render } from "./renderer.js";
import {
  toggleLang,
  updateLanguageToggleState,
  getCurrentLang,
} from "./language.js";
import { setupFlipToggle } from "./flip.js";
import { fetchIcon, getIconSlug } from "./icons.js";

/**
 * Setup language toggle button event listener (both front and back)
 */
function setupLanguageToggle() {
  const toggleBtn = document.getElementById("lang-toggle");
  const toggleBtnBack = document.getElementById("lang-toggle-back");

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking language toggle
    toggleLang();
    render();
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
 * Setup download JSON button event listeners (both front and back)
 */
async function setupDownloadButtons() {
  const downloadBtnFront = document.getElementById("download-json-front");
  const downloadBtnBack = document.getElementById("download-json-back");

  // Fetch and insert download icon
  const slug = getIconSlug("download");
  const iconSvg = await fetchIcon(slug, "download");

  if (downloadBtnFront) {
    downloadBtnFront.innerHTML = iconSvg;
  }
  if (downloadBtnBack) {
    downloadBtnBack.innerHTML = iconSvg;
  }

  const handleDownload = async (e) => {
    e.stopPropagation(); // Prevent card flip when clicking download button

    const lang = getCurrentLang();
    const confirmMessage =
      lang === "ja"
        ? "プロフィールのJSONファイルをダウンロードしますか?"
        : "Download profile JSON file?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch("./me.json");
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "me.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[Profile] Error downloading me.json:", error);
      const errorMessage =
        lang === "ja"
          ? "ダウンロードに失敗しました"
          : "Failed to download file";
      alert(errorMessage);
    }
  };

  if (downloadBtnFront) {
    downloadBtnFront.addEventListener("click", handleDownload);
  }

  if (downloadBtnBack) {
    downloadBtnBack.addEventListener("click", handleDownload);
  }
}

/**
 * Load profile data and initialize UI
 * @returns {Promise<void>}
 */
async function loadContent() {
  try {
    await loadProfileData();
    await render();
    setupLanguageToggle();
    setupDownloadButtons();
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
