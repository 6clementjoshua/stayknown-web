import type { Metadata } from "next";
import AudienceExperience from "@/components/AudienceExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/families-guardians`;

const TITLE = 'Family & Guardian Safety | Consent, Minors, I’M SAFE & SOS';
const DESCRIPTION = 'See how StayKnown helps families and eligible guardians support loved ones through approved contacts, age-aware consent, Visits, I’M SAFE, SOS, and clear privacy boundaries.';

const JOURNEY_ITEMS = [
  {
    name: 'Approve the relationship',
    description: 'Create a visible and revocable trusted-contact relationship.',
    url: '/learn/contact-approval',
  },
  {
    name: 'Complete guardian consent',
    description: 'Use the supported guardian process for eligible users aged 13–17.',
    url: '/guardian-consent',
  },
  {
    name: 'Use I’M SAFE reassurance',
    description: 'Communicate safety directly without opening permanent family tracking.',
    url: '/learn/get-safe-guidance',
  },
  {
    name: 'Respond to urgent SOS',
    description: 'Receive high-clarity emergency context and a verified completion state.',
    url: '/learn/sos',
  },
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/families-guardians",
  },

  keywords: [
    'family safety app',
    'guardian safety app',
    'minor safety app',
    'guardian consent',
    'family I’M SAFE check-in',
    'family SOS app',
    'approved contact safety',
    'family location privacy',
  ],

  openGraph: {
    type: "website",
    url: "/families-guardians",
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
          url: absoluteUrl('/hero/stayknown-family-farewell.png'),
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
            name: 'Families & Guardians',
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
        id="stayknown-families-guardians-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <AudienceExperience kind='families' />
    </>
  );
}
