import type { Metadata } from "next";
import StayKnownHomePage from "@/components/StayKnownHomePage";
import { HOME_FAQS } from "@/lib/stayknown-home-content";

const SITE_URL = "https://www.stay-known.com";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

const TITLE =
  "StayKnown Personal Safety App | Visits, LIVE Sharing & SOS";

const DESCRIPTION =
  "StayKnown is a consent-first Android safety app for active Visits, LIVE sharing, I’M SAFE check-ins, SOS alerts, approved contacts, and secure chat.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/",
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
    "student safety app",
    "travel safety app",
    "ride-hailing safety",
    "family safety without permanent tracking",
    "Nigeria safety app",
  ],

  openGraph: {
    type: "website",
    url: "/",
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
      name: "StayKnown Pro Monthly — Global",
      price: "14.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Yearly — Global",
      price: "149.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Max Monthly — Global",
      price: "24.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Max Yearly — Global",
      price: "249.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: GOOGLE_PLAY_URL,
    },
    {
      "@type": "Offer",
      name: "StayKnown Pro Monthly — Nigeria",
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
      name: "StayKnown Pro Yearly — Nigeria",
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
      name: "StayKnown Pro Max Monthly — Nigeria",
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
      name: "StayKnown Pro Max Yearly — Nigeria",
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
        image: absoluteUrl("/hero/visit-live-sos.png"),
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
          "Secure chat and translation",
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
