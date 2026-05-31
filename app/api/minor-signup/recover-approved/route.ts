// app/api/minor-signup/recover-approved/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MinorSignupRow = {
  id: string;

  minor_email?: string | null;
  minor_first_name?: string | null;
  minor_last_name?: string | null;
  minor_date_of_birth?: string | null;
  minor_age_years?: number | null;

  guardian_email?: string | null;
  guardian_first_name?: string | null;
  guardian_last_name?: string | null;
  guardian_relationship?: string | null;

  status?: string | null;

  minor_approved?: boolean | null;
  guardian_approved?: boolean | null;
  minor_declined?: boolean | null;
  guardian_declined?: boolean | null;

  expires_at?: string | null;
  decided_at?: string | null;

  auth_user_id?: string | null;
  profile_synced_at?: string | null;
  guardian_contact_synced_at?: string | null;
  completed_at?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Minor signup recovery is not fully configured yet.");
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

function fullName(first?: string | null, last?: string | null) {
  return `${clean(first)} ${clean(last)}`.trim();
}

function maskEmail(email?: string | null) {
  const e = normalizeEmail(email);
  if (!e || !e.includes("@")) return "";

  const [name, domain] = e.split("@");
  if (!name || !domain) return "";

  const visible =
    name.length <= 2
      ? `${name[0] ?? "*"}*`
      : `${name.slice(0, 2)}${"*".repeat(Math.min(5, name.length - 2))}`;

  return `${visible}@${domain}`;
}

function rowState(row: MinorSignupRow) {
  const status = lower(row.status);

  if (row.completed_at || row.profile_synced_at || row.auth_user_id) {
    return "completed" as const;
  }

  if (status === "cancelled") return "cancelled" as const;

  if (
    status === "declined" ||
    row.minor_declined === true ||
    row.guardian_declined === true
  ) {
    return "declined" as const;
  }

  const exp = clean(row.expires_at);
  if (exp) {
    const expMs = new Date(exp).getTime();
    if (Number.isFinite(expMs) && expMs <= Date.now()) {
      return "expired" as const;
    }
  }

  const minorApproved = row.minor_approved === true;
  const guardianApproved = row.guardian_approved === true;

  if (status === "approved" || (minorApproved && guardianApproved)) {
    return "approved_not_completed" as const;
  }

  if (minorApproved && !guardianApproved) {
    return "pending_existing" as const;
  }

  if (!minorApproved && guardianApproved) {
    return "pending_existing" as const;
  }

  return "pending_existing" as const;
}

function publicRequest(row: MinorSignupRow) {
  return {
    id: row.id,
    status: clean(row.status) || "pending",
    minor_name: fullName(row.minor_first_name, row.minor_last_name),
    minor_email_masked: maskEmail(row.minor_email),
    minor_age_years: row.minor_age_years ?? null,
    guardian_name: fullName(row.guardian_first_name, row.guardian_last_name),
    guardian_email_masked: maskEmail(row.guardian_email),
    guardian_relationship: clean(row.guardian_relationship) || "parent",
    minor_approved: row.minor_approved === true,
    guardian_approved: row.guardian_approved === true,
    expires_at: row.expires_at ?? null,
    decided_at: row.decided_at ?? null,
    completed_at: row.completed_at ?? null,
    profile_synced_at: row.profile_synced_at ?? null,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const minorEmail = normalizeEmail(body.minor_email);
    const dob = clean(body.minor_date_of_birth);
    const guardianEmail = normalizeEmail(body.guardian_email);

    if (!minorEmail || !minorEmail.includes("@")) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "Missing minor email.",
        },
        { status: 400 },
      );
    }

    if (!dob) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "Missing date of birth.",
        },
        { status: 400 },
      );
    }

    if (!guardianEmail || !guardianEmail.includes("@")) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "Missing guardian email.",
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
          minor_date_of_birth,
          minor_age_years,

          guardian_email,
          guardian_first_name,
          guardian_last_name,
          guardian_relationship,

          status,

          minor_approved,
          guardian_approved,
          minor_declined,
          guardian_declined,

          expires_at,
          decided_at,

          auth_user_id,
          profile_synced_at,
          guardian_contact_synced_at,
          completed_at,

          created_at,
          updated_at
        `,
      )
      .eq("minor_email", minorEmail)
      .eq("minor_date_of_birth", dob)
      .eq("guardian_email", guardianEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const row = (data as MinorSignupRow | null) ?? null;

    if (!row?.id) {
      return NextResponse.json({
        ok: true,
        state: "not_found",
        message: "No existing minor consent request was found.",
        request: null,
      });
    }

    const state = rowState(row);

    if (state === "expired" && lower(row.status) !== "expired") {
      await sb
        .from("minor_signup_requests")
        .update({
          status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
    }

    let message = "Existing minor signup request found.";

    if (state === "approved_not_completed") {
      message =
        "Guardian consent is already approved. Continue to email verification.";
    } else if (state === "pending_existing") {
      message =
        "A guardian consent request is already in progress. Continue waiting for confirmation.";
    } else if (state === "completed") {
      message =
        "This approved minor signup has already been completed. Please sign in.";
    } else if (state === "declined") {
      message =
        "The previous minor signup request was declined. A new request is required.";
    } else if (state === "cancelled") {
      message =
        "The previous minor signup request was cancelled. A new request is required.";
    } else if (state === "expired") {
      message =
        "The previous minor signup request expired. A new request is required.";
    }

    return NextResponse.json({
      ok: true,
      state,
      message,
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
            : "Could not recover minor signup request right now.",
      },
      { status: 500 },
    );
  }
}
