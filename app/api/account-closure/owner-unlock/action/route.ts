// app/api/account-closure/owner-unlock/action/route.ts
// StayKnown Secure Account Closure & Recovery
//
// Protected website authority for deliberate Protection Lock owner-unlock.
//
// SECURITY DESIGN
// - GET never consumes a token and never changes account state.
// - POST requires a same-origin submission from the protected owner-unlock page.
// - The raw one-use token is never logged, echoed, persisted by this route,
//   or returned to the browser.
// - The route uses the Supabase service role only to call one atomic RPC:
//     public.apply_account_closure_owner_unlock(...)
// - The database RPC remains authoritative for token hashing, purpose, expiry,
//   one-use enforcement, owner identity, lock state, unlock deadline, request
//   state, safe cancellation, audit evidence, notifications and idempotency.
// - The route never releases a Protection Lock directly.
//
// Keep ACCOUNT_CLOSURE_OWNER_UNLOCK_ACTION_ENABLED=false until the matching
// SQL migration and all Flutter/startup enforcement files are installed.

import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;

type OwnerUnlockState =
  | "unlocked"
  | "already_unlocked"
  | "protection_lock_not_due"
  | "legal_hold_active"
  | "request_state_changed"
  | "already_resolved"
  | "expired"
  | "invalid"
  | "disabled"
  | "error";

type ParsedInput = {
  token: string;
  ownerUnlockAcknowledged: boolean;
  protectedAccessAcknowledged: boolean;
  typedConfirmation: string;
  source: string;
  wantsJson: boolean;
};

type RpcResult = {
  ok?: boolean;
  state?: string;
  message?: string;
  request_id?: string;
  user_id?: string;
  security_lock_id?: string;
  unlocked_at?: string;
  owner_reauthenticated_at?: string;
  unlock_not_before?: string;
  closure_request_cancelled?: boolean;
  protection_lock_released?: boolean;
  account_unlocked?: boolean;
  account_closed?: boolean;
  account_reactivated?: boolean;
  chat_access_restored?: boolean;
  contact_access_restored?: boolean;
  notifications_queued?: number;
  next_step?: string;
  [key: string]: unknown;
};

const REQUIRED_CONFIRMATION = "UNLOCK";

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
    throw new Error("Secure Protection Lock recovery is not fully configured.");
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
      process.env.ACCOUNT_CLOSURE_OWNER_UNLOCK_ACTION_ENABLED,
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

