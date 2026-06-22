// app/api/minor-signup/status/route.ts
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
  expires_at?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Minor signup status is not fully configured yet.");
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
  const guardianName = fullName(
    row.guardian_first_name,
    row.guardian_last_name,
  );

  return {
    id: row.id,
    status: clean(row.status) || "pending",

    minor_name: fullName(row.minor_first_name, row.minor_last_name),
    minor_email_masked: maskEmail(row.minor_email),
    minor_age_years: row.minor_age_years ?? null,

    // This must use the canonical/resolved guardian name.
    // If /start resolved the guardian email to a StayKnown profile,
    // these fields now contain the real account owner name.
    guardian_name: guardianName || "the guardian",
    guardian_email_masked: maskEmail(row.guardian_email),
    guardian_relationship: clean(row.guardian_relationship) || "parent",

    // Identity metadata. The current client can ignore these, but they help
    // website/debug/admin flows know whether the guardian name was resolved
    // from a real StayKnown profile or typed by the minor.
    guardian_identity_source:
      clean(row.guardian_identity_source) || "typed_by_minor",
    guardian_identity_mismatch: row.guardian_identity_mismatch === true,
    guardian_user_id: clean(row.guardian_user_id) || null,

    // Audit-only typed name. Do not display this as the true guardian name.
    guardian_entered_name: fullName(
      row.guardian_entered_first_name,
      row.guardian_entered_last_name,
    ),

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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const requestId = clean(url.searchParams.get("rid"));

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

    const sb = admin();

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
          expires_at,

          created_at,
          updated_at
        `,
      )
      .eq("id", requestId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const row = (data as MinorSignupRow | null) ?? null;

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

    const state = requestState(row);

    if (state === "expired" && lower(row.status) !== "expired") {
      await sb
        .from("minor_signup_requests")
        .update({
          status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);
    }

    return NextResponse.json({
      ok: true,
      state,
      request: publicRequest({
        ...row,
        status: state === "expired" ? "expired" : row.status,
      }),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        state: "error",
        message:
          e instanceof Error
            ? e.message
            : "Could not read minor signup status right now.",
      },
      { status: 500 },
    );
  }
}
