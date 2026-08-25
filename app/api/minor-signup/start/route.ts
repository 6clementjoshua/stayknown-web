// app/api/minor-signup/start/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CONSENT_VERSION = "guardian-consent-v1.0-2026-05-29";
const REQUEST_TTL_HOURS = 48;

type Actor = "minor" | "guardian";
type Decision = "approve" | "decline";

type StartBody = {
  minor_email?: string;
  minor_first_name?: string;
  minor_last_name?: string;
  minor_gender?: string;
  minor_date_of_birth?: string;

  guardian_email?: string;
  guardian_first_name?: string;
  guardian_last_name?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
};

type GuardianIdentitySource = "stayknown_profile" | "typed_by_minor";
type GuardianEligibility =
  | "adult"
  | "minor"
  | "age_unverified"
  | "account_unavailable"
  | "external_or_unresolved";

type GuardianIdentity = {
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  source: GuardianIdentitySource;
  mismatch: boolean;
  eligibility: GuardianEligibility;
};

type MinorSignupInsert = {
  minor_email: string;
  minor_first_name: string;
  minor_last_name: string;
  minor_gender: string;
  minor_date_of_birth: string;
  minor_age_years: number;

  guardian_email: string;
  guardian_user_id: string | null;
  guardian_first_name: string | null;
  guardian_last_name: string | null;
  guardian_entered_first_name: string | null;
  guardian_entered_last_name: string | null;
  guardian_identity_source: string;
  guardian_identity_resolved_at: string | null;
  guardian_identity_mismatch: boolean;
  guardian_phone: string | null;
  guardian_relationship: string;

  status: string;
  consent_version: string;
  consent_snapshot: string;
  expires_at: string;
};

type MinorSignupRow = MinorSignupInsert & {
  id: string;
  created_at?: string | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  status: string | null;
  age_status: string | null;
  date_of_birth: string | null;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Minor signup start is not fully configured yet.");
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false },
  });
}

