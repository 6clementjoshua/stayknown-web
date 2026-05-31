// app/api/minor-signup/cancel/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MinorSignupRow = {
  id: string;
  minor_email?: string | null;
  minor_first_name?: string | null;
  minor_last_name?: string | null;
  guardian_email?: string | null;
  status?: string | null;
  minor_approved?: boolean | null;
  guardian_approved?: boolean | null;
  minor_declined?: boolean | null;
  guardian_declined?: boolean | null;
  expires_at?: string | null;

  // Recovery/final-sync protection columns
  auth_user_id?: string | null;
  profile_synced_at?: string | null;
  guardian_contact_synced_at?: string | null;
  completed_at?: string | null;
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Minor signup cancellation is not fully configured yet.");
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

function toIsoNow() {
  return new Date().toISOString();
}

function requestState(row: MinorSignupRow) {
  const status = lower(row.status);

  if (status === "cancelled") return "cancelled" as const;
  if (status === "approved") return "fully_approved" as const;
  if (status === "declined" || row.minor_declined || row.guardian_declined) {
    return "declined" as const;
  }

  const exp = clean(row.expires_at);
  if (exp) {
    const expMs = new Date(exp).getTime();
    if (Number.isFinite(expMs) && expMs <= Date.now()) {
      return "expired" as const;
    }
  }

  if (row.minor_approved === true && row.guardian_approved === true) {
    return "fully_approved" as const;
  }

  return "pending" as const;
}

async function invokeInternalEdge(
  name: string,
  payload: Record<string, unknown>,
) {
  const baseUrl = clean(process.env.SUPABASE_FUNCTIONS_URL);
  const anonKey = clean(process.env.SUPABASE_ANON_KEY);
  const internalSecret = clean(process.env.INTERNAL_EDGE_SECRET);

  if (!baseUrl || !anonKey || !internalSecret) {
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const requestId = clean(body.request_id);
    const minorEmail = normalizeEmail(body.minor_email);
    const reason = clean(body.reason) || "cancelled_by_minor";

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

    if (!minorEmail || !minorEmail.includes("@")) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "Missing minor email for cancellation verification.",
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
    guardian_email,
    status,
    minor_approved,
    guardian_approved,
    minor_declined,
    guardian_declined,
    expires_at,
    auth_user_id,
    profile_synced_at,
    guardian_contact_synced_at,
    completed_at
  `,
      )
      .eq("id", requestId)
      .maybeSingle();

    if (error) throw error;

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

    if (normalizeEmail(row.minor_email) !== minorEmail) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "This cancellation request could not be verified.",
        },
        { status: 403 },
      );
    }

    const state = requestState(row);

    const alreadyApprovedOrSynced =
      state === "fully_approved" ||
      lower(row.status) === "approved" ||
      (row.minor_approved === true && row.guardian_approved === true) ||
      !!row.auth_user_id ||
      !!row.profile_synced_at ||
      !!row.guardian_contact_synced_at ||
      !!row.completed_at;

    if (alreadyApprovedOrSynced) {
      return NextResponse.json(
        {
          ok: false,
          state: "approved_not_completed",
          message:
            "This guardian consent has already been approved and cannot be cancelled. Continue to email verification.",
          request: {
            id: row.id,
            status: row.status,
            minor_approved: row.minor_approved === true,
            guardian_approved: row.guardian_approved === true,
            auth_user_id: row.auth_user_id ?? null,
            profile_synced_at: row.profile_synced_at ?? null,
            guardian_contact_synced_at: row.guardian_contact_synced_at ?? null,
            completed_at: row.completed_at ?? null,
          },
        },
        { status: 409 },
      );
    }

    if (state === "declined") {
      return NextResponse.json({
        ok: true,
        state: "declined",
        message: "This request was already declined and cannot continue.",
      });
    }

    if (state === "expired") {
      await sb
        .from("minor_signup_requests")
        .update({
          status: "expired",
          updated_at: toIsoNow(),
        })
        .eq("id", requestId);

      return NextResponse.json({
        ok: true,
        state: "expired",
        message: "This request already expired and cannot continue.",
      });
    }

    if (state === "cancelled") {
      return NextResponse.json({
        ok: true,
        state: "cancelled",
        message: "This request was already cancelled and cannot continue.",
      });
    }

    const actionIp = extractClientIp(req);
    const actionGeo = coarseLocationFromHeaders(req);
    const actionUserAgent = (req.headers.get("user-agent") || "").trim();
    const now = toIsoNow();

    const { error: updateErr } = await sb
      .from("minor_signup_requests")
      .update({
        status: "cancelled",
        decided_at: now,
        updated_at: now,

        /*
          We store cancellation technical metadata in the minor actor fields
          because the cancellation is initiated from the minor signup overlay.
        */
        minor_completed_at: now,
        minor_ip: actionIp || null,
        minor_user_agent: actionUserAgent || null,
        minor_country: actionGeo.country || null,
        minor_region: actionGeo.region || null,
        minor_city: actionGeo.city || null,
      })
      .eq("id", requestId)
      .in("status", ["pending", "minor_approved", "guardian_approved"]);

    if (updateErr) throw updateErr;

    await invokeInternalEdge("minor_signup_cancelled_notify", {
      request_id: requestId,
      cancelled_by: "minor",
      reason,
    });

    return NextResponse.json({
      ok: true,
      state: "cancelled",
      message:
        "This StayKnown minor signup flow has been cancelled. Old approval links can no longer continue this account request.",
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        state: "error",
        message:
          e instanceof Error
            ? e.message
            : "Could not cancel this minor signup flow right now.",
      },
      { status: 500 },
    );
  }
}
