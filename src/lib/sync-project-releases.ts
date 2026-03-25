import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { fetchAllReleases } from "./github-releases";

export type SyncProjectReleasesResult = {
  releaseCount: number;
};

type YamlDoc = Record<string, unknown>;

/**
 * Refresh `releasesFromGithub` in `content/projects/<folderSlug>/index.yaml`
 * from the GitHub API (same shape as `npm run sync:github-releases`).
 */
export async function syncProjectReleasesForSlug(
  root: string,
  folderSlug: string,
  token?: string
): Promise<SyncProjectReleasesResult> {
  const indexPath = join(root, "content", "projects", folderSlug, "index.yaml");
  let text: string;
  try {
    text = await readFile(indexPath, "utf8");
  } catch {
    throw new Error("Missing content/projects/" + folderSlug + "/index.yaml");
  }

  const doc = (parseYaml(text) as YamlDoc) ?? {};
  const repo = typeof doc.githubRepo === "string" ? doc.githubRepo.trim() : "";
  if (!repo) {
    doc.releasesFromGithub = [];
    delete doc.dockerImage;
    await writeFile(indexPath, stringifyYaml(doc, { lineWidth: 0 }) + "\n", "utf8");
    return { releaseCount: 0 };
  }

  const bundle = await fetchAllReleases(repo, token);
  const rels = bundle?.releases ?? [];

  const overrideByTag = new Map<string, string>();
  const prev = doc.releasesFromGithub;
  if (Array.isArray(prev)) {
    for (const row of prev) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const tag = typeof o.tag === "string" ? o.tag.trim() : "";
      const ov = typeof o.dockerImageOverride === "string" ? o.dockerImageOverride.trim() : "";
      if (tag && ov) overrideByTag.set(tag, ov);
    }
  }

  doc.releasesFromGithub = rels.map((r) => {
    const row: Record<string, unknown> = {
      tag: r.tag,
      title: r.title,
      publishedAt: r.publishedAt ?? "",
      body: r.body ?? "",
      assets: r.assets.map((a) => ({ name: a.name, url: a.url }))
    };
    const keptOv = overrideByTag.get(r.tag);
    if (keptOv) row.dockerImageOverride = keptOv;
    return row;
  });

  delete doc.dockerImage;

  await writeFile(indexPath, stringifyYaml(doc, { lineWidth: 0 }) + "\n", "utf8");
  return { releaseCount: rels.length };
}
