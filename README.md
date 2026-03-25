# integrate-site

Static site for [integrate.pl](https://integrate.pl) (Astro).

## Requirements

- Node.js **22** (LTS) and npm

## Commands

```bash
npm ci          # install (CI-style; needs package-lock.json)
npm run dev     # local dev server (hot reload)
npm run check   # Astro/TypeScript checks
npm run build   # production build → dist/
npm run preview # serve dist/ locally
```

## Where things live

| Path | Role |
|------|------|
| `src/pages/` | Routes (`index.astro` = homepage) |
| `src/layouts/` | HTML shell, global `<head>` |
| `src/components/home/` | Homepage sections |
| `src/data/home.ts` | Copy and structured content |
| `src/styles/` | CSS tokens + page modules |
| `src/scripts/` | Client JS (map, modal) |
| `public/` | Static files as-is (`robots.txt`, `CNAME`, …) |

SEO (meta, JSON-LD) is wired from `src/pages/index.astro` + `src/lib/seo-jsonld.ts`. Site URL: `astro.config.mjs` → `site`.

## CI

- **Non-`main` branches** (on `push`): `.github/workflows/branch-ci.yml` runs `npm run check` and `npm run build` (no deploy).
- **`main`** (on `push`): `.github/workflows/deploy.yml` runs the same checks, then publishes to **GitHub Pages**.

## Deploy

Pushing to `main` runs **Deploy site**, which publishes to **GitHub Pages**. In the repo: **Settings → Pages → Source: GitHub Actions**.

Recommended: **Settings → Branches** → protect `main` and require the **`build`** job from **Deploy site** to pass before merging.
