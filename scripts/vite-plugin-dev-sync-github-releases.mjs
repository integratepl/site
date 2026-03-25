import path from "node:path";

/** Dev-only: POST /api/dev-sync-github-releases { slug } → updates project index.yaml */
export function devSyncGithubReleasesPlugin() {
  return {
    name: "dev-sync-github-releases",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        if (pathname !== "/api/dev-sync-github-releases" || req.method !== "POST") {
          return next();
        }

        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString("utf8");
        let slug = "";
        try {
          const body = JSON.parse(raw || "{}");
          slug = typeof body.slug === "string" ? body.slug.trim() : "";
        } catch {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
          return;
        }

        if (!slug || !/^[a-zA-Z0-9._-]+$/.test(slug)) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: "Missing or invalid slug" }));
          return;
        }

        try {
          const modPath = path.join(server.config.root, "src/lib/sync-project-releases.ts");
          const mod = await server.ssrLoadModule(modPath);
          const ghEnvPath = path.join(server.config.root, "src/lib/gh-env.ts");
          const { githubTokenFromEnv } = await server.ssrLoadModule(ghEnvPath);
          const token = githubTokenFromEnv();
          const result = await mod.syncProjectReleasesForSlug(server.config.root, slug, token);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, releaseCount: result.releaseCount }));
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: message }));
        }
      });
    }
  };
}
