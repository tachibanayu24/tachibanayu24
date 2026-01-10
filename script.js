const README_URL = "./README.md";
const SIMPLE_ICONS_CDN = "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons";

// Map link names to Simple Icons slugs
const iconSlugs = {
  facebook: "facebook",
  linkedin: null, // Not available in Simple Icons (removed due to brand guidelines)
  github: "github",
  x: "x",
  note: "note",
  blog: "blogger",
  wantedly: "wantedly",
  qiita: "qiita",
  zenn: "zenn",
  resume: "readdotcv",
};

// Fallback SVGs for icons not in Simple Icons
const fallbackIcons = {
  linkedin: `<svg role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
};

// Cache for fetched SVG icons
const iconCache = {};

// Fetch SVG icon from Simple Icons CDN or use fallback
async function fetchIcon(slug, key) {
  // Use fallback if slug is null or icon exists in fallbackIcons
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
    // Add fill="currentColor" for CSS color control
    svg = svg.replace("<svg", '<svg fill="currentColor"');
    iconCache[slug] = svg;
    return svg;
  } catch (error) {
    console.warn(`Failed to fetch icon: ${slug}`, error);
    // Return fallback or simple circle icon
    return (
      fallbackIcons[key] ||
      `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>`
    );
  }
}

async function loadContent() {
  try {
    const response = await fetch(README_URL);
    if (!response.ok) throw new Error("Failed to fetch");
    const markdown = await response.text();
    await parseAndRender(markdown);
  } catch (error) {
    document.getElementById("bio").innerHTML =
      '<span class="error">Failed to load content</span>';
    document.getElementById("links").innerHTML = "";
    console.error("Error loading README:", error);
  }
}

async function parseAndRender(markdown) {
  const lines = markdown.split("\n");
  const bioLines = [];
  const links = [];

  for (const line of lines) {
    if (line.startsWith("# ")) continue;

    const linkMatch = line.match(/^- \[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      links.push({ name: linkMatch[1], url: linkMatch[2] });
      continue;
    }

    if (line.toLowerCase().includes("find me on")) continue;

    if (links.length === 0 && line.trim()) {
      bioLines.push(line.trim());
    }
  }

  // Render bio
  const bioHtml = bioLines
    .map((line) => {
      return line.replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>',
      );
    })
    .join("<br>");
  document.getElementById("bio").innerHTML = bioHtml;

  // Fetch all icons in parallel
  const iconPromises = links.map((link) => {
    const key = link.name.toLowerCase();
    const slug = iconSlugs[key] !== undefined ? iconSlugs[key] : iconSlugs.blog;
    return fetchIcon(slug, key);
  });
  const icons = await Promise.all(iconPromises);

  // Render links with icons
  const linksHtml = links
    .map((link, index) => {
      return `<a href="${link.url}" class="link" target="_blank" rel="noopener">
        <span class="link-icon">${icons[index]}</span>
        ${link.name}
      </a>`;
    })
    .join("");
  document.getElementById("links").innerHTML = linksHtml;
}

// Initialize
loadContent();
