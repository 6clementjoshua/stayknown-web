import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createMailConsoleLoginToken } from "@/lib/mailConsoleServerAuth";

const OWNER_EMAIL = "6clementjoshua@gmail.com";

type LoginMailProviderKey = "stayknown" | "sixrides" | "foundation" | "music";

type LoginMailProviderConfig = {
  key: LoginMailProviderKey;
  label: string;
  envName: string;
  apiKey: string;
  from: string;
};

// TEMP LOGIN ORDER.
// Because StayKnown is limited right now, this starts with 6Rides.
// Later, to switch back, move "stayknown" to the first position.
const LOGIN_MAIL_PROVIDER_ORDER: LoginMailProviderKey[] = [
  "sixrides",
  "foundation",
  "music",
  "stayknown",
];

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

function safeJsonText(data: unknown) {
  try {
    return JSON.stringify(data);
  } catch (_) {
    return String(data);
  }
}

function resendErrorText(data: unknown) {
  if (!data || typeof data !== "object") return "";

  const row = data as Record<string, unknown>;

  const name = typeof row.name === "string" ? row.name : "";
  const message = typeof row.message === "string" ? row.message : "";
  const error = typeof row.error === "string" ? row.error : "";

  return [name, message, error].filter(Boolean).join(": ");
}

function getLoginMailProviderConfig(
  provider: LoginMailProviderKey,
): LoginMailProviderConfig {
  if (provider === "sixrides") {
    return {
      key: "sixrides",
      label: "6Rides",
      envName: "RESEND_API_KEY_6RIDES",
      apiKey: clean(process.env.RESEND_API_KEY_6RIDES),
      from:
        clean(process.env.MAIL_CONSOLE_LOGIN_FROM_6RIDES) ||
        "6Rides Admin <admin@6rides.com>",
    };
  }

  if (provider === "foundation") {
    return {
      key: "foundation",
      label: "6 Clement Joshua Foundation",
      envName: "RESEND_API_KEY_6CLEMENTJOSHUAFOUNDATION",
      apiKey: clean(process.env.RESEND_API_KEY_6CLEMENTJOSHUAFOUNDATION),
      from:
        clean(process.env.MAIL_CONSOLE_LOGIN_FROM_FOUNDATION) ||
        "6 Clement Joshua Foundation Admin <admin@6clementjoshuafoundation.com>",
    };
  }

  if (provider === "music") {
    return {
      key: "music",
      label: "6 Clement Joshua Musics",
      envName: "RESEND_API_KEY_6CLEMENTJOSHUAMUSICS",
      apiKey: clean(process.env.RESEND_API_KEY_6CLEMENTJOSHUAMUSICS),
      from:
        clean(process.env.MAIL_CONSOLE_LOGIN_FROM_MUSIC) ||
        "6 Clement Joshua Musics Admin <admin@6clementjoshuamusics.com>",
    };
  }

  return {
    key: "stayknown",
    label: "StayKnown",
    envName: "RESEND_API_KEY_STAYKNOWN or RESEND_API_KEY",
    apiKey:
      clean(process.env.RESEND_API_KEY_STAYKNOWN) ||
      clean(process.env.RESEND_API_KEY),
    from:
      clean(process.env.MAIL_CONSOLE_LOGIN_FROM_STAYKNOWN) ||
      clean(process.env.MAIL_CONSOLE_LOGIN_FROM) ||
      clean(process.env.RESEND_FROM) ||
      "StayKnown Admin <admin@stay-known.com>",
  };
}

function getLoginMailProviders() {
  return LOGIN_MAIL_PROVIDER_ORDER.map(getLoginMailProviderConfig);
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
                      This private link expires in 15 minutes. If you did not request this, ignore this email.
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
  providerLabel: string;
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
      headers: {
        "X-StayKnown-Login-Provider": params.providerLabel,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const providerText = resendErrorText(data) || safeJsonText(data);

    return {
      ok: false as const,
      status: res.status,
      statusText: res.statusText,
      error: `Resend failed on ${params.providerLabel}: ${res.status} ${res.statusText} ${providerText}`,
      data,
    };
  }

  return {
    ok: true as const,
    status: res.status,
    statusText: res.statusText,
    data,
  };
}

async function sendLoginEmailWithFallback(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const providers = getLoginMailProviders();

  const attempts: Array<{
    provider: string;
    envName: string;
    from: string;
    status: "sent" | "skipped" | "failed";
    error?: string;
    httpStatus?: number;
  }> = [];

  for (const provider of providers) {
    if (!provider.apiKey) {
      attempts.push({
        provider: provider.label,
        envName: provider.envName,
        from: provider.from,
        status: "skipped",
        error: `Missing ${provider.envName} in Vercel.`,
      });

      continue;
    }

    const result = await sendResendEmail({
      apiKey: provider.apiKey,
      from: provider.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      providerLabel: provider.label,
    });

    if (result.ok) {
      attempts.push({
        provider: provider.label,
        envName: provider.envName,
        from: provider.from,
        status: "sent",
        httpStatus: result.status,
      });

      return {
        ok: true,
        provider,
        data: result.data,
        attempts,
      };
    }

    attempts.push({
      provider: provider.label,
      envName: provider.envName,
      from: provider.from,
      status: "failed",
      httpStatus: result.status,
      error: result.error,
    });

    console.warn("[mail-console/login] provider failed, trying next", {
      provider: provider.label,
      status: result.status,
      error: result.error,
    });
  }

  throw new Error(
    `All login email providers failed. Attempts: ${attempts
      .map((item) => {
        const base = `${item.provider}=${item.status}`;
        return item.error ? `${base} (${item.error})` : base;
      })
      .join(" | ")}`,
  );
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

    const siteUrl =
      clean(process.env.NEXT_PUBLIC_SITE_URL) || "https://stay-known.com";

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

    const token = createMailConsoleLoginToken(email);
    const loginLink = `${siteUrl.replace(/\/+$/g, "")}/mail-auth/callback?token=${encodeURIComponent(
      token,
    )}`;

    const sendResult = await sendLoginEmailWithFallback({
      to: email,
      subject: "StayKnown Mail Console Admin Login",
      html: buildAdminLoginEmailHtml({
        loginLink,
        email,
      }),
    });

    return NextResponse.json({
      ok: true,
      message: `Admin login link sent using ${sendResult.provider.label}. Open your email and tap the StayKnown Mail Console link.`,
      provider_used: sendResult.provider.label,
      attempts: sendResult.attempts,
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
