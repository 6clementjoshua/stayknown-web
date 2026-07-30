// app/api/live/advisory/send/route.ts
// StayKnown Upgrade Master File Record:
// protected recipient-bound Visit Safety Advisory authority.

import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  accessFromUnknown,
  canUseInteractiveLiveActions,
  clean,
  createAdminClient,
  requestIpHash,
  resolveStayKnownUserByEmail,
  validateVisitAccess,
  verifyLiveAccess,
  visitHasEnded,
  visitOwnerUserId,
} from "../../../../live/live-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const POLICY_VERSION = "visit-map-safety-use-v2-2026-07-17";
const COOLDOWN_SECONDS = 300;
const DELIVERY_TIMEOUT_MS = 12000;

const RESPONSE_HEADERS: Record<string, string> = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

const PRESETS: Record<string, string> = {
  leave_area:
    "I’m concerned about your current area. Please leave carefully and contact me.",
  check_route:
    "I know this route. You may be heading toward an unsafe area. Please check your route now.",
  location_mismatch:
    "Your current location does not match where I expected you to be. Please confirm your location.",
};

type JsonObject = Record<string, unknown>;

type SenderIdentity = {
  displayName: string;
  email: string;
  verified: boolean;
  badgeType: string;
  badgeStatus: string;
  avatarUrl: string;
};

type DeliveryResult = {
  ok: boolean;
  status?: number;
  code: string;
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: RESPONSE_HEADERS,
  });
}

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function configuredSiteOrigin(): string {
  const raw = clean(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.SITE_URL ??
      "https://www.stay-known.com",
  );

  try {
    return new URL(raw).origin;
  } catch {
    return "https://www.stay-known.com";
  }
}

