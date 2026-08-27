import type { Metadata } from "next";

import { UpdatesFeed } from "@/components/updates/UpdatesFeed";
import {
  getRouteViews,
  listPublicUpdates,
  SITE_URL,
} from "@/lib/stayknown-updates";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const DESCRIPTION =
  "The official public record of what StayKnown is building, changing and releasing across product, safety, technology and company updates.";

export async function generateMetadata(): Promise<Metadata> {
  const latest = (await listPublicUpdates(1))[0] || null;
  const image = latest?.image_16_9_url || latest?.hero_image_url || "";
  const imageAlt = latest?.hero_alt_text || latest?.title || "StayKnown Updates";

  return {
    title: "StayKnown Updates",
    description: DESCRIPTION,
    alternates: { canonical: "/updates" },
    openGraph: {
      type: "website",
      url: "/updates",
      siteName: "StayKnown",
      title: "StayKnown Updates",
      description: DESCRIPTION,
      ...(image
        ? {
            images: [
              {
                url: image,
                width: 1600,
                height: 900,
                alt: imageAlt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: "StayKnown Updates",
      description: DESCRIPTION,
      ...(image ? { images: [image] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    metadataBase: new URL(SITE_URL),
  };
}

export default async function Page() {
  const [posts, views] = await Promise.all([
    listPublicUpdates(),
    getRouteViews("/updates"),
  ]);

  return <UpdatesFeed posts={posts} totalViews={views} />;
}
