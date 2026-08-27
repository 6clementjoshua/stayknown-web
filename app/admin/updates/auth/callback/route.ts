import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { adminClient } from "@/lib/stayknown-updates";
import {
  UPDATES_ADMIN_SESSION_COOKIE,
  UPDATES_ADMIN_SESSION_MAX_AGE,
  createUpdatesAdminSessionToken,
} from "@/lib/stayknown-updates-auth";

export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function redirectToAdmin(siteUrl: string, state: string) {
  return NextResponse.redirect(
    `${siteUrl}/admin/updates?auth=${encodeURIComponent(state)}`,
    303,
  );
}

export async function GET(req: Request) {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.stay-known.com"
  ).replace(/\/$/, "");

  try {
    const url = new URL(req.url);
    const tokenHash = clean(url.searchParams.get("token_hash"));

    if (!tokenHash) {
      return redirectToAdmin(siteUrl, "invalid-link");
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !publishableKey) {
      console.error("updates_publication_callback_auth_not_configured");
      return redirectToAdmin(siteUrl, "unavailable");
    }

    const verifier = createClient(supabaseUrl, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const verified = await verifier.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    const authUser = verified.data.user || verified.data.session?.user;

    if (verified.error || !verified.data.session || !authUser?.email) {
      console.error("updates_publication_callback_verify_failed", {
        message: verified.error?.message || "missing_session",
      });
      return redirectToAdmin(siteUrl, "expired-or-invalid");
    }

    const email = authUser.email.trim().toLowerCase();
    const sb = adminClient();
    const { data: admin, error: adminError } = await sb
      .from("stayknown_update_admins")
      .select("id,user_id,email,role,is_active")
      .ilike("email", email)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError || !admin) {
      console.error("updates_publication_callback_not_authorized", adminError);
      return redirectToAdmin(siteUrl, "not-authorized");
    }

    if (admin.user_id && admin.user_id !== authUser.id) {
      console.error("updates_publication_callback_identity_mismatch");
      return redirectToAdmin(siteUrl, "identity-mismatch");
    }

    if (!admin.user_id) {
      const { error: linkError } = await sb
        .from("stayknown_update_admins")
        .update({
          user_id: authUser.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", admin.id);

      if (linkError) {
        console.error("updates_publication_callback_link_admin_failed", linkError);
        return redirectToAdmin(siteUrl, "unavailable");
      }
    }

    const sessionToken = createUpdatesAdminSessionToken({
      userId: authUser.id,
      email,
    });

    const response = redirectToAdmin(siteUrl, "success");
    response.cookies.set(UPDATES_ADMIN_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: UPDATES_ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("updates_publication_callback_failed", error);
    return redirectToAdmin(siteUrl, "unavailable");
  }
}
