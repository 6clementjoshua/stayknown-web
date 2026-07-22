import crypto from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import CheckInClient, { type CheckInSeed } from "./check-in-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type CheckInRow = {
  id: string;
  user_id: string;
  checked_in_at: string | null;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  place: string | null;
  plan_tier: string | null;
  missed_alerts_enabled: boolean | null;
  created_at: string | null;
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("StayKnown check-in maps are not fully configured yet.");
  }

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
    },
  });
}

function safeTrim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanString(value: unknown): string | null {
  const clean = safeTrim(value);
  return clean || null;
}

function safeEqualBase64Url(expected: string, received: string): boolean {
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(received);

    if (a.length !== b.length || a.length === 0) {
      return false;
    }

    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function verifySignature(params: URLSearchParams) {
  const cid = safeTrim(params.get("cid"));
  const exp = safeTrim(params.get("exp"));
  const uid = safeTrim(params.get("uid"));
  const aud = safeTrim(params.get("aud"));
  const sig = safeTrim(params.get("sig"));

  const secret = safeTrim(process.env.TRACKING_SIGNING_SECRET);

  if (!cid) {
    return {
      ok: false,
      reason: "missing_cid" as const,
    };
  }

  if (!exp) {
    return {
      ok: false,
      reason: "missing_exp" as const,
    };
  }

  if (!uid) {
    return {
      ok: false,
      reason: "missing_uid" as const,
    };
  }

  if (!sig) {
    return {
      ok: false,
      reason: "missing_sig" as const,
    };
  }

  if (!secret) {
    return {
      ok: false,
      reason: "missing_secret" as const,
    };
  }

  const expNum = Number(exp);
  const now = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(expNum)) {
    return {
      ok: false,
      reason: "bad_exp" as const,
    };
  }

  if (expNum < now) {
    return {
      ok: false,
      reason: "expired" as const,
    };
  }

  if (aud !== "contacts" && aud !== "self") {
    return {
      ok: false,
      reason: "bad_audience" as const,
    };
  }

  const message = `cid=${cid}&exp=${expNum}` + `&uid=${uid}&aud=${aud}`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const ok = safeEqualBase64Url(expected, sig);

  console.log("[check-in-verify]", {
    ok,
    reason: ok ? "ok" : "bad_signature",
    cid_present: Boolean(cid),
    uid_present: Boolean(uid),
    aud,
    exp,
    now,
    sig_prefix: sig.slice(0, 12),
    expected_prefix: expected.slice(0, 12),
    secret_present: Boolean(secret),
  });

  return {
    ok,
    reason: ok ? "ok" : ("bad_signature" as const),
  };
}

