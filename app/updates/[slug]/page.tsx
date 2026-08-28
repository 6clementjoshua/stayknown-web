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
  const post = await getPublicUpdate(slug);

  if (!post) {
    return {
      title: "Update not found",
      robots: { index: false, follow: false },
    };
  }

  const path = canonicalPath(post.slug);
  const image = post.image_16_9_url || post.hero_image_url || undefined;

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.summary,
    alternates: {
      canonical: path,
      types: {
        "application/rss+xml": `${SITE_URL}/updates/feed.xml`,
      },
    },
    openGraph: {
      type: "article",
      url: path,
      siteName: "StayKnown",
      title: post.seo_title || post.title,
      description: post.seo_description || post.summary,
      images: image
        ? [{ url: image, alt: post.hero_alt_text || post.title }]
        : undefined,
      publishedTime: publicDate(post),
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_title || post.title,
      description: post.seo_description || post.summary,
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
  const post = await getPublicUpdate(slug);
  if (!post) notFound();

  const views = await getRouteViews(canonicalPath(post.slug));
  const images = [
    post.image_1_1_url,
    post.image_4_3_url,
    post.image_16_9_url,
  ].filter((value): value is string => Boolean(value));

  const firstVideo = Array.isArray(post.body)
    ? (post.body as any[]).find(
        (block) => block?.type === "video" && typeof block?.url === "string",
      )
    : null;
  const videoThumbnail =
    firstVideo?.poster_url ||
    post.image_16_9_url ||
    post.hero_image_url ||
    null;

  const articleUrl = canonicalUrl(post.slug);
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": post.article_type || "Article",
    "@id": `${articleUrl}#article`,
    url: articleUrl,
    headline: post.title,
    description: post.summary,
    image: images,
    thumbnailUrl: post.image_16_9_url || post.hero_image_url || undefined,
    datePublished: publicDate(post),
    dateModified: post.updated_at,
    inLanguage: "en",
    isAccessibleForFree: true,
    articleSection: post.category || undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    author: {
      "@type": post.author_name === "StayKnown" ? "Organization" : "Person",
      name: post.author_name,
      ...(post.author_url ? { url: post.author_url } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.png`,
      },
    },
  };

  if (firstVideo && videoThumbnail) {
    jsonLd.video = {
      "@type": "VideoObject",
      name: firstVideo.title || firstVideo.caption || post.title,
      description: firstVideo.caption || post.summary,
      contentUrl: firstVideo.url,
      thumbnailUrl: [videoThumbnail],
      uploadDate: publicDate(post),
    };
  }

  return (
    <>
      <Script
        id="stayknown-update-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <UpdateArticle post={post} views={views} />
    </>
  );
}
