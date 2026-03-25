import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { GithubReleaseInfo } from "../data/home";
import { closeDialogOnBackdropPointer } from "./dialog-backdrop-close";

type NewsModalEntry = {
  slug: string;
  title: string;
  content: string;
};

function wireNewsModal(): void {
  const dataEl = document.getElementById("latest-news-modal-data");
  const newsModal = document.querySelector("#latest-news-modal");
  if (!dataEl?.textContent?.trim() || !(newsModal instanceof HTMLDialogElement)) return;

  let entries: NewsModalEntry[];
  try {
    entries = JSON.parse(dataEl.textContent) as NewsModalEntry[];
  } catch {
    return;
  }
  if (entries.length === 0) return;

  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const titleEl = document.getElementById("latest-news-modal-title");
  const contentEl = document.getElementById("latest-news-modal-content");
  const closeBtn = newsModal.querySelector(".news-close");

  if (!titleEl || !contentEl || !(closeBtn instanceof HTMLButtonElement)) return;

  const dlg: HTMLDialogElement = newsModal;
  const elTitle = titleEl;
  const elContent = contentEl;

  function openFor(slug: string): void {
    const item = bySlug.get(slug);
    if (!item) return;
    elTitle.textContent = item.title;
    elContent.replaceChildren();
    const p = document.createElement("p");
    p.className = "news-modal-body";
    p.textContent = item.content;
    elContent.appendChild(p);
    dlg.showModal();
  }

  document.querySelectorAll(".news-trigger[data-news-slug]").forEach((btn) => {
    const slug = btn.getAttribute("data-news-slug");
    if (!slug || !(btn instanceof HTMLButtonElement)) return;
    btn.addEventListener("click", () => openFor(slug));
    btn.addEventListener("keydown", (e) => {
      if (!(e instanceof KeyboardEvent)) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFor(slug);
      }
    });
  });

  closeBtn.addEventListener("click", () => dlg.close());
  closeDialogOnBackdropPointer(dlg);
}

wireNewsModal();

/** Bump when the tile URL or map behavior changes so a full reload picks up the new layer */
const CONTACT_MAP_REV = "map-local-leaflet-10";

async function initContactMap(): Promise<void> {
  const el = document.getElementById("contact-map-host");
  if (!el || el.dataset.contactMapRev === CONTACT_MAP_REV) return;

  const lat = Number.parseFloat(el.dataset.lat ?? "51.53194");
  const lng = Number.parseFloat(el.dataset.lng ?? "17.27548");
  const zoom = Number.parseFloat(el.dataset.zoom ?? "13.5");

  const map = L.map(el, {
    zoomControl: false,
    attributionControl: true,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false,
    zoomSnap: 0.25
  });

  map.attributionControl.setPrefix("");
  map.setView([lat, lng], zoom);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
    detectRetina: false
  }).addTo(map);

  el.dataset.contactMapRev = CONTACT_MAP_REV;

  map.whenReady(() => {
    map.invalidateSize();
    [80, 250, 700].forEach((ms) => setTimeout(() => map.invalidateSize(), ms));
  });

  const ro = new ResizeObserver(() => map.invalidateSize());
  ro.observe(el);
}

void initContactMap();

type ProjectModalEntry = {
  slug: string;
  name: string;
  kind: string;
  description: string;
  releaseUrl: string | null;
  githubReleases: GithubReleaseInfo[] | null;
  licensePrice: string | null;
};

function formatReleaseDate(iso: string | undefined): string | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** Split `registry/ns/image:tag` on the last `:` after the last `/` (GHCR-style refs). */
function splitDockerImageRef(ref: string): { base: string; tag: string } {
  const t = ref.trim();
  const slashIdx = t.lastIndexOf("/");
  const colonIdx = t.lastIndexOf(":");
  if (colonIdx > slashIdx && colonIdx !== -1) {
    return { base: t.slice(0, colonIdx), tag: t.slice(colonIdx + 1) };
  }
  return { base: t, tag: "latest" };
}

function populateVersionSelect(select: HTMLSelectElement, releases: GithubReleaseInfo[]): void {
  select.replaceChildren();
  const optLatest = document.createElement("option");
  optLatest.value = "__latest__";
  optLatest.textContent = `Latest (default) — ${releases[0]?.tag ?? "—"}`;
  select.appendChild(optLatest);
  for (const r of releases) {
    const opt = document.createElement("option");
    opt.value = r.tag;
    opt.textContent = r.title.trim() === r.tag.trim() ? r.tag : `${r.tag} — ${r.title}`;
    select.appendChild(opt);
  }
  select.value = "__latest__";
}

