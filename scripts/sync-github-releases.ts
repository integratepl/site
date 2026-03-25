import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { syncProjectReleasesForSlug } from "../src/lib/sync-project-releases";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectsDir = join(root, "content", "projects");
const token = process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim() || undefined;

async function main(): Promise<void> {
  const entries = await readdir(projectsDir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    try {
      const { releaseCount } = await syncProjectReleasesForSlug(root, ent.name, token);
      process.stdout.write(ent.name + ": " + String(releaseCount) + " releases\n");
    } catch {
      continue;
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
