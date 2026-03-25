/** GitHub API token from the environment (CI, local dev sync, build-time fetch). */
export function githubTokenFromEnv(): string | undefined {
  const t = process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim();
  return t || undefined;
}
