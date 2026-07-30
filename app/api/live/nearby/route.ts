// app/api/live/nearby/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  LiveLocationQuality,
  LivePresenceState,
  NearbyApprovedContactPresence,
  NearbyApprovedContactsResponse,
} from "../../../live/live-types";

import {
  accessFromSearchParams,
  accessFromUnknown,
  clean,
  createAdminClient,
  requestIpHash,
  resolveStayKnownUserByEmail,
  validateVisitAccess,
  verifyLiveAccess,
  type SignedLiveAccess,
  type VerifiedLiveAccess,
  type VisitAccessContext,
} from "../../../live/live-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_RADIUS_METERS = 5000;
const MIN_RADIUS_METERS = 100;
const MAX_RADIUS_METERS = 10000;
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 50;
const NEXT_REFRESH_AFTER_SECONDS = 25;

type NearbyRpcRow = {
  nearby_user_id?: string | null;
  visit_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  avatar_path?: string | null;
  lat?: number | null;
  lng?: number | null;
  accuracy?: number | null;
  place?: string | null;
  presence_state?: string | null;
  is_sos?: boolean | null;
  distance_meters?: number | null;
  last_location_at?: string | null;
};

type SubjectPoint = {
  lat: number;
  lng: number;
  accuracy: number | null;
  place: string;
  createdAt: string;
};

type SubjectIdentity = {
  firstName: string;
  lastName: string;
  fullName: string;
};

type VerificationInfo = {
  verified: boolean;
  badgeType: string;
  badgeStatus: string;
};

type AuthorizedNearbyRequest = {
  admin: SupabaseClient;
  verified: VerifiedLiveAccess;
  accessContext: VisitAccessContext;
  subjectUserId: string;
  subjectIdentity: SubjectIdentity;
  subjectPoint: SubjectPoint;
  viewerUserId: string;
  radiusMeters: number;
  limit: number;
  rows: NearbyRpcRow[];
};

function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function finiteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampInteger(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.round(parsed)));
}

