/** GitHub Releases at build time (REST API, paginated). */

import type { GithubReleaseAsset, GithubReleaseInfo } from "../data/home";

const GH_API = "https://api.github.com";

type GhAsset = { name: string; browser_download_url: string };

type GhRelease = {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  body?: string | null;
  draft: boolean;
  assets: GhAsset[];
};

export type GithubReleasesBundle = {
  /** e.g. https://github.com/owner/repo/releases */
  releasesPageUrl: string;
  releases: GithubReleaseInfo[];
};

export function parseGithubOwnerRepo(raw: string | null | undefined): { owner: string; repo: string } | null {
  const m = raw?.trim().match(/^([^/\s]+)\/([^/\s]+)$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

/** Default GHCR repository for packages published from `owner/repo` (same path as on github.com). */
export function defaultGhcrImageBase(githubRepo: string | null | undefined): string | undefined {
  const p = parseGithubOwnerRepo(githubRepo);
  return p ? `ghcr.io/${p.owner}/${p.repo}` : undefined;
}

/** Per-tag release page on github.com (same pattern GitHub uses for release assets). */
export function githubReleaseTagPageUrl(owner: string, repo: string, tag: string): string {
  return `https://github.com/${owner}/${repo}/releases/tag/${encodeURIComponent(tag)}`;
}

/**
 * Set `htmlUrl` and `dockerImage` from `githubRepo` + each release’s tag.
 * When `githubRepo` is invalid, strip computed `dockerImage` only and keep existing `htmlUrl` (e.g. from the API).
 */
export function applyGithubRepoDerivedFields(
  releases: GithubReleaseInfo[],
  githubRepo: string | null | undefined
): GithubReleaseInfo[] {
  const p = parseGithubOwnerRepo(githubRepo);
  if (!p) {
    return releases.map(({ dockerImage: _d, ...rest }) => rest);
  }
  const { owner, repo } = p;
  const base = `ghcr.io/${owner}/${repo}`;
  return releases.map((r) => ({
    ...r,
    htmlUrl: githubReleaseTagPageUrl(owner, repo, r.tag),
    dockerImage: base
  }));
}

function releasesIndexPage(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}/releases`;
}

/** Public releases index URL for owner/repo, or undefined if repo string is invalid. */
export function releasesPageUrlForRepo(githubRepo: string | null | undefined): string | undefined {
  const p = parseGithubOwnerRepo(githubRepo);
  return p ? releasesIndexPage(p.owner, p.repo) : undefined;
}

function nextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(",")) {
    const m = part.trim().match(/^<([^>]+)>;\s*rel="next"/);
    if (m) return m[1];
  }
  return null;
}

function mapRelease(r: GhRelease): GithubReleaseInfo {
  const assets: GithubReleaseAsset[] = (Array.isArray(r.assets) ? r.assets : [])
    .filter((a) => a.browser_download_url?.trim() && a.name?.trim())
    .map((a) => ({
      name: a.name.trim(),
      url: a.browser_download_url.trim()
    }));

  const body = r.body?.trim();
  return {
    tag: r.tag_name?.trim() || "release",
    title: (r.name?.trim() || r.tag_name?.trim() || "Release").trim(),
    htmlUrl: r.html_url.trim(),
    publishedAt: r.published_at?.trim() || undefined,
    body: body ? body : undefined,
    assets
  };
}

const MAX_PAGES = 25;

/** In `astro dev`, avoid hammering the API on every homepage refresh (rate limit). */
const devCacheTtlMs = 5 * 60 * 1000;
const devFetchCache = new Map<string, { expires: number; data: GithubReleasesBundle }>();

export async function fetchAllReleases(
  githubRepo: string | null | undefined,
  token?: string | null
): Promise<GithubReleasesBundle | null> {
  const parsed = parseGithubOwnerRepo(githubRepo);
  if (!parsed) return null;

  const { owner, repo } = parsed;
  const t = token?.trim();
  const cacheKey = owner + "/" + repo + ":" + (t ? "auth" : "anon");

  if (import.meta.env.DEV) {
    const hit = devFetchCache.get(cacheKey);
    if (hit && hit.expires > Date.now()) return hit.data;
  }

  const fallback: GithubReleasesBundle = {
    releasesPageUrl: releasesIndexPage(owner, repo),
    releases: []
  };

  function memo(bundle: GithubReleasesBundle): GithubReleasesBundle {
    if (import.meta.env.DEV) {
      devFetchCache.set(cacheKey, { expires: Date.now() + devCacheTtlMs, data: bundle });
    }
    return bundle;
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "integrate-site-build"
  };
  if (t) headers.Authorization = "Bearer " + t;

  const collected: GhRelease[] = [];
  let url: string | null = `${GH_API}/repos/${owner}/${repo}/releases?per_page=100`;
  let pages = 0;

  while (url && pages < MAX_PAGES) {
    let res: Response;
    try {
      res = await fetch(url, { headers });
    } catch (e) {
      console.warn(`[github-releases] fetch failed for ${owner}/${repo}:`, e);
      return memo(fallback);
    }

    if (res.status === 404) {
      return memo(fallback);
    }
    if (!res.ok) {
      const hint =
        res.status === 403
          ? " — set GITHUB_TOKEN or GH_TOKEN for higher limits (unauthenticated ~60 req/h per IP)."
          : "";
      console.warn(`[github-releases] ${owner}/${repo}: HTTP ${res.status} ${res.statusText}${hint}`);
      return memo(fallback);
    }

    let batch: unknown;
    try {
      batch = await res.json();
    } catch {
      console.warn(`[github-releases] ${owner}/${repo}: invalid JSON`);
      return memo(fallback);
    }

    if (!Array.isArray(batch)) {
      console.warn(`[github-releases] ${owner}/${repo}: expected array`);
      return memo(fallback);
    }

    collected.push(...(batch as GhRelease[]));
    pages++;
    url = nextPageUrl(res.headers.get("link"));
  }

  const releases = collected
    .filter((r) => !r.draft)
    .map(mapRelease);

  return memo({
    releasesPageUrl: releasesIndexPage(owner, repo),
    releases
  });
}
