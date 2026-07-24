import type { Metadata } from "next";
import AboutExperience from "@/components/AboutExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/about`;

const TITLE = "About StayKnown | Consent-First Safety by 6clement Joshua";
const DESCRIPTION =
  "Learn why Clement Joshua created StayKnown, how its consent-first safety sessions work, what the Android platform includes, and the emergency and privacy boundaries it does not claim to replace.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/about",
  },

  keywords: [
    "about StayKnown",
    "Clement Joshua",
    "6clement Joshua",
    "consent-first safety app",
    "personal safety platform",
    "StayKnown mission",
    "Android safety app",
  ],

  openGraph: {
    type: "website",
    url: "/about",
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

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
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
            name: "About",
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#clement-joshua`,
        name: "Clement Joshua",
        alternateName: "6clement Joshua",
        knowsAbout: [
          "Personal safety technology",
          "Consent-first location sharing",
          "Trusted-contact communication",
        ],
      },
    ],
  };

  return (
    <>
      <script
        id="stayknown-about-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <AboutExperience />
    </>
  );
}
