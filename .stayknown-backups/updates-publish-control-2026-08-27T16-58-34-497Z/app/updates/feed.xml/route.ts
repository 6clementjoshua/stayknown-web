import {
  listPublicUpdates,
  publicDate,
  SITE_URL,
} from "@/lib/stayknown-updates";
const esc = (s: string) =>
  s.replace(
    /[<>&'\"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c] || c,
  );
export async function GET() {
  const posts = await listPublicUpdates(100);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>StayKnown Updates</title><link>${SITE_URL}/updates</link><description>Official StayKnown product, safety, technology and company updates.</description>${posts.map((p) => `<item><title>${esc(p.title)}</title><link>${SITE_URL}/updates/${p.slug}</link><guid>${SITE_URL}/updates/${p.slug}</guid><pubDate>${new Date(publicDate(p)).toUTCString()}</pubDate><description>${esc(p.summary)}</description></item>`).join("")}</channel></rss>`;
  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=900",
    },
  });
}
