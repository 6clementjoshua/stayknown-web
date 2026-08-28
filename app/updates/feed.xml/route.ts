import {
  SITE_URL,
  listPublicUpdates,
  publicDate,
} from "@/lib/stayknown-updates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const esc = (value: string) =>
  value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] || character,
  );

export async function GET() {
  const posts = await listPublicUpdates(100);
  const lastBuildDate = posts.length
    ? new Date(publicDate(posts[0])).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n  <channel>\n    <title>StayKnown Updates</title>\n    <link>${SITE_URL}/updates</link>\n    <atom:link href="${SITE_URL}/updates/feed.xml" rel="self" type="application/rss+xml" />\n    <description>Official StayKnown product, safety, technology and company updates.</description>\n    <language>en</language>\n    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n    <generator>StayKnown Updates</generator>\n    ${posts
    .map((post) => {
      const image = post.image_16_9_url || post.hero_image_url || "";
      return `<item>\n      <title>${esc(post.title)}</title>\n      <link>${SITE_URL}/updates/${post.slug}</link>\n      <guid isPermaLink="true">${SITE_URL}/updates/${post.slug}</guid>\n      <pubDate>${new Date(publicDate(post)).toUTCString()}</pubDate>\n      <category>${esc(post.category || "Updates")}</category>\n      <description>${esc(post.summary)}</description>${
        image
          ? `\n      <media:content url="${esc(image)}" medium="image" />\n      <media:thumbnail url="${esc(image)}" />`
          : ""
      }\n    </item>`;
    })
    .join("\n    ")}\n  </channel>\n</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
    },
  });
}