function resolveSelectedRelease(
  releases: GithubReleaseInfo[],
  selectValue: string
): { rel: GithubReleaseInfo; dockerTag: string } {
  if (selectValue === "__latest__") {
    const rel = releases[0];
    return { rel, dockerTag: rel.tag };
  }
  const found = releases.find((r) => r.tag === selectValue);
  if (found) {
    return { rel: found, dockerTag: found.tag };
  }
  const rel = releases[0];
  return { rel, dockerTag: rel.tag };
}

function renderSelectedReleaseHead(
  container: HTMLElement,
  rel: GithubReleaseInfo,
  releaseUrl: string | null
): void {
  container.replaceChildren();
  const hub = releaseUrl?.trim();

  const head = document.createElement("div");
  head.className = "project-modal-release-head";

  const dateStr = formatReleaseDate(rel.publishedAt);
  if (dateStr) {
    const time = document.createElement("time");
    time.className = "project-modal-release-date";
    if (rel.publishedAt) time.dateTime = rel.publishedAt;
    time.textContent = dateStr;
    head.appendChild(time);
  }

  const titleA = document.createElement("a");
  titleA.className = "project-modal-release-title";
  titleA.href = rel.htmlUrl?.trim() || hub || "#";
  titleA.target = "_blank";
  titleA.rel = "noopener noreferrer";
  titleA.textContent = rel.title;
  head.appendChild(titleA);
  container.appendChild(head);
  container.hidden = false;
}

