export type Project = { name: string; kind: string; description: string };

export type LatestNews = {
  title: string;
  teaser: string;
  content: string[];
};

export type ContactMeta = { company: string; lines: string[] };

export type ContactMap = { lat: number; lng: number; zoom: number };

export const contactEmail = "hello@integrate.pl";

export const projects: Project[] = [
  {
    name: "modbus2hue",
    kind: "Bridge",
    description:
      "Bring Philips Hue lighting into any building automation system — without custom integration work. Exposes Hue resources as native Modbus registers over RTU and TCP."
  },
  {
    name: "automodbus",
    kind: "Framework",
    description:
      "A runtime for connecting devices once and reusing that integration everywhere. Deterministic Modbus mapping layer designed for consistent, production-grade deployments."
  },
  {
    name: "zigbee2any",
    kind: "Integration stack",
    description:
      "Make any Zigbee device available to any system — regardless of protocol. A standalone daemon exposing a unified API for bridges, services, and transport layers."
  },
  {
    name: "zigbee2any-mqtt",
    kind: "Transport",
    description:
      "Connect Zigbee devices to MQTT-based platforms, cloud services, and home automation hubs. A transport layer built on zigbee2any — drop-in compatible with standard MQTT brokers."
  }
];

export const latestNews: LatestNews = {
  title: "modbus2hue stabilization work underway",
  teaser:
    "We are currently focused on stabilization work and expect the first public release soon.",
  content: [
    "Current work on modbus2hue is focused on stabilization and preparing the project for release.",
    "The goal is to make the first release solid, reliable, and ready for real-world use.",
    "If everything stays on track, the first public release is expected soon."
  ]
};

export const contactMeta: ContactMeta = {
  company: "Integrate.pl",
  lines: [
    "Integration and automation for homes and industry.",
    "Milicz, Poland",
    "NIP PL9161390382"
  ]
};

/** Leaflet view — Milicz Rynek (town square), zoomed out slightly */
export const contactMap: ContactMap = { lat: 51.53194, lng: 17.27548, zoom: 13.5 };
