// app/api/account-closure/action/route.ts
// StayKnown Secure Account Closure & Recovery
//
// Website authority for deliberate owner email actions.
//
// IMPORTANT SECURITY DESIGN
// - The GET page never calls this route.
// - Only an intentional POST from the premium decision page is accepted.
// - The raw one-use token is never logged, echoed, or returned.
// - Token hashing, claiming, sibling-token revocation, request transition,
//   identity reservation, security-lock creation, audit records, and queued
//   notifications are performed atomically by the PostgreSQL RPC:
//     public.apply_account_closure_email_action(...)
// - Keep ACCOUNT_CLOSURE_ACTION_ENABLED=false until the matching SQL authority,
//   notification worker, app-lock enforcement, reactivation, and day-30
//   finalizer are installed.

import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;

type Purpose = "confirm_closure" | "deny_closure" | "keep_account";

type ActionState =
  | "closure_scheduled"
  | "kept_account"
  | "security_protected"
  | "already_resolved"
  | "expired"
  | "invalid"
  | "disabled"
  | "error";

type ParsedInput = {
  purpose: Purpose | null;
  token: string;
  policyAcknowledged: boolean;
  source: string;
  wantsJson: boolean;
};

type RpcResult = {
  ok?: boolean;
  state?: string;
  message?: string;
  request_id?: string;
  scheduled_at?: string;
  permanent_closure_at?: string;
  unlock_not_before?: string;
  recovery_days?: number;
  account_remains_active?: boolean;
  next_step?: string;
  [key: string]: unknown;
};

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://www.stay-known.com"
).replace(/\/+$/g, "");

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

const SUPPORT_EMAIL = (
  process.env.SUPPORT_EMAIL || "support@stay-known.com"
).trim();

const corsHeaders: Record<string, string> = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Security-Policy":
    "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Secure Account Closure is not fully configured.");
  }

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function clean(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asObject(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as JsonObject;
}

function asPurpose(value: unknown): Purpose | null {
  const normalized = clean(value, 40).toLowerCase();

  if (normalized === "confirm_closure") {
    return "confirm_closure";
  }

  if (normalized === "deny_closure") {
    return "deny_closure";
  }

  if (normalized === "keep_account") {
    return "keep_account";
  }

  return null;
}

function asBoolean(value: unknown): boolean {
  if (value === true) return true;

  const normalized = clean(value, 20).toLowerCase();

  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function featureEnabled(): boolean {
  return (
    clean(process.env.ACCOUNT_CLOSURE_ACTION_ENABLED, 20).toLowerCase() ===
    "true"
  );
}

function tokenLooksSafe(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,160}$/.test(token);
}

function firstHeader(request: Request, names: string[]): string {
  for (const name of names) {
    const value = clean(request.headers.get(name), 500);

    if (value) return value;
  }

  return "";
}

function broadLocationFromHeaders(request: Request): JsonObject {
  const city = decodeHeaderValue(
    firstHeader(request, ["x-vercel-ip-city", "cf-ipcity"]),
  );

  const region = decodeHeaderValue(
    firstHeader(request, ["x-vercel-ip-country-region", "cf-region-code"]),
  );

  const country = decodeHeaderValue(
    firstHeader(request, ["x-vercel-ip-country", "cf-ipcountry"]),
  ).toUpperCase();

  const summary = [city, region, country]
    .filter(Boolean)
    .join(", ")
    .slice(0, 240);

  return {
    ...(city ? { city } : {}),
    ...(region ? { region } : {}),
    ...(country ? { country_code: country } : {}),
    ...(summary ? { summary } : {}),
    source: "verified_request_headers",
    captured_at: new Date().toISOString(),
  };
}

function decodeHeaderValue(value: string): string {
  if (!value) return "";

  try {
    return decodeURIComponent(value)
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100);
  } catch {
    return value
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100);
  }
}

