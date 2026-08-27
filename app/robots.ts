import type { MetadataRoute } from "next";
const SITE_URL = "https://www.stay-known.com";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/login-callback", "/live/"],
    },
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/updates/sitemap.xml`],
    host: SITE_URL,
  };
}
