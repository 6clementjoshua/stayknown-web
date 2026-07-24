import type { MetadataRoute } from "next";

const SITE_URL = "https://www.stay-known.com";

/**
 * Public website crawl policy.
 *
 * StayKnown's marketing, Learn, Help, trust, safety and policy pages remain
 * available to search engines.
 *
 * Private application routes must be protected using authentication and
 * page-level noindex metadata. robots.txt is not a security mechanism.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
