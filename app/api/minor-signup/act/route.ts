// app/api/minor-signup/act/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Actor = "minor" | "guardian";
type Decision = "approve" | "decline";

type MinorSignupRow = {
  id: string;

  minor_email?: string | null;
  minor_first_name?: string | null;
  minor_last_name?: string | null;
  minor_gender?: string | null;
  minor_date_of_birth?: string | null;
  minor_age_years?: number | null;

  guardian_email?: string | null;
  guardian_user_id?: string | null;
  guardian_first_name?: string | null;
  guardian_last_name?: string | null;
  guardian_entered_first_name?: string | null;
  guardian_entered_last_name?: string | null;
  guardian_identity_source?: string | null;
  guardian_identity_resolved_at?: string | null;
  guardian_identity_mismatch?: boolean | null;
  guardian_phone?: string | null;
  guardian_relationship?: string | null;

  status?: string | null;

  minor_approved?: boolean | null;
  guardian_approved?: boolean | null;
  minor_declined?: boolean | null;
  guardian_declined?: boolean | null;

  minor_completed_at?: string | null;
  guardian_completed_at?: string | null;
  decided_at?: string | null;

  consent_version?: string | null;
  consent_snapshot?: string | null;
  expires_at?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

type RegisteredGuardianProfile = {
  id: string;
  email?: string | null;
  age_status?: string | null;
  date_of_birth?: string | null;
  status?: string | null;
  deleted_at?: string | null;
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Minor signup approval is not fully configured yet.");
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

function asActor(v: string): Actor | null {
  const s = v.trim().toLowerCase();
  if (s === "minor" || s === "guardian") return s;
  return null;
}

function asDecision(v: string): Decision | null {
  const s = v.trim().toLowerCase();
  if (s === "approve" || s === "decline") return s;
  return null;
}

function toIsoNow() {
  return new Date().toISOString();
}

function maskEmail(email?: string | null) {
  const e = clean(email).toLowerCase();
  if (!e || !e.includes("@")) return "";

  const [name, domain] = e.split("@");
  if (!name || !domain) return "";

  const visible =
    name.length <= 2
      ? `${name[0] ?? "*"}*`
      : `${name.slice(0, 2)}${"*".repeat(Math.min(5, name.length - 2))}`;

  return `${visible}@${domain}`;
}

function fullName(first?: string | null, last?: string | null) {
  return `${clean(first)} ${clean(last)}`.replace(/\s+/g, " ").trim();
}

function guardianCanonicalName(row: MinorSignupRow) {
  return fullName(row.guardian_first_name, row.guardian_last_name);
}

function minorCanonicalName(row: MinorSignupRow) {
  return fullName(row.minor_first_name, row.minor_last_name);
}

function firstHeader(req: Request, names: string[]) {
  for (const name of names) {
    const v = (req.headers.get(name) || "").trim();
    if (v) return v;
  }
  return "";
}

function extractClientIp(req: Request) {
  const forwarded = firstHeader(req, [
    "x-forwarded-for",
    "cf-connecting-ip",
    "x-real-ip",
  ]);

  if (!forwarded) return "";
  return forwarded.split(",")[0]?.trim() || "";
}

function coarseLocationFromHeaders(req: Request) {
  const city = firstHeader(req, ["x-vercel-ip-city", "cf-ipcity"]);
  const region = firstHeader(req, [
    "x-vercel-ip-country-region",
    "cf-region-code",
  ]);
  const country = firstHeader(req, ["x-vercel-ip-country", "cf-ipcountry"]);

  return {
    city,
    region,
    country,
  };
}

function verifySignature(p: {
  requestId: string;
  actor: Actor;
  decision: Decision;
  exp: number;
  sig: string;
}) {
  const secret = (process.env.MINOR_SIGNUP_SIGNING_SECRET || "").trim();

  if (!secret) {
    return { ok: false, reason: "missing_secret" as const };
  }

  const now = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(p.exp)) {
    return { ok: false, reason: "bad_exp" as const };
  }

  if (p.exp < now) {
    return { ok: false, reason: "expired" as const };
  }

  const message = `rid=${p.requestId}&actor=${p.actor}&decision=${p.decision}&exp=${p.exp}`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(p.sig);

  if (
    expectedBuffer.length !== suppliedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
  ) {
    return { ok: false, reason: "bad_signature" as const };
  }

  return { ok: true as const };
}

function requestState(row: MinorSignupRow) {
  const minorApproved = row.minor_approved === true;
  const guardianApproved = row.guardian_approved === true;
  const minorDeclined = row.minor_declined === true;
  const guardianDeclined = row.guardian_declined === true;
  const status = lower(row.status);

  if (minorDeclined || guardianDeclined || status === "declined") {
    return "declined" as const;
  }

  if (status === "cancelled") {
    return "cancelled" as const;
  }

  const exp = clean(row.expires_at);
  if (exp) {
    const expMs = new Date(exp).getTime();
    if (Number.isFinite(expMs) && expMs <= Date.now()) {
      return "expired" as const;
    }
  }

  if (minorApproved && guardianApproved) {
    return "fully_approved" as const;
  }

  if (minorApproved && !guardianApproved) {
    return "waiting_guardian" as const;
  }

  if (!minorApproved && guardianApproved) {
    return "waiting_minor" as const;
  }

  return "pending_both" as const;
}

function publicRequest(row: MinorSignupRow) {
  const guardianName = guardianCanonicalName(row);

  return {
    id: row.id,
    status: clean(row.status) || "pending",

    minor_name: minorCanonicalName(row),
    minor_email_masked: maskEmail(row.minor_email),
    minor_age_years: row.minor_age_years ?? null,

    // This must always be the canonical/resolved guardian name.
    guardian_name: guardianName || "the guardian",
    guardian_email_masked: maskEmail(row.guardian_email),
    guardian_relationship: clean(row.guardian_relationship) || "parent",

    guardian_identity_source:
      clean(row.guardian_identity_source) || "typed_by_minor",
    guardian_identity_mismatch: row.guardian_identity_mismatch === true,

    minor_approved: row.minor_approved === true,
    guardian_approved: row.guardian_approved === true,
    minor_declined: row.minor_declined === true,
    guardian_declined: row.guardian_declined === true,

    minor_completed_at: row.minor_completed_at ?? null,
    guardian_completed_at: row.guardian_completed_at ?? null,
    decided_at: row.decided_at ?? null,

    consent_version: clean(row.consent_version),
    expires_at: row.expires_at ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

async function loadRequest(
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

        minor_approved,
        guardian_approved,
        minor_declined,
        guardian_declined,

        minor_completed_at,
        guardian_completed_at,
        decided_at,

        consent_version,
        consent_snapshot,
        expires_at,

        created_at,
        updated_at
      `,
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error) throw error;
  return (data as MinorSignupRow | null) ?? null;
}

function actorRecordedDecision(
  row: MinorSignupRow,
  actor: Actor,
): Decision | null {
  if (actor === "minor") {
    if (row.minor_approved === true) return "approve";
    if (row.minor_declined === true) return "decline";
    return null;
  }

  if (row.guardian_approved === true) return "approve";
  if (row.guardian_declined === true) return "decline";
  return null;
}

function isAdultDob(dateOnly?: string | null) {
  const raw = clean(dateOnly);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;

  const dob = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(dob.getTime())) return false;

  const cutoff = new Date();
  cutoff.setUTCHours(0, 0, 0, 0);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 18);

  return dob.getTime() <= cutoff.getTime();
}

async function validateRegisteredGuardianForApproval(
  sb: ReturnType<typeof admin>,
  row: MinorSignupRow,
) {
  const guardianUserId = clean(row.guardian_user_id);

  // External/unresolved guardians remain supported by the existing flow.
  if (!guardianUserId) {
    return { ok: true as const };
  }

  const { data, error } = await sb
    .from("profiles")
    .select("id,email,age_status,date_of_birth,status,deleted_at")
    .eq("id", guardianUserId)
    .maybeSingle();

  if (error) throw error;

  const profile = (data as RegisteredGuardianProfile | null) ?? null;

  if (!profile?.id) {
    return {
      ok: false as const,
      state: "guardian_profile_unavailable",
      status: 409,
      message:
        "The registered StayKnown guardian profile could not be verified.",
    };
  }

  const guardianEmail = clean(row.guardian_email).toLowerCase();
  const profileEmail = clean(profile.email).toLowerCase();

  if (!guardianEmail || !profileEmail || guardianEmail !== profileEmail) {
    return {
      ok: false as const,
      state: "guardian_identity_mismatch",
      status: 409,
      message:
        "The registered guardian account no longer matches this guardian consent request.",
    };
  }

  if (
    clean(profile.deleted_at) ||
    lower(profile.status || "active") !== "active"
  ) {
    return {
      ok: false as const,
      state: "guardian_account_unavailable",
      status: 409,
      message:
        "This registered StayKnown account is not currently eligible to act as a guardian.",
    };
  }

  const ageStatus = lower(profile.age_status);

  if (ageStatus === "minor") {
    return {
      ok: false as const,
      state: "guardian_must_be_adult",
      status: 403,
      message: "A registered StayKnown guardian must be 18 years or older.",
    };
  }

  if (ageStatus === "adult" || isAdultDob(profile.date_of_birth)) {
    return { ok: true as const };
  }

  return {
    ok: false as const,
    state: "guardian_age_unverified",
    status: 409,
    message:
      "This registered guardian account must complete its age information before it can approve a minor signup.",
  };
}

async function invokeInternalEdge(
  name: string,
  payload: Record<string, unknown>,
) {
  const baseUrl = (process.env.SUPABASE_FUNCTIONS_URL || "").trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim();
  const internalSecret = (process.env.INTERNAL_EDGE_SECRET || "").trim();

  if (!baseUrl || !anonKey || !internalSecret) {
    // Do not fail approval recording because notification wiring is not ready yet.
    return { ok: false, skipped: true, reason: "missing_edge_config" };
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
    return {
      ok: false,
      skipped: false,
      reason:
        json && typeof json.error === "string"
          ? json.error
          : `${res.status} ${res.statusText}`,
    };
  }

  return json;
}

async function finalizeMinorSignupIfReady(
  sb: ReturnType<typeof admin>,
  row: MinorSignupRow,
) {
  const minorApproved = row.minor_approved === true;
  const guardianApproved = row.guardian_approved === true;

  if (!minorApproved || !guardianApproved) {
    return false;
  }

  const now = toIsoNow();

  const { data, error } = await sb
    .from("minor_signup_requests")
    .update({
      status: "approved",
      decided_at: now,
      updated_at: now,
    })
    .eq("id", row.id)
    .in("status", ["pending", "minor_approved", "guardian_approved"])
    .select("id")
    .maybeSingle();

  if (error) throw error;

  // Another request already finalized this row. Do not send the
  // approved notification twice.
  if (!data?.id) {
    return false;
  }

  await invokeInternalEdge("minor_signup_approved_notify", {
    request_id: row.id,
    minor_email: clean(row.minor_email),
    minor_name: minorCanonicalName(row),
    guardian_email: clean(row.guardian_email),
    guardian_name: guardianCanonicalName(row),
    guardian_relationship: clean(row.guardian_relationship) || "parent",
    guardian_identity_source:
      clean(row.guardian_identity_source) || "typed_by_minor",
    guardian_identity_mismatch: row.guardian_identity_mismatch === true,
    guardian_user_id: clean(row.guardian_user_id) || null,
    consent_version: clean(row.consent_version),
  });

  return true;
}

async function markDeclined(
  sb: ReturnType<typeof admin>,
  row: MinorSignupRow,
  actor: Actor,
) {
  const now = toIsoNow();

  const { data, error } = await sb
    .from("minor_signup_requests")
    .update({
      status: "declined",
      decided_at: now,
      updated_at: now,
    })
    .eq("id", row.id)
    .in("status", ["pending", "minor_approved", "guardian_approved"])
    .select("id")
    .maybeSingle();

  if (error) throw error;

  // A concurrent/replayed action already transitioned this request.
  // Only the request that wins the terminal transition sends the notice.
  if (!data?.id) {
    return false;
  }

  await invokeInternalEdge("minor_signup_declined_notify", {
    request_id: row.id,
    declined_by: actor,
    minor_email: clean(row.minor_email),
    minor_name: minorCanonicalName(row),
    guardian_email: clean(row.guardian_email),
    guardian_name: guardianCanonicalName(row),
    guardian_identity_source:
      clean(row.guardian_identity_source) || "typed_by_minor",
    guardian_identity_mismatch: row.guardian_identity_mismatch === true,
    guardian_user_id: clean(row.guardian_user_id) || null,
  });

  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const requestId = clean(body.request_id);
    const actor = asActor(clean(body.actor));
    const decision = asDecision(clean(body.decision));
    const expRaw = Number(body.exp);
    const sig = clean(body.sig);

    if (!requestId || !actor || !decision || !sig || !Number.isFinite(expRaw)) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "This request is missing required minor approval details.",
        },
        { status: 400 },
      );
    }

    const verified = verifySignature({
      requestId,
      actor,
      decision,
      exp: expRaw,
      sig,
    });

    if (!verified.ok) {
      return NextResponse.json(
        {
          ok: false,
          state: verified.reason === "expired" ? "expired" : "invalid",
          message:
            verified.reason === "expired"
              ? "This minor signup request expired for security reasons. Please restart the process."
              : "This approval link is invalid or can no longer be trusted.",
        },
        { status: 400 },
      );
    }

    const sb = admin();

    const actionIp = extractClientIp(req);
    const actionGeo = coarseLocationFromHeaders(req);
    const actionUserAgent = (req.headers.get("user-agent") || "").trim();

    const row = await loadRequest(sb, requestId);

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

    const currentState = requestState(row);
    const recordedDecision = actorRecordedDecision(row, actor);

    // Repeated clicks/retries for the same already-recorded actor decision
    // are idempotent. Opposite decisions cannot overwrite the first one.
    if (recordedDecision) {
      if (recordedDecision === decision) {
        return NextResponse.json({
          ok: true,
          state: currentState,
          message: "This confirmation was already recorded.",
          request: publicRequest(row),
        });
      }

      return NextResponse.json(
        {
          ok: false,
          state: "already_resolved",
          message:
            "This person already completed their decision for this minor signup request.",
          request: publicRequest(row),
        },
        { status: 409 },
      );
    }

    if (currentState === "expired") {
      const now = toIsoNow();

      await sb
        .from("minor_signup_requests")
        .update({
          status: "expired",
          updated_at: now,
        })
        .eq("id", row.id);

      return NextResponse.json({
        ok: false,
        state: "expired",
        message:
          "This minor signup request expired for security reasons. Please restart the account creation process.",
        request: publicRequest({
          ...row,
          status: "expired",
        }),
      });
    }

    if (currentState === "cancelled") {
      return NextResponse.json({
        ok: false,
        state: "cancelled",
        message: "This minor signup request was cancelled and cannot proceed.",
        request: publicRequest(row),
      });
    }

    if (currentState === "declined") {
      return NextResponse.json({
        ok: false,
        state: "declined",
        message:
          "This minor signup request was already declined and cannot proceed.",
        request: publicRequest(row),
      });
    }

    if (currentState === "fully_approved" || lower(row.status) === "approved") {
      return NextResponse.json({
        ok: false,
        state: "already_resolved",
        message: "This minor signup request was already approved.",
        request: publicRequest(row),
      });
    }

    if (actor === "guardian" && decision === "approve") {
      const guardianEligibility = await validateRegisteredGuardianForApproval(
        sb,
        row,
      );

      if (!guardianEligibility.ok) {
        return NextResponse.json(
          {
            ok: false,
            state: guardianEligibility.state,
            message: guardianEligibility.message,
            request: publicRequest(row),
          },
          { status: guardianEligibility.status },
        );
      }
    }

    const now = toIsoNow();

    const patch: Record<string, unknown> = {
      updated_at: now,
    };

    if (actor === "minor") {
      patch.minor_completed_at = now;
      patch.minor_ip = actionIp || null;
      patch.minor_user_agent = actionUserAgent || null;
      patch.minor_country = actionGeo.country || null;
      patch.minor_region = actionGeo.region || null;
      patch.minor_city = actionGeo.city || null;

      if (decision === "approve") {
        patch.minor_approved = true;
        patch.minor_declined = false;
      } else {
        patch.minor_declined = true;
        patch.minor_approved = false;
      }
    }

    if (actor === "guardian") {
      patch.guardian_completed_at = now;
      patch.guardian_ip = actionIp || null;
      patch.guardian_user_agent = actionUserAgent || null;
      patch.guardian_country = actionGeo.country || null;
      patch.guardian_region = actionGeo.region || null;
      patch.guardian_city = actionGeo.city || null;

      if (decision === "approve") {
        patch.guardian_approved = true;
        patch.guardian_declined = false;
      } else {
        patch.guardian_declined = true;
        patch.guardian_approved = false;
      }
    }

    const actorApprovedColumn =
      actor === "minor" ? "minor_approved" : "guardian_approved";
    const actorDeclinedColumn =
      actor === "minor" ? "minor_declined" : "guardian_declined";

    const { data: actionWrite, error: updateErr } = await sb
      .from("minor_signup_requests")
      .update(patch)
      .eq("id", requestId)
      .in("status", ["pending", "minor_approved", "guardian_approved"])
      .eq(actorApprovedColumn, false)
      .eq(actorDeclinedColumn, false)
      .select("id")
      .maybeSingle();

    if (updateErr) throw updateErr;

    if (!actionWrite?.id) {
      const latest = (await loadRequest(sb, requestId)) ?? row;
      const latestDecision = actorRecordedDecision(latest, actor);
      const latestState = requestState(latest);

      if (latestDecision === decision) {
        return NextResponse.json({
          ok: true,
          state: latestState,
          message: "This confirmation was already recorded.",
          request: publicRequest(latest),
        });
      }

      return NextResponse.json(
        {
          ok: false,
          state: "already_resolved",
          message:
            "This minor signup request changed before this action could be recorded.",
          request: publicRequest(latest),
        },
        { status: 409 },
      );
    }

    const nextRow = (await loadRequest(sb, requestId)) ?? row;
    const nextState = requestState(nextRow);

    if (nextState === "declined") {
      await markDeclined(sb, nextRow, actor);

      return NextResponse.json({
        ok: true,
        state: "declined",
        message:
          actor === "minor"
            ? "You declined this signup request. StayKnown will not continue this minor account creation flow."
            : "You declined this guardian consent request. StayKnown will not continue this minor account creation flow.",
        request: publicRequest({
          ...nextRow,
          status: "declined",
        }),
      });
    }

    if (nextState === "fully_approved") {
      await finalizeMinorSignupIfReady(sb, nextRow);

      const finalRow = (await loadRequest(sb, requestId)) ?? {
        ...nextRow,
        status: "approved",
      };

      return NextResponse.json({
        ok: true,
        state: "fully_approved",
        message:
          "Both confirmations are complete. The minor signup flow may now continue to the normal StayKnown email verification step.",
        request: publicRequest(finalRow),
      });
    }

    if (nextState === "waiting_guardian") {
      return NextResponse.json({
        ok: true,
        state: "waiting_guardian",
        message:
          "The minor confirmation has been recorded. Waiting for guardian approval.",
        request: publicRequest(nextRow),
      });
    }

    if (nextState === "waiting_minor") {
      return NextResponse.json({
        ok: true,
        state: "waiting_minor",
        message:
          "The guardian confirmation has been recorded. Waiting for the minor to confirm they started this account creation flow.",
        request: publicRequest(nextRow),
      });
    }

    return NextResponse.json({
      ok: true,
      state: "pending_both",
      message:
        "This minor signup request is still waiting for both required confirmations.",
      request: publicRequest(nextRow),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        state: "error",
        message:
          e instanceof Error
            ? e.message
            : "This minor signup approval could not be completed right now.",
      },
      { status: 500 },
    );
  }
}
