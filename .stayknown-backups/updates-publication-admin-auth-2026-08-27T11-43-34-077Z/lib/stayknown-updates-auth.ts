import { createClient } from "@supabase/supabase-js";
import { adminClient } from "./stayknown-updates";

export async function requireUpdatesAdmin(
  req: Request,
  roles: string[] = ["owner", "admin", "editor", "analyst"],
) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";

  if (!token) {
    throw Object.assign(new Error("not_authenticated"), { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const browserKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !browserKey) {
    throw Object.assign(new Error("auth_not_configured"), { status: 500 });
  }

  const verifier = createClient(url, browserKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await verifier.auth.getUser(token);

  if (error || !data.user?.email) {
    throw Object.assign(new Error("invalid_session"), { status: 401 });
  }

  const sb = adminClient();
  const { data: admin, error: adminError } = await sb
    .from("stayknown_update_admins")
    .select("id,user_id,email,role,is_active")
    .ilike("email", data.user.email)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError || !admin || !roles.includes(admin.role)) {
    throw Object.assign(new Error("not_authorized"), { status: 403 });
  }

  if (!admin.user_id) {
    await sb
      .from("stayknown_update_admins")
      .update({
        user_id: data.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", admin.id);
  }

  return { user: data.user, admin };
}
