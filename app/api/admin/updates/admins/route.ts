import { adminClient } from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";
export async function GET(req: Request) {
  try {
    await requireUpdatesAdmin(req, ["owner", "admin"]);
    const { data, error } = await adminClient()
      .from("stayknown_update_admins")
      .select("id,email,role,is_active,created_at,updated_at")
      .order("created_at");
    if (error) throw error;
    return Response.json({ admins: data || [] });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
export async function POST(req: Request) {
  try {
    const { user } = await requireUpdatesAdmin(req, ["owner"]);
    const b = await req.json();
    const email = String(b.email || "")
      .trim()
      .toLowerCase();
    const role = String(b.role || "editor");
    if (
      !/^\S+@\S+\.\S+$/.test(email) ||
      !["owner", "admin", "editor", "analyst"].includes(role)
    )
      return Response.json({ error: "invalid_admin" }, { status: 400 });
    const sb = adminClient();
    const { data, error } = await sb
      .from("stayknown_update_admins")
      .upsert(
        { email, role, is_active: true, updated_at: new Date().toISOString() },
        { onConflict: "email" },
      )
      .select("id,email,role,is_active")
      .single();
    if (error) throw error;
    await sb
      .from("stayknown_update_audit_log")
      .insert({
        actor_user_id: user.id,
        action: "admin_upserted",
        details: { email, role },
      });
    return Response.json({ admin: data });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
