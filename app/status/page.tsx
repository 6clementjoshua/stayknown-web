import type { Metadata } from "next";
import StatusExperience from "@/components/StatusExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/status`;

const TITLE = "StayKnown Public Status | Browser Reachability Checks";
const DESCRIPTION =
  "Run lightweight browser reachability checks for selected StayKnown public routes and review the important limits of this status page.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/status",
  },

  keywords: [
    "StayKnown status",
    "StayKnown website status",
    "service reachability",
    "billing route status",
    "public incident notice",
  ],

  openGraph: {
    type: "website",
    url: "/status",
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

export default function StatusPage() {
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
          name: "Public Status",
          item: PAGE_URL,
        },
      ],
    },
  };

  return (
    <>
      <script
        id="stayknown-status-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <StatusExperience />
    </>
  );
}
