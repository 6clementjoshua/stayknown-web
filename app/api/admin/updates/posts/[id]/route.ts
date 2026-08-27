import { adminClient, canonicalPath } from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";
import { inspectSeo } from "@/lib/stayknown-updates-seo";
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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
    const payload = {
      ...input,
      canonical_path: canonicalPath(input.slug),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };
    delete payload.id;
    delete payload.created_at;
    delete payload.created_by;
    delete payload.imageMeta;
    if (input.status === "published" && !input.published_at)
      payload.published_at = new Date().toISOString();
    const sb = adminClient();
    const { data, error } = await sb
      .from("stayknown_updates_posts")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    await sb
      .from("stayknown_update_audit_log")
      .insert({
        post_id: id,
        actor_user_id: user.id,
        action: "updated",
        details: { status: data.status },
      });
    return Response.json({ post: data, issues });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
