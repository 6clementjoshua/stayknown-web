import type { Metadata } from "next";

import GooglePlayRecognitionExperience from "@/components/GooglePlayRecognitionExperience";

const SITE_URL = "https://www.stay-known.com";
const PAGE_PATH = "/recognition/google-play-indie-corner";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

const TITLE =
  "StayKnown Google Play Indie Corner Nomination | Recognition";
const DESCRIPTION =
  "Explore StayKnown's Google Play Indie Corner nomination and the consent-first safety mission, features, privacy principles, and independent product work behind the recognition.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  keywords: [
    "StayKnown Google Play recognition",
    "StayKnown Indie Corner nomination",
    "Google Play Indie Corner",
    "independent Android safety app",
    "consent-first safety app",
    "StayKnown personal safety",
    "Nigeria technology startup",
    "6Clement Joshua",
  ],
  openGraph: {
    type: "article",
    url: PAGE_PATH,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "StayKnown",
    locale: "en_NG",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "StayKnown Google Play Indie Corner nomination",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/twitter-image"],
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

function buildRecognitionJsonLd() {
  const organizationId = `${SITE_URL}/#organization`;
  const appId = `${SITE_URL}/#android-application`;
  const pageId = `${PAGE_URL}/#webpage`;
  const articleId = `${PAGE_URL}/#article`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "StayKnown",
        url: SITE_URL,
        logo: `${SITE_URL}/6logo.png`,
        founder: {
          "@type": "Person",
          name: "6Clement Joshua",
        },
        sameAs: [
          "https://www.tiktok.com/@stayknownapp",
          "https://x.com/stayknownapp",
          "https://www.youtube.com/@stayknownapp",
          GOOGLE_PLAY_URL,
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": appId,
        name: "StayKnown",
        url: SITE_URL,
        downloadUrl: GOOGLE_PLAY_URL,
        installUrl: GOOGLE_PLAY_URL,
        operatingSystem: "Android",
        applicationCategory: "LifestyleApplication",
        applicationSubCategory: "Personal Safety",
        publisher: {
          "@id": organizationId,
        },
        featureList: [
          "Consent-first approved contacts",
          "User-started safety Visits",
          "LIVE sharing during active safety sessions",
          "I'M SAFE check-ins",
          "SOS alerts and response context",
          "Secure approved-contact chat",
          "Guardian safeguards for minors",
          "Device and session security controls",
          "Safety history and delivery health",
        ],
      },
      {
        "@type": "WebPage",
        "@id": pageId,
        url: PAGE_URL,
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": appId,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/opengraph-image`,
        },
      },
      {
        "@type": "Article",
        "@id": articleId,
        headline: "StayKnown's Google Play Indie Corner nomination",
        description: DESCRIPTION,
        datePublished: "2026-07-30",
        dateModified: "2026-07-30",
        mainEntityOfPage: {
          "@id": pageId,
        },
        author: {
          "@id": organizationId,
        },
        publisher: {
          "@id": organizationId,
        },
        about: {
          "@id": appId,
        },
        image: `${SITE_URL}/opengraph-image`,
      },
      {
        "@type": "BreadcrumbList",
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
            name: "Recognition",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };
}

export default function GooglePlayRecognitionPage() {
  const jsonLd = buildRecognitionJsonLd();

  return (
    <>
      <script
        id="stayknown-google-play-recognition-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <GooglePlayRecognitionExperience />
    </>
  );
}
