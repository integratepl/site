import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { closeDialogOnBackdropPointer } from "./dialog-backdrop-close";

const newsTrigger = document.querySelector(".news-trigger");
const newsModal = document.querySelector("#latest-news-modal");
const newsClose = document.querySelector(".news-close");

if (newsTrigger instanceof HTMLButtonElement && newsModal instanceof HTMLDialogElement) {
  newsTrigger.addEventListener("click", () => {
    newsModal.showModal();
  });
}

if (newsClose instanceof HTMLButtonElement && newsModal instanceof HTMLDialogElement) {
  newsClose.addEventListener("click", () => {
    newsModal.close();
  });

  closeDialogOnBackdropPointer(newsModal);
}

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
  name: string;
  kind: string;
  description: string;
  dockerImage: string | null;
  releaseUrl: string | null;
  binaryLinuxAmd64Url: string | null;
  binaryLinuxArm64Url: string | null;
  licensePrice: string | null;
};

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

  const byName = new Map(entries.map((e) => [e.name, e]));

  const kindEl = document.getElementById("project-modal-kind");
  const titleEl = document.getElementById("project-modal-title");
  const descEl = document.getElementById("project-modal-description");
  const dockerSection = document.getElementById("project-modal-docker-section");
  const dockerEl = document.getElementById("project-modal-docker");
  const binariesSection = document.getElementById("project-modal-binaries-section");
  const licenseSection = document.getElementById("project-modal-license-section");
  const licenseEl = document.getElementById("project-modal-license");
  const linkAmd = document.getElementById("project-modal-link-amd64");
  const linkArm = document.getElementById("project-modal-link-arm64");
  const linkRel = document.getElementById("project-modal-link-releases");

  if (
    !kindEl ||
    !titleEl ||
    !descEl ||
    !dockerSection ||
    !dockerEl ||
    !binariesSection ||
    !licenseSection ||
    !licenseEl ||
    !(linkAmd instanceof HTMLAnchorElement) ||
    !(linkArm instanceof HTMLAnchorElement) ||
    !(linkRel instanceof HTMLAnchorElement)
  ) {
    return;
  }

  const ui = {
    dialog: projectModal as HTMLDialogElement,
    kind: kindEl,
    title: titleEl,
    desc: descEl,
    dockerSection,
    docker: dockerEl,
    binariesSection,
    licenseSection,
    license: licenseEl,
    linkAmd,
    linkArm,
    linkRel
  };

  function openFor(name: string): void {
    const p = byName.get(name);
    if (!p) return;

    ui.kind.textContent = p.kind;
    ui.title.textContent = p.name;
    ui.desc.textContent = p.description;

    const dockerRef = p.dockerImage?.trim();
    if (dockerRef) {
      ui.docker.textContent = `docker pull ${dockerRef}`;
      ui.dockerSection.hidden = false;
    } else {
      ui.docker.textContent = "";
      ui.dockerSection.hidden = true;
    }

    const licenseText = p.licensePrice?.trim();
    if (licenseText) {
      ui.license.textContent = licenseText;
      ui.licenseSection.hidden = false;
    } else {
      ui.license.textContent = "";
      ui.licenseSection.hidden = true;
    }

    const showBinaries = !!(
      p.releaseUrl?.trim() ||
      p.binaryLinuxAmd64Url?.trim() ||
      p.binaryLinuxArm64Url?.trim()
    );
    if (showBinaries) {
      ui.binariesSection.hidden = false;
      const rel = p.releaseUrl?.trim();
      if (rel) {
        ui.linkRel.href = rel;
        ui.linkRel.hidden = false;
      } else {
        ui.linkRel.hidden = true;
      }
      const amd = p.binaryLinuxAmd64Url?.trim();
      if (amd) {
        ui.linkAmd.href = amd;
        ui.linkAmd.hidden = false;
      } else {
        ui.linkAmd.hidden = true;
      }
      const arm = p.binaryLinuxArm64Url?.trim();
      if (arm) {
        ui.linkArm.href = arm;
        ui.linkArm.hidden = false;
      } else {
        ui.linkArm.hidden = true;
      }
    } else {
      ui.binariesSection.hidden = true;
      ui.linkRel.hidden = true;
      ui.linkAmd.hidden = true;
      ui.linkArm.hidden = true;
    }

    ui.dialog.showModal();
  }

  document.querySelectorAll(".project-card--interactive[data-project]").forEach((card) => {
    const name = card.getAttribute("data-project");
    if (!name) return;

    card.addEventListener("click", () => openFor(name));
    card.addEventListener("keydown", (e) => {
      if (!(e instanceof KeyboardEvent)) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFor(name);
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
