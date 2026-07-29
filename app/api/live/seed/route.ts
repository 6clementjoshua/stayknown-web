// app/api/live/seed/route.ts
// StayKnown Upgrade Master File Record:
// sanitized bootstrap snapshot for recipient-bound LIVE Visit access.

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AdvisorySnapshot,
  LivePoint,
  LiveSeedResponse,
} from "../../../live/live-types";
import {
  accessFromSearchParams,
  canUseInteractiveLiveActions,
  clean,
  createAdminClient,
  resolveStayKnownUserByEmail,
  validateVisitAccess,
  verifyLiveAccess,
  visitHasEnded,
  visitOwnerUserId,
} from "../../../live/live-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const NEARBY_APPROVED_CONTACT_RADIUS_METERS = 5000;

const RESPONSE_HEADERS: Record<string, string> = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

type VisitLocationRow = {
  lat?: number | null;
  lng?: number | null;
  accuracy?: number | null;
  place?: string | null;
  created_at?: string | null;
};

type VisitPayload = {
  destination_name?: string | null;
  destination_address?: string | null;
  purpose?: string | null;
  person_to_meet?: string | null;
  expected_duration_minutes?: number | null;
  extra_note?: string | null;
  [key: string]: unknown;
};

type VerificationInfo = {
  verified: boolean;
  badgeType: string;
  badgeStatus: string;
};

type LocationQualitySnapshot = {
  location_quality: "exact" | "approximate" | "coarse" | "unknown";
  location_is_exact: boolean;
  location_is_approximate: boolean;
  location_age_seconds: number | null;
  location_label: string;
};

function jsonResponse(
  body: LiveSeedResponse | Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: RESPONSE_HEADERS,
  });
}

