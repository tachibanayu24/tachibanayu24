/**
 * Profile - Shared HTML builders
 *
 * Pure, isomorphic string builders shared by `profile/renderer.js` (browser
 * runtime) and `scripts/generate-docs.js` (Node build-time prerender). Keeping
 * the markup in a single place guarantees the prerendered HTML matches the
 * client-rendered DOM byte-for-byte, so hydration never reflows.
 *
 * These functions must stay free of DOM/window globals so Node can import them.
 */

/**
 * Escape a string for safe interpolation into HTML text or double-quoted
 * attribute contexts. Isomorphic (no DOM), so the Node build and the browser
 * runtime share the exact same escaping.
 * @param {string} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Return the URL only if it uses a safe scheme; otherwise return "#".
 * Blocks `javascript:`/`data:`/etc. from reaching an href. Relative and
 * http(s)/mailto URLs pass through. Callers still run the result through
 * escapeHtml for the attribute context.
 * @param {string} url
 * @returns {string}
 */
export function safeUrl(url) {
  const trimmed = String(url).trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  // Any other explicit scheme (javascript:, data:, vbscript:, …) is rejected.
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return "#";
  // No scheme → relative/anchor URL, allowed.
  return trimmed;
}

/**
 * Build bio HTML (newlines become <br>).
 * @param {string} bioText
 * @returns {string}
 */
export function buildBioHtml(bioText) {
  return escapeHtml(bioText).split("\n").join("<br>");
}

/**
 * Build affiliation HTML shown under the title.
 * @param {{fulltime: {list: {name: string, url: string}[]}}} companies
 * @returns {string}
 */
export function buildCompanyHtml(companies) {
  return companies.fulltime.list
    .map(
      (c) =>
        `<a href="${escapeHtml(safeUrl(c.url))}" class="text-link text-engraved" target="_blank" rel="noopener">${escapeHtml(c.name)}</a>`,
    )
    .join(" / ");
}

/**
 * Build links HTML with pre-resolved icon SVG markup (same index as links).
 * The icon markup is trusted (Simple Icons / bundled fallbacks) and injected
 * as-is; only the author-supplied name/url are escaped.
 * @param {{name: string, url: string}[]} links
 * @param {string[]} icons
 * @returns {string}
 */
export function buildLinksHtml(links, icons) {
  return links
    .map((link, index) => {
      return `<a href="${escapeHtml(safeUrl(link.url))}" class="link text-engraved" target="_blank" rel="noopener">
        <span class="link-icon">${icons[index]}</span>
        ${escapeHtml(link.name)}
      </a>`;
    })
    .join("");
}

/**
 * Build favorites pill HTML.
 * @param {string[]} list
 * @returns {string}
 */
export function buildFavoritesHtml(list) {
  return list
    .map(
      (item) =>
        `<span class="favorite-tag text-engraved">${escapeHtml(item)}</span>`,
    )
    .join("");
}
