/**
 * Profile - Data Module
 *
 * Type definitions and data fetching for profile information.
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
 * @typedef {Object} BacksideData
 * @property {{label: {en: string, ja: string}, content: {en: string, ja: string}}} about - About section
 * @property {{label: {en: string, ja: string}, list: {en: string[], ja: string[]}}} favorites - Favorites section
 */

/**
 * @typedef {Object} ProfileData
 * @property {{en: string, ja: string}} name - Multilingual name
 * @property {{fulltime: {label: {en: string, ja: string}, list: Company[]}, contract: {label: {en: string, ja: string}, list: Company[]}}} companies - Company info
 * @property {{en: string, ja: string}} bio - Multilingual bio
 * @property {Link[]} links - Social links
 * @property {BacksideData} backside - Card backside data
 */

/** @type {string} */
const ME_JSON_URL = "./me.json";

/**
 * Profile data loaded from me.json
 * @type {ProfileData|null}
 */
let profileData = null;

/**
 * Get the current profile data
 * @returns {ProfileData|null}
 */
export function getProfileData() {
  return profileData;
}

/**
 * Load profile data from me.json
 * @returns {Promise<ProfileData>}
 * @throws {Error} If fetch fails
 */
export async function loadProfileData() {
  const response = await fetch(ME_JSON_URL);
  if (!response.ok) throw new Error("Failed to fetch");
  profileData = await response.json();
  return profileData;
}
