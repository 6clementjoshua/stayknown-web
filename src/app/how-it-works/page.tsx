import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/how-it-works`;

const TITLE =
  "How StayKnown Works | Consent-First Visits, LIVE & SOS";

const DESCRIPTION =
  "See how StayKnown uses approved contacts, user-started Visits, LIVE safety sharing, I’M SAFE check-ins, SOS escalation, and verified ending without permanent tracking.";

const STAGES = [
  {
    name: "Approve trusted contacts",
    description:
      "Create a visible approved-contact relationship before supported safety access can become available.",
    url: "/learn/contact-approval",
  },
  {
    name: "Start a safety Visit",
    description:
      "Choose a destination, recipients, and purpose before deliberately beginning the active safety session.",
    url: "/learn/visit-live-sos",
  },
  {
    name: "Share LIVE safety context",
    description:
      "Give permitted recipients controlled location and session context while the Visit remains active.",
    url: "/learn/live-map",
  },
  {
    name: "Add a safety Capture",
    description:
      "Send an intentional additional safety location or context update during the supported active flow.",
    url: "/learn/manual-capture",
  },
  {
    name: "Confirm I’M SAFE",
    description:
      "Reassure trusted people directly and create clearer follow-up when an expected check-in is missed.",
    url: "/learn/get-safe-guidance",
  },
  {
    name: "Escalate with SOS",
    description:
      "Send urgent safety context and response actions to configured contacts and responders.",
    url: "/learn/sos",
  },
  {
    name: "End protection deliberately",
    description:
      "Use the verified ending flow to close the Visit or SOS and stop LIVE access intentionally.",
    url: "/learn/end-visit-verify",
  },
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/how-it-works",
  },

  keywords: [
    "how StayKnown works",
    "consent-first safety app",
    "active Visit safety",
    "temporary LIVE location sharing",
    "approved contacts",
    "I'M SAFE check-in",
    "SOS safety alerts",
    "safety app without permanent tracking",
    "travel safety app",
    "student safety app",
  ],

  openGraph: {
    type: "website",
    url: "/how-it-works",
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
            name: "How StayKnown Works",
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}/#safety-stages`,
        name: "How StayKnown Works",
        description: DESCRIPTION,
        numberOfItems: STAGES.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: STAGES.map((stage, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: stage.name,
          description: stage.description,
          url: absoluteUrl(stage.url),
        })),
      },
    ],
  };
}

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function HowItWorksPage() {
  const jsonLd = buildJsonLd();

  return (
    <>
      <script
        id="stayknown-how-it-works-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <HowItWorksExperience />
    </>
  );
}