type SupabaseAdminClient = ReturnType<typeof admin>;

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeEmail(v: unknown) {
  return clean(v).toLowerCase();
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function normalizeGender(v: unknown) {
  const s = clean(v).toLowerCase();

  if (s === "male") return "male";
  if (s === "female") return "female";
  if (s === "non_binary") return "non_binary";
  if (s === "non-binary") return "non_binary";
  if (s === "prefer_not_to_say") return "prefer_not_to_say";
  if (s === "prefer not to say") return "prefer_not_to_say";

  return "";
}

function normalizeRelationship(v: unknown) {
  const s = clean(v).toLowerCase().replaceAll("-", "_");

  if (s === "parent") return "parent";
  if (s === "mother" || s === "mom" || s === "mum") return "mother";
  if (s === "father" || s === "dad") return "father";

  if (s === "legal_guardian" || s === "legal guardian") {
    return "legal_guardian";
  }

  if (s === "caregiver" || s === "care giver") return "caregiver";
  if (s === "brother") return "brother";
  if (s === "sister") return "sister";
  if (s === "uncle") return "uncle";
  if (s === "aunt" || s === "aunty") return "aunt";
  if (s === "grandparent" || s === "grand_parent") return "grandparent";
  if (s === "teacher") return "teacher";

  if (s === "trusted_adult" || s === "trusted adult") {
    return "trusted_adult";
  }

  return "parent";
}

function parseDateOnly(v: unknown) {
  const s = clean(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;

  const d = new Date(`${s}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;

  const [yyyy, mm, dd] = s.split("-").map((x) => Number(x));
  if (!yyyy || !mm || !dd) return null;

  if (
    d.getUTCFullYear() !== yyyy ||
    d.getUTCMonth() + 1 !== mm ||
    d.getUTCDate() !== dd
  ) {
    return null;
  }

  return s;
}

function ageFromDateOfBirth(dateOnly: string) {
  const now = new Date();
  const dob = new Date(`${dateOnly}T00:00:00.000Z`);

  let age = now.getUTCFullYear() - dob.getUTCFullYear();

  const currentMonth = now.getUTCMonth();
  const birthMonth = dob.getUTCMonth();
  const currentDay = now.getUTCDate();
  const birthDay = dob.getUTCDate();

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age -= 1;
  }

  return age;
}

function siteBaseUrl(req: Request) {
  const configured = clean(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured.replace(/\/+$/g, "");

  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

function signApprovalLink(p: {
  baseUrl: string;
  requestId: string;
  actor: Actor;
  decision: Decision;
  exp: number;
}) {
  const secret = clean(process.env.MINOR_SIGNUP_SIGNING_SECRET);

  if (!secret) {
    throw new Error("Missing MINOR_SIGNUP_SIGNING_SECRET.");
  }

  const message = `rid=${p.requestId}&actor=${p.actor}&decision=${p.decision}&exp=${p.exp}`;

  const sig = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const params = new URLSearchParams({
    rid: p.requestId,
    actor: p.actor,
    decision: p.decision,
    exp: String(p.exp),
    sig,
  });

  return `${p.baseUrl}/minor-signup-approval?${params.toString()}`;
}

function consentSnapshot() {
  return [
    "StayKnown guardian consent approval for eligible minor users ages 13–17.",
    "Under 13 users are not supported at launch.",
    "Ages 13–17 require both minor confirmation and guardian approval before full app access.",
    "StayKnown may process account details, date of birth, guardian consent status, approved contacts, Visit sessions, SOS records, chat metadata, media references, location-related safety metadata, support records, abuse reports, and safety logs where applicable.",
    "StayKnown is for lawful, safety-focused use only and must not be used for stalking, harassment, coercive control, hidden tracking, exploitation, punishment, or unsafe contact.",
    "StayKnown does not replace official emergency services, police, ambulance, fire service, child-protection authorities, schools, guardians, or real-world safety planning.",
    "Guardian consent may be withdrawn subject to safety, legal, abuse-prevention, security, fraud-prevention, dispute, and data-retention limits.",
  ].join("\n");
}

function compactName(firstName: string | null, lastName: string | null) {
  return [firstName, lastName]
    .map((x) => clean(x))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeNameCompare(v: string) {
  return v.toLowerCase().replace(/\s+/g, " ").trim();
}

function splitDisplayName(displayName: string | null) {
  const full = clean(displayName).replace(/\s+/g, " ");
  if (!full) {
    return {
      first_name: null as string | null,
      last_name: null as string | null,
    };
  }

  const parts = full.split(" ").filter(Boolean);
  if (parts.length <= 1) {
    return {
      first_name: parts[0] || null,
      last_name: null as string | null,
    };
  }

  return {
    first_name: parts[0] || null,
    last_name: parts.slice(1).join(" ") || null,
  };
}

async function resolveGuardianIdentity(p: {
  sb: SupabaseAdminClient;
  guardianEmail: string;
  enteredFirstName: string;
  enteredLastName: string;
}): Promise<GuardianIdentity> {
  const enteredFirstName = clean(p.enteredFirstName);
  const enteredLastName = clean(p.enteredLastName);
  const enteredFullName = compactName(enteredFirstName, enteredLastName);

  const { data, error } = await p.sb
    .from("profiles")
    .select(
      `
        id,
        email,
        display_name,
        first_name,
        last_name,
        status,
        age_status,
        date_of_birth,
        deleted_at,
        created_at,
        updated_at
      `,
    )
    .ilike("email", p.guardianEmail)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(1);

  if (error) {
    throw error;
  }

  const profile =
    Array.isArray(data) && data.length > 0 ? (data[0] as ProfileRow) : null;

  if (!profile) {
    return {
      user_id: null,
      first_name: enteredFirstName || null,
      last_name: enteredLastName || null,
      display_name: enteredFullName || null,
      source: "typed_by_minor",
      mismatch: false,
      eligibility: "external_or_unresolved",
    };
  }

  const profileStatus = clean(profile.status).toLowerCase();
  const profileAgeStatus = clean(profile.age_status).toLowerCase();
  const profileDob = parseDateOnly(profile.date_of_birth);
  const profileAge = profileDob ? ageFromDateOfBirth(profileDob) : null;

  let eligibility: GuardianEligibility;

  if (profile.deleted_at || profileStatus !== "active") {
    eligibility = "account_unavailable";
  } else if (
    profileAgeStatus === "minor" ||
    (profileAge !== null && profileAge < 18)
  ) {
    // Explicit minor classification or minor DOB always wins.
    eligibility = "minor";
  } else if (
    profileAgeStatus === "adult" ||
    (profileAge !== null && profileAge >= 18)
  ) {
    eligibility = "adult";
  } else {
    eligibility = "age_unverified";
  }

  const profileFirst = clean(profile.first_name);
  const profileLast = clean(profile.last_name);
  const profileDisplay = clean(profile.display_name);

  const split = splitDisplayName(profileDisplay);

  const resolvedFirstName =
    profileFirst || split.first_name || enteredFirstName;
  const resolvedLastName = profileLast || split.last_name || enteredLastName;
  const resolvedFullName = compactName(resolvedFirstName, resolvedLastName);

  const mismatch =
    Boolean(enteredFullName) &&
    Boolean(resolvedFullName) &&
    normalizeNameCompare(enteredFullName) !==
      normalizeNameCompare(resolvedFullName);

  return {
    user_id: profile.id,
    first_name: resolvedFirstName || null,
    last_name: resolvedLastName || null,
    display_name: resolvedFullName || profileDisplay || null,
    source: "stayknown_profile",
    mismatch,
    eligibility,
  };
}

async function invokeInternalEdge(
  name: string,
  payload: Record<string, unknown>,
) {
  const baseUrl = clean(process.env.SUPABASE_FUNCTIONS_URL);
  const anonKey = clean(process.env.SUPABASE_ANON_KEY);
  const internalSecret = clean(process.env.INTERNAL_EDGE_SECRET);

  if (!baseUrl || !anonKey || !internalSecret) {
    throw new Error(
      "Missing edge configuration for minor signup approval emails.",
    );
  }

  const res = await fetch(`${baseUrl}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "x-internal-secret": internalSecret,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || (json && json.ok === false)) {
    throw new Error(
      `Edge ${name} failed: ${
        json && typeof json.error === "string"
          ? json.error
          : `${res.status} ${res.statusText}`
      }`,
    );
  }

  return json;
}

function publicRequest(row: MinorSignupRow) {
  return {
    id: row.id,
    status: row.status,
    minor_email: row.minor_email,
    minor_first_name: row.minor_first_name,
    minor_last_name: row.minor_last_name,
    minor_age_years: row.minor_age_years,
    guardian_email: row.guardian_email,

    // These are now canonical display names.
    guardian_first_name: row.guardian_first_name,
    guardian_last_name: row.guardian_last_name,

    guardian_relationship: row.guardian_relationship,
    guardian_identity_source: row.guardian_identity_source,
    guardian_identity_mismatch: row.guardian_identity_mismatch,
    expires_at: row.expires_at,
    consent_version: row.consent_version,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as StartBody;

    const minorEmail = normalizeEmail(body.minor_email);
    const minorFirstName = clean(body.minor_first_name);
    const minorLastName = clean(body.minor_last_name);
    const minorGender = normalizeGender(body.minor_gender);
    const minorDob = parseDateOnly(body.minor_date_of_birth);

    const guardianEmail = normalizeEmail(body.guardian_email);
    const guardianEnteredFirstName = clean(body.guardian_first_name);
    const guardianEnteredLastName = clean(body.guardian_last_name);
    const guardianPhone = clean(body.guardian_phone);
    const guardianRelationship = normalizeRelationship(
      body.guardian_relationship,
    );

    if (!minorFirstName || minorFirstName.length < 2) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "Minor first name is required.",
        },
        { status: 400 },
      );
    }

    if (!minorLastName || minorLastName.length < 2) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "Minor last name is required.",
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(minorEmail)) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "A valid minor email is required.",
        },
        { status: 400 },
      );
    }

    if (!minorGender) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "Gender is required for profile setup.",
        },
        { status: 400 },
      );
    }

    if (!minorDob) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "A valid date of birth is required.",
        },
        { status: 400 },
      );
    }

    const age = ageFromDateOfBirth(minorDob);

    if (age < 13) {
      return NextResponse.json(
        {
          ok: false,
          state: "under_13_blocked",
          message:
            "StayKnown is not available for this age group yet. A parent or guardian may contact StayKnown support for questions.",
        },
        { status: 403 },
      );
    }

    if (age >= 18) {
      return NextResponse.json(
        {
          ok: false,
          state: "adult_flow_required",
          message:
            "This route is only for eligible minor users ages 13–17. Adults should continue the normal account creation flow.",
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(guardianEmail)) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "A valid parent or guardian email is required.",
        },
        { status: 400 },
      );
    }

    if (guardianEmail === minorEmail) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message:
            "Guardian email must be different from the minor account email.",
        },
        { status: 400 },
      );
    }

    if (!guardianEnteredFirstName || guardianEnteredFirstName.length < 2) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "Guardian first name is required.",
        },
        { status: 400 },
      );
    }

    if (!guardianEnteredLastName || guardianEnteredLastName.length < 2) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "Guardian last name is required.",
        },
        { status: 400 },
      );
    }

    const sb = admin();

    const guardianIdentity = await resolveGuardianIdentity({
      sb,
      guardianEmail,
      enteredFirstName: guardianEnteredFirstName,
      enteredLastName: guardianEnteredLastName,
    });

    if (guardianIdentity.eligibility === "minor") {
      return NextResponse.json(
        {
          ok: false,
          state: "guardian_must_be_adult",
          message: "A registered StayKnown guardian must be 18 years or older.",
        },
        { status: 403 },
      );
    }

    if (guardianIdentity.eligibility === "age_unverified") {
      return NextResponse.json(
        {
          ok: false,
          state: "guardian_age_unverified",
          message:
            "This registered guardian account must complete its age information before it can approve a minor signup.",
        },
        { status: 409 },
      );
    }

    if (guardianIdentity.eligibility === "account_unavailable") {
      return NextResponse.json(
        {
          ok: false,
          state: "guardian_account_unavailable",
          message:
            "This registered StayKnown account is not currently eligible to act as a guardian.",
        },
        { status: 409 },
      );
    }

    const expiresAt = new Date(
      Date.now() + REQUEST_TTL_HOURS * 60 * 60 * 1000,
    ).toISOString();

    /*
      Safety behavior:
      If the same minor email already has a pending request, expire the older
      pending one first. This avoids multiple live guardian approval links for
      the same minor signup attempt.
    */
    await sb
      .from("minor_signup_requests")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("minor_email", minorEmail)
      .in("status", ["pending", "minor_approved", "guardian_approved"]);

    const insertRow: MinorSignupInsert = {
      minor_email: minorEmail,
      minor_first_name: minorFirstName,
      minor_last_name: minorLastName,
      minor_gender: minorGender,
      minor_date_of_birth: minorDob,
      minor_age_years: age,

      guardian_email: guardianEmail,
      guardian_user_id: guardianIdentity.user_id,
      guardian_first_name: guardianIdentity.first_name,
      guardian_last_name: guardianIdentity.last_name,

      // Keep what the minor typed for audit/review only.
      guardian_entered_first_name: guardianEnteredFirstName || null,
      guardian_entered_last_name: guardianEnteredLastName || null,

      guardian_identity_source: guardianIdentity.source,
      guardian_identity_resolved_at:
        guardianIdentity.source === "stayknown_profile"
          ? new Date().toISOString()
          : null,
      guardian_identity_mismatch: guardianIdentity.mismatch,

      guardian_phone: guardianPhone || null,
      guardian_relationship: guardianRelationship,

      status: "pending",
      consent_version: CONSENT_VERSION,
      consent_snapshot: consentSnapshot(),
      expires_at: expiresAt,
    };

    const { data, error } = await sb
      .from("minor_signup_requests")
      .insert(insertRow)
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
          guardian_user_id,
          guardian_first_name,
          guardian_last_name,
          guardian_entered_first_name,
          guardian_entered_last_name,
          guardian_identity_source,
          guardian_identity_resolved_at,
          guardian_identity_mismatch,
          guardian_phone,
          guardian_relationship,
          status,
          consent_version,
          consent_snapshot,
          expires_at,
          created_at
        `,
      )
      .single();

    if (error) throw error;

    const row = data as MinorSignupRow;

    const expUnix = Math.floor(new Date(expiresAt).getTime() / 1000);
    const baseUrl = siteBaseUrl(req);

    const links = {
      minor: {
        approve: signApprovalLink({
          baseUrl,
          requestId: row.id,
          actor: "minor",
          decision: "approve",
          exp: expUnix,
        }),
        decline: signApprovalLink({
          baseUrl,
          requestId: row.id,
          actor: "minor",
          decision: "decline",
          exp: expUnix,
        }),
      },
      guardian: {
        approve: signApprovalLink({
          baseUrl,
          requestId: row.id,
          actor: "guardian",
          decision: "approve",
          exp: expUnix,
        }),
        decline: signApprovalLink({
          baseUrl,
          requestId: row.id,
          actor: "guardian",
          decision: "decline",
          exp: expUnix,
        }),
      },
    };

    await invokeInternalEdge("minor_signup_request_notify", {
      request_id: row.id,
      expires_at: expiresAt,
      consent_version: CONSENT_VERSION,

      minor: {
        email: row.minor_email,
        first_name: row.minor_first_name,
        last_name: row.minor_last_name,
        age_years: row.minor_age_years,
        approve_url: links.minor.approve,
        decline_url: links.minor.decline,
      },

      guardian: {
        email: row.guardian_email,

        // These now use the resolved StayKnown profile name when available.
        first_name: row.guardian_first_name,
        last_name: row.guardian_last_name,

        relationship: row.guardian_relationship,
        identity_source: row.guardian_identity_source,
        identity_mismatch: row.guardian_identity_mismatch,
        approve_url: links.guardian.approve,
        decline_url: links.guardian.decline,
      },
    });

    return NextResponse.json({
      ok: true,
      state: "pending_both",
      message:
        "Guardian consent emails have been sent. The minor and guardian must both confirm before the account can continue.",
      request: publicRequest(row),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        state: "error",
        message:
          e instanceof Error
            ? e.message
            : "Could not start minor signup approval right now.",
      },
      { status: 500 },
    );
  }
}
