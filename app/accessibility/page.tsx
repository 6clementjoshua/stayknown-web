import type { Metadata } from "next";
import AccessibilityExperience from "@/components/AccessibilityExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/accessibility`;

const TITLE = "StayKnown Accessibility | Clear, Keyboard-Friendly Safety UX";
const DESCRIPTION =
  "Review StayKnown website accessibility commitments for readable hierarchy, keyboard navigation, visible focus, reduced motion, descriptive labels, and meaning beyond colour.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/accessibility",
  },

  keywords: [
    "StayKnown accessibility",
    "accessible safety app website",
    "keyboard navigation",
    "reduced motion",
    "visible focus",
    "accessible safety information",
    "screen reader labels",
  ],

  openGraph: {
    type: "website",
    url: "/accessibility",
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

export default function AccessibilityPage() {
  const jsonLd = {
    "@context": "https://schema.org",
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
          name: "Accessibility",
          item: PAGE_URL,
        },
      ],
    },
  };

  return (
    <>
      <script
        id="stayknown-accessibility-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <AccessibilityExperience />
    </>
  );
}
