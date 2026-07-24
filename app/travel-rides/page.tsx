import type { Metadata } from "next";
import AudienceExperience from "@/components/AudienceExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/travel-rides`;

const TITLE = 'Travel & Ride Safety | Visits, LIVE Location, Capture & SOS';
const DESCRIPTION = 'See how StayKnown supports ride-hailing, road travel, airports, work trips, and unfamiliar destinations with purposeful Visits, LIVE sharing, Manual Capture, and SOS.';

const JOURNEY_ITEMS = [
  {
    name: 'Prepare the journey',
    description: 'Add a destination, select approved recipients, and start the Visit deliberately.',
    url: '/learn/visit-live-sos',
  },
  {
    name: 'Share LIVE route context',
    description: 'Keep selected trusted people informed during the active safety session.',
    url: '/learn/live-map',
  },
  {
    name: 'Add Manual Capture',
    description: 'Send a visible additional safety update when the route or situation changes.',
    url: '/learn/manual-capture',
  },
  {
    name: 'Escalate urgent danger',
    description: 'Use SOS when ordinary journey context is no longer enough.',
    url: '/learn/sos',
  },
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/travel-rides",
  },

  keywords: [
    'travel safety app',
    'ride safety app',
    'ride-hailing safety',
    'journey location sharing',
    'LIVE travel safety',
    'Manual Capture',
    'travel SOS app',
    'destination safety app',
  ],

  openGraph: {
    type: "website",
    url: "/travel-rides",
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
          url: absoluteUrl('/hero/visit-live.png'),
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
            name: 'Travel & Rides',
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
        id="stayknown-travel-rides-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <AudienceExperience kind='travel' />
    </>
  );
}
