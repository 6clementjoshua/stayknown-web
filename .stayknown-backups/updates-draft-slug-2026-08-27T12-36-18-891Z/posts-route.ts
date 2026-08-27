import { adminClient, canonicalPath } from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";
import { inspectSeo } from "@/lib/stayknown-updates-seo";
export async function GET(req: Request) {
  try {
    await requireUpdatesAdmin(req);
    const { data, error } = await adminClient()
      .from("stayknown_updates_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return Response.json({ posts: data || [] });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
export async function POST(req: Request) {
  try {
    const { user } = await requireUpdatesAdmin(req, [
      "owner",
      "admin",
      "editor",
    ]);
    const input = await req.json();
    const publishing = ["published", "scheduled"].includes(input.status);
    const issues = inspectSeo({
      ...input,
      canonical_path: canonicalPath(input.slug || ""),
    });
    if (publishing && issues.some((i) => i.level === "block"))
      return Response.json({ error: "seo_blocked", issues }, { status: 422 });
    const now = new Date().toISOString();
    const payload = {
      ...input,
      canonical_path: canonicalPath(input.slug),
      created_by: user.id,
      updated_by: user.id,
      updated_at: now,
      published_at:
        input.status === "published"
          ? input.published_at || now
          : input.published_at || null,
    };
    delete payload.id;
  delete payload.imageMeta;
  payload.scheduled_for =
    typeof input.scheduled_for === "string" && input.scheduled_for.trim()
      ? input.scheduled_for.trim()
      : null;
    const sb = adminClient();
    const { data, error } = await sb
      .from("stayknown_updates_posts")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    await sb
      .from("stayknown_update_audit_log")
      .insert({
        post_id: data.id,
        actor_user_id: user.id,
        action: "created",
        details: { status: data.status },
      });
    return Response.json({ post: data, issues }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
