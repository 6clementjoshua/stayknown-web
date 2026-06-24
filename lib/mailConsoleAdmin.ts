import { createClient } from "@supabase/supabase-js";
import { verifyMailConsoleSessionToken } from "@/lib/mailConsoleServerAuth";

function clean(v: string | undefined | null) {
  return (v || "").trim();
}

export function getMailConsoleSiteUrl() {
  return (
    clean(process.env.NEXT_PUBLIC_SITE_URL) ||
    clean(process.env.SITE_URL) ||
    "https://stay-known.com"
  ).replace(/\/+$/g, "");
}

export function getMailConsoleAdminClient() {
  const supabaseUrl = clean(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRole) {
    throw new Error("Missing Supabase server configuration.");
  }

  return createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function requireMailConsoleAdmin(sessionToken: string) {
  const payload = verifyMailConsoleSessionToken(sessionToken);
  const adminEmail = payload.email;

  const admin = getMailConsoleAdminClient();

  const { data: adminRow, error } = await admin
    .from("mail_console_admins")
    .select("id,email,role,is_active")
    .ilike("email", adminEmail)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!adminRow) {
    throw new Error("Mail console session is not allowed.");
  }

  return {
    admin,
    adminEmail,
    adminRow,
  };
}
