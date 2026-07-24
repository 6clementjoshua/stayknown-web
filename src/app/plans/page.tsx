import type { Metadata } from "next";
import { headers } from "next/headers";
import PlansExperience from "@/components/PlansExperience";
import { resolveBillingRegionFromHeaders } from "@/lib/stayknown-billing-region";

const SITE_URL = "https://www.stay-known.com";
const PAGE_URL = `${SITE_URL}/plans`;
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

const TITLE =
  "StayKnown Plans & Pricing | Starter, Pro and Pro Max";

const DESCRIPTION =
  "Compare StayKnown Starter, Pro, and Pro Max with IP-based NGN or global USD pricing, approved-contact capacity, SOS contacts, responders, Safety Gallery, chat, translation, and personalization.";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: "/plans",
  },

  keywords: [
    "StayKnown pricing",
    "StayKnown plans",
    "Starter Pro Pro Max",
    "Nigeria safety app pricing",
    "NGN safety app subscription",
    "personal safety app plans",
    "SOS contact capacity",
    "approved contact plans",
    "Safety Gallery plans",
  ],

  openGraph: {
    type: "website",
    url: "/plans",
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

function buildJsonLd() {
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
  ];

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
          url: `${SITE_URL}/hero/promax-shell.png`,
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
            name: "Plans and Pricing",
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "Product",
        "@id": `${PAGE_URL}/#plans`,
        name: "StayKnown safety plans",
        description: DESCRIPTION,
        brand: {
          "@type": "Brand",
          name: "StayKnown",
        },
        image: `${SITE_URL}/hero/promax-shell.png`,
        offers,
      },
    ],
  };
}

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function PlansPage() {
  const requestHeaders = await headers();
  const initialRegion = await resolveBillingRegionFromHeaders(requestHeaders);
  const jsonLd = buildJsonLd();

  return (
    <>
      <script
        id="stayknown-plans-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <PlansExperience initialRegion={initialRegion} />
    </>
  );
}
