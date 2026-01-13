#!/usr/bin/env node

/**
 * Generate README.md and README.ja.md from me.json
 * This script is run by GitHub Actions when me.json is updated
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Read me.json (now in public/)
const meJson = JSON.parse(
  readFileSync(join(rootDir, "public/me.json"), "utf-8"),
);

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
  const { fulltime, contract } = data.companies;
  const fulltimeLinks = fulltime.list
    .map((c) => `[${c.name}](${c.url})`)
    .join(" / ");
  const contractLinks = contract.list
    .map((c) => `[${c.name}](${c.url})`)
    .join(" / ");
  const companySection = `${fulltime.label[lang]}\n${fulltimeLinks}\n\n${contract.label[lang]}\n${contractLinks}`;

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
