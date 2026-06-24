import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const OWNER_EMAIL = "6clementjoshua@gmail.com";

function clean(v: string | undefined | null) {
  return (v || "").trim();
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildAdminLoginEmailHtml(params: {
  loginLink: string;
  email: string;
}) {
  const year = new Date().getFullYear();

  return `
  <div style="margin:0;padding:0;background:#f3f4f6;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f4f6;padding:26px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="width:560px;max-width:100%;">
            <tr>
              <td style="padding:10px 6px;">
                <div style="text-align:center;margin-bottom:18px;">
                  <div style="font-size:12px;font-weight:950;letter-spacing:2.6px;color:rgba(0,0,0,0.78);">
                    STAYKNOWN MAIL CONSOLE™
                  </div>
                  <div style="height:6px;"></div>
                  <div style="font-size:11px;font-weight:900;letter-spacing:1.6px;color:rgba(0,0,0,0.58);">
                    Private admin access · A 6 Clement Joshua service™
                  </div>
                </div>

                <div style="
                  border-radius:24px;
                  border:1px solid rgba(0,0,0,0.10);
                  background:rgba(255,255,255,0.86);
                  box-shadow:inset 0 1px 0 rgba(255,255,255,0.92),0 28px 75px rgba(0,0,0,0.09);
                  overflow:hidden;
                ">
                  <div style="padding:24px 22px;text-align:center;">
                    <div style="
                      display:inline-block;
                      padding:6px 12px;
                      border-radius:999px;
                      border:1px solid rgba(0,0,0,0.10);
                      background:rgba(0,0,0,0.04);
                      font-size:12px;
                      font-weight:900;
                      letter-spacing:0.8px;
                      color:#111;
                    ">
                      ADMIN LOGIN
                    </div>

                    <h1 style="margin:18px 0 8px;font-size:24px;line-height:1.2;color:#050505;">
                      Open your private email console
                    </h1>

                    <p style="margin:0 auto 18px;max-width:420px;font-size:14px;line-height:1.65;color:rgba(0,0,0,0.66);">
                      This secure link was requested for the StayKnown Mail Console.
                      It is only for the authorized admin email:
                      <br/>
                      <b>${escapeHtml(params.email)}</b>
                    </p>

                    <a href="${escapeHtml(params.loginLink)}" style="
                      display:inline-block;
                      padding:14px 20px;
                      border-radius:999px;
                      background:#050505;
                      color:#ffffff;
                      text-decoration:none;
                      font-weight:950;
                      letter-spacing:0.3px;
                      box-shadow:0 18px 44px rgba(0,0,0,0.18);
                    ">
                      Open Mail Console
                    </a>

                    <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:rgba(0,0,0,0.55);">
                      If you did not request this, ignore this email. Do not forward this link.
                    </p>
                  </div>
                </div>

                <div style="height:14px;"></div>

                <div style="text-align:center;font-size:11px;color:rgba(0,0,0,0.52);line-height:1.5;">
                  © ${year} StayKnown™ · Private admin communication
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Resend failed: ${res.status} ${res.statusText} ${JSON.stringify(data)}`,
    );
  }

  return data;
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

    const supabaseServiceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const resendApiKey = clean(process.env.RESEND_API_KEY);

    if (!supabaseUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing SUPABASE_URL in Vercel." },
        { status: 500 },
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY in Vercel." },
        { status: 500 },
      );
    }

    if (!resendApiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing RESEND_API_KEY in Vercel." },
        { status: 500 },
      );
    }

    const siteUrl =
      clean(process.env.NEXT_PUBLIC_SITE_URL) || "https://stay-known.com";

    const callbackUrl = `${siteUrl.replace(/\/+$/g, "")}/mail-auth/callback`;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: adminRow, error: adminError } = await supabaseAdmin
      .from("mail_console_admins")
      .select("id,email,role,is_active")
      .ilike("email", email)
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

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: callbackUrl,
        },
      });

    if (linkError) {
      return NextResponse.json(
        { ok: false, error: linkError.message },
        { status: 400 },
      );
    }

    const actionLink = clean(linkData?.properties?.action_link);

    if (!actionLink) {
      return NextResponse.json(
        { ok: false, error: "Supabase did not return a login link." },
        { status: 500 },
      );
    }

    const from =
      clean(process.env.MAIL_CONSOLE_LOGIN_FROM) ||
      clean(process.env.RESEND_FROM) ||
      "StayKnown Admin <admin@stay-known.com>";

    await sendResendEmail({
      apiKey: resendApiKey,
      from,
      to: email,
      subject: "StayKnown Mail Console Admin Login",
      html: buildAdminLoginEmailHtml({
        loginLink: actionLink,
        email,
      }),
    });

    return NextResponse.json({
      ok: true,
      message:
        "Admin login link sent. Open your email and tap the StayKnown Mail Console link.",
      redirectTo: callbackUrl,
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
