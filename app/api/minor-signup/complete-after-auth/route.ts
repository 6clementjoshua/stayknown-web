// app/api/minor-signup/complete-after-auth/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MinorSignupRow = {
  id: string;

  minor_email?: string | null;
  minor_first_name?: string | null;
  minor_last_name?: string | null;
  minor_gender?: string | null;
  minor_date_of_birth?: string | null;
  minor_age_years?: number | null;

  guardian_email?: string | null;
  guardian_first_name?: string | null;
  guardian_last_name?: string | null;
  guardian_phone?: string | null;
  guardian_relationship?: string | null;
  guardian_user_id?: string | null;

  status?: string | null;

  minor_approved?: boolean | null;
  guardian_approved?: boolean | null;
  minor_declined?: boolean | null;
  guardian_declined?: boolean | null;

  guardian_completed_at?: string | null;
  minor_completed_at?: string | null;

  consent_version?: string | null;
  decided_at?: string | null;

  auth_user_id?: string | null;
  profile_synced_at?: string | null;
  guardian_contact_synced_at?: string | null;
  completed_at?: string | null;
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Minor signup completion is not fully configured yet.");
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false },
  });
}

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function lower(v: unknown) {
  return clean(v).toLowerCase();
}

function normalizeEmail(v: unknown) {
  return clean(v).toLowerCase();
}

function normalizeGender(v: unknown) {
  const s = lower(v);

  if (s === "male") return "male";
  if (s === "female") return "female";
  if (s === "non_binary" || s === "non-binary" || s === "non binary") {
    return "non_binary";
  }
  if (
    s === "prefer_not_to_say" ||
    s === "prefer-not-to-say" ||
    s === "prefer not to say" ||
    s === "rather_not_say" ||
    s === "rather not say"
  ) {
    return "prefer_not_to_say";
  }

  return "prefer_not_to_say";
}

function fullName(first?: string | null, last?: string | null) {
  return `${clean(first)} ${clean(last)}`.trim();
}

function guardianName(row: MinorSignupRow) {
  const full = fullName(row.guardian_first_name, row.guardian_last_name);
  if (full) return full;
  return "Parent/Guardian";
}

function relationshipLabel(v: unknown) {
  const s = clean(v).toLowerCase().replaceAll("-", "_");

  if (s === "mother") return "Mother";
  if (s === "father") return "Father";
  if (s === "parent") return "Parent";
  if (s === "legal_guardian") return "Legal guardian";
  if (s === "caregiver") return "Caregiver";
  if (s === "brother") return "Brother";
  if (s === "sister") return "Sister";
  if (s === "uncle") return "Uncle";
  if (s === "aunt") return "Aunt";
  if (s === "grandparent") return "Grandparent";
  if (s === "teacher") return "Teacher";
  if (s === "trusted_adult") return "Trusted adult";

  return "Parent";
}

function toIsoNow() {
  return new Date().toISOString();
}

function authTokenFrom(req: Request) {
  const raw = req.headers.get("authorization") || "";
  return raw.replace(/^Bearer\s+/i, "").trim();
}

function publicRequest(row: MinorSignupRow) {
  return {
    id: row.id,
    status: clean(row.status),
    minor_email: normalizeEmail(row.minor_email),
    minor_first_name: clean(row.minor_first_name),
    minor_last_name: clean(row.minor_last_name),
    minor_age_years: row.minor_age_years ?? null,
    guardian_email: normalizeEmail(row.guardian_email),
    guardian_name: guardianName(row),
    guardian_relationship: clean(row.guardian_relationship) || "parent",
    profile_synced_at: row.profile_synced_at ?? null,
    guardian_contact_synced_at: row.guardian_contact_synced_at ?? null,
    completed_at: row.completed_at ?? null,
  };
}

async function loadMinorRequest(
  sb: ReturnType<typeof admin>,
  requestId: string,
): Promise<MinorSignupRow | null> {
  const { data, error } = await sb
    .from("minor_signup_requests")
    .select(
      `
        id,

        minor_email,
        minor_first_name,
        minor_last_name,
        minor_gender,
        minor_date_of_birth,
        minor_age_years,

        guardian_email,
        guardian_first_name,
        guardian_last_name,
        guardian_phone,
        guardian_relationship,
        guardian_user_id,

        status,

        minor_approved,
        guardian_approved,
        minor_declined,
        guardian_declined,

        minor_completed_at,
        guardian_completed_at,

        consent_version,
        decided_at,

        auth_user_id,
        profile_synced_at,
        guardian_contact_synced_at,
        completed_at
      `,
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error) throw error;
  return (data as MinorSignupRow | null) ?? null;
}

