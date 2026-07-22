// app/api/contact-approval/status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ApprovalRow = {
  id: string;
  requester_id?: string | null;
  target_user_id?: string | null;
  target_email?: string | null;
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

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function requestState(row: ApprovalRow) {
  const ownerApproved = row.owner_approved === true;
  const targetApproved = row.target_approved === true;
  const ownerDeclined = row.owner_declined === true;
  const targetDeclined = row.target_declined === true;
  const status = clean(row.status).toLowerCase();

  if (ownerDeclined || targetDeclined || status === "declined") {
    return "declined" as const;
  }

  const expiresAt = clean(row.expires_at);
  if (expiresAt) {
    const expiresAtMs = new Date(expiresAt).getTime();
    if (Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now()) {
      return "expired" as const;
    }
  }

  if (ownerApproved && targetApproved) {
    return "fully_approved" as const;
  }

  return "pending_other_party" as const;
}

function publicApprovalRequest(row: ApprovalRow) {
  return {
    id: row.id,
    status: row.status ?? null,
    added_type: row.added_type ?? null,
    expires_at: row.expires_at ?? null,
    owner_approved: row.owner_approved === true,
    target_approved: row.target_approved === true,
    owner_declined: row.owner_declined === true,
    target_declined: row.target_declined === true,
    owner_completed_at: row.owner_completed_at ?? null,
    target_completed_at: row.target_completed_at ?? null,
    requester_name: row.requester_name ?? null,
    requester_email_masked: row.requester_email_masked ?? null,
    target_name: row.target_name ?? null,
    target_email_masked: row.target_email_masked ?? null,
  };
}

async function invokeInternalEdge(
  name: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  const baseUrl = clean(process.env.SUPABASE_FUNCTIONS_URL);
  const anonKey = clean(process.env.SUPABASE_ANON_KEY);
  const internalSecret = clean(process.env.INTERNAL_EDGE_SECRET);

  if (!baseUrl || !anonKey || !internalSecret) {
    throw new Error(
      "Missing edge configuration for approval follow-up notifications.",
    );
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/g, "")}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "x-internal-secret": internalSecret,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.ok === false) {
    throw new Error(
      `Edge ${name} failed: ${
        typeof result?.error === "string"
          ? result.error
          : `${response.status} ${response.statusText}`
      }`,
    );
  }

  return result;
}

async function markPendingContactExpired(
  sb: ReturnType<typeof admin>,
  row: ApprovalRow,
): Promise<void> {
  const contactRowId = clean(row.contact_row_id);
  if (!contactRowId) return;

  const addedType = clean(row.added_type).toLowerCase();

  if (addedType === "emergency") {
    const { error } = await sb
      .from("emergency_contacts")
      .update({ approval_status: "expired" })
      .eq("id", contactRowId)
      .eq("approval_status", "pending");
    if (error) throw error;
    return;
  }

  if (addedType === "sos") {
    const { error } = await sb
      .from("sos_contacts")
      .update({ approval_status: "expired" })
      .eq("id", contactRowId)
      .eq("approval_status", "pending");
    if (error) throw error;
  }
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
          requester_id,
          target_user_id,
          target_email,
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

    if (error) throw error;

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
      const { data: expiredClaim, error: expiredError } = await sb
        .from("contact_approval_requests")
        .update({
          status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .neq("status", "expired")
        .select("id")
        .maybeSingle();

      if (expiredError) throw expiredError;

      await markPendingContactExpired(sb, row);

      // Only the request that actually performs the pending -> expired state
      // change sends the final expiration email and push. Repeated status polls
      // will therefore not duplicate delivery.
      if (clean((expiredClaim as Record<string, unknown> | null)?.id)) {
        try {
          await invokeInternalEdge("contact_declined_notify", {
            request_id: requestId,
            resolution: "expired",
            actor: "system",
            adder_user_id: clean(row.requester_id),
            added_type: clean(row.added_type),
            target_user_id: clean(row.target_user_id),
            target_email: clean(row.target_email),
            target_display_name:
              clean(row.target_name) || clean(row.target_email_masked),
            item: {
              name: clean(row.target_name),
              email: clean(row.target_email),
            },
          });
        } catch (notifyError) {
          console.error("CONTACT_APPROVAL_EXPIRY_NOTIFY_FAILED", notifyError);
        }
      }

      row.status = "expired";
    }

    return NextResponse.json({
      ok: true,
      state,
      request: publicApprovalRequest(row),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not read contact approval status right now.",
      },
      { status: 500 },
    );
  }
}
