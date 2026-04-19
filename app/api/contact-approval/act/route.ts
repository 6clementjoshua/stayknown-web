// app/api/contact-approval/act/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Actor = "owner" | "target";
type Decision = "approve" | "decline";

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
    throw new Error("Contact approval is not fully configured yet.");
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false },
  });
}

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function asActor(v: string): Actor | null {
  const s = v.trim().toLowerCase();
  if (s === "owner" || s === "target") return s;
  return null;
}

function asDecision(v: string): Decision | null {
  const s = v.trim().toLowerCase();
  if (s === "approve" || s === "decline") return s;
  return null;
}

function verifySignature(p: {
  requestId: string;
  actor: Actor;
  decision: Decision;
  exp: number;
  sig: string;
}) {
  const secret = (process.env.CONTACT_APPROVAL_SIGNING_SECRET || "").trim();
  if (!secret) return { ok: false, reason: "missing_secret" as const };

  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(p.exp)) return { ok: false, reason: "bad_exp" as const };
  if (p.exp < now) return { ok: false, reason: "expired" as const };

  const message = `rid=${p.requestId}&actor=${p.actor}&decision=${p.decision}&exp=${p.exp}`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (expected !== p.sig) {
    return { ok: false, reason: "bad_signature" as const };
  }

  return { ok: true as const };
}

function toIsoNow() {
  return new Date().toISOString();
}

function requestState(row: ApprovalRow) {
  const ownerApproved = row.owner_approved === true;
  const targetApproved = row.target_approved === true;
  const ownerDeclined = row.owner_declined === true;
  const targetDeclined = row.target_declined === true;

  if (ownerDeclined || targetDeclined || row.status === "declined") {
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

async function finalizeContactIfReady(
  sb: ReturnType<typeof admin>,
  row: ApprovalRow,
) {
  const ownerApproved = row.owner_approved === true;
  const targetApproved = row.target_approved === true;

  if (!ownerApproved || !targetApproved) return false;

  const addedType = clean(row.added_type).toLowerCase();
  const contactRowId = clean(row.contact_row_id);

  if (!contactRowId) {
    throw new Error("Missing contact_row_id");
  }

  if (addedType === "emergency") {
    const { error } = await sb
      .from("emergency_contacts")
      .update({
        approval_status: "approved",
      })
      .eq("id", contactRowId);

    if (error) throw error;
  } else if (addedType === "sos") {
    const { error } = await sb
      .from("sos_contacts")
      .update({
        approval_status: "approved",
      })
      .eq("id", contactRowId);

    if (error) throw error;
  } else {
    throw new Error("Unsupported added_type for dual confirmation");
  }

  const { error: reqErr } = await sb
    .from("contact_approval_requests")
    .update({
      status: "approved",
      decided_at: toIsoNow(),
      updated_at: toIsoNow(),
    })
    .eq("id", row.id);

  if (reqErr) throw reqErr;

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
          message: "This request is missing required approval details.",
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
              ? "This request expired for security reasons. Please restart the process."
              : "This approval link is invalid or can no longer be trusted.",
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

    const currentState = requestState(row);

    if (currentState === "expired") {
      await sb
        .from("contact_approval_requests")
        .update({
          status: "expired",
          updated_at: toIsoNow(),
        })
        .eq("id", requestId);

      return NextResponse.json({
        ok: false,
        state: "expired",
        message:
          "This request expired for security reasons. Please restart the process.",
        request: row,
      });
    }

    if (currentState === "declined") {
      return NextResponse.json({
        ok: false,
        state: "declined",
        message: "This request was already declined and cannot proceed.",
        request: row,
      });
    }

    if (currentState === "fully_approved") {
      return NextResponse.json({
        ok: false,
        state: "already_resolved",
        message: "This request was already completed successfully.",
        request: row,
      });
    }

    const patch: Record<string, unknown> = {
      updated_at: toIsoNow(),
    };

    if (actor === "owner") {
      if (decision === "approve") {
        patch.owner_approved = true;
        patch.owner_declined = false;
        patch.owner_completed_at = toIsoNow();
      } else {
        patch.owner_declined = true;
        patch.owner_approved = false;
        patch.owner_completed_at = toIsoNow();
        patch.status = "declined";
        patch.decided_at = toIsoNow();
      }
    } else {
      if (decision === "approve") {
        patch.target_approved = true;
        patch.target_declined = false;
        patch.target_completed_at = toIsoNow();
      } else {
        patch.target_declined = true;
        patch.target_approved = false;
        patch.target_completed_at = toIsoNow();
        patch.status = "declined";
        patch.decided_at = toIsoNow();
      }
    }

    const { error: updateErr } = await sb
      .from("contact_approval_requests")
      .update(patch)
      .eq("id", requestId);

    if (updateErr) {
      throw updateErr;
    }

    const { data: nextData, error: nextErr } = await sb
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

    if (nextErr) {
      throw nextErr;
    }

    const nextRow = (nextData as ApprovalRow | null) ?? row;
    const nextState = requestState(nextRow);

    if (nextState === "declined") {
      return NextResponse.json({
        ok: true,
        state: "declined",
        message:
          actor === "owner"
            ? "You declined this request. The email will not be added."
            : "You declined this request. The email will not be added.",
        request: nextRow,
      });
    }

    if (nextState === "fully_approved") {
      await finalizeContactIfReady(sb, nextRow);

      const { data: finalData } = await sb
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

      return NextResponse.json({
        ok: true,
        state: "fully_approved",
        message:
          "Both confirmations are complete. The contact has now been added successfully.",
        request: (finalData as ApprovalRow | null) ?? nextRow,
      });
    }

    return NextResponse.json({
      ok: true,
      state: "pending_other_party",
      message:
        actor === "owner"
          ? "Your confirmation has been recorded. The request will complete when the contact email owner also confirms."
          : "Your confirmation has been recorded. The request will complete when the account owner also confirms.",
      request: nextRow,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        state: "error",
        message:
          e instanceof Error
            ? e.message
            : "This request could not be completed right now.",
      },
      { status: 500 },
    );
  }
}
