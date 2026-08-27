import type { MetadataRoute } from "next";

const SITE_URL = "https://www.stay-known.com";

/**
 * Public website crawl policy.
 *
 * StayKnown's marketing, Learn, Help, trust, safety, recognition and policy
 * pages remain available to search engines.
 *
 * Private application routes must still be protected with authentication,
 * signed access and page-level noindex metadata. robots.txt is a crawl hint,
 * not a security boundary.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login-callback", "/live/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
