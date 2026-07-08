/**
 * Profile - Renderer Module
 *
 * Handles rendering profile data to the DOM.
 */

import { getProfileData } from "./data.js";
import { getCurrentLang, updateLanguageToggleState } from "./language.js";
import { fetchIcon, getIconSlug } from "./icons.js";
import {
  buildBioHtml,
  buildCompanyHtml,
  buildLinksHtml,
  buildFavoritesHtml,
} from "./templates.js";

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

  // Render role
  const roleEl = document.getElementById("role");
  if (roleEl && profileData.role) {
    roleEl.textContent = profileData.role[lang];
  }

  // Render bio
  document.getElementById("bio").innerHTML = buildBioHtml(
    profileData.bio[lang],
  );

  // Render affiliation under the title (fulltime company, shown without a label)
  const companyHtml = buildCompanyHtml(profileData.companies);
  document.getElementById("company").innerHTML = companyHtml;

  // Fetch all icons in parallel
  const iconPromises = profileData.links.map((link) => {
    const slug = getIconSlug(link.icon);
    return fetchIcon(slug, link.icon);
  });
  const icons = await Promise.all(iconPromises);

  // Render links with icons
  document.getElementById("links").innerHTML = buildLinksHtml(
    profileData.links,
    icons,
  );

  // Render backside content
  renderBackside(
    lang,
    profileData.name[lang],
    profileData.role?.[lang],
    companyHtml,
  );

  // Update language toggle active state
  const toggleBtn = document.getElementById("lang-toggle");
  const toggleBtnBack = document.getElementById("lang-toggle-back");
  updateLanguageToggleState(toggleBtn);
  updateLanguageToggleState(toggleBtnBack);
}

/**
 * Render backside content with current language
 * @param {'en'|'ja'} lang - Current language
 * @param {string} name - Localized name (mirrored from the front face)
 * @param {string|undefined} role - Localized role (mirrored from the front face)
 * @param {string} companyHtml - Affiliation HTML (mirrored from the front face)
 */
function renderBackside(lang, name, role, companyHtml) {
  const profileData = getProfileData();
  if (!profileData?.backside) return;

  const { backside } = profileData;

  // Name / role / affiliation (same as the front face, shown again on the back)
  const nameBackEl = document.getElementById("name-back");
  if (nameBackEl) nameBackEl.textContent = name;
  const roleBackEl = document.getElementById("role-back");
  if (roleBackEl && role) roleBackEl.textContent = role;
  const companyBackEl = document.getElementById("company-back");
  if (companyBackEl) companyBackEl.innerHTML = companyHtml;

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
    favoritesListEl.innerHTML = buildFavoritesHtml(
      backside.favorites.list[lang],
    );
  }
}
