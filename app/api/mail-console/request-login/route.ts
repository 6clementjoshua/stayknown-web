import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const OWNER_EMAIL = "6clementjoshua@gmail.com";

function clean(v: string | undefined | null) {
  return (v || "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = clean(body.email).toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email is required." },
        { status: 400 },
      );
    }

    if (email !== OWNER_EMAIL) {
      return NextResponse.json(
        {
          ok: false,
          error: "This email is not allowed to access the mail console.",
        },
        { status: 403 },
      );
    }

    const supabaseUrl = clean(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
    const supabaseAnonKey = clean(
      process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing SUPABASE_URL or SUPABASE_ANON_KEY in Vercel server environment.",
        },
        { status: 500 },
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://stayknown-web.vercel.app";

    const redirectTo = `${origin.replace(/\/+$/g, "")}/mail-console`;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: adminRow, error: adminError } = await supabase
      .from("mail_console_admins")
      .select("id,email,role,is_active")
      .eq("email", email)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError) {
      return NextResponse.json(
        { ok: false, error: adminError.message },
        { status: 500 },
      );
    }

    if (!adminRow) {
      return NextResponse.json(
        {
          ok: false,
          error: "This email is not active in mail_console_admins.",
        },
        { status: 403 },
      );
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: false,
      },
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Login link sent. Open your email and tap the link.",
      redirectTo,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Request failed.",
      },
      { status: 500 },
    );
  }
}
