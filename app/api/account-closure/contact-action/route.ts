// app/api/account-closure/contact-action/route.ts
// StayKnown Secure Account Closure & Recovery
//
// Website authority for deliberate trusted-contact safety responses.
//
// IMPORTANT SECURITY DESIGN
// - The GET page never calls this route.
// - Only an intentional POST from the protected contact-response page is accepted.
// - The raw one-use token is never logged, echoed, stored by this route, or
//   returned to the browser.
// - Token hashing, purpose enforcement, one-use consumption, contact-impact
//   transition, repeat-alert suppression, security-lock transition, audit
//   evidence, and follow-up queue creation are performed atomically by:
//     public.apply_account_closure_contact_action(...)
// - A trusted contact response never signs the contact into the protected
//   account and never unlocks, reactivates, closes, or controls it.
// - Keep ACCOUNT_CLOSURE_CONTACT_ACTION_ENABLED=false until the matching SQL
//   authority is installed and verified.

import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;

type ContactPurpose = "acknowledge" | "concern";

type ContactActionState =
  | "acknowledged"
  | "concern_reported"
  | "already_resolved"
  | "expired"
  | "invalid"
  | "disabled"
  | "error";

type ParsedInput = {
  purpose: ContactPurpose | null;
  token: string;
  responseAcknowledged: boolean;
  source: string;
  wantsJson: boolean;
};

