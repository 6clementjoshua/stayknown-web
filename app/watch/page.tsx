import type { Metadata } from "next";
import WatchExperience from "@/components/WatchExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/watch`;

const TITLE =
  "Watch StayKnown in Action | Consent, Visits, LIVE, I’M SAFE & SOS";

const DESCRIPTION =
  "Watch StayKnown’s interactive product film move through approved contacts, active Visits, LIVE safety sharing, Manual Capture, I’M SAFE, SOS, secure chat, and verified ending.";

const CHAPTERS = [
  {
    name: "Everyday movement",
    description:
      "Why journeys, visits, rides, school, work, and unfamiliar places need consent-first safety context.",
    url: "/learn/safe-journey",
  },
  {
    name: "Approved contacts",
    description:
      "How trusted relationships and identity appear before active location access.",
    url: "/learn/contact-approval",
  },
  {
    name: "Start a Visit",
    description:
      "How a user creates a destination-aware safety session and selects recipients.",
    url: "/learn/visit-live-sos",
  },
  {
    name: "LIVE safety sharing",
    description:
      "How active-session location, confidence, identity, and context reach permitted contacts.",
    url: "/learn/live-map",
  },
  {
    name: "Manual Capture",
    description:
      "How a user adds a fresh intentional safety update during an active Visit.",
    url: "/learn/manual-capture",
  },
  {
    name: "I’M SAFE",
    description:
      "How direct reassurance and missed check-in follow-up support trusted people.",
    url: "/learn/get-safe-guidance",
  },
  {
    name: "SOS escalation",
    description:
      "How the interface and message priority change when danger becomes urgent.",
    url: "/learn/sos",
  },
  {
    name: "Secure communication",
    description:
      "How protected chat, translation, voice, media, and profile recognition support safety communication.",
    url: "/learn/secure-chat-protection",
  },
  {
    name: "Verified completion",
    description:
      "How Visit and SOS protection end deliberately and close active LIVE access.",
    url: "/learn/verified-stop",
  },
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/watch",
  },

  keywords: [
    "watch StayKnown",
    "StayKnown app demo",
    "personal safety app demo",
    "Visit safety walkthrough",
    "LIVE safety sharing demo",
    "I'M SAFE check-in demo",
    "SOS app demonstration",
    "approved contacts",
    "consent-first safety app",
  ],

  openGraph: {
    type: "website",
    url: "/watch",
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
          url: absoluteUrl("/hero/visit-live-sos.png"),
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
            name: "Watch StayKnown",
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}/#film-chapters`,
        name: "StayKnown interactive product-film chapters",
        numberOfItems: CHAPTERS.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: CHAPTERS.map((chapter, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: chapter.name,
          description: chapter.description,
          url: absoluteUrl(chapter.url),
        })),
      },
    ],
  };
}

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function WatchPage() {
  const jsonLd = buildJsonLd();

  return (
    <>
      <script
        id="stayknown-watch-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <WatchExperience />
    </>
  );
}
