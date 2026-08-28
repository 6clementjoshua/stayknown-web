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

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>StayKnown Updates</title><link>${SITE_URL}/updates</link><description>Official StayKnown product, safety, technology and company updates.</description>${posts
    .map(
      (post) =>
        `<item><title>${esc(post.title)}</title><link>${SITE_URL}/updates/${post.slug}</link><guid isPermaLink="true">${SITE_URL}/updates/${post.slug}</guid><pubDate>${new Date(publicDate(post)).toUTCString()}</pubDate><description>${esc(post.summary)}</description></item>`,
    )
    .join("")}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "no-store, max-age=0",
    },
  });
}
