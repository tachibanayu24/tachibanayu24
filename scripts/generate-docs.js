#!/usr/bin/env node

/**
 * Generate README.md, README.ja.md, and llms.txt from me.json
 * This script is run by GitHub Actions when me.json is updated
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { getIconSlug, fetchIcon } from "../profile/icons.js";
import {
  buildBioHtml,
  buildCompanyHtml,
  buildLinksHtml,
  buildFavoritesHtml,
} from "../profile/templates.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Read me.json
const meJson = JSON.parse(readFileSync(join(rootDir, "me.json"), "utf-8"));

// Generate README content for a specific language
function generateReadme(data, lang) {
  // Language switch link (always include website link)
  const langSwitch =
    lang === "ja"
      ? "[English](./README.md) | [Website](https://tachibanayu24.com/)"
      : "[日本語](./README.ja.md) | [Website](https://tachibanayu24.com/)";

  // Bio section
  const bioSection = data.bio[lang].split("\n").join("  \n");

  // Companies section
  const { fulltime } = data.companies;
  const fulltimeLinks = fulltime.list
    .map((c) => `[${c.name}](${c.url})`)
    .join(" / ");
  const companySection = `${fulltime.label[lang]}\n${fulltimeLinks}`;

  // Links section
  const linksSection = data.links
    .map((link) => `- [${link.name}](${link.url})`)
    .join("\n");

  // Language-specific elements
  const findMeText = lang === "ja" ? "SNSなどはこちら" : "You can find me on";

  // Generate full README
  return `# ${data.name[lang]}

${langSwitch}

${bioSection}

${companySection}

${findMeText} <img width="20" src="https://raw.githubusercontent.com/tachibanayu24/tachibanayu24/main/images/wave.gif" />

${linksSection}
`;
}

// Generate English README (main)
const readmeEn = generateReadme(meJson, "en");
writeFileSync(join(rootDir, "README.md"), readmeEn);
console.log("README.md generated successfully!");

// Generate Japanese README
const readmeJa = generateReadme(meJson, "ja");
writeFileSync(join(rootDir, "README.ja.md"), readmeJa);
console.log("README.ja.md generated successfully!");

// Generate llms.txt
function generateLlmsTxt(data) {
  const { fulltime } = data.companies;

  // Positions
  const fulltimeSection = fulltime.list
    .map((c) => `- ${c.name} - ${c.url}`)
    .join("\n");
  const positionsSection = `### Full-time\n${fulltimeSection}`;

  // Links
  const linksSection = data.links
    .map((link) => `- ${link.name}: ${link.url}`)
    .join("\n");

  // About content (use English version)
  const aboutContent = data.backside?.about?.content?.en || "";

  // Favorites (use English version)
  const favorites = data.backside?.favorites?.list?.en || [];
  const favoritesText = favorites.join(", ");

  return `# ${data.name.en} (${data.name.ja})

> Engineering Capitalist based in Tokyo, Japan — an engineer who builds and invests. Personal profile and link collection.

## About

${aboutContent}

## Current Positions

${positionsSection}

## Connect

${linksSection}

## Data Format

This site's profile data is available in structured JSON format at:
- https://tachibanayu24.com/me.json

The JSON schema is defined at:
- https://tachibanayu24.com/me.schema.json

## Interests

${favoritesText}

## Language

This site supports both English and Japanese. Content is managed through me.json with language-specific fields.
`;
}

const llmsTxt = generateLlmsTxt(meJson);
writeFileSync(join(rootDir, "llms.txt"), llmsTxt);
console.log("llms.txt generated successfully!");

// ---------------------------------------------------------------------------
// Prerendered HTML (SSG) + sitemap
//
// index.html (ja, root) and en/index.html (en) are generated from
// index.template.html so crawlers/AI see full content without running JS.
// ---------------------------------------------------------------------------

/**
 * Compute the <title> / og:title / twitter:title for a language.
 */
function computeTitle(data, lang) {
  return `${data.name.en} (${data.name.ja}) - ${data.role[lang]}`;
}

/**
 * Build the JSON-LD Person graph for a language, derived from me.json + seo.
 * worksFor / sameAs / jobTitle are derived from existing data (no hardcoding);
 * SEO-only fields come from data.seo so there is a single source of truth.
 */
function generateJsonLd(data, lang) {
  const seo = data.seo || {};
  const fulltime = data.companies.fulltime.list[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name.en,
    alternateName: [data.name.ja, ...(seo.alternateName || [])],
    url:
      lang === "ja"
        ? "https://tachibanayu24.com/"
        : "https://tachibanayu24.com/en/",
    image: "https://tachibanayu24.com/images/me.jpg",
    description: data.backside.about.content[lang],
    inLanguage: lang,
    jobTitle: data.role[lang],
    worksFor: {
      "@type": "Organization",
      name: fulltime.name,
      url: fulltime.url,
    },
    sameAs: data.links.map((link) => link.url),
    knowsAbout: seo.knowsAbout || [],
  };
  if (seo.affiliation?.length) {
    jsonLd.affiliation = seo.affiliation.map((a) => ({
      "@type": "Organization",
      name: a.name,
      url: a.url,
    }));
  }
  return JSON.stringify(jsonLd, null, 2);
}

