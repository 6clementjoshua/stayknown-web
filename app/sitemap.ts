import type { MetadataRoute } from "next";

const SITE_URL = "https://www.stay-known.com";
const PREVIOUS_CONTENT_UPDATE = "2026-05-31";
const HOMEPAGE_UPDATE = "2026-07-24";
const ACCOUNT_CLOSURE_UPDATE = "2026-07-27";

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;

type PublicRoute = {
  path: `/${string}` | "/";
  changeFrequency: ChangeFrequency;
  priority: number;
  lastModified?: string;
  images?: string[];
};

function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/*
 * These assets are visibly used by the homepage presentation.
 * Including them allows Next.js to generate image-sitemap entries
 * without making the website load the images any earlier.
 */
const homepageImages = [
  "/hero/visit-live-sos.png",
  "/hero/stayknown-safe-journey-bus.png",
  "/hero/stayknown-family-farewell.png",
  "/hero/get-safe-hints.png",
  "/hero/visit-live.png",
  "/hero/live-map.png",
  "/hero/promax-shell.png",
  "/hero/manual-capture.png",
  "/hero/sos-activated.png",
  "/hero/sos-live-idle.png",
  "/hero/end-sos-verify.png",
  "/hero/end-visit-verify.png",
  "/hero/vpn-safety-gate.png",
  "/hero/secure-chat-biometric.png",
  "/hero/chat-translation.png",
  "/hero/chat-stickers-voice.png",
  "/hero/contact-approval.png",
  "/hero/verification.png",
  "/hero/safety-gallery.png",
  "/hero/stories-profile.png",
].map(absoluteUrl);

const coreRoutes: readonly PublicRoute[] = [
  {
    path: "/",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "weekly",
    priority: 1,
    images: homepageImages,
  },
  {
    path: "/how-it-works",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "weekly",
    priority: 0.95,
    images: [
      absoluteUrl("/hero/visit-live-sos.png"),
      absoluteUrl("/hero/contact-approval.png"),
      absoluteUrl("/hero/live-map.png"),
      absoluteUrl("/hero/sos-activated.png"),
      absoluteUrl("/hero/end-visit-verify.png"),
    ],
  },
  {
    path: "/features",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "weekly",
    priority: 0.94,
    images: [
      absoluteUrl("/hero/visit-live.png"),
      absoluteUrl("/hero/sos-activated.png"),
      absoluteUrl("/hero/contact-approval.png"),
      absoluteUrl("/hero/secure-chat-biometric.png"),
      absoluteUrl("/hero/vpn-safety-gate.png"),
    ],
  },
  {
    path: "/watch",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "weekly",
    priority: 0.93,
    images: [
      absoluteUrl("/hero/stayknown-safe-journey-bus.png"),
      absoluteUrl("/hero/contact-approval.png"),
      absoluteUrl("/hero/visit-live-sos.png"),
      absoluteUrl("/hero/live-map.png"),
      absoluteUrl("/hero/manual-capture.png"),
      absoluteUrl("/hero/get-safe-hints.png"),
      absoluteUrl("/hero/sos-activated.png"),
      absoluteUrl("/hero/secure-chat-biometric.png"),
      absoluteUrl("/hero/end-visit-verify.png"),
    ],
  },
  {
    path: "/plans",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "weekly",
    priority: 0.93,
    images: [
      absoluteUrl("/hero/promax-shell.png"),
      absoluteUrl("/hero/contact-approval.png"),
      absoluteUrl("/hero/sos-activated.png"),
    ],
  },
  {
    path: "/students",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "weekly",
    priority: 0.88,
    images: [
      absoluteUrl("/hero/stayknown-safe-journey-bus.png"),
      absoluteUrl("/hero/visit-live-sos.png"),
      absoluteUrl("/hero/live-map.png"),
      absoluteUrl("/hero/get-safe-hints.png"),
      absoluteUrl("/hero/sos-activated.png"),
    ],
  },
  {
    path: "/travel-rides",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "weekly",
    priority: 0.88,
    images: [
      absoluteUrl("/hero/stayknown-safe-journey-bus.png"),
      absoluteUrl("/hero/visit-live.png"),
      absoluteUrl("/hero/live-map.png"),
      absoluteUrl("/hero/manual-capture.png"),
      absoluteUrl("/hero/sos-activated.png"),
    ],
  },
  {
    path: "/families-guardians",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "weekly",
    priority: 0.88,
    images: [
      absoluteUrl("/hero/stayknown-family-farewell.png"),
      absoluteUrl("/hero/contact-approval.png"),
      absoluteUrl("/hero/get-safe-hints.png"),
      absoluteUrl("/hero/sos-activated.png"),
      absoluteUrl("/hero/end-visit-verify.png"),
    ],
  },
  {
    path: "/accessibility",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "monthly",
    priority: 0.76,
  },
  {
    path: "/status",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "daily",
    priority: 0.72,
  },
  {
    path: "/about",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "monthly",
    priority: 0.82,
    images: [
      absoluteUrl("/hero/stayknown-family-farewell.png"),
      absoluteUrl("/hero/visit-live-sos.png"),
      absoluteUrl("/hero/promax-shell.png"),
    ],
  },
  {
    path: "/press-updates",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "weekly",
    priority: 0.78,
    images: [
      absoluteUrl("/hero/visit-live-sos.png"),
      absoluteUrl("/hero/promax-shell.png"),
      absoluteUrl("/hero/contact-approval.png"),
    ],
  },
  {
    path: "/donate",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "weekly",
    priority: 0.92,
  },
  {
    path: "/help-center",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/submit-request",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/submit-feature",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.85,
  },
];

