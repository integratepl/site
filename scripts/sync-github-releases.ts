import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { githubTokenFromEnv } from "../src/lib/gh-env";
import { syncProjectReleasesForSlug } from "../src/lib/sync-project-releases";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectsDir = join(root, "content", "projects");
const token = githubTokenFromEnv();

async function main(): Promise<void> {
  /** When set, sync errors do not fail the process (local dev); CI omits this flag. */
  const continueOnError = process.argv.includes("--continue");
  const failures: { slug: string; message: string }[] = [];

  const entries = await readdir(projectsDir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    try {
      const { releaseCount } = await syncProjectReleasesForSlug(root, ent.name, token);
      process.stdout.write(ent.name + ": " + String(releaseCount) + " releases\n");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`sync-github-releases: ${ent.name}: ${message}`);
      failures.push({ slug: ent.name, message });
    }
  }

  if (failures.length > 0 && !continueOnError) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
