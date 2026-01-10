const README_URL =
  "https://raw.githubusercontent.com/tachibanayu24/tachibanayu24/main/README.md";

// SVG Icons for each platform
const icons = {
  note: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  wantedly: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.453 14.555c-.171-.111-.658-.764-.658-.764l-3.253-5.764c-.108-.236-.249-.263-.398-.027l-1.06 1.614c-.112.151-.092.263.034.38l3.943 5.878s.567.666.759.763c.345.175.89.094 1.207-.233.317-.327.353-.859.115-1.21a16.9 16.9 0 0 0-.689-.637zM8.504 14.555c-.171-.111-.658-.764-.658-.764L4.593 8.027c-.108-.236-.249-.263-.398-.027L3.135 9.614c-.112.151-.092.263.034.38l3.943 5.878s.567.666.759.763c.345.175.89.094 1.207-.233.317-.327.353-.859.115-1.21a16.9 16.9 0 0 0-.689-.637zM14.609 8.027c-.108-.236-.249-.263-.398-.027l-1.06 1.614c-.112.151-.092.263.034.38l3.943 5.878s.567.666.759.763c.345.175.89.094 1.207-.233.317-.327.353-.859.115-1.21a16.9 16.9 0 0 0-.689-.637c-.171-.111-.658-.764-.658-.764l-3.253-5.764z"/></svg>`,
  qiita: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182a9.818 9.818 0 110 19.636 9.818 9.818 0 010-19.636zm0 3.273a6.545 6.545 0 100 13.09 6.545 6.545 0 000-13.09zm0 2.181a4.364 4.364 0 110 8.728 4.364 4.364 0 010-8.728z"/></svg>`,
  zenn: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.264 23.771h4.984c.264 0 .498-.147.645-.352L19.614.874c.176-.293-.029-.645-.381-.645h-4.72c-.235 0-.44.117-.557.323L.03 23.361c-.088.176.029.41.234.41zM17.445 23.419l6.479-10.408c.205-.323-.029-.733-.41-.733h-4.691c-.176 0-.352.088-.44.235l-6.655 10.643c-.176.264.029.616.352.616h4.779c.234-.001.468-.148.586-.353z"/></svg>`,
  blog: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
  resume: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
};

async function loadContent() {
  try {
    const response = await fetch(README_URL);
    if (!response.ok) throw new Error("Failed to fetch");
    const markdown = await response.text();
    parseAndRender(markdown);
  } catch (error) {
    document.getElementById("bio").innerHTML =
      '<span class="error">Failed to load content</span>';
    document.getElementById("links").innerHTML = "";
    console.error("Error loading README:", error);
  }
}

function parseAndRender(markdown) {
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

  // Render links with icons
  const linksHtml = links
    .map((link) => {
      const key = link.name.toLowerCase();
      const icon = icons[key] || icons.blog;
      const isResume = key === "resume";
      return `<a href="${link.url}" class="link${isResume ? " full-width" : ""}" target="_blank" rel="noopener">
        <span class="link-icon">${icon}</span>
        ${link.name}
      </a>`;
    })
    .join("");
  document.getElementById("links").innerHTML = linksHtml;
}

// Initialize
loadContent();
