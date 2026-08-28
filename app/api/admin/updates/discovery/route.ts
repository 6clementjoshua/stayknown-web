import {
  adminClient,
  isPublicPost,
  publicDate,
  SITE_URL,
} from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";
import { notifyUpdatesDiscovery } from "@/lib/stayknown-updates-discovery";

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

function absolute(pathname: string): string {
  return new URL(pathname, SITE_URL).toString();
}

async function fetchText(url: string) {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "user-agent": "StayKnown-Updates-Discovery-Check/1.0" },
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      text: "",
      error: error instanceof Error ? error.message : "Request failed.",
    };
  }
}

export async function GET(req: Request) {
  try {
    await requireUpdatesAdmin(req);

    const { data, error } = await adminClient()
      .from("stayknown_updates_posts")
      .select(
        "id,slug,title,status,published_at,scheduled_for,created_at,updated_at,deleted_at",
      )
      .is("deleted_at", null)
      .limit(1000);

    if (error) throw error;

    const publicPosts = (data || [])
      .filter((row: any) => isPublicPost(row))
      .sort(
        (a: any, b: any) =>
          new Date(publicDate(b)).getTime() - new Date(publicDate(a)).getTime(),
      );
    const latest = publicPosts[0] || null;

    const urls = {
      updates: absolute("/updates"),
      sitemap: absolute("/updates/sitemap.xml"),
      mainSitemap: absolute("/sitemap.xml"),
      rss: absolute("/updates/feed.xml"),
      robots: absolute("/robots.txt"),
      latest: latest ? absolute(`/updates/${latest.slug}`) : null,
    };

    const [updates, sitemap, mainSitemap, rss, robots, latestPage] =
      await Promise.all([
        fetchText(urls.updates),
        fetchText(urls.sitemap),
        fetchText(urls.mainSitemap),
        fetchText(urls.rss),
        fetchText(urls.robots),
        urls.latest ? fetchText(urls.latest) : Promise.resolve(null),
      ]);

    const checks = [
      {
        id: "updates",
        label: "Public Updates hub",
        pass: updates.ok,
        detail: updates.ok
          ? `/updates returned HTTP ${updates.status}.`
          : `/updates could not be fetched${updates.status ? ` (HTTP ${updates.status})` : ""}.`,
      },
      {
        id: "rss_autodiscovery",
        label: "RSS autodiscovery",
        pass:
          updates.ok &&
          updates.text.includes("application/rss+xml") &&
          updates.text.includes("/updates/feed.xml"),
        detail:
          updates.ok &&
          updates.text.includes("application/rss+xml") &&
          updates.text.includes("/updates/feed.xml")
            ? "The public Updates page advertises the RSS feed in page metadata."
            : "The Updates page is not advertising /updates/feed.xml as an RSS alternate yet.",
      },
      {
        id: "rss",
        label: "RSS feed",
        pass:
          rss.ok && rss.text.includes("<rss") && rss.text.includes("<channel>"),
        detail:
          rss.ok && rss.text.includes("<rss")
            ? `/updates/feed.xml returned a valid RSS document (HTTP ${rss.status}).`
            : `/updates/feed.xml did not return the expected RSS document.`,
      },
      {
        id: "updates_sitemap",
        label: "Updates sitemap",
        pass:
          sitemap.ok && (!urls.latest || sitemap.text.includes(urls.latest)),
        detail:
          sitemap.ok && (!urls.latest || sitemap.text.includes(urls.latest))
            ? "The Updates sitemap is live and contains the latest public Update."
            : "The Updates sitemap is missing or does not contain the latest public Update.",
      },
      {
        id: "main_sitemap",
        label: "Main sitemap handoff",
        pass: mainSitemap.ok && mainSitemap.text.includes("/updates"),
        detail:
          mainSitemap.ok && mainSitemap.text.includes("/updates")
            ? "The main sitemap exposes the public Updates section."
            : "The main sitemap does not currently expose /updates.",
      },
      {
        id: "robots",
        label: "Robots sitemap discovery",
        pass:
          robots.ok &&
          robots.text.includes("/sitemap.xml") &&
          robots.text.includes("/updates/sitemap.xml"),
        detail:
          robots.ok && robots.text.includes("/updates/sitemap.xml")
            ? "robots.txt advertises both the main and Updates sitemaps."
            : "robots.txt is not advertising the Updates sitemap.",
      },
      {
        id: "latest_article",
        label: "Latest public article",
        pass: !latest || Boolean(latestPage?.ok),
        detail: latest
          ? latestPage?.ok
            ? `${urls.latest} returned HTTP ${latestPage.status}.`
            : "The latest public Update URL could not be fetched."
          : "There are no public Updates yet.",
      },
      {
        id: "indexnow",
        label: "IndexNow configuration",
        pass: Boolean(process.env.INDEXNOW_KEY?.trim()),
        detail: process.env.INDEXNOW_KEY?.trim()
          ? "The server has an IndexNow verification key and can notify participating search engines."
          : "INDEXNOW_KEY is not configured in the production environment.",
      },
    ];

    return noStoreJson({
      ok: true,
      checkedAt: new Date().toISOString(),
      publicPostCount: publicPosts.length,
      latest: latest
        ? {
            id: latest.id,
            slug: latest.slug,
            title: latest.title,
            url: urls.latest,
            publishedAt: publicDate(latest),
          }
        : null,
      urls,
      checks,
      googleSearchConsole: {
        ready: checks
          .filter((check) =>
            [
              "updates",
              "rss_autodiscovery",
              "rss",
              "updates_sitemap",
              "main_sitemap",
              "robots",
              "latest_article",
            ].includes(check.id),
          )
          .every((check) => check.pass),
        sitemapUrls: [urls.mainSitemap, urls.sitemap],
        note: "Google indexing and ranking are never guaranteed. Submit the sitemap URLs once in Google Search Console, then use URL Inspection for especially important new announcements.",
      },
    });
  } catch (error) {
    const status = Number((error as { status?: number })?.status) || 500;
    return noStoreJson(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Search discovery check failed.",
      },
      { status },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireUpdatesAdmin(req, ["owner", "admin", "editor"]);
    const input = await req.json().catch(() => ({}));
    const action = String(input?.action || "notify").trim();

    if (action !== "notify") {
      return noStoreJson(
        { ok: false, error: "Unsupported search discovery action." },
        { status: 400 },
      );
    }

    const sb = adminClient();
    let query = sb
      .from("stayknown_updates_posts")
      .select("id,slug,status,published_at,scheduled_for,created_at,deleted_at")
      .is("deleted_at", null)
      .limit(1000);

    if (typeof input?.postId === "string" && input.postId.trim()) {
      query = query.eq("id", input.postId.trim());
    }

    const { data, error } = await query;
    if (error) throw error;

    const publicPosts = (data || []).filter((row: any) => isPublicPost(row));
    const slugs = publicPosts.map((row: any) => row.slug);

    if (!slugs.length) {
      return noStoreJson(
        {
          ok: false,
          error: "No currently public Updates were available to notify.",
        },
        { status: 409 },
      );
    }

    const discovery = await notifyUpdatesDiscovery(
      slugs,
      "manual_discovery_push",
    );

    return noStoreJson(
      {
        ok: discovery.accepted,
        discovery,
        notifiedPostCount: slugs.length,
      },
      discovery.accepted ? {} : { status: 502 },
    );
  } catch (error) {
    const status = Number((error as { status?: number })?.status) || 500;
    return noStoreJson(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Search-engine notification failed.",
      },
      { status },
    );
  }
}