function locationQuality(
  accuracy?: number | null,
  createdAt?: string | null,
): LocationQualitySnapshot {
  const acc =
    typeof accuracy === "number" && Number.isFinite(accuracy)
      ? Math.max(0, accuracy)
      : null;

  const createdValue = clean(createdAt);
  const created = createdValue ? new Date(createdValue) : null;

  const ageSeconds =
    created && !Number.isNaN(created.getTime())
      ? Math.max(0, Math.floor((Date.now() - created.getTime()) / 1000))
      : null;

  if (acc == null) {
    return {
      location_quality: "unknown",
      location_is_exact: false,
      location_is_approximate: true,
      location_age_seconds: ageSeconds,
      location_label: "Accuracy unknown",
    };
  }

  if (acc <= 80 && (ageSeconds == null || ageSeconds <= 180)) {
    return {
      location_quality: "exact",
      location_is_exact: true,
      location_is_approximate: false,
      location_age_seconds: ageSeconds,
      location_label: `Exact GPS • ± ${acc.toFixed(1)} m`,
    };
  }

  if (acc <= 250 && (ageSeconds == null || ageSeconds <= 600)) {
    return {
      location_quality: "approximate",
      location_is_exact: false,
      location_is_approximate: true,
      location_age_seconds: ageSeconds,
      location_label: `Approximate area • ± ${acc.toFixed(1)} m`,
    };
  }

  return {
    location_quality: "coarse",
    location_is_exact: false,
    location_is_approximate: true,
    location_age_seconds: ageSeconds,
    location_label: `Last known approximate area • ± ${acc.toFixed(0)} m`,
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
  console.error(`[SK_LIVE_SEED] ${operation} failed`, {
    code: clean(error.code) || null,
    message: clean(error.message) || null,
    details: clean(error.details) || null,
    hint: clean(error.hint) || null,
  });
}

async function loadVerification(
  admin: SupabaseClient,
  userId: string,
): Promise<VerificationInfo> {
  let profileVerified = false;

  try {
    const profile = await admin
      .from("profiles")
      .select("verified")
      .eq("id", userId)
      .maybeSingle();

    if (profile.error) {
      logDatabaseFailure("profile verification lookup", profile.error);
    } else {
      profileVerified = profile.data?.verified === true;
    }
  } catch (error) {
    console.error("[SK_LIVE_SEED] profile verification lookup threw", {
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

      return {
        verified: profileVerified,
        badgeType: "",
        badgeStatus: "",
      };
    }

    return {
      verified: profileVerified || Boolean(badge.data),
      badgeType: clean(badge.data?.badge_type),
      badgeStatus: clean(badge.data?.status),
    };
  } catch (error) {
    console.error("[SK_LIVE_SEED] verification badge lookup threw", {
      message: error instanceof Error ? error.message : "unknown_error",
    });

    return {
      verified: profileVerified,
      badgeType: "",
      badgeStatus: "",
    };
  }
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

    /*
    Existing absolute Supabase avatar URLs remain supported. Arbitrary external
    profile URLs are not sent to the recipient's browser because doing so could
    disclose the viewer's network address to an unrelated host.
    */
    const allowedOrigin = configuredStorageOrigin();

    if (allowedOrigin && url.origin !== allowedOrigin) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
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
      const result = await admin.storage
        .from(candidate.bucket)
        .createSignedUrl(candidate.path, 60 * 30);

      const url = clean(result.data?.signedUrl);

      if (!result.error && url) {
        return safeAbsoluteAvatarUrl(url);
      }

      if (result.error) {
        logDatabaseFailure(
          `avatar signing (${candidate.bucket})`,
          result.error,
        );
      }
    } catch (error) {
      console.error("[SK_LIVE_SEED] avatar signing threw", {
        bucket: candidate.bucket,
        message: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }

  return "";
}

function readPayload(visit: Record<string, unknown>): VisitPayload {
  const raw = visit.payload;

  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as VisitPayload)
    : {};
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildLatestPoint(params: {
  latest: VisitLocationRow | null;
  visit: Record<string, unknown>;
  ended: boolean;
}): LivePoint | null {
  const { latest, visit, ended } = params;

  const latestLat = finiteNumber(latest?.lat);
  const latestLng = finiteNumber(latest?.lng);

  if (latestLat != null && latestLng != null) {
    const accuracy = finiteNumber(latest?.accuracy);
    const createdAt = clean(latest?.created_at) || null;

    return {
      lat: latestLat,
      lng: latestLng,
      accuracy,
      place: clean(latest?.place) || null,
      created_at: createdAt,
      ...locationQuality(accuracy, createdAt),
    };
  }

  const fallbackLat = finiteNumber(ended ? visit.end_lat : visit.start_lat);
  const fallbackLng = finiteNumber(ended ? visit.end_lng : visit.start_lng);

  if (fallbackLat == null || fallbackLng == null) {
    return null;
  }

  const createdAt =
    clean(ended ? visit.ended_at : visit.started_at) ||
    clean(latest?.created_at) ||
    null;

  return {
    lat: fallbackLat,
    lng: fallbackLng,
    accuracy: null,
    place:
      clean(latest?.place) ||
      clean(visit.destination_name) ||
      clean(visit.destination_address) ||
      null,
    created_at: createdAt,
    ...locationQuality(null, createdAt),
  };
}

async function loadSosActive(
  admin: SupabaseClient,
  ownerUserId: string,
  sessionId: string,
  ended: boolean,
): Promise<boolean> {
  if (ended || !ownerUserId) return false;

  const result = await admin
    .from("sos_sessions")
    .select("ended_at,started_at,payload")
    .eq("user_id", ownerUserId)
    .order("started_at", { ascending: false })
    .limit(20);

  if (result.error) {
    logDatabaseFailure("SOS state lookup", result.error);
    return false;
  }

  return (result.data ?? []).some((row) => {
    const payload =
      row.payload &&
      typeof row.payload === "object" &&
      !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {};

    return clean(payload.session_id) === sessionId && !row.ended_at;
  });
}

async function loadActiveAdvisory(
  admin: SupabaseClient,
  visitId: string,
  recipientId: string,
): Promise<AdvisorySnapshot | null> {
  if (!recipientId) return null;

  const result = await admin
    .from("visit_safety_advisories")
    .select(
      "id,message_kind,message_text,status,response_kind,created_at,updated_at,leaving_at,safe_at",
    )
    .eq("visit_id", visitId)
    .eq("sender_contact_id", recipientId)
    .in("status", ["active", "leaving"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (result.error) {
    logDatabaseFailure("active advisory lookup", result.error);
    return null;
  }

  const row = result.data as Record<string, unknown> | null;
  const advisoryId = clean(row?.id);

  if (!row || !advisoryId) return null;

  return {
    id: advisoryId,
    message_kind: clean(row.message_kind) || undefined,
    message_text: clean(row.message_text) || undefined,
    status: clean(row.status) || undefined,
    response_kind: clean(row.response_kind) || null,
    created_at: clean(row.created_at) || undefined,
    updated_at: clean(row.updated_at) || undefined,
    leaving_at: clean(row.leaving_at) || null,
    safe_at: clean(row.safe_at) || null,
  };
}

function safeFailure(error: unknown): {
  status: number;
  error: string;
  code: string;
} {
  const code = error instanceof Error ? clean(error.message) : "";

  if (code === "visit_not_found") {
    return {
      status: 404,
      error: "This LIVE Visit is no longer available.",
      code: "visit_not_found",
    };
  }

  if (
    code === "recipient_not_authorized" ||
    code === "recipient_email_missing"
  ) {
    return {
      status: 403,
      error: "This recipient is not authorized to open the LIVE Visit.",
      code: "recipient_not_authorized",
    };
  }

  if (
    code === "visit_access_failed" ||
    code === "recipient_access_failed" ||
    code === "latest_location_failed"
  ) {
    return {
      status: 503,
      error: "StayKnown could not verify the LIVE Visit right now.",
      code: "live_temporarily_unavailable",
    };
  }

  if (code === "live_configuration_unavailable") {
    return {
      status: 503,
      error: "The secure LIVE Visit service is temporarily unavailable.",
      code: "live_configuration_unavailable",
    };
  }

  return {
    status: 500,
    error: "StayKnown could not load this LIVE Visit right now.",
    code: "live_seed_failed",
  };
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const requestUrl = new URL(req.url);
    const access = accessFromSearchParams(requestUrl.searchParams);
    const verified = verifyLiveAccess(access);

    if (!verified.ok) {
      /*
      Do not expose whether verification failed because of signature, audience,
      configuration, expiry, or a missing signed field.
      */
      return jsonResponse(
        {
          ok: false,
          error: "This signed LIVE Visit access is invalid or expired.",
          code: "invalid_live_access",
        },
        401,
      );
    }

    const admin = createAdminClient();
    const accessContext = await validateVisitAccess(admin, verified);
    const visit = accessContext.visit;
    const sid = verified.sid;
    const ownerUserId = visitOwnerUserId(accessContext, verified);
    const ended = visitHasEnded(visit);
    const interactiveActionsAllowed = canUseInteractiveLiveActions(
      verified,
      accessContext,
    );

    const latestResult = await admin
      .from("visit_locations")
      .select("lat,lng,accuracy,place,created_at")
      .eq("session_id", sid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestResult.error) {
      logDatabaseFailure("latest location lookup", latestResult.error);
      throw new Error("latest_location_failed");
    }

    const latest =
      (latestResult.data as VisitLocationRow | null | undefined) ?? null;

    const [sosActive, profileResult, profileFallback, verification] =
      await Promise.all([
        loadSosActive(admin, ownerUserId, sid, ended),
        admin
          .from("user_profile")
          .select("display_name,first_name,last_name,profile_photo_url")
          .eq("user_id", ownerUserId)
          .maybeSingle(),
        admin
          .from("profiles")
          .select("first_name,last_name,avatar_url")
          .eq("id", ownerUserId)
          .maybeSingle(),
        loadVerification(admin, ownerUserId),
      ]);

    if (profileResult.error) {
      logDatabaseFailure("user profile lookup", profileResult.error);
    }

    if (profileFallback.error) {
      logDatabaseFailure("profile fallback lookup", profileFallback.error);
    }

    const profile = profileResult.data as Record<string, unknown> | null;
    const fallbackProfile = profileFallback.data as Record<
      string,
      unknown
    > | null;

    const first =
      clean(profile?.first_name) || clean(fallbackProfile?.first_name);
    const last = clean(profile?.last_name) || clean(fallbackProfile?.last_name);

    const visitorName =
      [first, last].filter(Boolean).join(" ") ||
      clean(profile?.display_name) ||
      "StayKnown user";

    const avatarUrl = await signedAvatar(
      admin,
      clean(profile?.profile_photo_url) || clean(fallbackProfile?.avatar_url),
    );

    const payload = readPayload(visit);
    const latestPoint = buildLatestPoint({ latest, visit, ended });
    const recipient = accessContext.recipient;

    const viewerUserId = recipient
      ? await resolveStayKnownUserByEmail(admin, recipient.email)
      : verified.aud === "self"
        ? ownerUserId
        : "";

    const unboundLegacyContactLink =
      verified.version === "v1" && verified.aud === "contacts" && !recipient;

    /*
    Legacy unbound contact links remain usable as read-only map links, but they
    no longer receive private planning notes, the person being met, or a full
    destination address. Recipient-bound v2 links and signed self links retain
    the appropriate Visit details.
    */
    const exposeExtendedVisitDetails = !unboundLegacyContactLink;

    const activeAdvisory = recipient
      ? await loadActiveAdvisory(admin, sid, recipient.id)
      : null;

    const nearbyPresenceEnabled = interactiveActionsAllowed && !ended;

    const response: LiveSeedResponse = {
      ok: true,
      session_id: sid,
      latest: latestPoint,
      ended,
      sos_active: ended ? false : sosActive,
      started_at: clean(visit.started_at) || null,

      destination_name:
        clean(visit.destination_name) ||
        clean(payload.destination_name) ||
        null,
      destination_address: exposeExtendedVisitDetails
        ? clean(visit.destination_address) ||
          clean(payload.destination_address) ||
          null
        : null,
      purpose: exposeExtendedVisitDetails
        ? clean(payload.purpose) || null
        : null,
      person_to_meet: exposeExtendedVisitDetails
        ? clean(payload.person_to_meet) || null
        : null,
      expected_duration_minutes:
        exposeExtendedVisitDetails &&
        typeof payload.expected_duration_minutes === "number" &&
        Number.isFinite(payload.expected_duration_minutes)
          ? Math.max(0, Math.round(payload.expected_duration_minutes))
          : null,
      extra_note: exposeExtendedVisitDetails
        ? clean(payload.extra_note) || null
        : null,

      location_quality: latestPoint?.location_quality ?? "unknown",
      location_is_exact: latestPoint?.location_is_exact ?? false,
      location_is_approximate: latestPoint?.location_is_approximate ?? true,
      location_age_seconds: latestPoint?.location_age_seconds ?? null,
      location_label: clean(latestPoint?.location_label) || "Accuracy unknown",

      visitor_name: visitorName,
      visitor_first_name: first || null,
      visitor_last_name: last || null,
      visitor_avatar_url: avatarUrl || null,
      visitor_verified: verification.verified,
      visitor_badge_type: verification.badgeType || null,
      visitor_badge_status: verification.badgeStatus || null,

      viewer_name: recipient?.name ?? "",
      viewer_user_id: viewerUserId || null,
      viewer_is_stayknown: Boolean(viewerUserId),
      recipient_contact_id: recipient?.id ?? null,

      signed_access_version: verified.version,
      legacy_read_only: accessContext.legacyReadOnly,
      can_send_advisory: interactiveActionsAllowed,
      active_advisory: activeAdvisory,

      nearby_presence_enabled: nearbyPresenceEnabled,
      nearby_presence_radius_meters: nearbyPresenceEnabled
        ? NEARBY_APPROVED_CONTACT_RADIUS_METERS
        : null,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error("[SK_LIVE_SEED] request failed", {
      code: error instanceof Error ? clean(error.message) : "unknown_error",
    });

    const failure = safeFailure(error);

    return jsonResponse(
      {
        ok: false,
        error: failure.error,
        code: failure.code,
      },
      failure.status,
    );
  }
}
