import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { defaultGhcrImageBase, githubReleaseTagPageUrl } from "../lib/github-releases";

function labelForInput(input: Element, root: Element): string {
  const id = input.getAttribute("id");
  if (id && typeof CSS !== "undefined" && CSS.escape) {
    const lab = root.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (lab?.textContent) return lab.textContent.trim();
  }
  const wrap = input.parentElement;
  const prev = wrap?.previousElementSibling;
  if (prev?.textContent) return prev.textContent.trim();
  return "";
}

function findGitHubRepoInForm(formRoot: Element): string {
  for (const input of formRoot.querySelectorAll("input, textarea")) {
    const lab = labelForInput(input, formRoot);
    if (lab.includes("GitHub repo")) {
      return (input as HTMLInputElement | HTMLTextAreaElement).value.trim();
    }
  }
  return "";
}

function findGitTagBeforeHost(host: HTMLElement): string {
  let block: HTMLElement | null = host.parentElement;
  while (block) {
    const tree = block.querySelectorAll("*");
    const hostIdx = [...tree].indexOf(host);
    if (hostIdx !== -1) {
      const inputs = [...block.querySelectorAll("input, textarea")].filter((el) => {
        const i = [...tree].indexOf(el);
        return i !== -1 && i < hostIdx;
      });
      for (let k = inputs.length - 1; k >= 0; k--) {
        const input = inputs[k];
        const lab = labelForInput(input, block);
        if (lab.startsWith("Git tag")) {
          return (input as HTMLInputElement | HTMLTextAreaElement).value.trim();
        }
      }
    }
    block = block.parentElement;
  }
  return "";
}

type PreviewState =
  | { kind: "ok"; releaseUrl: string; dockerLine: string }
  | { kind: "hint"; message: string };

export function releaseDerivedUrlsPreviewField() {
  return {
    kind: "form" as const,
    label: "Release page and Docker (read-only)",
    description:
      "Derived from GitHub repo (project) and Git tag (this row). Used on the site unless you set a Docker override below.",
    Input: function ReleaseDerivedUrlsPreviewInput() {
      const ref = useRef<HTMLDivElement>(null);
      const [state, setState] = useState<PreviewState>({ kind: "hint", message: "—" });

      useEffect(() => {
        const tick = () => {
          const host = ref.current;
          const formRoot = host?.closest("form") ?? document.querySelector("main");
          if (!host || !formRoot) {
            setState({ kind: "hint", message: "—" });
            return;
          }
          const repoRaw = findGitHubRepoInForm(formRoot);
          const tag = findGitTagBeforeHost(host);
          const parsed = repoRaw.match(/^([^/\s]+)\/([^/\s]+)$/);
          if (!repoRaw) {
            setState({ kind: "hint", message: "—" });
            return;
          }
          if (!parsed) {
            setState({ kind: "hint", message: "Invalid GitHub repo (expected owner/repo)." });
            return;
          }
          if (!tag) {
            setState({ kind: "hint", message: "Set Git tag on this row." });
            return;
          }
          const owner = parsed[1]!;
          const repo = parsed[2]!;
          const base = defaultGhcrImageBase(repoRaw);
          setState({
            kind: "ok",
            releaseUrl: githubReleaseTagPageUrl(owner, repo, tag),
            dockerLine: base ? `docker pull ${base}:${tag}` : "docker pull —"
          });
        };

        tick();
        const id = window.setInterval(tick, 400);
        return () => window.clearInterval(id);
      }, []);

      const boxStyle: CSSProperties = {
        padding: "0.55rem 0.65rem",
        borderRadius: 6,
        background: "var(--color-surface-secondary, rgba(0, 0, 0, 0.055))",
        color: "var(--color-text-secondary, #5c5c5c)",
        fontSize: "0.8125rem",
        lineHeight: 1.45,
        marginBottom: "0.35rem"
      };

      const mono: CSSProperties = {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        wordBreak: "break-all"
      };

      return (
        <div ref={ref} style={boxStyle}>
          {state.kind === "hint" ? (
            state.message
          ) : (
            <>
              <div style={{ marginBottom: "0.45rem" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.2rem", color: "inherit" }}>Release page</div>
                <div style={mono}>{state.releaseUrl}</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.2rem", color: "inherit" }}>Docker pull</div>
                <div style={mono}>{state.dockerLine}</div>
              </div>
            </>
          )}
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
