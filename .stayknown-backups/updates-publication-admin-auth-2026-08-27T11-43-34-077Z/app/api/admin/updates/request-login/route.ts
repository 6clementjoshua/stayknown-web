import { createClient } from "@supabase/supabase-js";
import { adminClient } from "@/lib/stayknown-updates";

export const dynamic = "force-dynamic";

function cleanEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function noStoreJson(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      "cache-control": "no-store, max-age=0",
      ...(init.headers || {}),
    },
  });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const email = cleanEmail(payload?.email);

    if (!isEmail(email)) {
      return noStoreJson(
        { ok: false, error: "Enter a valid approved admin email." },
        { status: 400 },
      );
    }

    const adminDb = adminClient();
    const { data: admin, error: adminError } = await adminDb
      .from("stayknown_update_admins")
      .select("id,email,is_active")
      .ilike("email", email)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError) {
      console.error("updates_login_allowlist_lookup_failed", adminError);
      return noStoreJson(
        { ok: false, error: "Secure sign-in is temporarily unavailable." },
        { status: 503 },
      );
    }

    // Do not reveal whether an arbitrary address is on the private allowlist.
    if (!admin) {
      return noStoreJson({
        ok: true,
        message:
          "If this email is approved for StayKnown Updates, a secure sign-in link will be sent.",
      });
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const browserKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !browserKey) {
      console.error("updates_login_auth_not_configured");
      return noStoreJson(
        { ok: false, error: "Secure sign-in is not configured on production." },
        { status: 500 },
      );
    }

    const authClient = createClient(supabaseUrl, browserKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: "implicit",
      },
    });

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.stay-known.com"
    ).replace(/\/$/, "");

    const { error } = await authClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/admin/updates`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("updates_login_otp_failed", {
        name: error.name,
        status: error.status,
        code: error.code,
        message: error.message,
      });

      const message = /rate|limit|too many/i.test(error.message)
        ? "Too many sign-in attempts. Please wait a moment and try again."
        : "The secure sign-in email could not be sent right now.";

      return noStoreJson({ ok: false, error: message }, { status: 502 });
    }

    return noStoreJson({
      ok: true,
      message: "Check your email for the secure StayKnown Updates sign-in link.",
    });
  } catch (error) {
    console.error("updates_login_request_failed", error);
    return noStoreJson(
      { ok: false, error: "Secure sign-in is temporarily unavailable." },
      { status: 500 },
    );
  }
}
