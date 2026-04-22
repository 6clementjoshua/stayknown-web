// app/api/contact-approval/status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ApprovalRow = {
  id: string;
  status?: string | null;
  added_type?: string | null;
  contact_row_id?: string | null;
  expires_at?: string | null;

  owner_approved?: boolean | null;
  target_approved?: boolean | null;
  owner_declined?: boolean | null;
  target_declined?: boolean | null;

  owner_completed_at?: string | null;
  target_completed_at?: string | null;

  requester_name?: string | null;
  requester_email_masked?: string | null;
  target_name?: string | null;
  target_email_masked?: string | null;
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Contact approval status is not fully configured yet.");
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false },
  });
}

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function requestState(row: ApprovalRow) {
  const ownerApproved = row.owner_approved === true;
  const targetApproved = row.target_approved === true;
  const ownerDeclined = row.owner_declined === true;
  const targetDeclined = row.target_declined === true;

  if (
    ownerDeclined ||
    targetDeclined ||
    clean(row.status).toLowerCase() === "declined"
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

  if (ownerApproved && targetApproved) {
    return "fully_approved" as const;
  }

  return "pending_other_party" as const;
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
          message: "Missing request id.",
        },
        { status: 400 },
      );
    }

    const sb = admin();

    const { data, error } = await sb
      .from("contact_approval_requests")
      .select(
        `
          id,
          status,
          added_type,
          contact_row_id,
          expires_at,
          owner_approved,
          target_approved,
          owner_declined,
          target_declined,
          owner_completed_at,
          target_completed_at,
          requester_name,
          requester_email_masked,
          target_name,
          target_email_masked
        `,
      )
      .eq("id", requestId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const row = (data as ApprovalRow | null) ?? null;

    if (!row?.id) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "This request could not be found.",
        },
        { status: 404 },
      );
    }

    const state = requestState(row);

    if (state === "expired" && clean(row.status).toLowerCase() !== "expired") {
      await sb
        .from("contact_approval_requests")
        .update({
          status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);
    }

    return NextResponse.json({
      ok: true,
      state,
      request: row,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        state: "error",
        message:
          e instanceof Error
            ? e.message
            : "Could not read contact approval status right now.",
      },
      { status: 500 },
    );
  }
}
