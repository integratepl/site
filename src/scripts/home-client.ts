/** Loaded from unpkg at runtime */
interface LeafletMap {
  attributionControl: { setPrefix: (v: string) => void };
  setView: (center: [number, number], zoom: number) => void;
  invalidateSize: () => void;
  whenReady: (fn: () => void) => void;
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => void;
}

interface LeafletGlobal {
  map: (el: HTMLElement, options: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, options: Record<string, unknown>) => LeafletTileLayer;
}

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

  newsModal.addEventListener("click", (event) => {
    const bounds = newsModal.getBoundingClientRect();
    const isOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (isOutside) {
      newsModal.close();
    }
  });
}

function loadCss(href: string): Promise<void> {
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error("leaflet-css"));
    document.head.appendChild(link);
  });
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("leaflet-js"));
    document.head.appendChild(script);
  });
}

/** Bump when the tile URL or map behavior changes so a full reload picks up the new layer */
const CONTACT_MAP_REV = "map-attrib-inline-9";

async function initContactMap(): Promise<void> {
  const el = document.getElementById("contact-map-host");
  if (!el || el.dataset.contactMapRev === CONTACT_MAP_REV) return;

  try {
    await loadCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
    await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
  } catch {
    return;
  }

  const L = (window as unknown as { L?: LeafletGlobal }).L;
  if (!L) return;

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
    tap: false,
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
