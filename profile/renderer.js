/**
 * Profile - Renderer Module
 *
 * Handles rendering profile data to the DOM.
 */

import { getProfileData } from "./data.js";
import { getCurrentLang, updateLanguageToggleState } from "./language.js";
import { fetchIcon, getIconSlug } from "./icons.js";

/**
 * Render profile with current language
 * @returns {Promise<void>}
 */
export async function render() {
  const profileData = getProfileData();
  if (!profileData) return;

  const lang = getCurrentLang();

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

  // Render companies (fulltime and contract)
  const { fulltime, contract } = profileData.companies;

  const fulltimeLabel = fulltime.label[lang];
  const fulltimeLinks = fulltime.list
    .map(
      (c) =>
        `<a href="${c.url}" class="text-link text-engraved" target="_blank" rel="noopener">${c.name}</a>`,
    )
    .join(" / ");

  const contractLabel = contract.label[lang];
  const contractLinks = contract.list
    .map(
      (c) =>
        `<a href="${c.url}" class="text-link text-engraved" target="_blank" rel="noopener">${c.name}</a>`,
    )
    .join(" / ");

  document.getElementById("company").innerHTML =
    `${fulltimeLabel}<br>${fulltimeLinks}<br><br>${contractLabel}<br>${contractLinks}`;

  // Fetch all icons in parallel
  const iconPromises = profileData.links.map((link) => {
    const slug = getIconSlug(link.icon);
    return fetchIcon(slug, link.icon);
  });
  const icons = await Promise.all(iconPromises);

  // Render links with icons
  const linksHtml = profileData.links
    .map((link, index) => {
      return `<a href="${link.url}" class="link text-engraved" target="_blank" rel="noopener">
        <span class="link-icon">${icons[index]}</span>
        ${link.name}
      </a>`;
    })
    .join("");

  document.getElementById("links").innerHTML = linksHtml;

  // Render backside content
  renderBackside(lang);

  // Update language toggle active state
  const toggleBtn = document.getElementById("lang-toggle");
  const toggleBtnBack = document.getElementById("lang-toggle-back");
  updateLanguageToggleState(toggleBtn);
  updateLanguageToggleState(toggleBtnBack);
}

/**
 * Render backside content with current language
 * @param {'en'|'ja'} lang - Current language
 */
function renderBackside(lang) {
  const profileData = getProfileData();
  if (!profileData?.backside) return;

  const { backside } = profileData;

  // About
  const aboutLabelEl = document.getElementById("about-label");
  const aboutContentEl = document.getElementById("about-content");
  if (aboutLabelEl && backside.about) {
    aboutLabelEl.textContent = backside.about.label[lang];
  }
  if (aboutContentEl && backside.about) {
    aboutContentEl.textContent = backside.about.content[lang];
  }

  // Favorites
  const favoritesLabelEl = document.getElementById("favorites-label");
  const favoritesListEl = document.getElementById("favorites-list");
  if (favoritesLabelEl && backside.favorites) {
    favoritesLabelEl.textContent = backside.favorites.label[lang];
  }
  if (favoritesListEl && backside.favorites) {
    favoritesListEl.innerHTML = backside.favorites.list[lang]
      .map((item) => `<span class="favorite-tag text-engraved">${item}</span>`)
      .join("");
  }
}
