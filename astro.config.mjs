import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://tachibanayu24.com",
  integrations: [sitemap()],
  compressHTML: true,
  build: {
    inlineStylesheets: "never", // Keep CSS files separate for caching
  },
});
