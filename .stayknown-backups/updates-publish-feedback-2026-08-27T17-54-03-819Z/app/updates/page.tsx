import type { Metadata } from "next";
import { UpdatesFeed } from "@/components/updates/UpdatesFeed";
import {
  getRouteViews,
  listPublicUpdates,
  SITE_URL,
} from "@/lib/stayknown-updates";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "StayKnown Updates",
  description:
    "Official StayKnown product, safety, technology, company and release updates.",
  alternates: { canonical: "/updates" },
  openGraph: {
    type: "website",
    url: "/updates",
    siteName: "StayKnown",
    title: "StayKnown Updates",
    description:
      "The official public record of what StayKnown is building, changing and releasing.",
  },
  twitter: {
    card: "summary_large_image",
    title: "StayKnown Updates",
    description:
      "Product, safety, technology and company updates from StayKnown.",
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
};
export default async function Page() {
  const [posts, views] = await Promise.all([
    listPublicUpdates(),
    getRouteViews("/updates"),
  ]);
  return <UpdatesFeed posts={posts} totalViews={views} />;
}
