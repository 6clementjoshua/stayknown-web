import type { Metadata } from "next";
import FeaturesExperience from "@/components/FeaturesExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/features`;

const TITLE =
  "StayKnown Features | Visits, SOS, Trusted Contacts & Secure Chat";

const DESCRIPTION =
  "Explore StayKnown’s complete capability system: active Visits, LIVE safety sharing, I’M SAFE, SOS, approved contacts, verification, Safety Gallery, secure chat, translation, and privacy controls.";

const FEATURE_GROUPS = [
  {
    name: "Safety Sessions",
    description:
      "User-started Visits, destination context, LIVE safety sharing, Manual Capture, and verified ending.",
    url: "/learn/visit-live-sos",
  },
  {
    name: "Emergency Response",
    description:
      "SOS activation, selected emergency contacts, responders, escalation controls, and verified stopping.",
    url: "/learn/sos",
  },
  {
    name: "Trusted Identity",
    description:
      "Approved contacts, visible identity, verification, profile recognition, and Safety Gallery.",
    url: "/learn/contact-approval",
  },
  {
    name: "Secure Communication",
    description:
      "Protected chat entry, translation-aware messages, voice notes, media, stories, and profile trust.",
    url: "/learn/secure-chat-biometric",
  },
  {
    name: "Safety Integrity",
    description:
      "VPN location-reliability controls, sensitive-screen privacy, plan-aware capacity, and fast safety navigation.",
    url: "/learn/vpn-safety-gate",
  },
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/features",
  },

  keywords: [
    "StayKnown features",
    "personal safety app features",
    "Visit safety app",
    "LIVE location safety sharing",
    "I'M SAFE check-ins",
    "SOS contacts and responders",
    "approved contact safety",
    "secure multilingual chat",
    "Safety Gallery",
    "VPN safety gate",
    "privacy-first safety app",
  ],

  openGraph: {
    type: "website",
    url: "/features",
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
        "@type": "CollectionPage",
        "@id": `${PAGE_URL}/#webpage`,
        url: PAGE_URL,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
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
            name: "Features",
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}/#feature-groups`,
        name: "StayKnown feature groups",
        numberOfItems: FEATURE_GROUPS.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: FEATURE_GROUPS.map((group, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: group.name,
          description: group.description,
          url: absoluteUrl(group.url),
        })),
      },
    ],
  };
}

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function FeaturesPage() {
  const jsonLd = buildJsonLd();

  return (
    <>
      <script
        id="stayknown-features-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <FeaturesExperience />
    </>
  );
}
