import type { Metadata } from "next";
import StayKnownHomePage from "@/components/StayKnownHomePage";
import { HOME_FAQS } from "@/lib/stayknown-home-content";

const SITE_URL = "https://www.stay-known.com";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

const TITLE =
  "StayKnown Safety & Secure Chat App | LIVE Visits, Iâ€™M SAFE & SOS";

const DESCRIPTION =
  "StayKnown is a consent-first safety app with LIVE Visits, I'M SAFE check-ins, SOS alerts, approved contacts, secure chat and location sharing.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: SITE_URL,
  },

  keywords: [
    "StayKnown",
    "consent-first personal safety app",
    "Android safety app",
    "active Visit safety",
    "LIVE location sharing",
    "I'M SAFE check-in",
    "SOS alerts",
    "approved contacts",
    "secure chat app",
    "approved contact messaging",
    "biometric protected chat",
    "language translation chat",
    "multilingual safety communication",
    "voice note messaging",
    "private safety conversations",
    "student safety app",
    "travel safety app",
    "ride-hailing safety",
    "family safety without permanent tracking",
    "Nigeria safety app",
  ],

  openGraph: {
    type: "website",
    url: SITE_URL,
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

function buildHomepageJsonLd() {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const webpageId = `${SITE_URL}/#homepage`;
  const productId = `${SITE_URL}/#android-application`;
  const faqId = `${SITE_URL}/#homepage-faq`;
  const chatId = `${SITE_URL}/#secure-chat-capabilities`;

  const offers = [
    {
      "@type": "Offer",
      name: "StayKnown Starter",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Monthly â€” Global",
      price: "14.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Yearly â€” Global",
      price: "149.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Max Monthly â€” Global",
      price: "24.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Max Yearly â€” Global",
      price: "249.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Monthly â€” Nigeria",
      price: "9999",
      priceCurrency: "NGN",
      eligibleRegion: {
        "@type": "Country",
        name: "Nigeria",
      },
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Yearly â€” Nigeria",
      price: "99999",
      priceCurrency: "NGN",
      eligibleRegion: {
        "@type": "Country",
        name: "Nigeria",
      },
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Max Monthly â€” Nigeria",
      price: "14999",
      priceCurrency: "NGN",
      eligibleRegion: {
        "@type": "Country",
        name: "Nigeria",
      },
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Max Yearly â€” Nigeria",
      price: "149999",
      priceCurrency: "NGN",
      eligibleRegion: {
        "@type": "Country",
        name: "Nigeria",
      },
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: SITE_URL,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en",
        isPartOf: {
          "@id": websiteId,
        },
        about: {
          "@id": productId,
        },
        keywords:
          "personal safety app, secure chat app, approved contacts, LIVE Visit sharing, Iâ€™M SAFE check-ins, SOS alerts, biometric protected chat, multilingual message translation, voice notes",
        hasPart: {
          "@id": chatId,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl("/hero/visit-live-sos.png"),
        },
        publisher: {
          "@id": organizationId,
        },
      },
      {
        "@type": ["SoftwareApplication", "Product"],
        "@id": productId,
        name: "StayKnown",
        alternateName: "Stay Known",
        url: SITE_URL,
        description: DESCRIPTION,
        operatingSystem: "Android",
        applicationCategory: "LifestyleApplication",
        applicationSubCategory: "Personal Safety",
        downloadUrl: GOOGLE_PLAY_URL,
        installUrl: GOOGLE_PLAY_URL,
        image: [
          absoluteUrl("/hero/visit-live-sos.png"),
          absoluteUrl("/hero/secure-chat-biometric.png"),
          absoluteUrl("/hero/chat-translation.png"),
          absoluteUrl("/hero/chat-stickers-voice.png"),
        ],
        screenshot: [
          absoluteUrl("/hero/visit-live-sos.png"),
          absoluteUrl("/hero/secure-chat-biometric.png"),
          absoluteUrl("/hero/chat-translation.png"),
          absoluteUrl("/hero/chat-stickers-voice.png"),
        ],
        softwareHelp: absoluteUrl("/help-center"),
        brand: {
          "@type": "Brand",
          name: "StayKnown",
        },
        manufacturer: {
          "@id": organizationId,
        },
        publisher: {
          "@id": organizationId,
        },
        isAccessibleForFree: true,
        featureList: [
          "User-started safety Visits",
          "LIVE sharing during active safety sessions",
          "I'M SAFE check-ins",
          "SOS alerts to trusted contacts",
          "Approved-contact safety access",
          "Secure chat between approved contacts",
          "Supported biometric or device-protected chat entry",
          "Language-aware message translation",
          "Voice notes, media, stickers, and expressive messaging",
          "Safety evidence and recognition",
        ],
        audience: [
          {
            "@type": "PeopleAudience",
            audienceType: "College students and young adults",
          },
          {
            "@type": "PeopleAudience",
            audienceType: "Travelers and ride-hailing users",
          },
          {
            "@type": "PeopleAudience",
            audienceType: "Families and guardians",
          },
        ],
        offers,
      },
      {
        "@type": "ItemList",
        "@id": chatId,
        name: "StayKnown secure chat capabilities",
        description:
          "Approved-contact communication features available within the StayKnown safety and communication platform.",
        url: `${SITE_URL}/#chat-awareness`,
        numberOfItems: 5,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Approved-contact chat",
            description:
              "Chat communication is connected to recognizable approved StayKnown relationships.",
            url: absoluteUrl("/learn/chat"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Protected chat entry",
            description:
              "Supported biometric or device-level protection can add a barrier before private conversations open.",
            url: absoluteUrl("/learn/secure-chat-protection"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Language-aware translation",
            description:
              "Recipient language preferences and translated message handling support multilingual communication.",
            url: absoluteUrl("/learn/language-aware-chat"),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Voice notes and media",
            description:
              "Supported voice notes, media, stickers, and expressive formats add communication context.",
            url: absoluteUrl("/learn/chat"),
          },
          {
            "@type": "ListItem",
            position: 5,
            name: "Safety-aware communication",
            description:
              "Chat remains part of the wider approved-contact, recognition, and personal safety system.",
            url: absoluteUrl("/features"),
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        url: `${SITE_URL}/#faq`,
        isPartOf: {
          "@id": webpageId,
        },
        mainEntity: HOME_FAQS.map((faq) => ({
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

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function Page() {
  const jsonLd = buildHomepageJsonLd();

  return (
    <>
      <script
        id="stayknown-homepage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <StayKnownHomePage />
    </>
  );
}

