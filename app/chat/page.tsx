import type { Metadata } from "next";
import StayKnownChatExperience from "@/components/StayKnownChatExperience";
import {
  STAYKNOWN_CHAT_FAQS,
  STAYKNOWN_CHAT_FLOW_STEPS,
  TRUSTED_CIRCLE_CONSENT_STEPS,
  TRUSTED_CIRCLE_ROLES,
} from "@/lib/stayknown-chat-content";

const SITE_URL = "https://www.stay-known.com";
const CHAT_URL = `${SITE_URL}/chat`;
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

const TITLE =
  "StayKnown Chat & Trusted Circles | Consent-Based Safety Messaging";
const DESCRIPTION =
  "Explore StayKnown Chat: approved-contact direct messaging, protected entry, translation-aware messages, voice and media, Trusted Circle consent, roles, selective audiences, and privacy boundaries.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/chat",
  },
  keywords: [
    "StayKnown Chat",
    "Trusted Circle Chat",
    "consent-based group chat",
    "approved contact messaging",
    "safety messaging app",
    "private safety chat",
    "selective audience messaging",
    "multilingual safety chat",
    "voice notes and media chat",
    "group chat permissions",
    "Circle Lead",
    "Circle Steward",
    "Nigeria safety communication app",
  ],
  openGraph: {
    type: "website",
    url: "/chat",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "StayKnown",
    locale: "en_NG",
    images: [
      {
        url: "/chat/opengraph-image",
        width: 1200,
        height: 630,
        alt: "StayKnown Chat and Trusted Circle consent experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/chat/twitter-image"],
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

function buildChatJsonLd() {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const applicationId = `${SITE_URL}/#android-application`;
  const webpageId = `${CHAT_URL}#webpage`;
  const faqId = `${CHAT_URL}#faq`;
  const breadcrumbId = `${CHAT_URL}#breadcrumb`;
  const featureListId = `${CHAT_URL}#feature-flow`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: CHAT_URL,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
        isPartOf: {
          "@id": websiteId,
        },
        about: {
          "@id": applicationId,
        },
        breadcrumb: {
          "@id": breadcrumbId,
        },
        mainEntity: {
          "@id": featureListId,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/hero/chat-translation.png`,
        },
        publisher: {
          "@id": organizationId,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "StayKnown",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Chat & Trusted Circles",
            item: CHAT_URL,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": featureListId,
        name: "StayKnown Chat safety and permission flow",
        description:
          "The ordered communication and consent boundaries used by StayKnown Chat and Trusted Circles.",
        numberOfItems: STAYKNOWN_CHAT_FLOW_STEPS.length,
        itemListElement: STAYKNOWN_CHAT_FLOW_STEPS.map((step, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: step.title,
          description: `${step.body} ${step.note}`,
        })),
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${CHAT_URL}#chat-feature`,
        name: "StayKnown Chat and Trusted Circles",
        alternateName: "StayKnown safety messaging",
        url: CHAT_URL,
        description: DESCRIPTION,
        operatingSystem: "Android",
        applicationCategory: "CommunicationApplication",
        applicationSubCategory: "Consent-based safety communication",
        downloadUrl: GOOGLE_PLAY_URL,
        installUrl: GOOGLE_PLAY_URL,
        image: `${SITE_URL}/hero/chat-translation.png`,
        isPartOf: {
          "@id": applicationId,
        },
        brand: {
          "@type": "Brand",
          name: "StayKnown",
        },
        publisher: {
          "@id": organizationId,
        },
        featureList: [
          "Approved-contact direct Chat",
          "Protected Chat entry",
          "Translation-aware messages",
          "Voice notes, photos, videos, files, audio, stickers, and deliberate location sharing",
          "Trusted Circle member consent",
          "Circle Lead, Circle Steward, and Circle Member roles",
          "Selective message audiences enforced by server-side permissions",
          "Separate direct and Trusted Circle histories",
          "Account-aware notification routing",
        ],
        audience: {
          "@type": "PeopleAudience",
          audienceType:
            "People using approved-contact communication and consent-governed safety groups",
        },
      },
      {
        "@type": "HowTo",
        "@id": `${CHAT_URL}#trusted-circle-consent-howto`,
        name: "How a person joins a StayKnown Trusted Circle",
        description:
          "A consent-governed sequence covering member suggestion, Circle Lead review, existing-member consent, and candidate acceptance.",
        step: TRUSTED_CIRCLE_CONSENT_STEPS.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.body,
          url: `${CHAT_URL}#trusted-circle-consent`,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${CHAT_URL}#trusted-circle-roles`,
        name: "Trusted Circle roles",
        itemListElement: TRUSTED_CIRCLE_ROLES.map((role, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: role.role,
          description: role.body,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        url: `${CHAT_URL}#chat-faq`,
        isPartOf: {
          "@id": webpageId,
        },
        mainEntity: STAYKNOWN_CHAT_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

export default function ChatPage() {
  const jsonLd = buildChatJsonLd();

  return (
    <>
      <script
        id="stayknown-chat-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <StayKnownChatExperience />
    </>
  );
}