function validLatitude(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

function validLongitude(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

function normalizePresenceState(value: unknown): LivePresenceState | null {
  const state = clean(value).toLowerCase();
  if (state === "live" || state === "recent" || state === "paused") {
    return state;
  }
  return null;
}

type LocationQualitySnapshot = {
  location_quality: LiveLocationQuality;
  location_is_exact: boolean;
  location_is_approximate: boolean;
};

function locationQuality(accuracy: number | null): LocationQualitySnapshot {
  if (accuracy == null || !Number.isFinite(accuracy) || accuracy <= 0) {
    return {
      location_quality: "unknown",
      location_is_exact: false,
      location_is_approximate: true,
    };
  }

  if (accuracy <= 80) {
    return {
      location_quality: "exact",
      location_is_exact: true,
      location_is_approximate: false,
    };
  }

  if (accuracy <= 250) {
    return {
      location_quality: "approximate",
      location_is_exact: false,
      location_is_approximate: true,
    };
  }

  return {
    location_quality: "coarse",
    location_is_exact: false,
    location_is_approximate: true,
  };
}

function ageSeconds(value: unknown): number | null {
  const raw = clean(value);
  if (!raw) return null;

  const timestamp = new Date(raw).getTime();
  if (!Number.isFinite(timestamp)) return null;

  return Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
}

function fullName(firstName: string, lastName: string): string {
  return [clean(firstName), clean(lastName)].filter(Boolean).join(" ").trim();
}

function possessiveApprovedContactLabel(firstName: string): string {
  const subject = clean(firstName) || "Visit owner";
  return subject.toLowerCase().endsWith("s")
    ? `${subject}’ approved contact`
    : `${subject}’s approved contact`;
}

function markerSecret(): string {
  return clean(
    process.env.LIVE_AUDIT_HASH_SECRET ??
      process.env.INTERNAL_EVENT_SECRET ??
      process.env.TRACKING_SIGNING_SECRET,
  );
}

function markerId(sessionId: string, nearbyUserId: string): string {
  const secret = markerSecret();
  if (!secret) {
    throw new Error("nearby_marker_secret_missing");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`nearby-marker:${sessionId}:${nearbyUserId}`)
    .digest("hex")
    .slice(0, 40);
}

async function loadSubjectIdentity(
  admin: SupabaseClient,
  userId: string,
): Promise<SubjectIdentity> {
  const userProfile = await admin
    .from("user_profile")
    .select("display_name,first_name,last_name")
    .eq("user_id", userId)
    .maybeSingle();

  const profile = await admin
    .from("profiles")
    .select("first_name,last_name")
    .eq("id", userId)
    .maybeSingle();

  const firstName =
    clean(userProfile.data?.first_name) || clean(profile.data?.first_name);
  const lastName =
    clean(userProfile.data?.last_name) || clean(profile.data?.last_name);

  const resolvedFullName =
    fullName(firstName, lastName) ||
    clean(userProfile.data?.display_name) ||
    "StayKnown user";

  return {
    firstName: firstName || resolvedFullName.split(/\s+/)[0] || "StayKnown",
    lastName,
    fullName: resolvedFullName,
  };
}

async function loadSubjectPoint(
  admin: SupabaseClient,
  sessionId: string,
  subjectUserId: string,
  visit: Record<string, unknown>,
): Promise<SubjectPoint | null> {
  const latest = await admin
    .from("visit_locations")
    .select("lat,lng,accuracy,place,created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestLat = finiteNumber(latest.data?.lat);
  const latestLng = finiteNumber(latest.data?.lng);

  if (
    latestLat != null &&
    latestLng != null &&
    validLatitude(latestLat) &&
    validLongitude(latestLng)
  ) {
    return {
      lat: latestLat,
      lng: latestLng,
      accuracy: finiteNumber(latest.data?.accuracy),
      place: clean(latest.data?.place),
      createdAt: clean(latest.data?.created_at),
    };
  }

  const presence = await admin
    .from("live_safety_presence")
    .select("lat,lng,accuracy,place,last_location_at,expires_at")
    .eq("user_id", subjectUserId)
    .eq("visit_id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  const presenceLat = finiteNumber(presence.data?.lat);
  const presenceLng = finiteNumber(presence.data?.lng);

  if (
    presenceLat != null &&
    presenceLng != null &&
    validLatitude(presenceLat) &&
    validLongitude(presenceLng)
  ) {
    return {
      lat: presenceLat,
      lng: presenceLng,
      accuracy: finiteNumber(presence.data?.accuracy),
      place: clean(presence.data?.place),
      createdAt: clean(presence.data?.last_location_at),
    };
  }

  const startLat = finiteNumber(visit.start_lat);
  const startLng = finiteNumber(visit.start_lng);

  if (
    startLat != null &&
    startLng != null &&
    validLatitude(startLat) &&
    validLongitude(startLng)
  ) {
    return {
      lat: startLat,
      lng: startLng,
      accuracy: null,
      place: clean(visit.destination_name) || clean(visit.destination_address),
      createdAt: clean(visit.started_at),
    };
  }

  return null;
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

    profileVerified = profile.data?.verified === true;
  } catch {}

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

    return {
      verified: profileVerified || Boolean(badge.data),
      badgeType: clean(badge.data?.badge_type),
      badgeStatus: clean(badge.data?.status),
    };
  } catch {
    return {
      verified: profileVerified,
      badgeType: "",
      badgeStatus: "",
    };
  }
}

async function signedAvatar(
  admin: SupabaseClient,
  rawPath: string,
): Promise<string> {
  const raw = clean(rawPath);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

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
    try {
      const result = await admin.storage
        .from(candidate.bucket)
        .createSignedUrl(candidate.path, 60 * 60);

      const url = clean(result.data?.signedUrl);
      if (!result.error && url) return url;
    } catch {}
  }

  return "";
}

async function recordAccess(
  admin: SupabaseClient,
  params: {
    visitId: string;
    subjectUserId: string;
    viewerContactId: string;
    viewerUserId: string;
    nearbyUserId?: string;
    eventType: "nearby_refreshed" | "marker_opened";
    distanceMeters?: number | null;
    meta?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await admin.rpc("sk_record_live_safety_presence_access", {
      p_visit_id: params.visitId,
      p_subject_user_id: params.subjectUserId,
      p_viewer_contact_id: params.viewerContactId,
      p_viewer_user_id: params.viewerUserId || null,
      p_nearby_user_id: params.nearbyUserId || null,
      p_event_type: params.eventType,
      p_distance_meters: params.distanceMeters ?? null,
      p_meta: params.meta ?? {},
    });
  } catch {
    // Access auditing is best effort and must not prevent a valid safety map.
  }
}

async function authorizeAndLoad(
  access: SignedLiveAccess,
  radiusValue: unknown,
  limitValue: unknown,
): Promise<AuthorizedNearbyRequest> {
  const verified = verifyLiveAccess(access);

  if (!verified.ok) {
    throw new Error(`access_invalid:${verified.reason}`);
  }

  // Nearby identity is available only through a recipient-bound v2 contact
  // link. Legacy and self links keep their existing primary Visit map only.
  if (
    verified.version !== "v2" ||
    verified.aud !== "contacts" ||
    !verified.rid
  ) {
    throw new Error("nearby_recipient_access_required");
  }

  const admin = createAdminClient();
  const accessContext = await validateVisitAccess(admin, verified);

  if (
    accessContext.legacyReadOnly ||
    !accessContext.recipient ||
    clean(accessContext.recipient.id) !== verified.rid
  ) {
    throw new Error("nearby_recipient_not_authorized");
  }

  const visit = accessContext.visit;
  const subjectUserId = clean(visit.user_id) || verified.uid;

  if (!subjectUserId || subjectUserId !== verified.uid) {
    throw new Error("nearby_subject_mismatch");
  }

  if (visit.ended_at) {
    throw new Error("nearby_visit_ended");
  }

  const subjectPoint = await loadSubjectPoint(
    admin,
    verified.sid,
    subjectUserId,
    visit,
  );

  if (!subjectPoint) {
    throw new Error("nearby_subject_location_unavailable");
  }

  const radiusMeters = clampInteger(
    radiusValue,
    DEFAULT_RADIUS_METERS,
    MIN_RADIUS_METERS,
    MAX_RADIUS_METERS,
  );

  const limit = clampInteger(limitValue, DEFAULT_LIMIT, 1, MAX_LIMIT);

  const nearbyResult = await admin.rpc("sk_find_nearby_approved_contacts", {
    p_subject_user_id: subjectUserId,
    p_subject_lat: subjectPoint.lat,
    p_subject_lng: subjectPoint.lng,
    p_radius_meters: radiusMeters,
    p_limit: limit,
  });

  if (nearbyResult.error) {
    throw new Error(`nearby_query_failed:${nearbyResult.error.message}`);
  }

  const rows = Array.isArray(nearbyResult.data)
    ? (nearbyResult.data as NearbyRpcRow[])
    : [];

  const subjectIdentity = await loadSubjectIdentity(admin, subjectUserId);
  const viewerUserId = await resolveStayKnownUserByEmail(
    admin,
    accessContext.recipient.email,
  );

  return {
    admin,
    verified,
    accessContext,
    subjectUserId,
    subjectIdentity,
    subjectPoint,
    viewerUserId,
    radiusMeters,
    limit,
    rows,
  };
}

async function prepareContact(
  context: AuthorizedNearbyRequest,
  row: NearbyRpcRow,
): Promise<NearbyApprovedContactPresence | null> {
  const nearbyUserId = clean(row.nearby_user_id);
  const firstName = clean(row.first_name);
  const lastName = clean(row.last_name);
  const resolvedFullName = fullName(firstName, lastName);
  const lat = finiteNumber(row.lat);
  const lng = finiteNumber(row.lng);
  const distanceMeters = finiteNumber(row.distance_meters);
  const presenceState = normalizePresenceState(row.presence_state);

  if (
    !nearbyUserId ||
    !firstName ||
    !lastName ||
    !resolvedFullName ||
    lat == null ||
    lng == null ||
    !validLatitude(lat) ||
    !validLongitude(lng) ||
    distanceMeters == null ||
    distanceMeters < 0 ||
    !presenceState
  ) {
    return null;
  }

  const [avatarUrl, verification] = await Promise.all([
    signedAvatar(context.admin, clean(row.avatar_path)),
    loadVerification(context.admin, nearbyUserId),
  ]);

  const accuracy = finiteNumber(row.accuracy);
  const quality = locationQuality(accuracy);

  return {
    marker_id: markerId(context.verified.sid, nearbyUserId),
    first_name: firstName,
    last_name: lastName,
    full_name: resolvedFullName,
    relationship_label: possessiveApprovedContactLabel(
      context.subjectIdentity.firstName,
    ),
    avatar_url: avatarUrl || null,
    verified: verification.verified,
    badge_type: verification.badgeType || null,
    badge_status: verification.badgeStatus || null,
    lat,
    lng,
    accuracy,
    place: clean(row.place) || null,
    distance_meters: Math.round(distanceMeters),
    presence_state: presenceState,
    is_sos: row.is_sos === true,
    ...quality,
    location_age_seconds: ageSeconds(row.last_location_at),
  };
}

function errorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "nearby_presence_failed";

  if (message.startsWith("access_invalid:")) {
    return noStoreJson(
      {
        ok: false,
        error: "This signed live-map access is invalid or expired.",
        reason: message.slice("access_invalid:".length),
      },
      401,
    );
  }

  if (
    message === "nearby_recipient_access_required" ||
    message === "nearby_recipient_not_authorized" ||
    message === "nearby_subject_mismatch" ||
    message.includes("recipient_not_authorized")
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "Nearby approved contacts are available only through the exact recipient-bound Visit link.",
      },
      403,
    );
  }

  if (message === "nearby_visit_ended") {
    return noStoreJson(
      {
        ok: false,
        error: "This Visit has ended.",
        reason: "visit_ended",
      },
      410,
    );
  }

  if (message === "nearby_subject_location_unavailable") {
    return noStoreJson({
      ok: true,
      contacts: [],
      reason: "subject_location_unavailable",
    });
  }

  console.error("[SK_LIVE_NEARBY]", message);

  return noStoreJson(
    {
      ok: false,
      error: "Nearby approved contacts could not be loaded right now.",
    },
    500,
  );
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const access = accessFromSearchParams(url.searchParams);

    const context = await authorizeAndLoad(
      access,
      url.searchParams.get("radius"),
      url.searchParams.get("limit"),
    );

    const prepared = await Promise.all(
      context.rows.map((row) => prepareContact(context, row)),
    );

    const contacts = prepared.filter(
      (item): item is NearbyApprovedContactPresence => item != null,
    );

    const recipient = context.accessContext.recipient!;

    await recordAccess(context.admin, {
      visitId: context.verified.sid,
      subjectUserId: context.subjectUserId,
      viewerContactId: recipient.id,
      viewerUserId: context.viewerUserId,
      eventType: "nearby_refreshed",
      meta: {
        ip_hash: requestIpHash(req),
        signed_access_version: context.verified.version,
        radius_meters: context.radiusMeters,
        returned_contacts: contacts.length,
      },
    });

    const response: NearbyApprovedContactsResponse = {
      ok: true,
      session_id: context.verified.sid,
      subject_first_name: context.subjectIdentity.firstName,
      subject_last_name: context.subjectIdentity.lastName || null,
      subject_full_name: context.subjectIdentity.fullName,
      radius_meters: context.radiusMeters,
      contacts,
      generated_at: new Date().toISOString(),
      next_refresh_after_seconds: NEXT_REFRESH_AFTER_SECONDS,
    };

    return noStoreJson(response);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = clean(
      body && typeof body === "object"
        ? (body as Record<string, unknown>).action
        : "",
    ).toLowerCase();

    if (action !== "marker_opened") {
      return noStoreJson(
        {
          ok: false,
          error: "Unsupported nearby-presence action.",
        },
        400,
      );
    }

    const markerIdValue = clean(
      body && typeof body === "object"
        ? (body as Record<string, unknown>).marker_id
        : "",
    );

    if (!markerIdValue) {
      return noStoreJson(
        {
          ok: false,
          error: "marker_id is required.",
        },
        400,
      );
    }

    const access = accessFromUnknown(body);
    const context = await authorizeAndLoad(access, null, null);

    const matched = context.rows.find((row) => {
      const nearbyUserId = clean(row.nearby_user_id);
      return (
        nearbyUserId &&
        markerId(context.verified.sid, nearbyUserId) === markerIdValue
      );
    });

    if (!matched) {
      return noStoreJson(
        {
          ok: false,
          error: "This nearby contact marker is no longer available.",
        },
        404,
      );
    }

    const recipient = context.accessContext.recipient!;
    const distanceMeters = finiteNumber(matched.distance_meters);

    await recordAccess(context.admin, {
      visitId: context.verified.sid,
      subjectUserId: context.subjectUserId,
      viewerContactId: recipient.id,
      viewerUserId: context.viewerUserId,
      nearbyUserId: clean(matched.nearby_user_id),
      eventType: "marker_opened",
      distanceMeters:
        distanceMeters == null ? null : Math.round(distanceMeters),
      meta: {
        ip_hash: requestIpHash(req),
        signed_access_version: context.verified.version,
        marker_id: markerIdValue,
      },
    });

    return noStoreJson({
      ok: true,
      marker_id: markerIdValue,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
