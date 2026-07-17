import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  accessFromSearchParams,
  clean,
  createAdminClient,
  resolveStayKnownUserByEmail,
  validateVisitAccess,
  verifyLiveAccess,
} from "../../../live/live-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type VisitLocationRow = {
  lat?: number | null;
  lng?: number | null;
  accuracy?: number | null;
  place?: string | null;
  created_at?: string | null;
};

type VisitPayload = {
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

function locationQuality(accuracy?: number | null, createdAt?: string | null) {
  const acc =
    typeof accuracy === "number" && Number.isFinite(accuracy) ? accuracy : null;
  const created = createdAt && clean(createdAt) ? new Date(createdAt) : null;
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
    return { verified: profileVerified, badgeType: "", badgeStatus: "" };
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
    ? [{ bucket: "avatars", path: normalized.slice(8) }]
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

export async function GET(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const access = accessFromSearchParams(requestUrl.searchParams);
    const verified = verifyLiveAccess(access);

    if (!verified.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "This signed live-map access is invalid or expired.",
          reason: verified.reason,
        },
        { status: 401 },
      );
    }

    const admin = createAdminClient();
    const accessContext = await validateVisitAccess(admin, verified);
    const visit = accessContext.visit;
    const sid = verified.sid;
    const ownerUserId = clean(visit.user_id) || verified.uid;

    const latestResult = await admin
      .from("visit_locations")
      .select("lat,lng,accuracy,place,created_at")
      .eq("session_id", sid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestResult.error) {
      throw new Error(`latest_location_failed:${latestResult.error.message}`);
    }

    const latest = (latestResult.data as VisitLocationRow | null) ?? null;
    const ended = Boolean(visit.ended_at);

    let sosActive = false;
    if (!ended) {
      const sosResult = await admin
        .from("sos_sessions")
        .select("ended_at,started_at,payload")
        .eq("user_id", ownerUserId)
        .order("started_at", { ascending: false })
        .limit(20);

      if (!sosResult.error) {
        sosActive = (sosResult.data ?? []).some((row) => {
          const payload =
            row.payload && typeof row.payload === "object"
              ? (row.payload as Record<string, unknown>)
              : {};
          return clean(payload.session_id) === sid && !row.ended_at;
        });
      }
    }

    const profileResult = await admin
      .from("user_profile")
      .select("display_name,first_name,last_name,profile_photo_url")
      .eq("user_id", ownerUserId)
      .maybeSingle();

    const profileFallback = await admin
      .from("profiles")
      .select("avatar_url")
      .eq("id", ownerUserId)
      .maybeSingle();

    const profile = profileResult.data as Record<string, unknown> | null;
    const first = clean(profile?.first_name);
    const last = clean(profile?.last_name);
    const visitorName =
      clean(profile?.display_name) ||
      [first, last].filter(Boolean).join(" ") ||
      "StayKnown user";
    const verification = await loadVerification(admin, ownerUserId);
    const avatarUrl = await signedAvatar(
      admin,
      clean(profile?.profile_photo_url) ||
        clean(profileFallback.data?.avatar_url),
    );

    const payload =
      visit.payload && typeof visit.payload === "object"
        ? (visit.payload as VisitPayload)
        : {};

    const latestPoint =
      latest && typeof latest.lat === "number" && typeof latest.lng === "number"
        ? {
            ...latest,
            ...locationQuality(
              latest.accuracy ?? null,
              latest.created_at ?? null,
            ),
          }
        : ended &&
            typeof visit.end_lat === "number" &&
            typeof visit.end_lng === "number"
          ? {
              lat: visit.end_lat,
              lng: visit.end_lng,
              accuracy: null,
              place:
                latest?.place ??
                visit.destination_name ??
                visit.destination_address ??
                null,
              created_at: visit.ended_at ?? latest?.created_at ?? null,
              ...locationQuality(
                null,
                clean(visit.ended_at) || latest?.created_at || null,
              ),
            }
          : !ended &&
              typeof visit.start_lat === "number" &&
              typeof visit.start_lng === "number"
            ? {
                lat: visit.start_lat,
                lng: visit.start_lng,
                accuracy: null,
                place:
                  latest?.place ??
                  visit.destination_name ??
                  visit.destination_address ??
                  null,
                created_at: visit.started_at ?? latest?.created_at ?? null,
                ...locationQuality(
                  null,
                  clean(visit.started_at) || latest?.created_at || null,
                ),
              }
            : null;

    const recipient = accessContext.recipient;
    const viewerUserId = recipient
      ? await resolveStayKnownUserByEmail(admin, recipient.email)
      : verified.aud === "self"
        ? ownerUserId
        : "";

    let activeAdvisory: Record<string, unknown> | null = null;
    if (recipient) {
      const advisoryResult = await admin
        .from("visit_safety_advisories")
        .select(
          "id,message_kind,message_text,status,response_kind,created_at,updated_at,leaving_at,safe_at",
        )
        .eq("visit_id", sid)
        .eq("sender_contact_id", recipient.id)
        .in("status", ["active", "leaving"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!advisoryResult.error && advisoryResult.data) {
        activeAdvisory = advisoryResult.data as Record<string, unknown>;
      }
    }

    return NextResponse.json({
      ok: true,
      session_id: sid,
      latest: latestPoint,
      ended,
      sos_active: ended ? false : sosActive,
      started_at: visit.started_at ?? null,
      destination_name:
        clean(visit.destination_name) ||
        clean(payload.destination_name) ||
        null,
      destination_address:
        clean(visit.destination_address) ||
        clean(payload.destination_address) ||
        null,
      purpose: clean(payload.purpose) || null,
      person_to_meet: clean(payload.person_to_meet) || null,
      expected_duration_minutes:
        typeof payload.expected_duration_minutes === "number"
          ? payload.expected_duration_minutes
          : null,
      extra_note: clean(payload.extra_note) || null,
      visitor_name: visitorName,
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
      can_send_advisory:
        verified.aud === "contacts" &&
        Boolean(recipient) &&
        !accessContext.legacyReadOnly &&
        !ended,
      active_advisory: activeAdvisory,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Live tracking could not be loaded right now.";
    const status = message.includes("not_found")
      ? 404
      : message.includes("not_authorized")
        ? 403
        : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
