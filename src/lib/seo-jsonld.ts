import type { ContactMap, ContactMeta, Project } from "../data/home";

export type HomeJsonLdParams = {
  siteHref: string;
  canonicalHref: string;
  pageTitle: string;
  pageDescription: string;
  projects: Project[];
  contactMeta: ContactMeta;
  contactEmail: string;
  /** Map marker coordinates from CMS (`contact` singleton); keeps `geo` in sync with the homepage map. */
  contactMap: ContactMap;
};

/**
 * JSON-LD @graph for homepage: Organization, WebSite, WebPage, ItemList (projects).
 * Postal address and VAT are fixed legal/registry data; map coordinates come from `contactMap` (CMS).
 */
export function buildHomeJsonLd(p: HomeJsonLdParams): string {
  const site = p.siteHref.replace(/\/$/, "");
  const orgId = `${site}/#organization`;
  const websiteId = `${site}/#website`;

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": orgId,
    name: p.contactMeta.company,
    legalName: p.contactMeta.company,
    url: site,
    email: p.contactEmail,
    description: p.contactMeta.lines[0],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Milicz",
      addressCountry: "PL"
    },
    vatID: "PL9161390382",
    geo: {
      "@type": "GeoCoordinates",
      latitude: p.contactMap.lat,
      longitude: p.contactMap.lng
    },
    sameAs: ["https://github.com/integratepl"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: p.contactEmail,
      availableLanguage: ["English", "Polish"]
    }
  };

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": websiteId,
    url: site,
    name: "Integrate",
    description: p.pageDescription,
    inLanguage: "en",
    publisher: { "@id": orgId }
  };

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${p.canonicalHref}#webpage`,
    url: p.canonicalHref,
    name: p.pageTitle,
    description: p.pageDescription,
    inLanguage: "en",
    isPartOf: { "@id": websiteId },
    about: { "@id": orgId },
    mainEntity: { "@id": `${p.canonicalHref}#projects` }
  };

  const projectList: Record<string, unknown> = {
    "@type": "ItemList",
    "@id": `${p.canonicalHref}#projects`,
    name: "Integration projects",
    numberOfItems: p.projects.length,
    itemListElement: p.projects.map((project, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: project.name,
        description: project.description,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: project.kind,
        url: `${site}/#${project.slug}`
      }
    }))
  };

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [organization, website, webPage, projectList]
  });
}
