import { defineConfig } from "astro/config";
import markdoc from "@astrojs/markdoc";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import { devSyncGithubReleasesPlugin } from "./scripts/vite-plugin-dev-sync-github-releases.mjs";

/**
 * Keystatic injects SSR routes (`/keystatic`, `/api/keystatic`), which require an adapter.
 * Enable it only for `astro dev` so `astro build` / `astro check` stay static (GitHub Pages).
 *
 * Astro 5 `defineConfig` does not invoke a function export — a callback here breaks config merge
 * (integrations ignored → /keystatic 404). We detect the CLI subcommand from argv instead.
 * Do not gate on `CI` alone (often set globally). Override: `DISABLE_KEYSTATIC=1`.
 */
const astroSubcommands = new Set([
  "add",
  "build",
  "check",
  "dev",
  "docs",
  "info",
  "preferences",
  "preview",
  "sync",
  "telemetry"
]);

function resolveAstroCliSubcommand() {
  const positional = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  for (let i = positional.length - 1; i >= 0; i--) {
    if (astroSubcommands.has(positional[i])) return positional[i];
  }
  return positional[0] ?? "";
}

const enableKeystaticUi =
  resolveAstroCliSubcommand() === "dev" && process.env.DISABLE_KEYSTATIC !== "1";

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
