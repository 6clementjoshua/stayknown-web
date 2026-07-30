// app/api/live/consent/route.ts
// StayKnown Upgrade Master File Record:
// deliberate, privacy-preserving LIVE Visit safety-use consent authority.

import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";

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
} from "../../../live/live-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const POLICY_VERSION = "visit-map-safety-use-v2-2026-07-17";

const RESPONSE_HEADERS: Record<string, string> = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

type JsonObject = Record<string, unknown>;
type ConsentDecision = "accepted" | "declined";

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

function consentDecision(value: unknown): ConsentDecision | null {
  const normalized = clean(value).toLowerCase();

  if (normalized === "accepted" || normalized === "declined") {
    return normalized;
  }

  return null;
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
        .update(`stayknown-live-client:${userAgent}`, "utf8")
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

function logDatabaseFailure(
  operation: string,
  error: {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
  },
): void {
  console.error(`[SK_LIVE_CONSENT] ${operation} failed`, {
    code: clean(error.code) || null,
    message: clean(error.message) || null,
    details: clean(error.details) || null,
    hint: clean(error.hint) || null,
  });
}

function safeFailure(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  const code = error instanceof Error ? clean(error.message) : "";

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
      message: "This recipient is not authorized to open the LIVE Visit.",
    };
  }

  if (
    code === "visit_access_failed" ||
    code === "recipient_access_failed" ||
    code === "consent_record_failed" ||
    code === "live_configuration_unavailable"
  ) {
    return {
      status: 503,
      code: "consent_temporarily_unavailable",
      message:
        "StayKnown could not safely record this decision right now. Please try again.",
    };
  }

  return {
    status: 500,
    code: "consent_failed",
    message:
      "StayKnown could not safely record this decision. Please try again.",
  };
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    if (!contentTypeIsJson(req)) {
      return jsonResponse(
        {
          ok: false,
          code: "unsupported_content_type",
          error: "Submit this LIVE Visit decision from the protected page.",
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
            "This LIVE Visit decision must be submitted from the protected StayKnown page.",
        },
        403,
      );
    }

    const body = asObject(await req.json().catch(() => ({})));
    const access = accessFromUnknown(body);
    const verified = verifyLiveAccess(access);

    if (!verified.ok) {
      /*
      Never expose whether verification failed because of expiry, signature,
      audience, configuration, or a missing signed field.
      */
      return jsonResponse(
        {
          ok: false,
          code: "invalid_live_access",
          error: "This signed LIVE Visit access is invalid or expired.",
        },
        401,
      );
    }

    const decision = consentDecision(body.decision);

    if (!decision) {
      return jsonResponse(
        {
          ok: false,
          code: "decision_required",
          error: "Choose accept or decline before continuing.",
        },
        400,
      );
    }

    const admin = createAdminClient();
    const context = await validateVisitAccess(admin, verified);
    const recipient = context.recipient;
    const ownerUserId = visitOwnerUserId(context, verified);
    const ended = visitHasEnded(context.visit);
    const interactiveActionsAllowed = canUseInteractiveLiveActions(
      verified,
      context,
    );

    const viewerUserId = recipient
      ? await resolveStayKnownUserByEmail(admin, recipient.email)
      : verified.aud === "self"
        ? ownerUserId
        : "";

    const insert = await admin
      .from("visit_map_access_consents")
      .insert({
        visit_id: verified.sid,
        owner_user_id: ownerUserId,
        recipient_contact_id: recipient?.id ?? null,
        viewer_user_id: viewerUserId || null,
        viewer_email: recipient?.email ?? null,
        viewer_name:
          recipient?.name ?? (verified.aud === "self" ? "Visit owner" : null),
        audience: verified.aud,
        decision,
        policy_version: POLICY_VERSION,
        signed_exp: verified.expNumber,
        signed_version: verified.version,
        ip_hash: requestIpHash(req) || null,

        /*
        Never persist the raw user-agent. The privacy-safe platform/browser
        summary and keyed hash are stored in metadata instead.
        */
        user_agent: null,

        metadata: {
          channel: "signed_live_visit_map",
          policy_version: POLICY_VERSION,
          lawful_safety_use_confirmed: decision === "accepted",
          no_stalking_confirmed: decision === "accepted",
          no_harassment_confirmed: decision === "accepted",
          no_false_route_claims_confirmed: decision === "accepted",
          no_luring_or_coercion_confirmed: decision === "accepted",
          legacy_read_only: context.legacyReadOnly,
          visit_ended: ended,
          interactive_actions_allowed: interactiveActionsAllowed,
          client: userAgentSummary(req),
          request_received_at: new Date().toISOString(),
          raw_access_token_stored: false,
          raw_ip_address_stored: false,
          exact_coordinates_stored: false,
          raw_user_agent_stored: false,
          account_credentials_stored: false,
        },
      })
      .select("id,created_at")
      .single();

    if (insert.error) {
      logDatabaseFailure("consent insert", insert.error);
      throw new Error("consent_record_failed");
    }

    return jsonResponse({
      ok: true,
      decision,
      consent_id: decision === "accepted" ? clean(insert.data.id) : null,
      policy_version: POLICY_VERSION,
      can_send_advisory:
        decision === "accepted" && interactiveActionsAllowed && !ended,
    });
  } catch (error) {
    console.error("[SK_LIVE_CONSENT] request failed", {
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