function renderReleaseAssets(root: HTMLElement, rel: GithubReleaseInfo): void {
  root.replaceChildren();

  if (rel.assets.length === 0) {
    const empty = document.createElement("p");
    empty.className = "project-modal-release-empty";
    empty.textContent = "No downloadable assets in this release.";
    root.appendChild(empty);
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "project-modal-release-assets";
  for (const asset of rel.assets) {
    const li = document.createElement("li");
    const aa = document.createElement("a");
    aa.className = "project-modal-link";
    aa.href = asset.url;
    aa.target = "_blank";
    aa.rel = "noopener noreferrer";
    aa.textContent = asset.name;
    li.appendChild(aa);
    ul.appendChild(li);
  }
  root.appendChild(ul);
}

function wireProjectModal(): void {
  const dataEl = document.getElementById("project-modal-data");
  const projectModal = document.querySelector("#project-modal");
  if (!dataEl?.textContent?.trim() || !(projectModal instanceof HTMLDialogElement)) return;

  let entries: ProjectModalEntry[];
  try {
    entries = JSON.parse(dataEl.textContent) as ProjectModalEntry[];
  } catch {
    return;
  }

  const bySlug = new Map(entries.map((e) => [e.slug, e]));

  const kindEl = document.getElementById("project-modal-kind");
  const titleEl = document.getElementById("project-modal-title");
  const versionRow = document.getElementById("project-modal-version-row");
  const versionSelect = document.getElementById("project-modal-version");
  const descEl = document.getElementById("project-modal-description");
  const notesSection = document.getElementById("project-modal-notes-section");
  const notesPre = document.getElementById("project-modal-release-notes");
  const dockerSection = document.getElementById("project-modal-docker-section");
  const dockerEl = document.getElementById("project-modal-docker");
  const binariesSection = document.getElementById("project-modal-binaries-section");
  const releasesRoot = document.getElementById("project-modal-releases-root");
  const releaseHeadRow = document.getElementById("project-modal-release-head-row");
  const licenseSection = document.getElementById("project-modal-license-section");
  const licenseEl = document.getElementById("project-modal-license");

  if (
    !kindEl ||
    !titleEl ||
    !versionRow ||
    !(versionSelect instanceof HTMLSelectElement) ||
    !descEl ||
    !notesSection ||
    !notesPre ||
    !dockerSection ||
    !dockerEl ||
    !binariesSection ||
    !releasesRoot ||
    !releaseHeadRow ||
    !licenseSection ||
    !licenseEl
  ) {
    return;
  }

  let activeProject: ProjectModalEntry | null = null;

  const ui = {
    dialog: projectModal as HTMLDialogElement,
    kind: kindEl,
    title: titleEl,
    versionRow,
    versionSelect,
    desc: descEl,
    notesSection,
    notesPre,
    dockerSection,
    docker: dockerEl,
    binariesSection,
    releasesRoot,
    releaseHeadRow,
    licenseSection,
    license: licenseEl
  };

  function applyVersionPick(): void {
    const p = activeProject;
    if (!p) return;

    const rels = p.githubReleases;
    const hasReleases = rels && rels.length > 0;

    if (hasReleases) {
      const { rel, dockerTag } = resolveSelectedRelease(rels, ui.versionSelect.value);
      const d = rel.dockerImage?.trim();
      const override = rel.dockerImageOverride?.trim();
      if (override) {
        ui.docker.textContent = `docker pull ${override}`;
        ui.dockerSection.hidden = false;
      } else if (d) {
        const { base } = splitDockerImageRef(d);
        ui.docker.textContent = `docker pull ${base}:${dockerTag}`;
        ui.dockerSection.hidden = false;
      } else {
        ui.docker.textContent = "";
        ui.dockerSection.hidden = true;
      }

      const body = rel.body?.trim();
      if (body) {
        ui.notesPre.textContent = body;
        ui.notesSection.hidden = false;
      } else {
        ui.notesPre.textContent = "";
        ui.notesSection.hidden = true;
      }

      renderSelectedReleaseHead(ui.releaseHeadRow, rel, p.releaseUrl);
      renderReleaseAssets(ui.releasesRoot, rel);
    } else {
      ui.docker.textContent = "";
      ui.dockerSection.hidden = true;
      ui.notesPre.textContent = "";
      ui.notesSection.hidden = true;
      ui.releasesRoot.replaceChildren();
      ui.releaseHeadRow.replaceChildren();
      ui.releaseHeadRow.hidden = true;
    }
  }

  ui.versionSelect.addEventListener("change", () => applyVersionPick());

  function openFor(slug: string): void {
    const p = bySlug.get(slug);
    if (!p) return;

    activeProject = p;

    ui.kind.textContent = p.kind?.trim() || "—";
    ui.title.textContent = p.name?.trim() || "—";
    const desc = (p.description ?? "").trim();
    ui.desc.textContent = desc || "—";

    const rels = p.githubReleases;
    if (rels && rels.length > 0) {
      ui.versionRow.hidden = false;
      populateVersionSelect(ui.versionSelect, rels);
    } else {
      ui.versionRow.hidden = true;
      ui.versionSelect.replaceChildren();
    }

    const licenseText = p.licensePrice?.trim();
    if (licenseText) {
      ui.license.textContent = licenseText;
      ui.licenseSection.hidden = false;
    } else {
      ui.license.textContent = "";
      ui.licenseSection.hidden = true;
    }

    applyVersionPick();

    const hasGh = (rels?.length ?? 0) > 0;

    if (hasGh) {
      ui.binariesSection.hidden = false;
    } else {
      ui.binariesSection.hidden = true;
      ui.releasesRoot.replaceChildren();
      ui.releaseHeadRow.replaceChildren();
      ui.releaseHeadRow.hidden = true;
    }

    /* Defer past the opening click so backdrop handlers / UA quirks cannot close immediately. */
    queueMicrotask(() => {
      ui.dialog.showModal();
    });
  }

  document.querySelectorAll(".project-card--interactive[data-project]").forEach((card) => {
    const slug = card.getAttribute("data-project");
    if (!slug) return;

    card.addEventListener("click", () => openFor(slug));
    card.addEventListener("keydown", (e) => {
      if (!(e instanceof KeyboardEvent)) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFor(slug);
      }
    });
  });

  const closeBtn = ui.dialog.querySelector("[data-project-modal-close]");
  if (closeBtn instanceof HTMLButtonElement) {
    closeBtn.addEventListener("click", () => ui.dialog.close());
  }

  ui.dialog.addEventListener("close", () => {
    /* Browser restores focus to the card after close; defer blur to the next macrotask so it wins. */
    setTimeout(() => {
      const ae = document.activeElement;
      if (ae instanceof HTMLElement && ae.matches(".project-card--interactive[data-project]")) {
        ae.blur();
      }
    }, 0);
  });

  closeDialogOnBackdropPointer(ui.dialog);
}

wireProjectModal();
