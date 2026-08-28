import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { UpdateArticle } from "@/components/updates/UpdateArticle";
import {
  canonicalPath,
  canonicalUrl,
  getPublicUpdate,
  getRouteViews,
  publicDate,
  SITE_URL,
} from "@/lib/stayknown-updates";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicUpdate(slug);
  if (!p)
    return {
      title: "Update not found",
      robots: { index: false, follow: false },
    };
  const path = canonicalPath(p.slug);
  const image = p.image_16_9_url || p.hero_image_url || undefined;
  return {
    title: p.seo_title || p.title,
    description: p.seo_description || p.summary,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      siteName: "StayKnown",
      title: p.seo_title || p.title,
      description: p.seo_description || p.summary,
      images: image
        ? [{ url: image, alt: p.hero_alt_text || p.title }]
        : undefined,
      publishedTime: publicDate(p),
      modifiedTime: p.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title: p.seo_title || p.title,
      description: p.seo_description || p.summary,
      images: image ? [image] : undefined,
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
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPublicUpdate(slug);
  if (!p) notFound();
  const views = await getRouteViews(canonicalPath(p.slug));
  const images = [p.image_1_1_url, p.image_4_3_url, p.image_16_9_url].filter(
    Boolean,
  );
  const ld = {
    "@context": "https://schema.org",
    "@type": p.article_type || "Article",
    headline: p.title,
    description: p.summary,
    image: images,
    datePublished: publicDate(p),
    dateModified: p.updated_at,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl(p.slug) },
    author: {
      "@type": p.author_name === "StayKnown" ? "Organization" : "Person",
      name: p.author_name,
      ...(p.author_url ? { url: p.author_url } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
    },
  };
  return (
    <>
      <Script
        id="stayknown-update-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <UpdateArticle post={p} views={views} />
    </>
  );
}
