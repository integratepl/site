import { ActionButton } from "@keystar/ui/button";
import { useCallback, useMemo, useState } from "react";

function parseProjectFolderSlug(pathname: string): string | null {
  const m = pathname.match(/\/collection\/projects\/item\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

const API = "/api/dev-sync-github-releases";

/**
 * Keystatic form field with no YAML footprint (same idea as `fields.empty`):
 * runs the dev server sync endpoint for the current project entry.
 */
export function githubSyncReleasesButtonField() {
  return {
    kind: "form" as const,
    label: "Sync from GitHub",
    Input: function GithubSyncReleasesInput() {
      const slug = useMemo(() => parseProjectFolderSlug(window.location.pathname), []);
      const [status, setStatus] = useState("");
      const [busy, setBusy] = useState(false);

      const run = useCallback(async () => {
        if (!slug) {
          setStatus("Open a project entry (edit view) to sync.");
          return;
        }
        setBusy(true);
        setStatus("");
        try {
          const r = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug })
          });
          const data = (await r.json()) as {
            ok?: boolean;
            error?: string;
            releaseCount?: number;
          };
          if (!r.ok || !data.ok) {
            setStatus(data.error ?? "Sync failed.");
          } else {
            setStatus(
              "Synced " + String(data.releaseCount ?? 0) + " releases. Reload the page."
            );
          }
        } catch (e) {
          setStatus(e instanceof Error ? e.message : String(e));
        } finally {
          setBusy(false);
        }
      }, [slug]);

      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            alignItems: "center",
            marginBottom: "0.35rem"
          }}
        >
          <ActionButton
            alignSelf="start"
            isDisabled={busy}
            type="button"
            onPress={() => {
              void run();
            }}
          >
            {busy ? "Syncing…" : "Sync releases"}
          </ActionButton>
          {status ? (
            <span style={{ fontSize: "0.9em", opacity: 0.9 }}>{status}</span>
          ) : null}
        </div>
      );
    },
    defaultValue: () => null,
    parse: () => null,
    serialize: () => ({ value: undefined }),
    validate: (value: null) => value,
    reader: {
      parse() {
        return null;
      }
    }
  };
}
