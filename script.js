/**
 * Profile Content Manager
 *
 * Handles loading and rendering of profile data with multilingual support.
 */

/**
 * @typedef {Object} Company
 * @property {string} name - Company name
 * @property {string} url - Company URL
 */

/**
 * @typedef {Object} Link
 * @property {string} name - Link display name
 * @property {string} url - Link URL
 * @property {string} icon - Icon identifier
 */

/**
 * @typedef {Object} ProfileData
 * @property {{en: string, ja: string}} name - Multilingual name
 * @property {{label: {en: string, ja: string}, list: Company[]}} companies - Company info
 * @property {{en: string, ja: string}} bio - Multilingual bio
 * @property {Link[]} links - Social links
 */

/** @type {string} */
const ME_JSON_URL = "./me.json";

/** @type {string} */
const SIMPLE_ICONS_CDN = "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons";

/**
 * Map icon identifiers to Simple Icons slugs
 * @type {Object<string, string|null>}
 */
const iconSlugs = {
  facebook: "facebook",
  linkedin: null, // Uses custom fallback SVG for design consistency
  github: "github",
  x: "x",
  note: "note",
  blog: "blogger",
  wantedly: "wantedly",
  qiita: "qiita",
  zenn: "zenn",
  resume: "readdotcv",
};

/**
 * Fallback SVGs for icons not in Simple Icons
 * @type {Object<string, string>}
 */
const fallbackIcons = {
  linkedin: `<svg role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
};

/**
 * Cache for fetched SVG icons
 * @type {Object<string, string>}
 */
const iconCache = {};

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
 * Profile data loaded from me.json
 * @type {ProfileData|null}
 */
let profileData = null;

/**
 * Fetch SVG icon from Simple Icons CDN or use fallback
 * @param {string|null} slug - Simple Icons slug
 * @param {string} key - Icon key for fallback lookup
 * @returns {Promise<string>} SVG markup
 */
async function fetchIcon(slug, key) {
  if (!slug && fallbackIcons[key]) {
    return fallbackIcons[key];
  }

  if (iconCache[slug]) {
    return iconCache[slug];
  }

  try {
    const response = await fetch(`${SIMPLE_ICONS_CDN}/${slug}.svg`);
    if (!response.ok) throw new Error("Icon not found");
    let svg = await response.text();
    svg = svg.replace("<svg", '<svg fill="currentColor"');
    iconCache[slug] = svg;
    return svg;
  } catch (error) {
    console.warn(`Failed to fetch icon: ${slug}`, error);
    return (
      fallbackIcons[key] ||
      `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>`
    );
  }
}

/**
 * Load profile data from me.json
 * @returns {Promise<void>}
 */
async function loadContent() {
  try {
    const response = await fetch(ME_JSON_URL);
    if (!response.ok) throw new Error("Failed to fetch");
    profileData = await response.json();
    await render();
    setupLanguageToggle();
  } catch (error) {
    const bioEl = document.getElementById("bio");
    const linksEl = document.getElementById("links");
    if (bioEl) {
      bioEl.innerHTML = '<span class="error">Failed to load content</span>';
    }
    if (linksEl) {
      linksEl.innerHTML = "";
    }
    console.error("[Script] Error loading me.json:", error);
  }
}

/**
 * Render profile with current language
 * @returns {Promise<void>}
 */
async function render() {
  if (!profileData) return;

  const lang = currentLang;

  // Update HTML lang attribute for SEO and accessibility
  document.documentElement.lang = lang;

  // Render name
  const nameEl = document.getElementById("name");
  if (nameEl) {
    nameEl.textContent = profileData.name[lang];
  }

  // Render bio
  const bioHtml = profileData.bio[lang].split("\n").join("<br>");
  document.getElementById("bio").innerHTML = bioHtml;

  // Render companies
  const companyLabel = profileData.companies.label[lang];
  const companyLinks = profileData.companies.list
    .map(
      (c) => `<a href="${c.url}" target="_blank" rel="noopener">${c.name}</a>`,
    )
    .join(" / ");
  document.getElementById("company").innerHTML =
    `${companyLabel}<br>${companyLinks}`;

  // Fetch all icons in parallel
  const iconPromises = profileData.links.map((link) => {
    const slug =
      iconSlugs[link.icon] !== undefined
        ? iconSlugs[link.icon]
        : iconSlugs.blog;
    return fetchIcon(slug, link.icon);
  });
  const icons = await Promise.all(iconPromises);

  // Render links with icons
  const linksHtml = profileData.links
    .map((link, index) => {
      return `<a href="${link.url}" class="link" target="_blank" rel="noopener">
        <span class="link-icon">${icons[index]}</span>
        ${link.name}
      </a>`;
    })
    .join("");

  document.getElementById("links").innerHTML = linksHtml;

  // Update language toggle active state
  updateLanguageToggleState();
}

/**
 * Setup language toggle button event listener
 */
function setupLanguageToggle() {
  const toggleBtn = document.getElementById("lang-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "ja" : "en";
    setStoredLang(currentLang);
    render();
  });

  updateLanguageToggleState();
}

/**
 * Update language toggle button text and aria-label
 */
function updateLanguageToggleState() {
  const toggleBtn = document.getElementById("lang-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = currentLang.toUpperCase();
    toggleBtn.setAttribute(
      "aria-label",
      currentLang === "en" ? "言語を切り替え" : "Switch language",
    );
  }
}

// Initialize
loadContent();
