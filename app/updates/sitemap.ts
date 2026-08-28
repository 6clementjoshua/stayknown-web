import type { MetadataRoute } from "next";

import {
  listPublicUpdates,
  publicDate,
  SITE_URL,
} from "@/lib/stayknown-updates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublicUpdates(5000);

  return [
    {
      url: `${SITE_URL}/updates`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...posts.map((post) => {
      const images = [
        post.image_16_9_url,
        post.image_4_3_url,
        post.image_1_1_url,
      ].filter((value): value is string => Boolean(value));

      return {
        url: `${SITE_URL}/updates/${post.slug}`,
        lastModified: new Date(post.updated_at || publicDate(post)),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        ...(images.length ? { images: Array.from(new Set(images)) } : {}),
      };
    }),
  ];
}
