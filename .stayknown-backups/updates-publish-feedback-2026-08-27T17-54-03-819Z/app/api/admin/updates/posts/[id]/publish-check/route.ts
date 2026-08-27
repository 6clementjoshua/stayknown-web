import {
  SITE_URL,
  adminClient,
  canonicalPath,
  canonicalUrl,
  isPublicPost,
} from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function noStoreJson(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      "cache-control": "no-store, max-age=0",
      ...(init.headers || {}),
    },
  });
}

async function fetchText(url: string) {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "user-agent": "StayKnown-Publication-Verification/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    return {
      ok: response.ok,
      status: response.status,
      text: await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      text: "",
      error: error instanceof Error ? error.message : "request_failed",
    };
  }
}

function containsUrl(source: string, url: string) {
  if (!source || !url) return false;
  return (
    source.includes(url) ||
    source.includes(url.replaceAll("&", "&amp;")) ||
    source.includes(url.replaceAll("&", "\\u0026"))
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireUpdatesAdmin(req);

    const sb = adminClient();
    const { data, error } = await sb
      .from("stayknown_updates_posts")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return noStoreJson(
        { error: "This publication is unavailable or is in Recently Deleted." },
        { status: 404 },
      );
    }

    const post = data as any;
    const publicNow = isPublicPost(post);
    const publicPath = canonicalPath(post.slug);
    const publicUrl = canonicalUrl(post.slug);
    const expectedImage = String(
      post.image_16_9_url || post.hero_image_url || "",
    );

    if (!publicNow) {
      return noStoreJson({
        ok: false,
        publicUrl,
        checkedAt: new Date().toISOString(),
        views: 0,
        likes: Number(post.like_count || 0),
        checks: [
          {
            key: "public_state",
            label: "Public visibility",
            ok: false,
            detail:
              post.status === "scheduled"
                ? "This Update is scheduled and is not public yet."
                : "This Update is not currently published.",
          },
        ],
      });
    }

    const [page, sitemap, feed, viewsResult] = await Promise.all([
      fetchText(publicUrl),
      fetchText(`${SITE_URL}/updates/sitemap.xml`),
      fetchText(`${SITE_URL}/updates/feed.xml`),
      sb
        .from("website_route_visit_totals")
        .select("total_visits")
        .eq("path", publicPath)
        .maybeSingle(),
    ]);

    const pageHtml = page.text || "";
    const sitemapXml = sitemap.text || "";
    const feedXml = feed.text || "";

    const canonicalReady =
      page.ok &&
      (containsUrl(pageHtml, publicUrl) ||
        pageHtml.includes(`href="${publicPath}"`));

    const ogImageReady =
      page.ok &&
      Boolean(expectedImage) &&
      containsUrl(pageHtml, expectedImage) &&
      /property=["']og:image(?::url)?["']/i.test(pageHtml);

    const twitterReady =
      page.ok &&
      /name=["']twitter:card["'][^>]+content=["']summary_large_image["']/i.test(
        pageHtml,
      );

    const jsonLdReady =
      page.ok &&
      pageHtml.includes("application/ld+json") &&
      pageHtml.includes(String(post.title || "")) &&
      [post.image_16_9_url, post.image_4_3_url, post.image_1_1_url]
        .filter(Boolean)
        .every((url: string) => containsUrl(pageHtml, String(url)));

    const sitemapReady = sitemap.ok && containsUrl(sitemapXml, publicUrl);
    const feedReady = feed.ok && containsUrl(feedXml, publicUrl);

    const views = Number(
      (viewsResult.data as { total_visits?: unknown } | null)?.total_visits || 0,
    );
    const likes = Number(post.like_count || 0);

    const checks = [
      {
        key: "public_url",
        label: "Public Update URL",
        ok: page.ok,
        detail: page.ok
          ? `${publicUrl} returned HTTP ${page.status}.`
          : `${publicUrl} could not be loaded (HTTP ${page.status || "unavailable"}).`,
      },
      {
        key: "canonical",
        label: "Canonical URL",
        ok: canonicalReady,
        detail: canonicalReady
          ? `Canonical points to ${publicPath}.`
          : "The live page did not expose the expected canonical URL.",
      },
      {
        key: "social_image",
        label: "Social share image",
        ok: ogImageReady && twitterReady,
        detail:
          ogImageReady && twitterReady
            ? "Open Graph and X/Twitter use the Update's 16:9 representative image."
            : "The expected large social-card metadata was not confirmed.",
      },
      {
        key: "article_schema",
        label: "Article structured data",
        ok: jsonLdReady,
        detail: jsonLdReady
          ? "Article JSON-LD includes the headline and representative image set."
          : "The expected Article JSON-LD could not be fully confirmed.",
      },
      {
        key: "sitemap",
        label: "Updates sitemap",
        ok: sitemapReady,
        detail: sitemapReady
          ? "The live Update URL is present in /updates/sitemap.xml."
          : "The live Update URL was not found in /updates/sitemap.xml.",
      },
      {
        key: "rss",
        label: "Updates RSS",
        ok: feedReady,
        detail: feedReady
          ? "The live Update URL is present in /updates/feed.xml."
          : "The live Update URL was not found in /updates/feed.xml.",
      },
      {
        key: "engagement",
        label: "Likes & analytics",
        ok: Number.isFinite(views) && Number.isFinite(likes),
        detail: `${Number.isFinite(views) ? views : 0} views and ${
          Number.isFinite(likes) ? likes : 0
        } likes are currently recorded.`,
      },
    ];

    return noStoreJson({
      ok: checks.every((check) => check.ok),
      publicUrl,
      checkedAt: new Date().toISOString(),
      views: Number.isFinite(views) ? views : 0,
      likes: Number.isFinite(likes) ? likes : 0,
      checks,
    });
  } catch (error) {
    const status = Number((error as { status?: number })?.status) || 500;

    return noStoreJson(
      {
        error:
          status === 401
            ? "Sign in to Updates & Publication Admin again."
            : status === 403
              ? "This administrator cannot verify publications."
              : error instanceof Error
                ? error.message
                : "Publication verification failed.",
      },
      { status },
    );
  }
}