type RpcResult = {
  ok?: boolean;
  state?: string;
  message?: string;
  request_id?: string;
  security_lock_id?: string;
  contact_impact_id?: string;
  contact_alerts_suppressed?: boolean;
  account_unlocked?: boolean;
  account_reactivated?: boolean;
  account_closed?: boolean;
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

const responseHeaders: Record<string, string> = {
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

function adminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Secure Account Closure contact actions are not fully configured.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
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

function asPurpose(value: unknown): ContactPurpose | null {
  const normalized = clean(value, 40).toLowerCase();

  if (normalized === "acknowledge") {
    return "acknowledge";
  }

  if (normalized === "concern") {
    return "concern";
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
    clean(
      process.env.ACCOUNT_CLOSURE_CONTACT_ACTION_ENABLED,
      20,
    ).toLowerCase() === "true"
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

function broadLocationFromHeaders(request: Request): JsonObject {
  const city = decodeHeaderValue(
    firstHeader(request, ["x-vercel-ip-city", "cf-ipcity"]),
  );

  const region = decodeHeaderValue(
    firstHeader(request, ["x-vercel-ip-country-region", "cf-region-code"]),
  );

  const countryCode = decodeHeaderValue(
    firstHeader(request, ["x-vercel-ip-country", "cf-ipcountry"]),
  ).toUpperCase();

  const summary = [city, region, countryCode]
    .filter(Boolean)
    .join(", ")
    .slice(0, 240);

  return {
    ...(city ? { city } : {}),
    ...(region ? { region } : {}),
    ...(countryCode ? { country_code: countryCode } : {}),
    ...(summary ? { summary } : {}),
    source: "verified_request_headers",
    captured_at: new Date().toISOString(),
  };
}

function clientSummary(request: Request): JsonObject {
  const userAgent = clean(request.headers.get("user-agent"), 1000);

  if (!userAgent) {
    return {
      available: false,
    };
  }

  const normalized = userAgent.toLowerCase();

  const platform = normalized.includes("android")
    ? "android"
    : normalized.includes("iphone") ||
        normalized.includes("ipad") ||
        normalized.includes("ios")
      ? "ios"
      : normalized.includes("windows")
        ? "windows"
        : normalized.includes("macintosh") || normalized.includes("mac os")
          ? "macos"
          : normalized.includes("linux")
            ? "linux"
            : "unknown";

  const browser = normalized.includes("edg/")
    ? "edge"
    : normalized.includes("chrome/")
      ? "chrome"
      : normalized.includes("safari/") && !normalized.includes("chrome/")
        ? "safari"
        : normalized.includes("firefox/")
          ? "firefox"
          : "unknown";

  const userAgentHash = createHash("sha256").update(userAgent).digest("hex");

  return {
    available: true,
    platform,
    browser,
    user_agent_hash: userAgentHash,
  };
}

function sanitizedRequestContext(
  request: Request,
  input: ParsedInput,
): JsonObject {
  return {
    channel: "account_closure_contact_email_action_page",
    submitted_source: input.source,
    submitted_purpose: input.purpose,
    response_acknowledged: input.responseAcknowledged,
    broad_location: broadLocationFromHeaders(request),
    client: clientSummary(request),
    request_received_at: new Date().toISOString(),
    sec_fetch_site: clean(request.headers.get("sec-fetch-site"), 30) || null,
    raw_token_stored: false,
    ip_address_stored: false,
    exact_coordinates_stored: false,
    raw_user_agent_stored: false,
    session_token_stored: false,
    account_credentials_stored: false,
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
  const expected = expectedOrigin();

  const fetchSite = clean(
    request.headers.get("sec-fetch-site"),
    30,
  ).toLowerCase();

  if (fetchSite === "cross-site" || fetchSite === "none") {
    return false;
  }

  const origin = clean(request.headers.get("origin"), 500);

  if (origin && origin !== expected) {
    return false;
  }

  const referer = clean(request.headers.get("referer"), 1000);

  if (referer) {
    try {
      if (new URL(referer).origin !== expected) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return Boolean(origin || referer || fetchSite === "same-origin");
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
        contact_response_acknowledged: form.get(
          "contact_response_acknowledged",
        ),
        source: form.get("source"),
      };
    }
  }

  return {
    purpose: asPurpose(body.purpose),
    token: clean(body.token, 200),
    responseAcknowledged: asBoolean(body.contact_response_acknowledged),
    source: clean(body.source, 120) || "account_closure_contact_action",
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

function normalizeRpcState(value: unknown): ContactActionState {
  const state = clean(value, 80).toLowerCase();

  if (state === "acknowledged" || state === "contact_acknowledged") {
    return "acknowledged";
  }

  if (state === "concern_reported" || state === "contact_concern_reported") {
    return "concern_reported";
  }

  if (
    state === "already_resolved" ||
    state === "already_used" ||
    state === "already_acknowledged" ||
    state === "concern_already_reported"
  ) {
    return "already_resolved";
  }

  if (state === "expired") {
    return "expired";
  }

  return "invalid";
}

function statusForState(state: ContactActionState): number {
  switch (state) {
    case "acknowledged":
    case "concern_reported":
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

function resultPresentation(
  state: ContactActionState,
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
    case "acknowledged":
      return {
        eyebrow: "Safety notice received",
        title: "Your acknowledgement was recorded.",
        message:
          clean(result.message, 1000) ||
          "StayKnown recorded that this protected safety notice reached you.",
        badge: "Receipt recorded",
        tone: "mint",
        details: [
          "Eligible repeated alerts for this same notice may now stop.",
          "This does not confirm that the person is safe.",
          "The protected account remains under its existing security state.",
          "You were not signed in and did not receive access to private account information.",
          "Use a private and appropriate channel when a welfare check is still needed.",
        ],
        primaryHref: "/",
        primaryLabel: "Return to StayKnown",
      };

    case "concern_reported":
      return {
        eyebrow: "Safety concern recorded",
        title: "StayKnown recorded your concern.",
        message:
          clean(result.message, 1000) ||
          "Your protected safety concern was recorded and routed through the applicable StayKnown response flow.",
        badge: "Concern recorded",
        tone: "danger",
        details: [
          "The concern is preserved as protected safety evidence.",
          "The account remains locked or otherwise protected according to its authoritative security state.",
          "Your response did not unlock, reactivate, close, sign in to, or control the account.",
          "Do not confront a suspected coercer or expose private safety planning.",
          "Contact the appropriate local emergency authority when there is immediate danger.",
        ],
        primaryHref: "/help-center",
        primaryLabel: "Review StayKnown safety guidance",
      };

    case "already_resolved":
      return {
        eyebrow: "Response already recorded",
        title: "This one-use response is no longer available.",
        message:
          clean(result.message, 1000) ||
          "This safety notice was already acknowledged, reported, revoked, or otherwise resolved.",
        badge: "Already resolved",
        tone: "neutral",
        details: [
          "No second response was recorded.",
          "A used or revoked contact action cannot override a previous protected result.",
          "The account was not unlocked, reactivated, closed, or exposed by opening this page.",
          "Contact StayKnown Support when the recorded result is unexpected.",
        ],
        primaryHref: "/submit-request",
        primaryLabel: "Contact StayKnown Support",
      };

    case "expired":
      return {
        eyebrow: "Safety link expired",
        title: "This contact-response link expired.",
        message:
          clean(result.message, 1000) ||
          "The signed response period ended. No new contact response or account change was made.",
        badge: "Expired",
        tone: "neutral",
        details: [
          "Expired links cannot acknowledge a notice or report concern.",
          "They cannot unlock, reactivate, close, or control an account.",
          "Use a current StayKnown notice or contact Support when assistance is needed.",
        ],
        primaryHref: "/submit-request",
        primaryLabel: "Contact StayKnown Support",
      };

    case "disabled":
      return {
        eyebrow: "Protection package not active",
        title: "This safety response is not available yet.",
        message:
          "StayKnown has not enabled the complete protected contact-response package. No response or account change was recorded.",
        badge: "Temporarily unavailable",
        tone: "neutral",
        details: [
          "The original account security state remains unchanged.",
          "This safety gate prevents a partial system from consuming the one-use response.",
          "Return to the original notice after the complete package is activated.",
        ],
        primaryHref: "/submit-request",
        primaryLabel: "Contact StayKnown Support",
      };

    case "invalid":
    case "error":
    default:
      return {
        eyebrow: "Response could not be verified",
        title: "StayKnown did not record this response.",
        message:
          clean(result.message, 1000) ||
          "The one-use safety response is invalid, incomplete, or temporarily unavailable.",
        badge: state === "error" ? "Please try later" : "Invalid response",
        tone: "danger",
        details: [
          "The raw security token was not displayed or returned.",
          "No unverified contact response was recorded.",
          "The protected account was not unlocked, reactivated, closed, or exposed.",
          "Use the original signed email action or contact StayKnown Support.",
        ],
        primaryHref: "/submit-request",
        primaryLabel: "Contact StayKnown Support",
      };
  }
}

function resultHtml(state: ContactActionState, result: RpcResult): string {
  const view = resultPresentation(state, result);

  const accent =
    view.tone === "mint"
      ? "#9ff5d6"
      : view.tone === "danger"
        ? "#ffb4b4"
        : "#ffffff";

  const details = view.details
    .map(
      (detail: string) => `
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
          ">One-use response processed securely</span>
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
            ${details}
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
  state: ContactActionState,
  result: RpcResult,
  status = 200,
): NextResponse {
  return new NextResponse(resultHtml(state, result), {
    status,
    headers: {
      ...responseHeaders,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function jsonResponse(
  state: ContactActionState,
  result: RpcResult,
  status = 200,
): NextResponse {
  return NextResponse.json(
    {
      ...result,
      state,
      raw_token_returned: false,
      account_authority_granted: false,
    },
    {
      status,
      headers: responseHeaders,
    },
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const wantsJson = acceptsJson(request);

  try {
    if (!featureEnabled()) {
      const result: RpcResult = {
        ok: false,
        state: "disabled",
        message:
          "The complete protected contact-response package is not enabled yet.",
        account_unlocked: false,
        account_reactivated: false,
        account_closed: false,
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
          "This contact response must be submitted from the protected StayKnown safety-response page.",
        account_unlocked: false,
        account_reactivated: false,
        account_closed: false,
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
          "This contact-response request is missing valid one-use security details.",
        account_unlocked: false,
        account_reactivated: false,
        account_closed: false,
      };

      return input.wantsJson
        ? jsonResponse("invalid", result, 400)
        : htmlResponse("invalid", result, 400);
    }

    if (!input.responseAcknowledged) {
      const result: RpcResult = {
        ok: false,
        state: "invalid",
        message:
          "Confirm that you understand what this protected contact response records before continuing.",
        account_unlocked: false,
        account_reactivated: false,
        account_closed: false,
      };

      return input.wantsJson
        ? jsonResponse("invalid", result, 400)
        : htmlResponse("invalid", result, 400);
    }

    const supabase = adminClient();

    const { data, error: rpcError } = await supabase.rpc(
      "apply_account_closure_contact_action",
      {
        p_raw_token: input.token,
        p_purpose: input.purpose,
        p_response_acknowledged: input.responseAcknowledged,
        p_action_context: sanitizedRequestContext(request, input),
      },
    );

    if (rpcError) {
      console.error("[account-closure/contact-action] RPC failed", {
        code: rpcError.code,
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint,
      });

      const result: RpcResult = {
        ok: false,
        state: "error",
        message:
          "StayKnown could not safely record this contact response. No unverified response or account change was applied.",
        account_unlocked: false,
        account_reactivated: false,
        account_closed: false,
      };

      return input.wantsJson
        ? jsonResponse("error", result, 500)
        : htmlResponse("error", result, 500);
    }

    const result = asObject(data) as RpcResult;

    const state = normalizeRpcState(result.state);

    const status = statusForState(state);

    const safeResult: RpcResult = {
      ...result,
      account_unlocked: false,
      account_reactivated: false,
      account_closed: false,
    };

    return input.wantsJson
      ? jsonResponse(state, safeResult, status)
      : htmlResponse(state, safeResult, status);
  } catch (error) {
    console.error(
      "[account-closure/contact-action] unexpected failure",
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
          }
        : {
            message: "Unknown contact-action route failure",
          },
    );

    const result: RpcResult = {
      ok: false,
      state: "error",
      message:
        "StayKnown could not safely process this contact response. No unverified response or account change was applied.",
      account_unlocked: false,
      account_reactivated: false,
      account_closed: false,
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
        "Opening a safety-notice link never consumes a StayKnown contact-response token. Use the protected page and submit a deliberate response.",
      raw_token_returned: false,
      account_authority_granted: false,
      account_unlocked: false,
      account_reactivated: false,
      account_closed: false,
    },
    {
      status: 405,
      headers: {
        ...responseHeaders,
        Allow: "POST",
      },
    },
  );
}
