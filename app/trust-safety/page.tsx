import type { Metadata } from "next";
import TrustSafetyExperience from "@/components/TrustSafetyExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/trust-safety`;

const TITLE =
  "StayKnown Trust & Safety Center | Consent, SOS & Anti-Stalking";

const DESCRIPTION =
  "Learn how StayKnown protects users through approved contacts, consent-first location access, anti-stalking rules, SOS boundaries, abuse reporting, minor safety, privacy, security, and emergency limitations.";

const TRUST_PILLARS = [
  {
    name: "Consent and approved contacts",
    description:
      "Visible, revocable approval that remains separate from active LIVE location access.",
    url: "/contact-consent",
  },
  {
    name: "Location and active safety sessions",
    description:
      "Visit, LIVE, SOS, and Manual Capture location context tied to a supported safety purpose.",
    url: "/location-safety",
  },
  {
    name: "Emergency and SOS boundaries",
    description:
      "Urgent trusted-contact escalation without claiming official professional dispatch.",
    url: "/emergency",
  },
  {
    name: "Communication safety",
    description:
      "Rules against threats, harassment, impersonation, exploitation, scams, and unsafe content.",
    url: "/acceptable-use",
  },
  {
    name: "Security and platform integrity",
    description:
      "VPN reliability, device checks, sensitive-screen privacy, reporting, and responsible disclosure.",
    url: "/security",
  },
  {
    name: "Minor and guardian safety",
    description:
      "Age-aware access, guardian consent, and stronger protection against exploitation or coercion.",
    url: "/minors",
  },
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/trust-safety",
  },

  keywords: [
    "StayKnown Trust and Safety",
    "consent-first safety app",
    "anti-stalking safety app",
    "approved contact safety",
    "SOS abuse prevention",
    "location privacy",
    "minor safety app",
    "guardian consent",
    "abuse reporting",
    "responsible security disclosure",
  ],

  openGraph: {
    type: "website",
    url: "/trust-safety",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "StayKnown",
    locale: "en_NG",
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

function absoluteUrl(pathname: string): string {
  return new URL(pathname, SITE_URL).toString();
}

function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}/#webpage`,
        url: PAGE_URL,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
        dateModified: "2026-07-24",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#android-application`,
        },
        breadcrumb: {
          "@id": `${PAGE_URL}/#breadcrumb`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl("/hero/contact-approval.png"),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Trust & Safety",
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}/#trust-pillars`,
        name: "StayKnown Trust & Safety pillars",
        numberOfItems: TRUST_PILLARS.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: TRUST_PILLARS.map((pillar, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: pillar.name,
          description: pillar.description,
          url: absoluteUrl(pillar.url),
        })),
      },
    ],
  };
}

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function TrustSafetyPage() {
  const jsonLd = buildJsonLd();

  return (
    <>
      <script
        id="stayknown-trust-safety-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <TrustSafetyExperience />
    </>
  );
}
