import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
