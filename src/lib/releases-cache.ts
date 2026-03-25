import type { GithubReleaseAsset, GithubReleaseInfo } from "../data/home";

/**
 * Normalize Keystatic `releasesFromGithub` rows; `htmlUrl` / Docker base are filled at build from `githubRepo` + tag.
 * API-shaped rows from `fetchAllReleases` are a separate path — both are merged via `applyGithubRepoDerivedFields` in site-content.
 */
export function githubReleasesFromCache(raw: unknown): GithubReleaseInfo[] {
  if (!Array.isArray(raw)) return [];
  const out: GithubReleaseInfo[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const tag = typeof o.tag === "string" ? o.tag.trim() : "";
    if (!tag) continue;
    const assets: GithubReleaseAsset[] = [];
    if (Array.isArray(o.assets)) {
      for (const a of o.assets) {
        if (!a || typeof a !== "object") continue;
        const ar = a as Record<string, unknown>;
        const name = typeof ar.name === "string" ? ar.name.trim() : "";
        const url = typeof ar.url === "string" ? ar.url.trim() : "";
        if (name && url) assets.push({ name, url });
      }
    }
    const title =
      typeof o.title === "string" && o.title.trim() ? o.title.trim() : tag;
    const publishedAt =
      typeof o.publishedAt === "string" && o.publishedAt.trim()
        ? o.publishedAt.trim()
        : undefined;
    const body =
      typeof o.body === "string" && o.body.trim() ? o.body.trim() : undefined;
    const dockerImageOverride =
      typeof o.dockerImageOverride === "string" && o.dockerImageOverride.trim()
        ? o.dockerImageOverride.trim()
        : undefined;
    out.push({ tag, title, htmlUrl: "", publishedAt, body, assets, dockerImageOverride });
  }
  return out;
}
