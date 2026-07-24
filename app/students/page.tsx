import type { Metadata } from "next";
import AudienceExperience from "@/components/AudienceExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/students`;

const TITLE = 'Student Safety App | Campus, Commutes, I’M SAFE & SOS';
const DESCRIPTION = 'See how StayKnown supports students and young adults through consent-first Visits, LIVE sharing, I’M SAFE check-ins, approved contacts, guardian safeguards, and SOS.';

const JOURNEY_ITEMS = [
  {
    name: 'Start a student Visit',
    description: 'Create a destination-aware safety session for school, campus, transport, or an unfamiliar route.',
    url: '/learn/safe-journey',
  },
  {
    name: 'Use LIVE safety sharing',
    description: 'Share permitted active-session location context with selected approved contacts.',
    url: '/learn/live-map',
  },
  {
    name: 'Confirm I’M SAFE',
    description: 'Send direct reassurance and create clearer follow-up when a scheduled check-in is missed.',
    url: '/learn/get-safe-guidance',
  },
  {
    name: 'Escalate with SOS',
    description: 'Send urgent safety context to configured contacts and responders.',
    url: '/learn/sos',
  },
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/students",
  },

  keywords: [
    'student safety app',
    'campus safety app',
    'school journey safety',
    'student commute safety',
    "I'M SAFE check-in",
    'student SOS app',
    'guardian consent safety',
    'consent-first location sharing',
  ],

  openGraph: {
    type: "website",
    url: "/students",
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
          url: absoluteUrl('/hero/stayknown-safe-journey-bus.png'),
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
            name: 'Students',
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}/#journey-items`,
        name: `${TITLE} journey`,
        numberOfItems: JOURNEY_ITEMS.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: JOURNEY_ITEMS.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          description: item.description,
          url: absoluteUrl(item.url),
        })),
      },
    ],
  };
}

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function Page() {
  const jsonLd = buildJsonLd();

  return (
    <>
      <script
        id="stayknown-students-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <AudienceExperience kind='students' />
    </>
  );
}
