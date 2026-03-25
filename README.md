# integrate-site

Static site for [integrate.pl](https://integrate.pl) (Astro).

## Requirements

- Node.js **22** (LTS) and npm

## Commands

```bash
npm ci          # install (CI-style; needs package-lock.json)
npm run dev     # local dev server; CMS UI at http://127.0.0.1:4321/keystatic
npm run check   # Astro/TypeScript checks
npm run build   # production build → dist/ (use CI=true locally — see below)
npm run preview # serve dist/ locally
```

### Content (Keystatic)

- Editable copy lives in **`content/`** at the repo root (YAML), not in `src/data/home.ts`.
- **Locally:** run `npm run dev` and open **`/keystatic`** to edit **News** (list), **Projects**, **Contact**, and **FAQ** singletons.
- **CI / static hosting:** the GitHub Actions workflows set `CI=true` so the build stays **fully static** (no Keystatic SSR routes). The site is generated from the committed files in `content/` via `src/lib/site-content.ts`.
- To run the same static build on your machine: `CI=true npm run build`.
- To skip Keystatic UI in dev (rare): `DISABLE_KEYSTATIC=1 npm run dev`.

Types for projects, news, etc. remain in **`src/data/home.ts`** (types only).

## Where things live

| Path | Role |
|------|------|
| `content/` | Keystatic-managed YAML (projects, singletons) |
| `keystatic.config.ts` | Keystatic schema + storage (`local`) |
| `src/lib/site-content.ts` | Loads `content/` at build time (reader API) |
| `src/pages/` | Routes (`index.astro` = homepage) |
| `src/layouts/` | HTML shell, global `<head>` |
| `src/components/home/` | Homepage sections |
| `src/data/home.ts` | TypeScript types only (no copy) |
| `src/styles/` | CSS tokens + page modules |
| `src/scripts/` | Client JS (map, modal) |
| `public/` | Static files as-is (`robots.txt`, `CNAME`, …) |

SEO (meta, JSON-LD) is wired from `src/pages/index.astro` + `src/lib/seo-jsonld.ts`. Site URL: `astro.config.mjs` → `site`.

## CI

- **Non-`main` branches** (on `push`): `.github/workflows/branch-ci.yml` runs `npm run check` and `npm run build` with `CI=true` (no deploy).
- **`main`** (on `push`): `.github/workflows/deploy.yml` runs the same checks, then publishes to **GitHub Pages**.

## Deploy

Pushing to `main` runs **Deploy site**, which publishes to **GitHub Pages**. In the repo: **Settings → Pages → Source: GitHub Actions**.

Recommended: **Settings → Branches** → protect `main` and require the **`build`** job from **Deploy site** to pass before merging.