function userAgentSummary(request: Request): JsonObject {
  const raw = clean(request.headers.get("user-agent"), 1000);

  if (!raw) {
    return {
      available: false,
    };
  }

  const hash = createHash("sha256").update(raw).digest("hex");

  const lower = raw.toLowerCase();

  const platform = lower.includes("android")
    ? "android"
    : lower.includes("iphone") ||
        lower.includes("ipad") ||
        lower.includes("ios")
      ? "ios"
      : lower.includes("windows")
        ? "windows"
        : lower.includes("macintosh") || lower.includes("mac os")
          ? "macos"
          : lower.includes("linux")
            ? "linux"
            : "unknown";

  const browser = lower.includes("edg/")
    ? "edge"
    : lower.includes("chrome/")
      ? "chrome"
      : lower.includes("safari/") && !lower.includes("chrome/")
        ? "safari"
        : lower.includes("firefox/")
          ? "firefox"
          : "unknown";

  return {
    available: true,
    platform,
    browser,
    user_agent_hash: hash,
  };
}

function requestContext(request: Request): JsonObject {
  return {
    channel: "account_closure_email_action_page",
    broad_location: broadLocationFromHeaders(request),
    client: userAgentSummary(request),
    request_received_at: new Date().toISOString(),
    sec_fetch_site: clean(request.headers.get("sec-fetch-site"), 30) || null,
  };
}

function expectedOrigin(): string {
  try {
    return new URL(SITE_URL).origin;
  } catch {
    return "https://www.stay-known.com";
  }
}

