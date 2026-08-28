import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";

import { PublicWebsiteVisitTracker } from "@/components/PublicWebsiteVisitCounter";

import "./globals.css";

/*
 * Variable fonts keep the premium StayKnown typography while avoiding
 * separate font files for every individual weight.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Arial",
    "sans-serif",
  ],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  preload: true,
  fallback: [
    "Inter",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Arial",
    "sans-serif",
  ],
});

const SITE_URL = "https://www.stay-known.com";
const APP_NAME = "StayKnown";
const FOUNDER_NAME = "6 Clement Joshua";
const ANDROID_PACKAGE = "com.stayknown.app";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

const TIKTOK_URL = "https://www.tiktok.com/@stayknownapp";
const X_URL = "https://x.com/stayknownapp";
const YOUTUBE_URL = "https://www.youtube.com/@stayknownapp";

const DEFAULT_TITLE = "StayKnown: Consent-First Personal Safety, Visits & SOS";

const DEFAULT_DESCRIPTION =
  "StayKnown is a consent-first safety app with LIVE Visits, I’M SAFE check-ins, SOS alerts, approved contacts, secure chat and location sharing.";
const OG_IMAGE = "/hero/visit-live-sos.png";
const LOGO_IMAGE = "/6logo.png";

const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

const BING_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim();

function absoluteUrl(pathname: string): string {
  return new URL(pathname, SITE_URL).toString();
}

/*
 * Do not set one global canonical URL here.
 *
 * A canonical placed in the root layout can be inherited by policy, Learn,
 * pricing and support pages and may incorrectly point them all to "/".
 * Each indexable route should receive its own self-canonical metadata.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: DEFAULT_TITLE,
    template: "%s | StayKnown",
  },

  description: DEFAULT_DESCRIPTION,
  applicationName: APP_NAME,

  authors: [
    {
      name: APP_NAME,
      url: SITE_URL,
    },
  ],
  creator: FOUNDER_NAME,
  publisher: APP_NAME,
  category: "Personal safety",
  classification: "Consent-first personal safety application",

  keywords: [
    "StayKnown",
    "consent-first safety app",
    "personal safety app",
    "Android safety app",
    "active Visit safety",
    "live location sharing",
    "temporary location sharing",
    "approved contacts",
    "SOS alerts",
    "emergency contacts",
    "I'M SAFE check-in",
    "safety check-in app",
    "travel safety app",
    "ride-hailing safety",
    "student safety app",
    "family safety without tracking",
    "privacy-first location sharing",
    "secure safety chat",
    "safety evidence",
    "Nigeria safety app",
  ],

  referrer: "strict-origin-when-cross-origin",

  formatDetection: {
    telephone: false,
    address: false,
    email: false,
    date: false,
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: APP_NAME,
    locale: "en_NG",
  },

  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },

  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": APP_NAME,
    "google-play-app": `app-id=${ANDROID_PACKAGE}`,
    "msapplication-TileColor": "#000000",
    rating: "general",

    ...(GOOGLE_SITE_VERIFICATION
      ? {
          "google-site-verification": GOOGLE_SITE_VERIFICATION,
        }
      : {}),

    ...(BING_SITE_VERIFICATION
      ? {
          "msvalidate.01": BING_SITE_VERIFICATION,
        }
      : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    {
      media: "(prefers-color-scheme: dark)",
      color: "#000000",
    },
    {
      media: "(prefers-color-scheme: light)",
      color: "#000000",
    },
  ],
  colorScheme: "dark",
};

function buildGlobalJsonLd() {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const logoId = `${SITE_URL}/#logo`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: APP_NAME,
        url: SITE_URL,
        description:
          "StayKnown develops consent-first personal safety tools for active Visits, safety check-ins, approved contacts, secure communication and emergency escalation.",
        founder: {
          "@type": "Person",
          name: FOUNDER_NAME,
        },
        brand: {
          "@type": "Brand",
          name: APP_NAME,
        },
        logo: {
          "@type": "ImageObject",
          "@id": logoId,
          url: absoluteUrl(LOGO_IMAGE),
          contentUrl: absoluteUrl(LOGO_IMAGE),
          caption: "StayKnown logo",
        },
        image: {
          "@type": "ImageObject",
          url: absoluteUrl(OG_IMAGE),
          contentUrl: absoluteUrl(OG_IMAGE),
          caption: "StayKnown personal safety app",
        },
        sameAs: [GOOGLE_PLAY_URL, TIKTOK_URL, X_URL, YOUTUBE_URL],
        knowsAbout: [
          "Consent-first personal safety",
          "Active Visit safety",
          "Temporary live location sharing",
          "Approved contacts",
          "Safety check-ins",
          "SOS alerts",
          "Secure safety communication",
          "Guardian safeguards",
          "Device and session security",
          "Safety history",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: APP_NAME,
        alternateName: "Stay Known",
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en",
        publisher: {
          "@id": organizationId,
        },
      },
      {
        "@type": "MobileApplication",
        "@id": `${SITE_URL}/#android-application`,
        name: APP_NAME,
        url: SITE_URL,
        downloadUrl: GOOGLE_PLAY_URL,
        installUrl: GOOGLE_PLAY_URL,
        operatingSystem: "Android",
        applicationCategory: "LifestyleApplication",
        applicationSubCategory: "Personal Safety",
        description: DEFAULT_DESCRIPTION,
        isAccessibleForFree: true,
        featureList: [
          "User-started safety Visits",
          "LIVE sharing during active safety sessions",
          "I'M SAFE check-ins",
          "SOS alerts to trusted contacts",
          "Approved-contact safety access",
          "Secure chat and safety context",
          "Safety evidence and recognition",
          "Guardian safeguards",
          "Device and session security",
          "Safety history and delivery health",
        ],
        author: {
          "@id": organizationId,
        },
        publisher: {
          "@id": organizationId,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          category: "Free starter access with optional paid upgrades",
          availability: "https://schema.org/InStock",
          url: GOOGLE_PLAY_URL,
        },
        sameAs: GOOGLE_PLAY_URL,
      },
    ],
  };
}

function serializeJsonLd(value: unknown): string {
  /*
   * Escaping "<" prevents an unexpected HTML closing tag from terminating
   * the JSON-LD script if future structured data contains user-controlled text.
   */
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const jsonLd = buildGlobalJsonLd();

  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <script
          id="stayknown-global-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(jsonLd),
          }}
        />
      </head>

      <body className="min-h-screen bg-black antialiased">
        <a
          href="#main-content"
          className="
            fixed left-4 top-4 z-[9999] -translate-y-24 rounded-full
            border border-white/20 bg-white px-5 py-3 text-sm font-black
            text-black shadow-2xl transition-transform
            focus-visible:translate-y-0
          "
        >
          Skip to main content
        </a>

        <PublicWebsiteVisitTracker />

        <div id="main-content" tabIndex={-1} className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
