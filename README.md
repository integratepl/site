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

- **Feature branches** (`push`, wszystko poza `main`): `.github/workflows/branch-ci.yml` — `npm run check` + `npm run build` (bez deployu).
- **`main`**: `.github/workflows/deploy.yml` — ten sam check + build, potem **GitHub Pages**.

## Deploy

Push to `main`: workflow **Deploy site** publikuje na **GitHub Pages**. W repozytorium: **Settings → Pages → Source: GitHub Actions**.

Zalecane: **Settings → Branches** → ochrona `main` z wymaganym statusem joba **`build`** w workflowu **Deploy site**.