function requestIsSameOrigin(req: Request): boolean {
  const expectedOrigin = configuredSiteOrigin();
  const fetchSite = clean(req.headers.get("sec-fetch-site")).toLowerCase();

  if (fetchSite === "cross-site" || fetchSite === "none") {
    return false;
  }

  const origin = clean(req.headers.get("origin"));

  if (origin && origin !== expectedOrigin) {
    return false;
  }

  const referer = clean(req.headers.get("referer"));

  if (referer) {
    try {
      if (new URL(referer).origin !== expectedOrigin) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return Boolean(
    origin ||
    referer ||
    fetchSite === "same-origin" ||
    fetchSite === "same-site",
  );
}

function contentTypeIsJson(req: Request): boolean {
  return clean(req.headers.get("content-type"))
    .toLowerCase()
    .includes("application/json");
}

function escapeHtml(value: unknown): string {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validateMessage(kind: string, customMessage: string): string {
  if (Object.prototype.hasOwnProperty.call(PRESETS, kind)) {
    return PRESETS[kind];
  }

  if (kind !== "custom") {
    throw new Error("unsupported_advisory_kind");
  }

  const message = customMessage.replace(/\s+/g, " ").trim();

  if (!message) {
    throw new Error("custom_message_required");
  }

  if (message.length > 160) {
    throw new Error("custom_message_too_long");
  }

  if (/https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|app)\b/i.test(message)) {
    throw new Error("custom_message_links_not_allowed");
  }

  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(message)) {
    throw new Error("custom_message_invalid_characters");
  }

  const prohibitedPatterns = [
    /\bcome\s+alone\b/i,
    /\bmeet\s+me\s+alone\b/i,
    /\bdo\s+not\s+tell\s+(anyone|your\s+family|the\s+police)\b/i,
    /\bdon['’]?t\s+tell\s+(anyone|your\s+family|the\s+police)\b/i,
    /\byou\s+must\s+obey\b/i,
    /\bi\s+am\s+watching\s+you\b/i,
    /\bi\s+will\s+(hurt|kill|punish|attack)\s+you\b/i,
    /\bi['’]?ll\s+(hurt|kill|punish|attack)\s+you\b/i,
  ];

  if (prohibitedPatterns.some((pattern) => pattern.test(message))) {
    throw new Error("custom_message_policy_blocked");
  }

  return message;
}

function configuredStorageOrigin(): string {
  const raw = clean(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  );

  if (!raw) return "";

  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

function safeAbsoluteAvatarUrl(raw: string): string {
  if (!raw) return "";

  try {
    const url = new URL(raw);

    if (url.protocol !== "https:") return "";

    const allowedOrigin = configuredStorageOrigin();

    if (allowedOrigin && url.origin !== allowedOrigin) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function logDatabaseFailure(
  operation: string,
  error: {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
  },
): void {
  console.error(`[SK_LIVE_ADVISORY] ${operation} failed`, {
    code: clean(error.code) || null,
    message: clean(error.message) || null,
    details: clean(error.details) || null,
    hint: clean(error.hint) || null,
  });
}

function userAgentSummary(req: Request): JsonObject {
  const userAgent = clean(req.headers.get("user-agent")).slice(0, 1000);

  if (!userAgent) {
    return {
      available: false,
      raw_user_agent_stored: false,
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

  const secret = clean(
    process.env.LIVE_AUDIT_HASH_SECRET ??
      process.env.INTERNAL_EVENT_SECRET ??
      process.env.TRACKING_SIGNING_SECRET,
  );

  const userAgentHash = secret
    ? createHmac("sha256", secret)
        .update(`stayknown-live-advisory-client:${userAgent}`, "utf8")
        .digest("hex")
    : "";

  return {
    available: true,
    platform,
    browser,
    ...(userAgentHash ? { user_agent_hash: userAgentHash } : {}),
    raw_user_agent_stored: false,
  };
}

async function signedAvatar(
  admin: SupabaseClient,
  rawPath: string,
): Promise<string> {
  const raw = clean(rawPath);

  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    return safeAbsoluteAvatarUrl(raw);
  }

  const normalized = raw.replace(/^\/+/, "");

  const candidates = normalized.startsWith("avatars/")
    ? [{ bucket: "avatars", path: normalized.slice("avatars/".length) }]
    : normalized.startsWith("safety-gallery/")
      ? [
          {
            bucket: "safety-gallery",
            path: normalized.slice("safety-gallery/".length),
          },
        ]
      : [
          { bucket: "avatars", path: normalized },
          { bucket: "safety-gallery", path: normalized },
        ];

  for (const candidate of candidates) {
    if (!candidate.path) continue;

    try {
      const signed = await admin.storage
        .from(candidate.bucket)
        .createSignedUrl(candidate.path, 60 * 30);

      if (signed.error) {
        logDatabaseFailure(
          `avatar signing (${candidate.bucket})`,
          signed.error,
        );
        continue;
      }

      const url = safeAbsoluteAvatarUrl(clean(signed.data?.signedUrl));

      if (url) return url;
    } catch (error) {
      console.error("[SK_LIVE_ADVISORY] avatar signing threw", {
        bucket: candidate.bucket,
        message: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }

  return "";
}

async function loadSenderIdentity(
  admin: SupabaseClient,
  userId: string,
): Promise<SenderIdentity> {
  if (!userId) {
    return {
      displayName: "",
      email: "",
      verified: false,
      badgeType: "",
      badgeStatus: "",
      avatarUrl: "",
    };
  }

  let displayName = "";
  let profileEmail = "";
  let verified = false;
  let badgeType = "";
  let badgeStatus = "";
  let avatarPath = "";

  try {
    const profile = await admin
      .from("profiles")
      .select("verified,avatar_url,email,first_name,last_name")
      .eq("id", userId)
      .maybeSingle();

    if (profile.error) {
      logDatabaseFailure("profiles identity lookup", profile.error);
    } else {
      verified = profile.data?.verified === true;
      avatarPath = clean(profile.data?.avatar_url);
      profileEmail = clean(profile.data?.email).toLowerCase();

      const firstName = clean(profile.data?.first_name);
      const lastName = clean(profile.data?.last_name);
      displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
    }
  } catch (error) {
    console.error("[SK_LIVE_ADVISORY] profiles lookup threw", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }

  try {
    const userProfile = await admin
      .from("user_profile")
      .select("profile_photo_url,display_name,first_name,last_name,email")
      .eq("user_id", userId)
      .maybeSingle();

    if (userProfile.error) {
      logDatabaseFailure("user_profile identity lookup", userProfile.error);
    } else {
      avatarPath = clean(userProfile.data?.profile_photo_url) || avatarPath;

      const firstName = clean(userProfile.data?.first_name);
      const lastName = clean(userProfile.data?.last_name);

      displayName =
        clean(userProfile.data?.display_name) ||
        [firstName, lastName].filter(Boolean).join(" ").trim() ||
        displayName;

      profileEmail =
        clean(userProfile.data?.email).toLowerCase() || profileEmail;
    }
  } catch (error) {
    console.error("[SK_LIVE_ADVISORY] user_profile lookup threw", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }

  try {
    const badge = await admin
      .from("user_verification_badges")
      .select("badge_type,status,awarded_at,created_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .is("removed_at", null)
      .order("awarded_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (badge.error) {
      logDatabaseFailure("verification badge lookup", badge.error);
    } else if (badge.data) {
      verified = true;
      badgeType = clean(badge.data.badge_type);
      badgeStatus = clean(badge.data.status);
    }
  } catch (error) {
    console.error("[SK_LIVE_ADVISORY] badge lookup threw", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }

  return {
    displayName,
    email: profileEmail,
    verified,
    badgeType,
    badgeStatus,
    avatarUrl: await signedAvatar(admin, avatarPath),
  };
}

async function insertNotification(
  admin: SupabaseClient,
  params: {
    userId: string;
    title: string;
    body: string;
    kind: string;
    dedupeKey: string;
    data: Record<string, unknown>;
  },
): Promise<string> {
  const result = await admin
    .from("notifications")
    .insert({
      user_id: params.userId,
      title: params.title,
      body: params.body,
      kind: params.kind,
      data: {
        ...params.data,
        persistent_in_app: true,
        dedupe_key: params.dedupeKey,
      },
      meta: {
        source: "visit_live_map",
        persistent_in_app: true,
        dedupe_key: params.dedupeKey,
        updated_at: new Date().toISOString(),
      },
    })
    .select("id")
    .single();

  if (result.error) {
    logDatabaseFailure("notification insert", result.error);
    return "";
  }

  return clean(result.data?.id);
}

function withTimeoutSignal(milliseconds: number): {
  signal: AbortSignal;
  cancel: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), milliseconds);

  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
}

async function sendPush(params: {
  userId: string;
  title: string;
  body: string;
  imageUrl: string;
  data: Record<string, unknown>;
}): Promise<DeliveryResult> {
  const supabaseUrl = clean(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  ).replace(/\/+$/g, "");

  const secret = clean(process.env.INTERNAL_EVENT_SECRET);

  if (!supabaseUrl || !secret) {
    return {
      ok: false,
      code: "push_not_configured",
    };
  }

  const timeout = withTimeoutSignal(DELIVERY_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send_push_notification`,
      {
        method: "POST",
        cache: "no-store",
        signal: timeout.signal,
        headers: {
          "Content-Type": "application/json",
          "x-internal-event-secret": secret,
        },
        body: JSON.stringify({
          user_id: params.userId,
          title: params.title,
          body: params.body,
          kind: "visit_safety_advisory",
          image_url: params.imageUrl,
          collapse_key: `visit_safety_advisory_${clean(
            params.data.advisory_id,
          )}`,
          thread_id: `visit_${clean(params.data.session_id)}`,
          ttl_seconds: 86400,
          data_only_android: true,
          data: params.data,
        }),
      },
    );

    return {
      ok: response.ok,
      status: response.status,
      code: response.ok ? "delivered" : "push_rejected",
    };
  } catch (error) {
    return {
      ok: false,
      code:
        error instanceof Error && error.name === "AbortError"
          ? "push_timeout"
          : "push_failed",
    };
  } finally {
    timeout.cancel();
  }
}

async function sendEmail(params: {
  to: string;
  visitorName: string;
  senderName: string;
  message: string;
  place: string;
}): Promise<DeliveryResult> {
  const apiKey = clean(process.env.RESEND_API_KEY);
  const from = clean(process.env.RESEND_FROM);

  if (!apiKey || !from || !params.to.includes("@")) {
    return {
      ok: false,
      code: "email_not_configured",
    };
  }

  const timeout = withTimeoutSignal(DELIVERY_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: timeout.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: `Safety guidance from ${params.senderName}`,
        html: `
          <div style="margin:0;background:#f2f3f5;padding:28px 12px;font-family:Inter,Arial,sans-serif;color:#111;">
            <div style="max-width:620px;margin:0 auto;border-radius:30px;border:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.96);overflow:hidden;box-shadow:0 28px 80px rgba(0,0,0,.12);">
              <div style="padding:28px 24px 18px;text-align:center;background:linear-gradient(145deg,#fff,#f0f1f3);">
                <div style="font-size:11px;font-weight:950;letter-spacing:2.6px;">STAYKNOWN™</div>
                <div style="margin-top:14px;font-size:25px;font-weight:950;letter-spacing:-.5px;">Visit Safety Advisory</div>
                <div style="margin-top:8px;font-size:13px;line-height:1.6;color:#555;">${escapeHtml(
                  params.senderName,
                )} sent guidance about ${escapeHtml(
                  params.visitorName,
                )}’s active Visit.</div>
              </div>

              <div style="padding:22px 24px 26px;">
                <div style="border-radius:22px;background:#111;color:#fff;padding:20px;font-size:16px;font-weight:850;line-height:1.55;">${escapeHtml(
                  params.message,
                )}</div>

                ${
                  params.place
                    ? `<div style="margin-top:14px;border-radius:18px;background:#f4f5f6;padding:14px;font-size:12px;line-height:1.55;color:#3e4146;"><b>Location snapshot:</b> ${escapeHtml(
                        params.place,
                      )}</div>`
                    : ""
                }

                <div style="margin-top:16px;font-size:12px;line-height:1.65;color:#666;">
                  Open StayKnown to choose <b>I’m leaving now</b> or <b>I’m safe</b>.
                  This advisory does not replace emergency services.
                </div>
              </div>
            </div>
          </div>`,
      }),
    });

    return {
      ok: response.ok,
      status: response.status,
      code: response.ok ? "delivered" : "email_rejected",
    };
  } catch (error) {
    return {
      ok: false,
      code:
        error instanceof Error && error.name === "AbortError"
          ? "email_timeout"
          : "email_failed",
    };
  } finally {
    timeout.cancel();
  }
}

function safeFailure(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  const code = error instanceof Error ? clean(error.message) : "";

  const validationMessages: Record<string, string> = {
    unsupported_advisory_kind: "Choose an available Visit Safety Advisory.",
    custom_message_required: "Enter a short safety message before continuing.",
    custom_message_too_long:
      "Keep the custom safety message within 160 characters.",
    custom_message_links_not_allowed:
      "Links are not allowed in custom safety guidance.",
    custom_message_invalid_characters:
      "The custom safety message contains unsupported characters.",
    custom_message_policy_blocked:
      "This message cannot be sent through StayKnown safety guidance.",
  };

  if (Object.prototype.hasOwnProperty.call(validationMessages, code)) {
    return {
      status: 400,
      code,
      message: validationMessages[code],
    };
  }

  if (code === "visit_not_found") {
    return {
      status: 404,
      code: "visit_not_found",
      message: "This LIVE Visit is no longer available.",
    };
  }

  if (
    code === "recipient_not_authorized" ||
    code === "recipient_email_missing"
  ) {
    return {
      status: 403,
      code: "recipient_not_authorized",
      message:
        "This recipient is not authorized to send Visit Safety Advisories.",
    };
  }

  if (
    code === "visit_access_failed" ||
    code === "recipient_access_failed" ||
    code === "live_configuration_unavailable"
  ) {
    return {
      status: 503,
      code: "advisory_temporarily_unavailable",
      message:
        "StayKnown could not verify this LIVE Visit right now. Please try again.",
    };
  }

  return {
    status: 500,
    code: "advisory_failed",
    message: "StayKnown could not safely send this guidance. Please try again.",
  };
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    if (!contentTypeIsJson(req)) {
      return jsonResponse(
        {
          ok: false,
          code: "unsupported_content_type",
          error:
            "Submit this Visit Safety Advisory from the protected StayKnown page.",
        },
        415,
      );
    }

    if (!requestIsSameOrigin(req)) {
      return jsonResponse(
        {
          ok: false,
          code: "invalid_request_origin",
          error:
            "This Visit Safety Advisory must be submitted from the protected StayKnown page.",
        },
        403,
      );
    }

    const body = asObject(await req.json().catch(() => ({})));
    const access = accessFromUnknown(body);
    const verified = verifyLiveAccess(access);

    if (!verified.ok) {
      return jsonResponse(
        {
          ok: false,
          code: "invalid_live_access",
          error: "This signed LIVE Visit access is invalid or expired.",
        },
        401,
      );
    }

    const admin = createAdminClient();
    const context = await validateVisitAccess(admin, verified);
    const recipient = context.recipient;
    const ownerUserId = visitOwnerUserId(context, verified);

    if (!recipient || !canUseInteractiveLiveActions(verified, context)) {
      return jsonResponse(
        {
          ok: false,
          code: "recipient_bound_access_required",
          error: "Authorized recipient-bound LIVE Visit access is required.",
        },
        403,
      );
    }

    if (visitHasEnded(context.visit)) {
      return jsonResponse(
        {
          ok: false,
          code: "visit_ended",
          error: "This Visit has already ended.",
        },
        409,
      );
    }

    const consentId = clean(body.consent_id);

    if (!consentId) {
      return jsonResponse(
        {
          ok: false,
          code: "consent_required",
          error: "Accept the safety-use policy before sending guidance.",
        },
        403,
      );
    }

    const consent = await admin
      .from("visit_map_access_consents")
      .select(
        "id,decision,policy_version,created_at,owner_user_id,recipient_contact_id,audience,signed_exp,signed_version",
      )
      .eq("id", consentId)
      .eq("visit_id", verified.sid)
      .eq("owner_user_id", ownerUserId)
      .eq("recipient_contact_id", recipient.id)
      .eq("decision", "accepted")
      .eq("policy_version", POLICY_VERSION)
      .maybeSingle();

    if (consent.error) {
      logDatabaseFailure("consent lookup", consent.error);

      return jsonResponse(
        {
          ok: false,
          code: "consent_unavailable",
          error: "StayKnown could not verify the recorded safety-use consent.",
        },
        503,
      );
    }

    const consentRow = consent.data as Record<string, unknown> | null;

    const consentMatchesSignedAccess =
      consentRow !== null &&
      clean(consentRow.audience) === verified.aud &&
      clean(consentRow.signed_version) === verified.version &&
      Number(consentRow.signed_exp) === verified.expNumber;

    if (!consentMatchesSignedAccess) {
      return jsonResponse(
        {
          ok: false,
          code: "valid_consent_required",
          error: "A valid recorded consent is required.",
        },
        403,
      );
    }

    const kind = clean(body.message_kind).toLowerCase();
    const message = validateMessage(kind, clean(body.custom_message));

    const existing = await admin
      .from("visit_safety_advisories")
      .select("id,status,created_at")
      .eq("visit_id", verified.sid)
      .eq("sender_contact_id", recipient.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing.error) {
      logDatabaseFailure("advisory cooldown lookup", existing.error);

      return jsonResponse(
        {
          ok: false,
          code: "advisory_state_unavailable",
          error: "StayKnown could not verify the current advisory state.",
        },
        503,
      );
    }

    if (existing.data) {
      if (
        ["active", "leaving"].includes(
          clean(existing.data.status).toLowerCase(),
        )
      ) {
        return jsonResponse(
          {
            ok: false,
            code: "advisory_already_active",
            error: "You already have an active advisory for this Visit.",
            advisory_id: clean(existing.data.id) || null,
          },
          409,
        );
      }

      const created = new Date(clean(existing.data.created_at));

      if (!Number.isNaN(created.getTime())) {
        const ageSeconds = Math.max(
          0,
          Math.floor((Date.now() - created.getTime()) / 1000),
        );

        if (ageSeconds < COOLDOWN_SECONDS) {
          const retryAfter = COOLDOWN_SECONDS - ageSeconds;

          return NextResponse.json(
            {
              ok: false,
              code: "advisory_cooldown",
              error: `Please wait ${retryAfter} seconds before sending another advisory.`,
              retry_after_seconds: retryAfter,
            },
            {
              status: 429,
              headers: {
                ...RESPONSE_HEADERS,
                "Retry-After": String(retryAfter),
              },
            },
          );
        }
      }
    }

    const latest = await admin
      .from("visit_locations")
      .select("lat,lng,accuracy,place,created_at")
      .eq("session_id", verified.sid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest.error) {
      logDatabaseFailure("latest location lookup", latest.error);
    }

    const senderUserId = await resolveStayKnownUserByEmail(
      admin,
      recipient.email,
    );

    const [senderIdentity, ownerIdentity] = await Promise.all([
      loadSenderIdentity(admin, senderUserId),
      loadSenderIdentity(admin, ownerUserId),
    ]);

    const senderDisplayName = senderIdentity.displayName || recipient.name;
    const visitorName = ownerIdentity.displayName || "StayKnown user";

    const locationLat =
      typeof latest.data?.lat === "number" && Number.isFinite(latest.data.lat)
        ? latest.data.lat
        : null;

    const locationLng =
      typeof latest.data?.lng === "number" && Number.isFinite(latest.data.lng)
        ? latest.data.lng
        : null;

    const locationAccuracy =
      typeof latest.data?.accuracy === "number" &&
      Number.isFinite(latest.data.accuracy)
        ? Math.max(0, latest.data.accuracy)
        : null;

    const inserted = await admin
      .from("visit_safety_advisories")
      .insert({
        visit_id: verified.sid,
        owner_user_id: ownerUserId,
        owner_name: visitorName,
        owner_verified: ownerIdentity.verified,
        owner_badge_type: ownerIdentity.badgeType || null,
        owner_badge_status: ownerIdentity.badgeStatus || null,
        owner_avatar_url: ownerIdentity.avatarUrl || null,

        sender_contact_id: recipient.id,
        sender_user_id: senderUserId || null,
        sender_name: senderDisplayName,
        sender_email: recipient.email,
        sender_verified: senderIdentity.verified,
        sender_badge_type: senderIdentity.badgeType || null,
        sender_badge_status: senderIdentity.badgeStatus || null,
        sender_avatar_url: senderIdentity.avatarUrl || null,

        consent_id: consentId,
        message_kind: kind,
        message_text: message,
        status: "active",

        location_lat: locationLat,
        location_lng: locationLng,
        location_accuracy: locationAccuracy,
        location_place: clean(latest.data?.place) || null,
        location_recorded_at: clean(latest.data?.created_at) || null,

        delivery_meta: {
          source: "signed_live_map",
          policy_version: POLICY_VERSION,
          signed_access_version: verified.version,
          notification_state: "pending",
          push_state: "pending",
          email_state: "pending",
        },
      })
      .select("*")
      .single();

    if (inserted.error) {
      if (inserted.error.code === "23505") {
        return jsonResponse(
          {
            ok: false,
            code: "advisory_already_active",
            error: "An advisory is already active.",
          },
          409,
        );
      }

      logDatabaseFailure("advisory insert", inserted.error);
      throw new Error("advisory_insert_failed");
    }

    const advisory = inserted.data as Record<string, unknown>;
    const advisoryId = clean(advisory.id);

    const auditMetadata: JsonObject = {
      message_kind: kind,
      consent_id: consentId,
      policy_version: POLICY_VERSION,
      signed_access_version: verified.version,
      client: userAgentSummary(req),
      raw_access_token_stored: false,
      raw_ip_address_stored: false,
      raw_user_agent_stored: false,
      account_credentials_stored: false,
    };

    const eventResult = await admin
      .from("visit_safety_advisory_events")
      .insert({
        advisory_id: advisoryId,
        visit_id: verified.sid,
        owner_user_id: ownerUserId,
        actor_role: "contact",
        actor_user_id: senderUserId || null,
        actor_contact_id: recipient.id,
        event_type: "advisory_sent",
        message,
        ip_hash: requestIpHash(req) || null,
        user_agent: null,
        metadata: auditMetadata,
      });

    if (eventResult.error) {
      logDatabaseFailure("advisory event insert", eventResult.error);
    }

    const notificationData: Record<string, unknown> = {
      source: "visit_live_map",
      event: "visit_safety_advisory_sent",
      audience: "visitor",
      advisory_id: advisoryId,
      visit_safety_advisory_id: advisoryId,
      session_id: verified.sid,
      visit_id: verified.sid,

      sender_contact_id: recipient.id,
      sender_user_id: senderUserId || "",
      sender_name: senderDisplayName,
      sender_email: recipient.email,
      sender_verified: senderIdentity.verified,
      sender_badge_type: senderIdentity.badgeType,
      sender_badge_status: senderIdentity.badgeStatus,
      sender_avatar_url: senderIdentity.avatarUrl,

      subject_user_id: senderUserId || "",
      subject_name: senderDisplayName,
      subject_verified: senderIdentity.verified,
      subject_badge_type: senderIdentity.badgeType,
      subject_badge_status: senderIdentity.badgeStatus,
      subject_avatar_url: senderIdentity.avatarUrl,

      advisory_message: message,
      message_kind: kind,
      place: clean(latest.data?.place),
      lat: locationLat,
      lng: locationLng,
      accuracy: locationAccuracy,
      triggered_at: clean(advisory.created_at) || new Date().toISOString(),

      visit_advisory_leaving_label: "I’m leaving now",
      visit_advisory_safe_label: "I’m safe",
      stop_critical_sound: false,
      deep_link: `stayknown://visit-advisory/${advisoryId}`,
    };

    const notificationId = await insertNotification(admin, {
      userId: ownerUserId,
      title: `Safety guidance from ${senderDisplayName}`,
      body: message,
      kind: "visit_safety_advisory",
      dedupeKey: `visit_safety_advisory:${advisoryId}`,
      data: notificationData,
    });

    if (notificationId) {
      notificationData.notification_id = notificationId;
    }

    const [pushResult, emailResult] = await Promise.all([
      sendPush({
        userId: ownerUserId,
        title: `Safety guidance from ${senderDisplayName}`,
        body: message,
        imageUrl: senderIdentity.avatarUrl,
        data: notificationData,
      }),
      sendEmail({
        to: ownerIdentity.email,
        visitorName,
        senderName: senderDisplayName,
        message,
        place: clean(latest.data?.place),
      }),
    ]);

    const deliveryMeta = {
      source: "signed_live_map",
      policy_version: POLICY_VERSION,
      signed_access_version: verified.version,
      notification_id: notificationId || null,
      notification_state: notificationId ? "recorded" : "failed",
      push_state: pushResult.ok ? "delivered" : pushResult.code,
      email_state: emailResult.ok ? "delivered" : emailResult.code,
      updated_at: new Date().toISOString(),
    };

    const deliveryUpdate = await admin
      .from("visit_safety_advisories")
      .update({
        delivery_meta: deliveryMeta,
      })
      .eq("id", advisoryId);

    if (deliveryUpdate.error) {
      logDatabaseFailure(
        "advisory delivery metadata update",
        deliveryUpdate.error,
      );
    }

    const timelineResult = await admin.from("safety_timeline_events").insert({
      user_id: ownerUserId,
      event_type: "visit_safety_advisory_received",
      title: `Safety guidance from ${senderDisplayName}`,
      body: message,
      severity: "high",
      source: "visit_live_map",
      related_kind: "visit_safety_advisory",
      related_id: advisoryId,
      recipients_count: 1,
      meta: {
        advisory_id: advisoryId,
        visit_id: verified.sid,
        sender_name: senderDisplayName,
        sender_user_id: senderUserId || null,
        message_kind: kind,
        place: clean(latest.data?.place) || null,
        notification_id: notificationId || null,
        push_state: deliveryMeta.push_state,
        email_state: deliveryMeta.email_state,
      },
    });

    if (timelineResult.error) {
      logDatabaseFailure("timeline insert", timelineResult.error);
    }

    /*
    The advisory itself is authoritative once inserted. Downstream notification,
    push, email, event, or timeline failures must not make the client retry and
    create a competing advisory. Return safe delivery health instead.
    */
    return jsonResponse({
      ok: true,
      advisory: {
        id: advisoryId,
        message_kind: kind,
        message_text: message,
        status: "active",
        created_at: clean(advisory.created_at) || new Date().toISOString(),
      },
      delivery: {
        notification_recorded: Boolean(notificationId),
        push_delivered: pushResult.ok,
        email_delivered: emailResult.ok,
      },
    });
  } catch (error) {
    console.error("[SK_LIVE_ADVISORY] request failed", {
      code: error instanceof Error ? clean(error.message) : "unknown_error",
    });

    const failure = safeFailure(error);

    return jsonResponse(
      {
        ok: false,
        code: failure.code,
        error: failure.message,
      },
      failure.status,
    );
  }
}