function requestIsSameOrigin(request: Request): boolean {
  const fetchSite = clean(
    request.headers.get("sec-fetch-site"),
    30,
  ).toLowerCase();

  if (fetchSite === "cross-site" || fetchSite === "none") {
    return false;
  }

  const origin = clean(request.headers.get("origin"), 500);

  if (origin && origin !== expectedOrigin()) {
    return false;
  }

  const referer = clean(request.headers.get("referer"), 1000);

  if (referer) {
    try {
      if (new URL(referer).origin !== expectedOrigin()) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

function acceptsJson(request: Request): boolean {
  const accept = clean(request.headers.get("accept"), 500).toLowerCase();

  const contentType = clean(
    request.headers.get("content-type"),
    200,
  ).toLowerCase();

  return (
    accept.includes("application/json") ||
    contentType.includes("application/json")
  );
}

async function parseInput(request: Request): Promise<ParsedInput> {
  const contentType = clean(
    request.headers.get("content-type"),
    200,
  ).toLowerCase();

  let body: JsonObject = {};

  if (contentType.includes("application/json")) {
    body = asObject(await request.json().catch(() => ({})));
  } else if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData().catch(() => null);

    if (form) {
      body = {
        purpose: form.get("purpose"),
        token: form.get("token"),
        policy_acknowledged: form.get("policy_acknowledged"),
        source: form.get("source"),
      };
    }
  }

  return {
    purpose: asPurpose(body.purpose),
    token: clean(body.token, 200),
    policyAcknowledged: asBoolean(body.policy_acknowledged),
    source: clean(body.source, 120) || "account_closure_action",
    wantsJson: acceptsJson(request),
  };
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function prettyDate(value: unknown): string {
  const raw = clean(value, 100);
  const parsed = new Date(raw);

  if (!raw || Number.isNaN(parsed.getTime())) {
    return "";
  }

  return (
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(parsed) + " UTC"
  );
}

function resultPresentation(
  state: ActionState,
  result: RpcResult,
): {
  eyebrow: string;
  title: string;
  message: string;
  badge: string;
  tone: "mint" | "danger" | "neutral";
  details: string[];
  primaryHref: string;
  primaryLabel: string;
} {
  switch (state) {
    case "closure_scheduled": {
      const finalDate = prettyDate(result.permanent_closure_at);

      return {
        eyebrow: "30-day recovery started",
        title: "Your account closure is scheduled.",
        message:
          clean(result.message, 1000) ||
          "Your StayKnown account has entered its reversible recovery period.",
        badge: "Closure scheduled",
        tone: "neutral",
        details: [
          finalDate
            ? `Permanent closure is currently scheduled for ${finalDate}.`
            : "The permanent-closure date is recorded securely with your request.",
          "You may restore the same StayKnown account by signing in during the recovery period.",
          "Your email address and username remain reserved to your original account identity.",
          "Approved safety contacts may receive a closure notice and contact-health guidance.",
          "Six owner reminders will be sent as the recovery deadline approaches.",
        ],
        primaryHref: "/account-closure",
        primaryLabel: "Review closure and recovery",
      };
    }

    case "kept_account":
      return {
        eyebrow: "Request cancelled",
        title: "Your StayKnown account remains active.",
        message:
          clean(result.message, 1000) ||
          "The closure request was cancelled and its unused email actions were revoked.",
        badge: "Account active",
        tone: "mint",
        details: [
          "The 30-day recovery period did not begin.",
          "Your account identity, safety settings, chats, and approved-contact relationships remain available.",
          "You may start a new protected closure review later only through the StayKnown app.",
        ],
        primaryHref: "/",
        primaryLabel: "Return to StayKnown",
      };

    case "security_protected": {
      const unlockDate = prettyDate(result.unlock_not_before);

      return {
        eyebrow: "Unauthorized request reported",
        title: "StayKnown protected your account.",
        message:
          clean(result.message, 1000) ||
          "The closure request was cancelled and sensitive account controls were protected.",
        badge: "Security protection active",
        tone: "danger",
        details: [
          unlockDate
            ? `Sensitive account controls remain protected until at least ${unlockDate}.`
            : "Sensitive account controls are protected while the security response is active.",
          "SOS and supported emergency safety access remain prioritized.",
          "Return to the StayKnown app and complete the requested account-owner verification.",
          "Do not share the original email or any account-security link.",
        ],
        primaryHref: "/security",
        primaryLabel: "Review StayKnown security",
      };
    }

    case "already_resolved":
      return {
        eyebrow: "Decision already recorded",
        title: "This one-use action is no longer available.",
        message:
          clean(result.message, 1000) ||
          "The account decision was already completed from this or another protected action.",
        badge: "Already resolved",
        tone: "neutral",
        details: [
          "No second account change was made.",
          "One-use email actions cannot override an account decision that has already been recorded.",
          "Use the StayKnown app or Support when the recorded outcome is unexpected.",
        ],
        primaryHref: "/submit-request",
        primaryLabel: "Contact StayKnown Support",
      };

    case "expired":
      return {
        eyebrow: "Security link expired",
        title: "This account-decision link expired.",
        message:
          clean(result.message, 1000) ||
          "No account change was made. Start a fresh protected request from the StayKnown app.",
        badge: "Expired",
        tone: "neutral",
        details: [
          "Expired links cannot close, restore, or alter an account.",
          "Your account remains in its previously recorded state.",
          "A fresh security email is required for another decision.",
        ],
        primaryHref: "/account-closure",
        primaryLabel: "Review the closure policy",
      };

    case "disabled":
      return {
        eyebrow: "Protection package not active",
        title: "This security action is not available yet.",
        message:
          "StayKnown has not enabled the complete closure-and-recovery package. No account change was made.",
        badge: "Temporarily unavailable",
        tone: "neutral",
        details: [
          "The account remains in its previous state.",
          "This safety gate prevents a partial closure system from changing account access.",
        ],
        primaryHref: "/submit-request",
        primaryLabel: "Contact StayKnown Support",
      };

    case "invalid":
    case "error":
    default:
      return {
        eyebrow: "Action could not be verified",
        title: "StayKnown did not change the account.",
        message:
          clean(result.message, 1000) ||
          "The one-use action is invalid, incomplete, or temporarily unavailable.",
        badge: state === "error" ? "Please try later" : "Invalid action",
        tone: "danger",
        details: [
          "The raw security token was not displayed or returned.",
          "No unverified account-closure state was applied.",
          "Use a fresh email action or contact StayKnown Support.",
        ],
        primaryHref: "/submit-request",
        primaryLabel: "Contact StayKnown Support",
      };
  }
}

function resultHtml(state: ActionState, result: RpcResult): string {
  const view = resultPresentation(state, result);

  const accent =
    view.tone === "mint"
      ? "#9ff5d6"
      : view.tone === "danger"
        ? "#ffb4b4"
        : "#ffffff";

  const detailItems = view.details
    .map(
      (detail) => `
        <li style="
          display:flex;
          align-items:flex-start;
          gap:11px;
          margin-top:11px;
          color:rgba(255,255,255,0.62);
          font-size:12px;
          font-weight:650;
          line-height:1.65;
        ">
          <span style="
            display:block;
            flex:0 0 auto;
            width:6px;
            height:6px;
            margin-top:7px;
            border-radius:999px;
            background:${accent};
            box-shadow:0 0 18px ${accent}55;
          "></span>
          <span>${escapeHtml(detail)}</span>
        </li>
      `,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet"/>
  <meta name="referrer" content="no-referrer"/>
  <title>${escapeHtml(view.title)} | StayKnown</title>
</head>
<body style="
  margin:0;
  min-height:100vh;
  background:
    radial-gradient(circle at 50% -10%, rgba(146,243,207,0.11), transparent 35%),
    radial-gradient(circle at 8% 28%, rgba(255,255,255,0.05), transparent 26%),
    linear-gradient(180deg,#0b1012 0%,#050709 48%,#020303 100%);
  color:#ffffff;
  font-family:Inter,Arial,Helvetica,sans-serif;
">
  <main style="
    min-height:100vh;
    box-sizing:border-box;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:28px 14px;
  ">
    <section style="width:100%;max-width:680px;">
      <div style="text-align:center;margin-bottom:18px;">
        <a href="/" style="display:inline-flex;align-items:center;gap:11px;text-decoration:none;color:white;">
          <span style="
            display:inline-flex;
            width:44px;
            height:44px;
            align-items:center;
            justify-content:center;
            border-radius:16px;
            border:1px solid rgba(255,255,255,0.15);
            background:linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.035));
            box-shadow:inset 0 1px 0 rgba(255,255,255,0.17),0 14px 30px rgba(0,0,0,0.42);
          ">
            <img src="/6logo.png" alt="" width="23" height="23" style="display:block;object-fit:contain"/>
          </span>
          <span style="font-size:12px;font-weight:950;letter-spacing:2.4px;">STAYKNOWN</span>
        </a>
      </div>

      <div style="
        border-radius:30px;
        border:1px solid rgba(255,255,255,0.10);
        background:linear-gradient(145deg,rgba(255,255,255,0.085),rgba(255,255,255,0.026) 54%,rgba(0,0,0,0.18));
        padding:24px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.09),0 30px 90px rgba(0,0,0,0.42);
        backdrop-filter:blur(20px);
      ">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
          <span style="
            display:inline-flex;
            align-items:center;
            min-height:28px;
            padding:0 12px;
            border-radius:999px;
            border:1px solid rgba(255,255,255,0.13);
            background:rgba(255,255,255,0.06);
            color:${accent};
            font-size:9px;
            font-weight:950;
            letter-spacing:1.4px;
            text-transform:uppercase;
          ">${escapeHtml(view.badge)}</span>

          <span style="
            color:rgba(255,255,255,0.42);
            font-size:9px;
            font-weight:900;
            letter-spacing:1.4px;
            text-transform:uppercase;
          ">One-use action processed securely</span>
        </div>

        <div style="
          margin-top:26px;
          color:${accent};
          font-size:9px;
          font-weight:950;
          letter-spacing:2px;
          text-transform:uppercase;
        ">${escapeHtml(view.eyebrow)}</div>

        <h1 style="
          margin:12px 0 0;
          color:#ffffff;
          font-size:clamp(34px,7vw,52px);
          line-height:0.98;
          letter-spacing:-2.4px;
          font-weight:950;
        ">${escapeHtml(view.title)}</h1>

        <p style="
          margin:18px 0 0;
          color:rgba(255,255,255,0.62);
          font-size:13px;
          font-weight:650;
          line-height:1.75;
        ">${escapeHtml(view.message)}</p>

        <div style="
          margin-top:22px;
          padding:16px;
          border-radius:22px;
          border:1px solid rgba(255,255,255,0.10);
          background:rgba(255,255,255,0.04);
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.07);
        ">
          <ul style="list-style:none;margin:0;padding:0;">
            ${detailItems}
          </ul>
        </div>

        <a href="${escapeHtml(view.primaryHref)}" style="
          display:flex;
          min-height:54px;
          align-items:center;
          justify-content:center;
          margin-top:22px;
          border-radius:19px;
          border:1px solid rgba(255,255,255,0.92);
          background:#ffffff;
          color:#050709;
          text-decoration:none;
          font-size:13px;
          font-weight:950;
          box-shadow:inset 0 1px 0 #ffffff,inset 0 -8px 19px rgba(0,0,0,0.10),0 20px 46px rgba(0,0,0,0.35);
        ">${escapeHtml(view.primaryLabel)}</a>

        <p style="
          margin:14px 0 0;
          text-align:center;
          color:rgba(255,255,255,0.36);
          font-size:10px;
          font-weight:650;
          line-height:1.55;
        ">Support: ${escapeHtml(SUPPORT_EMAIL)}</p>
      </div>

      <footer style="
        margin-top:22px;
        padding-top:21px;
        border-top:1px solid rgba(255,255,255,0.075);
        text-align:center;
      ">
        <a href="${escapeHtml(GOOGLE_PLAY_URL)}" style="
          display:inline-flex;
          min-height:48px;
          align-items:center;
          justify-content:center;
          border-radius:17px;
          border:1px solid rgba(255,255,255,0.92);
          background:#ffffff;
          padding:0 19px;
          color:#050709;
          text-decoration:none;
          font-size:12px;
          font-weight:950;
          box-shadow:inset 0 1px 0 #ffffff,inset 0 -6px 15px rgba(0,0,0,0.08),0 16px 38px rgba(0,0,0,0.32);
        ">Get StayKnown on Google Play</a>

        <div style="
          margin-top:15px;
          color:rgba(255,255,255,0.45);
          font-size:10px;
          line-height:1.9;
          font-weight:800;
        ">
          <a href="/account-closure" style="color:inherit;">Account Closure &amp; Recovery</a>
          &nbsp;•&nbsp;
          <a href="/privacy" style="color:inherit;">Privacy</a>
          &nbsp;•&nbsp;
          <a href="/retention" style="color:inherit;">Data Retention</a>
          &nbsp;•&nbsp;
          <a href="/terms" style="color:inherit;">Terms</a>
          <br/>
          <a href="/help-center" style="color:inherit;">Help Center</a>
          &nbsp;•&nbsp;
          <a href="/submit-request" style="color:inherit;">Contact Support</a>
        </div>

        <p style="
          margin:15px 0 0;
          color:rgba(255,255,255,0.28);
          font-size:10px;
          font-weight:900;
          letter-spacing:0.8px;
          text-transform:uppercase;
        ">StayKnown™ · A 6 Clement Joshua service™</p>
      </footer>
    </section>
  </main>
</body>
</html>`;
}

function htmlResponse(
  state: ActionState,
  result: RpcResult,
  status = 200,
): NextResponse {
  return new NextResponse(resultHtml(state, result), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function jsonResponse(
  state: ActionState,
  result: RpcResult,
  status = 200,
): NextResponse {
  return NextResponse.json(
    {
      ...result,
      state,
    },
    {
      status,
      headers: corsHeaders,
    },
  );
}

function normalizeRpcState(value: unknown): ActionState {
  const state = clean(value, 80).toLowerCase();

  if (state === "closure_scheduled") {
    return "closure_scheduled";
  }

  if (state === "kept_account" || state === "cancelled_keep_account") {
    return "kept_account";
  }

  if (
    state === "security_protected" ||
    state === "unauthorized_request_protected"
  ) {
    return "security_protected";
  }

  if (
    state === "already_resolved" ||
    state === "already_used" ||
    state === "already_cancelled"
  ) {
    return "already_resolved";
  }

  if (state === "expired") {
    return "expired";
  }

  return "invalid";
}

function statusForState(state: ActionState): number {
  switch (state) {
    case "closure_scheduled":
    case "kept_account":
    case "security_protected":
    case "already_resolved":
      return 200;

    case "expired":
      return 410;

    case "disabled":
      return 503;

    case "invalid":
      return 400;

    case "error":
    default:
      return 500;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const wantsJson = acceptsJson(request);

  try {
    if (!featureEnabled()) {
      const result: RpcResult = {
        ok: false,
        state: "disabled",
        message:
          "The complete Secure Account Closure & Recovery package is not enabled yet.",
      };

      return wantsJson
        ? jsonResponse("disabled", result, 503)
        : htmlResponse("disabled", result, 503);
    }

    if (!requestIsSameOrigin(request)) {
      const result: RpcResult = {
        ok: false,
        state: "invalid",
        message:
          "This account action must be submitted from the protected StayKnown decision page.",
      };

      return wantsJson
        ? jsonResponse("invalid", result, 403)
        : htmlResponse("invalid", result, 403);
    }

    const input = await parseInput(request);

    if (!input.purpose || !tokenLooksSafe(input.token)) {
      const result: RpcResult = {
        ok: false,
        state: "invalid",
        message:
          "This account-decision request is missing valid security details.",
      };

      return input.wantsJson
        ? jsonResponse("invalid", result, 400)
        : htmlResponse("invalid", result, 400);
    }

    if (input.purpose === "confirm_closure" && !input.policyAcknowledged) {
      const result: RpcResult = {
        ok: false,
        state: "invalid",
        message:
          "Review and acknowledge the Account Closure, Privacy, Data Retention, and Terms information before confirming.",
      };

      return input.wantsJson
        ? jsonResponse("invalid", result, 400)
        : htmlResponse("invalid", result, 400);
    }

    const sb = admin();

    const { data, error } = await sb.rpc("apply_account_closure_email_action", {
      p_raw_token: input.token,
      p_purpose: input.purpose,
      p_policy_acknowledged: input.policyAcknowledged,
      p_action_context: {
        ...requestContext(request),
        submitted_source: input.source,
        policy_acknowledged: input.policyAcknowledged,
      },
    });

    if (error) {
      console.error("[account-closure/action] RPC failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      const result: RpcResult = {
        ok: false,
        state: "error",
        message:
          "StayKnown could not safely record this account decision. No unverified account change was applied.",
      };

      return input.wantsJson
        ? jsonResponse("error", result, 500)
        : htmlResponse("error", result, 500);
    }

    const result = asObject(data) as RpcResult;
    const state = normalizeRpcState(result.state);
    const status = statusForState(state);

    return input.wantsJson
      ? jsonResponse(
          state,
          {
            ...result,
            raw_token_returned: false,
          },
          status,
        )
      : htmlResponse(state, result, status);
  } catch (error) {
    console.error(
      "[account-closure/action] unexpected failure",
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
          }
        : {
            message: "Unknown route failure",
          },
    );

    const result: RpcResult = {
      ok: false,
      state: "error",
      message:
        "StayKnown could not safely process this account decision. No unverified account change was applied.",
    };

    return wantsJson
      ? jsonResponse("error", result, 500)
      : htmlResponse("error", result, 500);
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: "method_not_allowed",
      message:
        "Opening a link never consumes a StayKnown account-decision token. Use the protected page and submit a deliberate decision.",
    },
    {
      status: 405,
      headers: {
        ...corsHeaders,
        Allow: "POST",
      },
    },
  );
}
