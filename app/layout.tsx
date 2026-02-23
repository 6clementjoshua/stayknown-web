import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";

// ✅ Fonts like 6ride (CSS variables)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

// ✅ Update to your real domain when ready
const SITE_URL = "https://stay-known.com";

// Brand
const APP_NAME = "StayKnown";
const TITLE = "StayKnown — Personal safety visits, live sharing, Secure Chats and SOS escalation";
const DESCRIPTION =
  "StayKnown helps you share live locations during active visits to places,people and environments your not familiar with, keep SOS off-by-default, and escalate emergencies fast. Safety tools activate only when you initiate them.";

const OG_IMAGE = "/og-stayknown.png";
const TW_IMAGE = "/twitter-stayknown.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: TITLE,
    template: "%s — StayKnown",
  },

  description: DESCRIPTION,
  applicationName: APP_NAME,

  keywords: [
    "StayKnown",
    "personal safety app",
    "live location sharing",
    "SOS escalation",
    "visit tracking",
    "emergency contacts",
    "anti-stalking safety",
    "safety check-in",
    "location sharing during visits",
    "privacy-first safety",
    "off by default tracking",
    "emergency alert",
    "safety tools",
  ],

  authors: [{ name: "StayKnown" }],
  creator: "StayKnown",
  publisher: "StayKnown",
  category: "Safety",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: APP_NAME,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [TW_IMAGE],
  },

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },

  other: {
    "apple-mobile-web-app-title": APP_NAME,
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

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

function buildJsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: SITE_URL,
    logo: new URL("/favicon.png", SITE_URL).toString(),
    sameAs: [
      // add official socials when ready
    ],
  };

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    applicationCategory: "SafetyApplication",
    operatingSystem: "iOS, Android, Web",
    url: SITE_URL,
    description: DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: SITE_URL,
    inLanguage: "en",
  };

  return [org, softwareApp, website];
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = buildJsonLd();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${space.variable}`}
    >
      <head>
        {/* ✅ SEO helpers */}
        <meta
          name="format-detection"
          content="telephone=no, date=no, address=no, email=no"
        />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* ✅ Optional (add these files when you have them) */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="sitemap" href="/sitemap.xml" />
        <link rel="canonical" href={SITE_URL} />

        {/* ✅ “Protection” basics (browser-side) */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />

        {/* ✅ JSON-LD structured data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}