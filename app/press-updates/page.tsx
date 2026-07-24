import type { Metadata } from "next";
import PressUpdatesExperience from "@/components/PressUpdatesExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/press-updates`;

const TITLE = "StayKnown Press & Updates | Official Facts and Brand Guidance";
const DESCRIPTION =
  "Access official StayKnown product facts, approved safety language, brand guidance, public product updates, and press or partnership enquiry routes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/press-updates",
  },

  keywords: [
    "StayKnown press",
    "StayKnown media kit",
    "StayKnown product facts",
    "StayKnown updates",
    "6clement Joshua press",
    "personal safety app press",
    "StayKnown brand guidance",
  ],

  openGraph: {
    type: "website",
    url: "/press-updates",
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

export default function PressUpdatesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
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
      "@type": "BreadcrumbList",
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
          name: "Press & Updates",
          item: PAGE_URL,
        },
      ],
    },
  };

  return (
    <>
      <script
        id="stayknown-press-updates-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <PressUpdatesExperience />
    </>
  );
}
