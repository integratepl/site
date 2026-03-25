export type Project = {
  name: string;
  kind: string;
  description: string;
  /** GHCR ref for `docker pull`. Omit for library-only projects (Docker section hidden). */
  dockerImage?: string;
  /** GitHub Releases URL. Omit when there are no binary/release artifacts (section hidden). */
  releaseUrl?: string;
  /** Optional direct asset URL for linux/amd64 */
  binaryLinuxAmd64Url?: string;
  /** Optional direct asset URL for linux/arm64 */
  binaryLinuxArm64Url?: string;
  /** Omit when the project is not offered for sale (license section hidden in modal). */
  licensePrice?: string;
};

export type LatestNews = {
  title: string;
  teaser: string;
  content: string[];
};

export type ContactMeta = { company: string; lines: string[] };

export type ContactMap = { lat: number; lng: number; zoom: number };

export type FaqItem = {
  question: string;
  answer: string;
};

export const contactEmail = "hello@integrate.pl";

export const projects: Project[] = [
  {
    name: "modbus2hue",
    kind: "Bridge",
    description:
      "Bring Philips Hue lighting into any building automation system — without custom integration work. Exposes Hue resources as native Modbus registers over RTU and TCP.",
    dockerImage: "ghcr.io/integratepl/modbus2hue:latest",
    releaseUrl: "https://github.com/integratepl/modbus2hue/releases/latest",
    licensePrice: "Lifetime license, single payment — contact hello@integrate.pl for pricing"
  },
  {
    name: "automodbus",
    kind: "Framework",
    description:
      "A runtime for connecting devices once and reusing that integration everywhere. Deterministic Modbus mapping layer designed for consistent, production-grade deployments.",
  },
  {
    name: "zigbee2any",
    kind: "Integration stack",
    description:
      "Make any Zigbee device available to any system — regardless of protocol. A standalone daemon exposing a unified API for bridges, services, and transport layers.",
  },
  {
    name: "zigbee2any-mqtt",
    kind: "Transport",
    description:
      "Connect Zigbee devices to MQTT-based platforms, cloud services, and home automation hubs. A transport layer built on zigbee2any — drop-in compatible with standard MQTT brokers.",
    dockerImage: "ghcr.io/integratepl/zigbee2any-mqtt:latest",
    releaseUrl: "https://github.com/integratepl/zigbee2any-mqtt/releases/latest",
    licensePrice: "Lifetime license, single payment — contact hello@integrate.pl for pricing"
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

/** Modal heading in the FAQ dialog */
export const faqModalTitle = "Frequently asked questions";

export const faqItems: FaqItem[] = [
  {
    question: "Anything here yet?",
    answer: "Nope :)"
  }
];