const policyAndTrustRoutes: readonly PublicRoute[] = [
  {
    path: "/privacy",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/terms",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/account-closure",
    lastModified: ACCOUNT_CLOSURE_UPDATE,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/billing-policy",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/trust-safety",
    lastModified: HOMEPAGE_UPDATE,
    changeFrequency: "weekly",
    priority: 0.92,
    images: [
      absoluteUrl("/hero/contact-approval.png"),
      absoluteUrl("/hero/live-map.png"),
      absoluteUrl("/hero/sos-activated.png"),
      absoluteUrl("/hero/secure-chat-biometric.png"),
      absoluteUrl("/hero/vpn-safety-gate.png"),
      absoluteUrl("/hero/safety-gallery.png"),
    ],
  },
  {
    path: "/verification-policy",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.84,
  },
  {
    path: "/creator-apply",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.86,
  },
  {
    path: "/creator-policy",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.78,
  },
  {
    path: "/donor-policy",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.78,
  },
  {
    path: "/security",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/location-safety",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/contact-consent",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/acceptable-use",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/safety",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.82,
  },
  {
    path: "/emergency",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/minors",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/guardian-consent",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.78,
  },
  {
    path: "/abuse",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/retention",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/law",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.75,
  },
];

const learnRoutes: readonly PublicRoute[] = [
  /*
   * These two routes already power the cinematic homepage Learn More flow
   * but were missing from the previous static XML sitemap.
   */
  {
    path: "/learn/safe-journey",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.92,
  },
  {
    path: "/learn/family-safety",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/learn/get-safe-guidance",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/learn/visit-live-sos",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.86,
  },
  {
    path: "/learn/visit-live",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/learn/live-map",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/learn/promax-shell",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.78,
  },
  {
    path: "/learn/manual-capture",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.84,
  },
  {
    path: "/learn/sos",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.86,
  },
  {
    path: "/learn/end-sos-verify",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/learn/end-visit-verify",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/learn/vpn-safety",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.84,
  },
  {
    path: "/learn/secure-chat-protection",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.83,
  },
  {
    path: "/learn/language-aware-chat",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.82,
  },
  {
    path: "/learn/chat",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/learn/contact-approval",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.82,
  },
  {
    path: "/learn/verification",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.84,
  },
  {
    path: "/learn/safety-gallery",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/learn/stories-profile-trust",
    lastModified: PREVIOUS_CONTENT_UPDATE,
    changeFrequency: "monthly",
    priority: 0.8,
  },
];

const publicRoutes: readonly PublicRoute[] = [
  ...coreRoutes,
  ...policyAndTrustRoutes,
  ...learnRoutes,
];

export default function sitemap(): MetadataRoute.Sitemap {
  const uniqueRoutes = new Map<string, PublicRoute>();

  for (const route of publicRoutes) {
    uniqueRoutes.set(absoluteUrl(route.path), route);
  }

  return Array.from(uniqueRoutes.entries()).map(
    ([
      url,
      {
        lastModified,
        changeFrequency,
        priority,
        images,
      },
    ]): SitemapEntry => ({
      url,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency,
      priority,
      ...(images?.length
        ? { images: Array.from(new Set(images)) }
        : {}),
    }),
  );
}