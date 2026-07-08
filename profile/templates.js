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
 * Build bio HTML (newlines become <br>).
 * @param {string} bioText
 * @returns {string}
 */
export function buildBioHtml(bioText) {
  return bioText.split("\n").join("<br>");
}

/**
 * Build affiliation HTML shown under the title.
 * @param {{fulltime: {list: {name: string, url: string}[]}, contract?: {label: {en: string, ja: string}, list: {name: string, url: string}[]}}} companies
 * @param {'en'|'ja'} lang
 * @returns {string}
 */
export function buildCompanyHtml(companies, lang) {
  const { fulltime, contract } = companies;

  const renderCompanyLinks = (list) =>
    list
      .map(
        (c) =>
          `<a href="${c.url}" class="text-link text-engraved" target="_blank" rel="noopener">${c.name}</a>`,
      )
      .join(" / ");

  let companyHtml = renderCompanyLinks(fulltime.list);
  if (contract) {
    companyHtml += `<br><br>${contract.label[lang]}<br>${renderCompanyLinks(contract.list)}`;
  }
  return companyHtml;
}

/**
 * Build links HTML with pre-resolved icon SVG markup (same index as links).
 * @param {{name: string, url: string}[]} links
 * @param {string[]} icons
 * @returns {string}
 */
export function buildLinksHtml(links, icons) {
  return links
    .map((link, index) => {
      return `<a href="${link.url}" class="link text-engraved" target="_blank" rel="noopener">
        <span class="link-icon">${icons[index]}</span>
        ${link.name}
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
    .map((item) => `<span class="favorite-tag text-engraved">${item}</span>`)
    .join("");
}