/**
 * Resolve all link icons to inline SVG markup at build time, reusing the exact
 * runtime logic in profile/icons.js so the slug map and fallbacks never drift.
 * Aborts the build if a CDN fetch fell back to the generic placeholder circle,
 * so a jsDelivr hiccup never bakes a placeholder into committed HTML.
 */
async function fetchAllIcons(links) {
  const icons = await Promise.all(
    links.map((link) => fetchIcon(getIconSlug(link.icon), link.icon)),
  );
  links.forEach((link, i) => {
    const usedPlaceholder =
      getIconSlug(link.icon) &&
      icons[i].includes('<circle cx="12" cy="12" r="10"');
    if (usedPlaceholder) {
      throw new Error(
        `Icon fetch failed for "${link.icon}" — aborting build to avoid baking a placeholder icon.`,
      );
    }
  });
  return icons;
}

/**
 * Replace every {{TOKEN}} occurrence in the template.
 */
function renderTemplate(template, tokens) {
  let out = template;
  for (const [key, value] of Object.entries(tokens)) {
    out = out.replaceAll(`{{${key}}}`, value);
  }
  return out;
}

/**
 * Produce a fully prerendered HTML document for a language.
 * Body markup reuses the shared builders in profile/templates.js so it matches
 * what renderer.js produces at runtime.
 */
function generateHtml(template, data, lang, icons) {
  const canonical =
    lang === "ja"
      ? "https://tachibanayu24.com/"
      : "https://tachibanayu24.com/en/";
  return renderTemplate(template, {
    HTML_LANG: lang,
    TITLE: computeTitle(data, lang),
    DESCRIPTION: data.backside.about.content[lang],
    CANONICAL: canonical,
    OG_LOCALE: lang === "ja" ? "ja_JP" : "en_US",
    OG_LOCALE_ALT: lang === "ja" ? "en_US" : "ja_JP",
    JSONLD: generateJsonLd(data, lang),
    NAME: data.name[lang],
    ROLE: data.role[lang],
    COMPANY_HTML: buildCompanyHtml(data.companies, lang),
    BIO_HTML: buildBioHtml(data.bio[lang]),
    LINKS_HTML: buildLinksHtml(data.links, icons),
    ABOUT_LABEL: data.backside.about.label[lang],
    ABOUT_CONTENT: data.backside.about.content[lang],
    FAVORITES_LABEL: data.backside.favorites.label[lang],
    FAVORITES_LIST_HTML: buildFavoritesHtml(data.backside.favorites.list[lang]),
    LANG_TOGGLE_LABEL: lang.toUpperCase(),
    LANG_TOGGLE_ARIA: lang === "ja" ? "Switch language" : "言語を切り替え",
    VIEW_JSON_ARIA:
      lang === "ja"
        ? "プロフィールデータ (JSON) を表示"
        : "View profile data (JSON)",
  });
}

/**
 * Sitemap listing both language URLs (trailing slash to avoid GH Pages redirects).
 */
function generateSitemap(lastmod) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tachibanayu24.com/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tachibanayu24.com/en/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
`;
}

/**
 * Use the me.json commit date so lastmod only changes with content, not on
 * every manual workflow_dispatch run (avoids noisy date-only commits).
 */
function resolveLastmod() {
  try {
    const date = execSync("git log -1 --format=%cs -- me.json", {
      cwd: rootDir,
      encoding: "utf-8",
    }).trim();
    if (date) return date;
  } catch {
    // fall back to today's date below
  }
  return new Date().toISOString().slice(0, 10);
}

async function generateSite() {
  const template = readFileSync(join(rootDir, "index.template.html"), "utf-8");
  const icons = await fetchAllIcons(meJson.links);

  writeFileSync(
    join(rootDir, "index.html"),
    generateHtml(template, meJson, "ja", icons),
  );
  console.log("index.html (ja) generated successfully!");

  mkdirSync(join(rootDir, "en"), { recursive: true });
  writeFileSync(
    join(rootDir, "en", "index.html"),
    generateHtml(template, meJson, "en", icons),
  );
  console.log("en/index.html generated successfully!");

  writeFileSync(
    join(rootDir, "sitemap.xml"),
    generateSitemap(resolveLastmod()),
  );
  console.log("sitemap.xml generated successfully!");
}

generateSite().catch((err) => {
  console.error(err);
  process.exit(1);
});
