import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import CheckInClient, { type CheckInSeed } from "./check-in-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

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
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      expectedBuffer.length === 0
    ) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
}

function verifySignature(params: URLSearchParams) {
  const checkInId = safeTrim(params.get("cid"));
  const exp = safeTrim(params.get("exp"));
  const userId = safeTrim(params.get("uid"));
  const audience = safeTrim(params.get("aud"));
  const signature = safeTrim(params.get("sig"));

  const secret = safeTrim(process.env.TRACKING_SIGNING_SECRET);

  if (!checkInId) {
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

  if (!userId) {
    return {
      ok: false,
      reason: "missing_uid" as const,
    };
  }

  if (!signature) {
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

  const expirationNumber = Number(exp);
  const now = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(expirationNumber)) {
    return {
      ok: false,
      reason: "bad_exp" as const,
    };
  }

  if (expirationNumber < now) {
    return {
      ok: false,
      reason: "expired" as const,
    };
  }

  if (audience !== "contacts" && audience !== "self") {
    return {
      ok: false,
      reason: "bad_audience" as const,
    };
  }

  const message =
    `cid=${checkInId}` +
    `&exp=${expirationNumber}` +
    `&uid=${userId}` +
    `&aud=${audience}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const ok = safeEqualBase64Url(expectedSignature, signature);

  console.log("[check-in-verify]", {
    ok,
    reason: ok ? "ok" : "bad_signature",
    cid_present: Boolean(checkInId),
    uid_present: Boolean(userId),
    audience,
    exp,
    now,
    sig_prefix: signature.slice(0, 12),
    expected_prefix: expectedSignature.slice(0, 12),
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

async function loadVerification(
  supabase: ReturnType<typeof admin>,
  userId: string,
) {
  let profileVerified = false;

  try {
    const profileResult = await supabase
      .from("profiles")
      .select("verified")
      .eq("id", userId)
      .maybeSingle();

    const profileRow = profileResult.data as {
      verified?: boolean | null;
    } | null;

    profileVerified = profileRow?.verified === true;
  } catch {}

  try {
    const badgeResult = await supabase
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

    const badgeRow = badgeResult.data as {
      badge_type?: string | null;
      status?: string | null;
    } | null;

    return {
      verified: profileVerified || Boolean(badgeRow),

      badgeType: safeTrim(badgeRow?.badge_type),
    };
  } catch {
    return {
      verified: profileVerified,
      badgeType: "",
    };
  }
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
    const supabase = admin();

    const [checkInResult, profileResult, verification] = await Promise.all([
      supabase
        .from("daily_safety_checkins")
        .select(
          "id,user_id,checked_in_at,lat,lng,accuracy,place,plan_tier,missed_alerts_enabled,created_at",
        )
        .eq("id", checkInId)
        .eq("user_id", userId)
        .maybeSingle(),

      supabase
        .from("user_profile")
        .select("display_name,first_name,last_name")
        .eq("user_id", userId)
        .maybeSingle(),

      loadVerification(supabase, userId),
    ]);

    if (checkInResult.error || !checkInResult.data) {
      console.error("[check-in-page.checkin]", checkInResult.error);

      return <InvalidState reason="checkin_not_found" />;
    }

    const row = checkInResult.data as unknown as {
      id: string;
      user_id: string;
      checked_in_at: string;
      lat: number | null;
      lng: number | null;
      accuracy: number | null;
      place: string | null;
      plan_tier: string;
      missed_alerts_enabled: boolean;
      created_at: string;
    };

    const lat =
      typeof row.lat === "number" && Number.isFinite(row.lat) ? row.lat : null;

    const lng =
      typeof row.lng === "number" && Number.isFinite(row.lng) ? row.lng : null;

    const accuracy =
      typeof row.accuracy === "number" && Number.isFinite(row.accuracy)
        ? row.accuracy
        : null;

    if (lat === null || lng === null) {
      return <InvalidState reason="location_not_attached" />;
    }

    const seed: CheckInSeed = {
      checkInId,
      userId,
      audience,
      expiresAt,

      visitorName: displayNameFromProfile(
        (profileResult.data as Record<string, unknown> | null) ?? null,
      ),

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
