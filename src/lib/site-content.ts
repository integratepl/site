import { createReader } from "@keystatic/core/reader";
import type { ContactMap, ContactMeta, FaqItem, LatestNews, Project } from "../data/home";
import keystaticConfig from "../../keystatic.config";
import { applyGithubRepoDerivedFields, fetchAllReleases, releasesPageUrlForRepo } from "./github-releases";
import { githubTokenFromEnv } from "./gh-env";
import { githubReleasesFromCache } from "./releases-cache";

const reader = createReader(process.cwd(), keystaticConfig);

function optText(value: string | null | undefined): string | undefined {
  const t = value?.trim();
  return t ? t : undefined;
}

function projectDisplayName(slugField: unknown, collectionSlug: string): string {
  if (slugField && typeof slugField === "object") {
    const o = slugField as { name?: unknown; slug?: unknown };
    const n = typeof o.name === "string" ? o.name.trim() : "";
    if (n) return n;
    const s = typeof o.slug === "string" ? o.slug.trim() : "";
    if (s) return s;
  }
  if (typeof slugField === "string" && slugField.trim()) return slugField.trim();
  return collectionSlug;
}

/** Homepage + JSON-LD */
export async function getProjects(): Promise<Project[]> {
  const rows = await reader.collections.projects.all();
  const token = githubTokenFromEnv();

  const enriched = await Promise.all(
    rows.map(async ({ slug: collectionSlug, entry }) => {
      const cached = githubReleasesFromCache(entry.releasesFromGithub);
      let releases = cached;
      let releaseUrl = releasesPageUrlForRepo(entry.githubRepo);
      if (cached.length === 0) {
        const fromGh = await fetchAllReleases(entry.githubRepo, token);
        if (fromGh?.releases.length) {
          releases = fromGh.releases;
        }
        releaseUrl = fromGh?.releasesPageUrl ?? releaseUrl;
      }

      releases = applyGithubRepoDerivedFields(releases, entry.githubRepo);

      const project: Project = {
        slug: collectionSlug,
        name: projectDisplayName(entry.slug, collectionSlug),
        kind: entry.kind,
        description: entry.description,
        releaseUrl,
        licensePrice: optText(entry.licensePrice)
      };
      if (releases.length) {
        project.githubReleases = releases;
      }
      return { order: entry.sortOrder ?? 999, project };
    })
  );

  return enriched.sort((a, b) => a.order - b.order).map(({ project }) => project);
}

export async function getNews(): Promise<LatestNews[]> {
  const rows = await reader.collections.news.all();
  return rows
    .map(({ slug, entry }) => ({
      order: entry.sortOrder ?? 999,
      item: {
        slug,
        title: entry.title,
        teaser: entry.teaser,
        content: entry.content?.trim() ?? ""
      } satisfies LatestNews
    }))
    .sort((a, b) => a.order - b.order)
    .map(({ item }) => item);
}

export async function getContactEmail(): Promise<string> {
  const data = await reader.singletons.contact.read();
  if (!data?.email?.trim()) {
    throw new Error("Keystatic singleton contact.email is missing");
  }
  return data.email.trim();
}

export async function getContactMeta(): Promise<ContactMeta> {
  const data = await reader.singletons.contact.read();
  if (!data) {
    throw new Error("Keystatic singleton contact is missing");
  }
  return {
    company: data.company,
    lines: data.lines.filter((l): l is string => Boolean(l?.trim()))
  };
}

export async function getContactMap(): Promise<ContactMap> {
  const data = await reader.singletons.contact.read();
  if (!data) {
    throw new Error("Keystatic singleton contact is missing");
  }
  return {
    lat: data.mapLat ?? 51.53194,
    lng: data.mapLng ?? 17.27548,
    zoom: data.mapZoom ?? 13.5
  };
}

export async function getFaq(): Promise<{ modalTitle: string; items: FaqItem[] }> {
  const data = await reader.singletons.faq.read();
  if (!data) {
    throw new Error("Keystatic singleton faq is missing");
  }
  return {
    modalTitle: data.modalTitle,
    items: data.items.map((row) => ({
      question: row.question,
      answer: row.answer
    }))
  };
}
