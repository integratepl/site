import { collection, config, fields, singleton } from "@keystatic/core";
import { githubSyncReleasesButtonField } from "./src/keystatic/github-sync-releases-button-field";
import { releaseDerivedUrlsPreviewField } from "./src/keystatic/release-derived-urls-preview-field";

export default config({
  storage: {
    kind: "local"
  },
  singletons: {
    contact: singleton({
      label: "Contact",
      path: "content/singletons/contact/",
      schema: {
        email: fields.text({ label: "Contact email" }),
        company: fields.text({ label: "Company name" }),
        lines: fields.array(fields.text({ label: "Line" }), {
          label: "Meta lines (address, tagline, …)",
          itemLabel: (props) => props.value ?? "Line"
        }),
        mapLat: fields.number({ label: "Map latitude" }),
        mapLng: fields.number({ label: "Map longitude" }),
        mapZoom: fields.number({ label: "Map zoom" })
      }
    }),
    faq: singleton({
      label: "FAQ",
      path: "content/singletons/faq/",
      schema: {
        modalTitle: fields.text({ label: "Modal title" }),
        items: fields.array(
          fields.object({
            question: fields.text({ label: "Question" }),
            answer: fields.text({ label: "Answer", multiline: true })
          }),
          {
            label: "Questions & answers",
            itemLabel: (props) => props.fields.question.value ?? "Item"
          }
        )
      }
    })
  },
  collections: {
    news: collection({
      label: "News",
      slugField: "slug",
      path: "content/news/*/",
      columns: ["title", "sortOrder"],
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        sortOrder: fields.number({
          label: "Order",
          description: "Lower numbers appear first (newest / top of the list)."
        }),
        title: fields.text({ label: "Title" }),
        teaser: fields.text({ label: "Teaser", multiline: true }),
        content: fields.text({ label: "Body", multiline: true })
      }
    }),
    projects: collection({
      label: "Projects",
      slugField: "slug",
      path: "content/projects/*/",
      columns: ["kind", "sortOrder"],
      schema: {
        slug: fields.slug({
          name: {
            label: "Card title",
            description:
              "Shown on the homepage (can differ from the id below, e.g. “Modbus2Hue” vs modbus2hue)."
          },
          slug: {
            label: "Id (URL slug)",
            description:
              "Stable id — must match the content folder name. Used for anchors and the project modal."
          }
        }),
        sortOrder: fields.number({
          label: "Order",
          description: "Lower numbers appear first on the homepage."
        }),
        kind: fields.text({ label: "Kind" }),
        description: fields.text({ label: "Description", multiline: true }),
        githubRepo: fields.text({
          label: "GitHub repo (releases)",
          description:
            "owner/repo (e.g. integratepl/modbus2hue). On the site, each release link and default Docker line are derived as `github.com/owner/repo/releases/tag/<tag>` and `ghcr.io/owner/repo:<tag>`. Sync below or `npm run sync:github-releases`."
        }),
        syncGithubReleases: githubSyncReleasesButtonField(),
        releasesFromGithub: fields.array(
          fields.object({
            tag: fields.text({ label: "Git tag" }),
            derivedUrlsPreview: releaseDerivedUrlsPreviewField(),
            title: fields.text({ label: "Title" }),
            publishedAt: fields.text({ label: "Published at (ISO)", description: "Optional." }),
            body: fields.text({
              label: "Release notes",
              multiline: true,
              description: "GitHub release body (Markdown)."
            }),
            assets: fields.array(
              fields.object({
                name: fields.text({ label: "File name" }),
                url: fields.text({ label: "Download URL" })
              }),
              {
                label: "Assets",
                itemLabel: (props) => props.fields.name.value ?? "file"
              }
            ),
            dockerImageOverride: fields.text({
              label: "Docker image override (optional)",
              description:
                "Full image reference for `docker pull` for this release only (e.g. `docker.io/myorg/other:tag`). Leave empty to use the default Docker line in the read-only block above."
            })
          }),
          {
            label: "Releases (from GitHub)",
            description:
              "Populated by sync (button above or `npm run sync:github-releases`). Tags, assets, and notes mirror the API for editing context in Keystatic.",
            itemLabel: (props) => props.fields.tag.value ?? "Release"
          }
        ),
        licensePrice: fields.text({ label: "License note (optional)" })
      }
    })
  }
});
