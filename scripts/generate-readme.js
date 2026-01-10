#!/usr/bin/env node

/**
 * Generate README.md from me.json
 * This script is run by GitHub Actions when me.json is updated
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Read me.json
const meJson = JSON.parse(readFileSync(join(rootDir, "me.json"), "utf-8"));

// Generate README content (English version for GitHub profile)
function generateReadme(data) {
  const bioLines = data.bio.en.split("\n");
  const companyLine = `[${data.company.name}](${data.company.url})`;

  // Build bio section
  const bioSection = bioLines
    .map((line, index) => {
      // Last line gets the company link appended
      if (index === bioLines.length - 1) {
        return `${line} ${companyLine}`;
      }
      return line;
    })
    .join("  \n");

  // Build links section
  const linksSection = data.links
    .map((link) => `- [${link.name}](${link.url})`)
    .join("\n");

  // Generate full README
  return `# ${data.name}

${bioSection}

You can find me on <img width="20" src="https://raw.githubusercontent.com/tachibanayu24/tachibanayu24/main/images/wave.gif" />

${linksSection}
`;
}

// Write README.md
const readmeContent = generateReadme(meJson);
writeFileSync(join(rootDir, "README.md"), readmeContent);

console.log("README.md generated successfully!");