async function upsertApprovedMinorProfile(params: {
  sb: ReturnType<typeof admin>;
  uid: string;
  userEmail: string;
  row: MinorSignupRow;
}) {
  const { sb, uid, userEmail, row } = params;

  const now = toIsoNow();
  const firstName = clean(row.minor_first_name);
  const lastName = clean(row.minor_last_name);
  const displayName = fullName(firstName, lastName) || "StayKnown user";

  const gender = normalizeGender(row.minor_gender);
  const dob = clean(row.minor_date_of_birth);

  const guardianEmail = normalizeEmail(row.guardian_email);
  const gName = guardianName(row);
  const guardianRelationship = relationshipLabel(row.guardian_relationship);
  const consentVersion =
    clean(row.consent_version) || "guardian-consent-v1.0-2026-05-29";

  const { error: userProfileErr } = await sb.from("user_profile").upsert(
    {
      user_id: uid,

      // ✅ Important for profile header + edit screen fallbacks
      display_name: displayName,
      first_name: firstName,
      last_name: lastName,
      email: userEmail,

      gender,
      date_of_birth: dob || null,
      date_of_birth_public: false,
      dob_verified: true,

      age_status: "minor",
      guardian_consent_required: true,
      guardian_consent_status: "approved",
      guardian_consent_at: row.decided_at || now,
      guardian_email: guardianEmail,
      guardian_name: gName,
      guardian_relationship: guardianRelationship,
      guardian_consent_version: consentVersion,
      minor_signup_request_id: row.id,

      /*
        Do not force profile_completed true here.
        The minor still needs to complete phone/avatar/other profile fields normally.
      */
      profile_completed: false,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );

  if (userProfileErr) throw userProfileErr;

  const { error: profileErr } = await sb.from("profiles").upsert(
    {
      id: uid,

      // ✅ Important for profile header + public/basic identity
      display_name: displayName,
      first_name: firstName,
      last_name: lastName,
      email: userEmail,

      gender,
      date_of_birth: dob || null,
      age_status: "minor",
      guardian_consent_status: "approved",
      status: "active",
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (profileErr) throw profileErr;
}

async function reconcileUniversalProfile(params: {
  sb: ReturnType<typeof admin>;
  uid: string;
}) {
  const { sb, uid } = params;

  const { data, error } = await sb.rpc("reconcile_profile_identity", {
    p_user_id: uid,
  });

  if (error) {
    throw error;
  }

  if (!data || typeof data !== "object") {
    throw new Error(
      "Universal profile reconciliation returned an invalid response.",
    );
  }

  return data;
}

async function syncGuardianEmergencyContact(params: {
  sb: ReturnType<typeof admin>;
  uid: string;
  row: MinorSignupRow;
}) {
  const { sb, uid, row } = params;

  const email = normalizeEmail(row.guardian_email);
  if (!email || !email.includes("@")) {
    throw new Error("Guardian email is missing.");
  }

  const name = guardianName(row);
  const relationship = relationshipLabel(row.guardian_relationship);
  const guardianUserId = clean(row.guardian_user_id) || null;

  const existing = await sb
    .from("emergency_contacts")
    .select("id, target_user_id")
    .eq("user_id", uid)
    .eq("email", email)
    .maybeSingle();

  if (existing.error) throw existing.error;

  const existingRow = existing.data as {
    id?: string;
    target_user_id?: string | null;
  } | null;

  const existingId = clean(existingRow?.id);
  const existingTargetUserId = clean(existingRow?.target_user_id);

  /*
    If the guardian was resolved to an existing StayKnown account by the
    authoritative minor-signup flow, carry that exact identity into the
    Emergency relationship. Never silently relink an Emergency row that is
    already attached to a different registered account.

    When guardianUserId is null the guardian remains external/unresolved and
    the existing safety-only behavior is preserved.
  */
  if (
    guardianUserId &&
    existingTargetUserId &&
    existingTargetUserId !== guardianUserId
  ) {
    throw new Error(
      "Guardian Emergency contact is linked to a different StayKnown account.",
    );
  }

  if (existingId) {
    const { error } = await sb
      .from("emergency_contacts")
      .update({
        name,
        alias: relationship,
        restricted: false,
        blocked: false,
        approval_status: "approved",
        ...(guardianUserId ? { target_user_id: guardianUserId } : {}),
      })
      .eq("id", existingId)
      .eq("user_id", uid);

    if (error) throw error;
    return;
  }

  const { error } = await sb.from("emergency_contacts").insert({
    user_id: uid,
    name,
    email,
    alias: relationship,
    restricted: false,
    blocked: false,
    approval_status: "approved",
    target_user_id: guardianUserId,
  });

  if (error) throw error;
}

export async function POST(req: Request) {
  const sb = admin();
  let requestId = "";

  try {
    const token = authTokenFrom(req);

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          state: "unauthorized",
          message: "Missing authenticated session.",
        },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: userErr,
    } = await sb.auth.getUser(token);

    if (userErr || !user?.id) {
      return NextResponse.json(
        {
          ok: false,
          state: "unauthorized",
          message: "This session could not be verified.",
        },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    requestId = clean(body.request_id);

    if (!requestId) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "Missing minor signup request id.",
        },
        { status: 400 },
      );
    }

    const row = await loadMinorRequest(sb, requestId);

    if (!row?.id) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "This minor signup request could not be found.",
        },
        { status: 404 },
      );
    }

    const status = lower(row.status);
    const minorEmail = normalizeEmail(row.minor_email);
    const userEmail = normalizeEmail(user.email);

    if (status === "cancelled") {
      return NextResponse.json(
        {
          ok: false,
          state: "cancelled",
          message: "This minor signup request was cancelled.",
          request: publicRequest(row),
        },
        { status: 409 },
      );
    }

    if (status === "declined" || row.minor_declined || row.guardian_declined) {
      return NextResponse.json(
        {
          ok: false,
          state: "declined",
          message: "This minor signup request was declined.",
          request: publicRequest(row),
        },
        { status: 409 },
      );
    }

    if (
      status !== "approved" ||
      row.minor_approved !== true ||
      row.guardian_approved !== true
    ) {
      return NextResponse.json(
        {
          ok: false,
          state: "not_approved",
          message:
            "This minor signup request has not completed both confirmations yet.",
          request: publicRequest(row),
        },
        { status: 409 },
      );
    }

    if (!minorEmail || !userEmail || minorEmail !== userEmail) {
      return NextResponse.json(
        {
          ok: false,
          state: "email_mismatch",
          message:
            "This authenticated account does not match the approved minor signup request.",
          request: publicRequest(row),
        },
        { status: 403 },
      );
    }

    /*
      Idempotent completion:
      If this request was already synced for this same user, return success.
    */
    if (
      row.completed_at &&
      row.auth_user_id &&
      clean(row.auth_user_id) === user.id
    ) {
      /*
    The guardian-specific synchronization was already completed.

    Still run the universal reconciler so older approved minor accounts
    receive the same profile-readiness repair used by every StayKnown user.
  */
      await reconcileUniversalProfile({
        sb,
        uid: user.id,
      });

      return NextResponse.json({
        ok: true,
        state: "already_completed",
        message: "Approved minor signup was already synced.",
        request: publicRequest(row),
      });
    }

    try {
      await upsertApprovedMinorProfile({
        sb,
        uid: user.id,
        userEmail,
        row,
      });

      await syncGuardianEmergencyContact({
        sb,
        uid: user.id,
        row,
      });

      /*
  Guardian consent and guardian contact are specific to minors.

  After those writes finish, use the same universal evaluator used for
  adults, returning users and legacy accounts.
*/
      await reconcileUniversalProfile({
        sb,
        uid: user.id,
      });

      const now = toIsoNow();

      const { error: updateErr } = await sb
        .from("minor_signup_requests")
        .update({
          auth_user_id: user.id,
          profile_synced_at: now,
          guardian_contact_synced_at: now,
          completed_at: now,
          sync_error: null,
          updated_at: now,
        })
        .eq("id", row.id);

      if (updateErr) throw updateErr;

      const fresh = (await loadMinorRequest(sb, requestId)) ?? {
        ...row,
        auth_user_id: user.id,
        profile_synced_at: now,
        guardian_contact_synced_at: now,
        completed_at: now,
      };

      return NextResponse.json({
        ok: true,
        state: "completed",
        message:
          "Approved minor signup data was synced into the authenticated account.",
        request: publicRequest(fresh),
      });
    } catch (syncErr) {
      await sb
        .from("minor_signup_requests")
        .update({
          sync_error:
            syncErr instanceof Error ? syncErr.message : String(syncErr),
          updated_at: toIsoNow(),
        })
        .eq("id", row.id);

      throw syncErr;
    }
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        state: "error",
        message:
          e instanceof Error
            ? e.message
            : "Could not complete approved minor signup right now.",
      },
      { status: 500 },
    );
  }
}