function InvalidState({ reason }: { reason?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center px-6 max-w-md">
        <div className="mx-auto mb-5 flex items-center justify-center">
          <img
            src="/6logo.png"
            alt="StayKnown"
            className="h-10 w-10 object-contain"
          />
        </div>

        <h1 className="text-xl font-bold tracking-tight">
          Invalid or Expired Link
        </h1>

        <p className="opacity-60 mt-2 text-sm leading-6">
          This I&apos;M SAFE check-in map is no longer available. Ask the
          StayKnown member for a newer safety check-in when appropriate.
        </p>

        {reason ? (
          <p className="opacity-40 mt-3 text-[11px] uppercase tracking-[0.18em]">
            Reason: {reason}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function displayNameFromProfile(profile: Record<string, unknown> | null) {
  if (!profile) {
    return "StayKnown member";
  }

  const displayName = cleanString(profile.display_name);

  if (displayName) {
    return displayName;
  }

  const firstName = cleanString(profile.first_name);

  const lastName = cleanString(profile.last_name);

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return fullName || "StayKnown member";
}

async function loadVerification(sb: SupabaseClient, userId: string) {
  let profileVerified = false;

  try {
    const profileResult = await sb
      .from("profiles")
      .select("verified")
      .eq("id", userId)
      .maybeSingle();

    profileVerified = profileResult.data?.verified === true;
  } catch {}

  try {
    const badgeResult = await sb
      .from("user_verification_badges")
      .select("badge_type,status")
      .eq("user_id", userId)
      .eq("status", "active")
      .is("removed_at", null)
      .order("awarded_at", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    return {
      verified: profileVerified || Boolean(badgeResult.data),

      badgeType: safeTrim(badgeResult.data?.badge_type),
    };
  } catch {
    return {
      verified: profileVerified,
      badgeType: "",
    };
  }
}

async function signedAvatar(
  sb: SupabaseClient,
  rawPath: string,
): Promise<string> {
  const raw = safeTrim(rawPath);

  if (!raw) {
    return "";
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const normalized = raw.replace(/^\/+/, "");

  const candidates = normalized.startsWith("avatars/")
    ? [
        {
          bucket: "avatars",
          path: normalized.slice("avatars/".length),
        },
      ]
    : normalized.startsWith("safety-gallery/")
      ? [
          {
            bucket: "safety-gallery",
            path: normalized.slice("safety-gallery/".length),
          },
        ]
      : [
          {
            bucket: "avatars",
            path: normalized,
          },
          {
            bucket: "safety-gallery",
            path: normalized,
          },
        ];

  for (const candidate of candidates) {
    try {
      const result = await sb.storage
        .from(candidate.bucket)
        .createSignedUrl(candidate.path, 60 * 60);

      const url = safeTrim(result.data?.signedUrl);

      if (!result.error && url) {
        return url;
      }
    } catch {}
  }

  return "";
}

export default async function CheckInPage({
  searchParams,
}: {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const resolvedSearchParams = await searchParams;

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams ?? {})) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value) && typeof value[0] === "string") {
      params.set(key, value[0]);
    }
  }

  const verifiedLink = verifySignature(params);

  if (!verifiedLink.ok) {
    return <InvalidState reason={verifiedLink.reason} />;
  }

  const checkInId = safeTrim(params.get("cid"));

  const userId = safeTrim(params.get("uid"));

  const audience = safeTrim(params.get("aud")) as "contacts" | "self";

  const expiresAt = Number(params.get("exp"));

  if (!checkInId || !userId) {
    return <InvalidState reason="missing_identity_after_verify" />;
  }

  try {
    const sb = admin();

    const [checkInResult, profileResult, profileFallbackResult, verification] =
      await Promise.all([
        sb
          .from("daily_safety_checkins")
          .select(
            "id,user_id,checked_in_at,lat,lng,accuracy,place,plan_tier,missed_alerts_enabled,created_at",
          )
          .eq("id", checkInId)
          .eq("user_id", userId)
          .maybeSingle(),

        sb
          .from("user_profile")
          .select(
            [
              "display_name",
              "first_name",
              "last_name",
              "profile_photo_url",
            ].join(","),
          )
          .eq("user_id", userId)
          .maybeSingle(),

        sb.from("profiles").select("avatar_url").eq("id", userId).maybeSingle(),

        loadVerification(sb, userId),
      ]);

    if (checkInResult.error || !checkInResult.data) {
      return <InvalidState reason="checkin_not_found" />;
    }

    const row = checkInResult.data as unknown as CheckInRow;

    const profile =
      (profileResult.data as Record<string, unknown> | null) ?? null;

    const fallbackProfile =
      (profileFallbackResult.data as Record<string, unknown> | null) ?? null;

    const lat =
      typeof row.lat === "number" && Number.isFinite(row.lat) ? row.lat : null;

    const lng =
      typeof row.lng === "number" && Number.isFinite(row.lng) ? row.lng : null;

    const accuracy =
      typeof row.accuracy === "number" && Number.isFinite(row.accuracy)
        ? row.accuracy
        : null;

    if (lat == null || lng == null) {
      return <InvalidState reason="location_not_attached" />;
    }

    const storedAvatarPath =
      safeTrim(profile?.profile_photo_url) ||
      safeTrim(fallbackProfile?.avatar_url);

    /*
     * Same avatar resolution pattern used
     * by the working live Visit map:
     *
     * user_profile.profile_photo_url
     * → profiles.avatar_url
     * → conventional avatars/{uid}/avatar path
     * → StayKnown logo only if all fail.
     */
    const visitorAvatarUrl = await signedAvatar(
      sb,
      storedAvatarPath || `${userId}/avatar`,
    );

    const seed: CheckInSeed = {
      checkInId,
      userId,
      audience,
      expiresAt,

      visitorName: displayNameFromProfile(profile),

      visitorAvatarUrl: visitorAvatarUrl || null,

      verified: verification.verified,

      badgeType: verification.badgeType,

      checkedInAt: safeTrim(row.checked_in_at) || safeTrim(row.created_at),

      lat,
      lng,
      accuracy,

      place: safeTrim(row.place) || "Current GPS point confirmed",

      planTier: safeTrim(row.plan_tier) || "starter",

      missedAlertsEnabled: row.missed_alerts_enabled === true,
    };

    return <CheckInClient seed={seed} />;
  } catch (error) {
    console.error("[check-in-page]", error);

    return <InvalidState reason="checkin_load_failed" />;
  }
}
