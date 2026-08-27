import type { MetadataRoute } from "next";
import {
  listPublicUpdates,
  publicDate,
  SITE_URL,
} from "@/lib/stayknown-updates";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublicUpdates(5000);
  return [
    {
      url: `${SITE_URL}/updates`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...posts.map((p) => ({
      url: `${SITE_URL}/updates/${p.slug}`,
      lastModified: new Date(p.updated_at || publicDate(p)),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
