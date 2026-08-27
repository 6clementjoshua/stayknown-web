import { adminClient } from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";
export async function GET(req: Request) {
  try {
    await requireUpdatesAdmin(req);
    const sb = adminClient();
    const [{ data: posts, error: pErr }, { data: routes, error: rErr }] =
      await Promise.all([
        sb
          .from("stayknown_updates_posts")
          .select("id,slug,title,status,like_count")
          .order("created_at", { ascending: false }),
        sb
          .from("website_route_visit_totals")
          .select("path,total_visits")
          .like("path", "/updates%"),
      ]);
    if (pErr) throw pErr;
    if (rErr) throw rErr;
    const map = new Map(
      (routes || []).map((r: any) => [r.path, Number(r.total_visits || 0)]),
    );
    return Response.json({
      updatesViews: map.get("/updates") || 0,
      posts: (posts || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        views: map.get(`/updates/${p.slug}`) || 0,
        likes: Number(p.like_count || 0),
      })),
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
