import { defineConfig } from "astro/config";
import markdoc from "@astrojs/markdoc";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import { devSyncGithubReleasesPlugin } from "./scripts/vite-plugin-dev-sync-github-releases.mjs";

/**
 * Keystatic injects SSR routes (`/keystatic`, `/api/keystatic`), which require an adapter.
 * GitHub Pages is static-only, so CI sets `CI=true` and we skip the Keystatic integration there.
 * Locally: `npm run dev` → full admin UI at /keystatic. Production HTML is built from `content/` via the reader in `src/lib/site-content.ts`.
 */
const enableKeystaticUi = process.env.CI !== "true" && process.env.DISABLE_KEYSTATIC !== "1";

export default defineConfig({
  site: "https://integrate.pl",
  integrations: [
    ...(enableKeystaticUi ? [react(), markdoc(), keystatic()] : []),
    sitemap()
  ],
  vite: {
    plugins: enableKeystaticUi ? [devSyncGithubReleasesPlugin()] : []
  }
});
