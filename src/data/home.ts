/** Shared content types (copy lives in `content/` at repo root; edit via Keystatic UI at `/keystatic`). */

export type GithubReleaseAsset = {
  name: string;
  url: string;
};

/** One published GitHub release (drafts excluded); from API, cache, or `releasesFromGithub` in CMS. */
export type GithubReleaseInfo = {
  tag: string;
  title: string;
  /** Filled at build: `https://github.com/owner/repo/releases/tag/<tag>` when GitHub repo is valid. */
  htmlUrl: string;
  /** ISO 8601 from GitHub API */
  publishedAt?: string;
  /** GitHub release body (Markdown); shown in the project modal. */
  body?: string;
  assets: GithubReleaseAsset[];
  /**
   * Computed at build: `ghcr.io/<owner>/<repo>` from the project GitHub repo; paired with this row’s git tag on the site.
   */
  dockerImage?: string;
  /** Optional full `image:tag` (or registry path) when the default GHCR line must not be used. */
  dockerImageOverride?: string;
};

export type Project = {
  /** Content folder id / Keystatic entry key; `data-project` and fragment links. */
  slug: string;
  /** Homepage card heading (from Keystatic slug field “Card title”). */
  name: string;
  kind: string;
  description: string;
  /** Set at build from `githubRepo` (GitHub releases index). */
  releaseUrl?: string;
  /** All non-draft releases + assets from GitHub when `githubRepo` is set (build time). */
  githubReleases?: GithubReleaseInfo[];
  /** Omit when the project is not offered for sale (license section hidden in modal). */
  licensePrice?: string;
};

export type LatestNews = {
  /** Keystatic slug; used for modal wiring */
  slug: string;
  title: string;
  teaser: string;
  /** Full article body (line breaks preserved in the modal). */
  content: string;
};

export type ContactMeta = { company: string; lines: string[] };

export type ContactMap = { lat: number; lng: number; zoom: number };

export type FaqItem = {
  question: string;
  answer: string;
};
