/**
 * Profile - Icons Module
 *
 * Handles fetching and caching of SVG icons from Simple Icons CDN.
 */

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
  download: null, // Uses custom fallback SVG
};

/**
 * Fallback SVGs for icons not in Simple Icons
 * @type {Object<string, string>}
 */
const fallbackIcons = {
  linkedin: `<svg role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  download: `<svg role="img" viewBox="0 -960 960 960" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><title>Download</title><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>`,
};

/**
 * Cache for fetched SVG icons
 * @type {Object<string, string>}
 */
const iconCache = {};

/**
 * Get the Simple Icons slug for a given icon key
 * @param {string} key - Icon key
 * @returns {string|null} Simple Icons slug or null
 */
export function getIconSlug(key) {
  return iconSlugs[key] !== undefined ? iconSlugs[key] : iconSlugs.blog;
}

/**
 * Fetch SVG icon from Simple Icons CDN or use fallback
 * @param {string|null} slug - Simple Icons slug
 * @param {string} key - Icon key for fallback lookup
 * @returns {Promise<string>} SVG markup
 */
export async function fetchIcon(slug, key) {
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