function sanitizedActionContext(
  request: Request,
  input: ParsedInput,
): JsonObject {
  return {
    channel: "account_closure_owner_unlock_email_action_page",
    submitted_source: input.source,
    owner_unlock_acknowledged: input.ownerUnlockAcknowledged,
    protected_access_acknowledged: input.protectedAccessAcknowledged,
    typed_confirmation: input.typedConfirmation,
    broad_location: broadLocationFromHeaders(request),
    client: clientSummary(request),
    request_received_at: new Date().toISOString(),
    sec_fetch_site: clean(request.headers.get("sec-fetch-site"), 30) || null,
    raw_token_stored: false,
    ip_address_stored: false,
    exact_coordinates_stored: false,
    raw_user_agent_stored: false,
    session_token_stored: false,
    authorization_header_stored: false,
    account_credentials_stored: false,
    biometric_material_stored: false,
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
        token: form.get("token"),
        owner_unlock_acknowledged: form.get("owner_unlock_acknowledged"),
        protected_access_acknowledged: form.get(
          "protected_access_acknowledged",
        ),
        typed_confirmation: form.get("typed_confirmation"),
        source: form.get("source"),
      };
    }
  }

  return {
    token: clean(body.token, 200),
    ownerUnlockAcknowledged: asBoolean(body.owner_unlock_acknowledged),
    protectedAccessAcknowledged: asBoolean(body.protected_access_acknowledged),
    typedConfirmation: clean(body.typed_confirmation, 40).toUpperCase(),
    source: clean(body.source, 120) || "account_closure_owner_unlock_action",
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

function normalizeRpcState(value: unknown): OwnerUnlockState {
  const state = clean(value, 100).toLowerCase();

  if (
    state === "unlocked" ||
    state === "protection_lock_released" ||
    state === "account_unlocked"
  ) {
    return "unlocked";
  }

  if (
    state === "already_unlocked" ||
    state === "protection_lock_already_released" ||
    state === "owner_unlock_already_completed"
  ) {
    return "already_unlocked";
  }

  if (state === "protection_lock_not_due" || state === "owner_unlock_not_due") {
    return "protection_lock_not_due";
  }

  if (state === "legal_hold_active" || state === "legal_hold") {
    return "legal_hold_active";
  }

  if (
    state === "request_state_changed" ||
    state === "safety_lock_not_active" ||
    state === "protected_request_already_resolved"
  ) {
    return "request_state_changed";
  }

  if (
    state === "already_resolved" ||
    state === "already_used" ||
    state === "revoked"
  ) {
    return "already_resolved";
  }

  if (state === "expired") {
    return "expired";
  }

  return "invalid";
}

function statusForState(state: OwnerUnlockState): number {
  switch (state) {
    case "unlocked":
    case "already_unlocked":
    case "already_resolved":
    case "request_state_changed":
      return 200;

    case "protection_lock_not_due":
      return 425;

    case "legal_hold_active":
      return 423;

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
  state: OwnerUnlockState,
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
    case "unlocked":
      return {
        eyebrow: "Protection Shield completed",
        title: "Your StayKnown Protection Lock is released.",
        message:
          clean(result.message, 1200) ||
          "StayKnown verified the protected owner action, cancelled the unsafe closure attempt and restored ordinary access to the same account.",
        badge: "Account unlocked",
        tone: "mint",
        details: [
          "The same StayKnown account remains owned by the same verified person.",
          "The unsafe account-closure attempt was cancelled rather than completed.",
          "Eligible account controls can return through protected app reconciliation.",
          "Existing chats, trusted relationships and safety history remain attached to the same account.",
          "Required Protection Lock and account-security evidence remains preserved.",
        ],
        primaryHref: "stayknown://account-unlocked",
        primaryLabel: "Open StayKnown",
      };

    case "already_unlocked":
      return {
        eyebrow: "Protection already resolved",
        title: "This StayKnown account is already unlocked.",
        message:
          clean(result.message, 1200) ||
          "The Protection Lock was released earlier. This one-use owner action cannot unlock the account a second time.",
        badge: "Already unlocked",
        tone: "mint",
        details: [
          "No duplicate account or owner identity was created.",
          "No second closure cancellation or access restoration was applied.",
          "The same account remains connected to its existing history and trusted relationships.",
          "Open StayKnown with the original owner account.",
        ],
        primaryHref: "stayknown://account-unlocked",
        primaryLabel: "Open StayKnown",
      };

    case "protection_lock_not_due":
      return {
        eyebrow: "Protection period active",
        title: "This Protection Lock cannot be released yet.",
        message:
          clean(result.message, 1200) ||
          "The mandatory protection period has not ended. No account change was made.",
        badge: "Protection still active",
        tone: "neutral",
        details: [
          "The signed action did not release the lock.",
          "Emergency-capable safety controls remain available according to the lock policy.",
          "Wait until the protected unlock deadline shown in StayKnown.",
          "A fresh owner-verification email may be required after the deadline.",
        ],
        primaryHref: "stayknown://account-security",
        primaryLabel: "Open Protection Shield",
      };

    case "legal_hold_active":
      return {
        eyebrow: "Protected review active",
        title: "Automatic account unlocking is unavailable.",
        message:
          clean(result.message, 1200) ||
          "The account remains under protected legal or security review and cannot be unlocked through the automatic email flow.",
        badge: "Protected review",
        tone: "neutral",
        details: [
          "The one-use action did not release the Protection Lock.",
          "The account and required evidence remain protected.",
          "A trusted contact cannot override this restriction.",
          "Contact StayKnown Support through the official Help Center.",
        ],
        primaryHref: "/submit-request",
        primaryLabel: "Contact StayKnown Support",
      };

    case "request_state_changed":
      return {
        eyebrow: "Protected request changed",
        title: "This owner-unlock action is no longer required.",
        message:
          clean(result.message, 1200) ||
          "The underlying protected request changed, was cancelled, was resolved or is no longer safety-locked.",
        badge: "Request resolved",
        tone: "neutral",
        details: [
          "No additional lock release was applied.",
          "The current backend account state remains authoritative.",
          "Open StayKnown to review the latest account-security status.",
        ],
        primaryHref: "stayknown://account-security",
        primaryLabel: "Open Account Security",
      };

    case "already_resolved":
      return {
        eyebrow: "One-use action resolved",
        title: "This protected unlock action is no longer available.",
        message:
          clean(result.message, 1200) ||
          "The signed link was already used, revoked, replaced or resolved.",
        badge: "Already resolved",
        tone: "neutral",
        details: [
          "No second lock release was applied.",
          "A replaced or revoked token cannot override the current security state.",
          "Use the most recent StayKnown owner-verification email or contact Support.",
        ],
        primaryHref: "stayknown://account-security",
        primaryLabel: "Return to StayKnown",
      };

    case "expired":
      return {
        eyebrow: "Owner-verification link expired",
        title: "This signed unlock email expired.",
        message:
          clean(result.message, 1200) ||
          "The one-use email confirmation period ended. The Protection Lock remains in its previous state.",
        badge: "Link expired",
        tone: "neutral",
        details: [
          "The expired action did not release the lock.",
          "The unsafe closure request was not cancelled by this link.",
          "Request a fresh protected unlock email from StayKnown.",
        ],
        primaryHref: "stayknown://account-security",
        primaryLabel: "Open Protection Shield",
      };

    case "disabled":
      return {
        eyebrow: "Unlock package not active",
        title: "Protected account unlocking is not available yet.",
        message:
          "StayKnown has not enabled the complete Protection Lock recovery package. No token was consumed and no account change was made.",
        badge: "Temporarily unavailable",
        tone: "neutral",
        details: [
          "The existing Protection Lock remains active.",
          "The unsafe closure request remains cancelled or blocked only according to its current authoritative state.",
          "This feature gate prevents a partial security package from releasing an account lock.",
        ],
        primaryHref: "/submit-request",
        primaryLabel: "Contact StayKnown Support",
      };

    case "invalid":
    case "error":
    default:
      return {
        eyebrow: "Owner unlock could not be verified",
        title: "StayKnown did not release this Protection Lock.",
        message:
          clean(result.message, 1200) ||
          "The signed owner-unlock action is invalid, incomplete or temporarily unavailable.",
        badge: state === "error" ? "Please try later" : "Invalid unlock action",
        tone: "danger",
        details: [
          "The raw security token was not displayed or returned.",
          "No unverified lock release was applied.",
          "The account, chats, contacts and safety evidence were not transferred to another person.",
          "Use the original signed owner-verification email or contact StayKnown Support.",
        ],
        primaryHref: "/submit-request",
        primaryLabel: "Contact StayKnown Support",
      };
  }
}

function resultHtml(state: OwnerUnlockState, result: RpcResult): string {
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

  const safeUnlockedAt = clean(
    result.unlocked_at || result.owner_reauthenticated_at,
    100,
  );

  const unlockedAtBlock =
    state === "unlocked" && safeUnlockedAt
      ? `
        <div style="
          margin-top:16px;
          padding:14px;
          border-radius:18px;
          border:1px solid rgba(159,245,214,0.18);
          background:rgba(159,245,214,0.055);
          color:rgba(220,255,242,0.82);
          font-size:11px;
          font-weight:750;
          line-height:1.55;
          text-align:center;
        ">
          Protection Lock released: ${escapeHtml(safeUnlockedAt)}
        </div>
      `
      : "";

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
    radial-gradient(circle at 50% -10%, rgba(146,243,207,0.12), transparent 35%),
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
    <section style="width:100%;max-width:690px;">
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
          ">One-use owner action processed securely</span>
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

        ${unlockedAtBlock}

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
  state: OwnerUnlockState,
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
  state: OwnerUnlockState,
  result: RpcResult,
  status = 200,
): NextResponse {
  return NextResponse.json(
    {
      ...result,
      state,
      raw_token_returned: false,
      direct_database_authority_granted: false,
    },
    {
      status,
      headers: responseHeaders,
    },
  );
}

function safeFailureResult(state: string, message: string): RpcResult {
  return {
    ok: false,
    state,
    message,
    protection_lock_released: false,
    account_unlocked: false,
    account_closed: false,
    account_reactivated: false,
    closure_request_cancelled: false,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const wantsJson = acceptsJson(request);

  try {
    if (!featureEnabled()) {
      const result = safeFailureResult(
        "disabled",
        "The complete protected owner-unlock package is not enabled yet.",
      );

      return wantsJson
        ? jsonResponse("disabled", result, 503)
        : htmlResponse("disabled", result, 503);
    }

    if (!requestIsSameOrigin(request)) {
      const result = safeFailureResult(
        "invalid",
        "This owner-unlock action must be submitted from the protected StayKnown page.",
      );

      return wantsJson
        ? jsonResponse("invalid", result, 403)
        : htmlResponse("invalid", result, 403);
    }

    const input = await parseInput(request);

    if (!tokenLooksSafe(input.token)) {
      const result = safeFailureResult(
        "invalid",
        "This owner-unlock action is missing valid one-use security details.",
      );

      return input.wantsJson
        ? jsonResponse("invalid", result, 400)
        : htmlResponse("invalid", result, 400);
    }

    if (!input.ownerUnlockAcknowledged) {
      const result = safeFailureResult(
        "invalid",
        "Confirm that you are requesting release of the Protection Lock on your own StayKnown account.",
      );

      return input.wantsJson
        ? jsonResponse("invalid", result, 400)
        : htmlResponse("invalid", result, 400);
    }

    if (!input.protectedAccessAcknowledged) {
      const result = safeFailureResult(
        "invalid",
        "Confirm that unlocking preserves required safety evidence and does not transfer account control.",
      );

      return input.wantsJson
        ? jsonResponse("invalid", result, 400)
        : htmlResponse("invalid", result, 400);
    }

    if (input.typedConfirmation !== REQUIRED_CONFIRMATION) {
      const result = safeFailureResult(
        "invalid",
        `Type ${REQUIRED_CONFIRMATION} exactly to request release of the Protection Lock.`,
      );

      return input.wantsJson
        ? jsonResponse("invalid", result, 400)
        : htmlResponse("invalid", result, 400);
    }

    const supabase = adminClient();

    const { data, error: rpcError } = await supabase.rpc(
      "apply_account_closure_owner_unlock",
      {
        p_raw_token: input.token,
        p_owner_unlock_acknowledged: input.ownerUnlockAcknowledged,
        p_protected_access_acknowledged: input.protectedAccessAcknowledged,
        p_typed_confirmation: input.typedConfirmation,
        p_action_context: sanitizedActionContext(request, input),
      },
    );

    if (rpcError) {
      console.error("[account-closure/owner-unlock/action] RPC failed", {
        code: rpcError.code,
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint,
      });

      const result = safeFailureResult(
        "error",
        "StayKnown could not safely complete owner reauthentication. The Protection Lock remains in its previous state.",
      );

      return input.wantsJson
        ? jsonResponse("error", result, 500)
        : htmlResponse("error", result, 500);
    }

    const result = asObject(data) as RpcResult;

    const state = normalizeRpcState(result.state);

    const status = statusForState(state);

    const success = state === "unlocked" || state === "already_unlocked";

    const safeResult: RpcResult = {
      ...result,
      account_closed: false,
      account_reactivated: false,
      account_unlocked: success,
      protection_lock_released: success,
      closure_request_cancelled:
        state === "unlocked"
          ? result.closure_request_cancelled !== false
          : Boolean(result.closure_request_cancelled),
    };

    return input.wantsJson
      ? jsonResponse(state, safeResult, status)
      : htmlResponse(state, safeResult, status);
  } catch (error) {
    console.error(
      "[account-closure/owner-unlock/action] unexpected failure",
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
          }
        : {
            message: "Unknown owner-unlock route failure",
          },
    );

    const result = safeFailureResult(
      "error",
      "StayKnown could not safely process this owner-verification action. The Protection Lock remains in its previous state.",
    );

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
        "Opening a StayKnown owner-verification email never consumes the token or releases a Protection Lock. Use the protected page and submit a deliberate POST.",
      raw_token_returned: false,
      protection_lock_released: false,
      account_unlocked: false,
      account_closed: false,
      account_reactivated: false,
      closure_request_cancelled: false,
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
