// app/api/contact-approval/act/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INTERNAL_EDGE_TIMEOUT_MS = 4_000;

type Actor = "owner" | "target";
type Decision = "approve" | "decline";

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

function toIsoNow() {
  return new Date().toISOString();
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
    summary: [city, region, country].filter(Boolean).join(", "),
  };
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

function publicApprovalRequest(row: ApprovalRow) {
  return {
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

async function finalizeContactIfReady(
  sb: ReturnType<typeof admin>,
  row: ApprovalRow,
): Promise<boolean> {
  if (row.owner_approved !== true || row.target_approved !== true) {
    return false;
  }

  const addedType = clean(row.added_type).toLowerCase();
  const contactRowId = clean(row.contact_row_id);

  if (!contactRowId) {
    throw new Error("Missing contact_row_id");
  }

  let finalizedContactId = "";

  if (addedType === "emergency") {
    const { data, error } = await sb
      .from("emergency_contacts")
      .update({ approval_status: "approved" })
      .eq("id", contactRowId)
      .eq("approval_status", "pending")
      .select("id")
      .maybeSingle();

    if (error) throw error;
    finalizedContactId = clean((data as Record<string, unknown> | null)?.id);
  } else if (addedType === "sos") {
    const { data, error } = await sb
      .from("sos_contacts")
      .update({ approval_status: "approved" })
      .eq("id", contactRowId)
      .eq("approval_status", "pending")
      .select("id")
      .maybeSingle();

    if (error) throw error;
    finalizedContactId = clean((data as Record<string, unknown> | null)?.id);
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

  // Only the request that actually changed the contact from pending to
  // approved sends the completion notifications. This prevents duplicate
  // email and push delivery when both links are submitted at nearly the same
  // time or a browser retries the request.
  return finalizedContactId.length > 0;
}

async function removePendingContact(
  sb: ReturnType<typeof admin>,
  row: ApprovalRow,
): Promise<boolean> {
  const addedType = clean(row.added_type).toLowerCase();
  const contactRowId = clean(row.contact_row_id);

  if (!contactRowId) return false;

  if (addedType === "emergency") {
    const { data, error } = await sb
      .from("emergency_contacts")
      .delete()
      .eq("id", contactRowId)
      .eq("approval_status", "pending")
      .select("id")
      .maybeSingle();

    if (error) throw error;
    return clean((data as Record<string, unknown> | null)?.id).length > 0;
  }

  if (addedType === "sos") {
    const { data, error } = await sb
      .from("sos_contacts")
      .delete()
      .eq("id", contactRowId)
      .eq("approval_status", "pending")
      .select("id")
      .maybeSingle();

    if (error) throw error;
    return clean((data as Record<string, unknown> | null)?.id).length > 0;
  }

  throw new Error("Unsupported added_type for pending contact removal");
}

async function invokeInternalEdgeBestEffort(
  name: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const baseUrl = (process.env.SUPABASE_FUNCTIONS_URL || "").trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim();
  const internalSecret = (process.env.INTERNAL_EDGE_SECRET || "").trim();

  if (!baseUrl || !anonKey || !internalSecret) {
    console.error("[contact-approval/act] notification configuration missing", {
      functionName: name,
    });
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    INTERNAL_EDGE_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${baseUrl}/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "x-internal-secret": internalSecret,
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (
      !response.ok ||
      (data && typeof data === "object" && data.ok === false)
    ) {
      console.error("[contact-approval/act] notification side effect failed", {
        functionName: name,
        httpStatus: response.status,
        deliveryState:
          data && typeof data === "object" && "delivery_state" in data
            ? String(data.delivery_state || "")
            : "",
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[contact-approval/act] notification side effect unavailable",
      {
        functionName: name,
        reason:
          error instanceof DOMException && error.name === "AbortError"
            ? "timeout"
            : "request_failed",
      },
    );
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function loadApprovedContactItem(
  sb: ReturnType<typeof admin>,
  row: ApprovalRow,
) {
  const addedType = clean(row.added_type).toLowerCase();
  const contactRowId = clean(row.contact_row_id);

  if (!contactRowId) {
    throw new Error("Missing contact_row_id");
  }

  if (addedType === "emergency") {
    const { data, error } = await sb
      .from("emergency_contacts")
      .select("name, email")
      .eq("id", contactRowId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Approved emergency contact not found");

    return {
      addedType: "emergency",
      item: {
        name: clean((data as Record<string, unknown>).name),
        email: clean((data as Record<string, unknown>).email),
      },
    };
  }

  if (addedType === "sos") {
    const { data, error } = await sb
      .from("sos_contacts")
      .select("name, email, role")
      .eq("id", contactRowId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Approved SOS contact not found");

    return {
      addedType: "sos",
      item: {
        name: clean((data as Record<string, unknown>).name),
        email: clean((data as Record<string, unknown>).email),
        role: clean((data as Record<string, unknown>).role),
      },
    };
  }

  throw new Error("Unsupported added_type");
}

function logInternalRouteError(error: unknown) {
  if (error instanceof Error) {
    console.error("[contact-approval/act] authoritative operation failed", {
      name: error.name,
      message: error.message,
    });
    return;
  }

  console.error("[contact-approval/act] authoritative operation failed", {
    name: "UnknownError",
  });
}

function publicServerFailure() {
  return NextResponse.json(
    {
      ok: false,
      state: "error",
      code: "contact_approval_temporarily_unavailable",
      message:
        "This request could not be completed right now. Please try again shortly.",
    },
    { status: 500 },
  );
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
          code: "approval_details_missing",
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
          code:
            verified.reason === "expired"
              ? "approval_link_expired"
              : "approval_link_invalid",
          message:
            verified.reason === "expired"
              ? "This request expired for security reasons. Please restart the process."
              : "This approval link is invalid or can no longer be trusted.",
        },
        { status: 400 },
      );
    }

    const sb = admin();

    const initiatorIp = extractClientIp(req);
    const initiatorGeo = coarseLocationFromHeaders(req);
    const initiatorUserAgent = (req.headers.get("user-agent") || "").trim();

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

    if (error) {
      throw error;
    }

    const row = (data as ApprovalRow | null) ?? null;

    if (!row?.id) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          code: "approval_request_not_found",
          message: "This request could not be found.",
        },
        { status: 404 },
      );
    }

    const currentState = requestState(row);

    if (currentState === "expired") {
      const { data: expiredClaim } = await sb
        .from("contact_approval_requests")
        .update({
          status: "expired",
          updated_at: toIsoNow(),
        })
        .eq("id", requestId)
        .neq("status", "expired")
        .select("id")
        .maybeSingle();

      const addedType = clean(row.added_type).toLowerCase();
      const contactRowId = clean(row.contact_row_id);

      if (contactRowId) {
        if (addedType === "emergency") {
          await sb
            .from("emergency_contacts")
            .update({ approval_status: "expired" })
            .eq("id", contactRowId)
            .eq("approval_status", "pending");
        } else if (addedType === "sos") {
          await sb
            .from("sos_contacts")
            .update({ approval_status: "expired" })
            .eq("id", contactRowId)
            .eq("approval_status", "pending");
        }
      }

      if (clean((expiredClaim as Record<string, unknown> | null)?.id)) {
        await invokeInternalEdgeBestEffort("contact_declined_notify", {
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
      }

      return NextResponse.json({
        ok: false,
        state: "expired",
        code: "approval_request_expired",
        message:
          "This request expired for security reasons. Please restart the process.",
        request: publicApprovalRequest(row),
      });
    }

    if (currentState === "declined") {
      return NextResponse.json({
        ok: false,
        state: "declined",
        code: "approval_request_declined",
        message: "This request was already declined and cannot proceed.",
        request: publicApprovalRequest(row),
      });
    }

    if (currentState === "fully_approved") {
      return NextResponse.json({
        ok: false,
        state: "already_resolved",
        code: "approval_request_completed",
        message: "This request was already completed successfully.",
        request: publicApprovalRequest(row),
      });
    }

    const actorAlreadyCompleted =
      actor === "owner"
        ? row.owner_approved === true || row.owner_declined === true
        : row.target_approved === true || row.target_declined === true;

    if (actorAlreadyCompleted) {
      return NextResponse.json({
        ok: true,
        state: requestState(row),
        code: "approval_decision_already_recorded",
        message:
          actor === "owner"
            ? "Your decision was already recorded. Waiting for the contact email owner."
            : "Your decision was already recorded. Waiting for the account owner.",
        request: publicApprovalRequest(row),
      });
    }

    const patch: Record<string, unknown> = {
      updated_at: toIsoNow(),
      last_action_ip: initiatorIp || null,
      last_action_user_agent: initiatorUserAgent || null,
      last_action_country: initiatorGeo.country || null,
      last_action_region: initiatorGeo.region || null,
      last_action_city: initiatorGeo.city || null,
    };

    if (actor === "owner") {
      if (decision === "approve") {
        patch.owner_approved = true;
        patch.owner_declined = false;
        patch.owner_completed_at = toIsoNow();
        patch.owner_ip = initiatorIp || null;
        patch.owner_user_agent = initiatorUserAgent || null;
        patch.owner_country = initiatorGeo.country || null;
        patch.owner_region = initiatorGeo.region || null;
        patch.owner_city = initiatorGeo.city || null;
      } else {
        patch.owner_declined = true;
        patch.owner_approved = false;
        patch.owner_completed_at = toIsoNow();
        patch.owner_ip = initiatorIp || null;
        patch.owner_user_agent = initiatorUserAgent || null;
        patch.owner_country = initiatorGeo.country || null;
        patch.owner_region = initiatorGeo.region || null;
        patch.owner_city = initiatorGeo.city || null;
        patch.status = "declined";
        patch.decided_at = toIsoNow();
      }
    } else {
      if (decision === "approve") {
        patch.target_approved = true;
        patch.target_declined = false;
        patch.target_completed_at = toIsoNow();
        patch.target_ip = initiatorIp || null;
        patch.target_user_agent = initiatorUserAgent || null;
        patch.target_country = initiatorGeo.country || null;
        patch.target_region = initiatorGeo.region || null;
        patch.target_city = initiatorGeo.city || null;
      } else {
        patch.target_declined = true;
        patch.target_approved = false;
        patch.target_completed_at = toIsoNow();
        patch.target_ip = initiatorIp || null;
        patch.target_user_agent = initiatorUserAgent || null;
        patch.target_country = initiatorGeo.country || null;
        patch.target_region = initiatorGeo.region || null;
        patch.target_city = initiatorGeo.city || null;
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

    if (nextErr) {
      throw nextErr;
    }

    const nextRow = (nextData as ApprovalRow | null) ?? row;
    const nextState = requestState(nextRow);

    if (nextState === "declined") {
      const removedPendingContact = await removePendingContact(sb, nextRow);

      if (removedPendingContact) {
        await invokeInternalEdgeBestEffort("contact_declined_notify", {
          request_id: clean(nextRow.id),
          resolution: "declined",
          actor,
          adder_user_id: clean(nextRow.requester_id),
          added_type: clean(nextRow.added_type),
          target_user_id: clean(nextRow.target_user_id),
          target_email: clean(nextRow.target_email),
          target_display_name:
            clean(nextRow.target_name) || clean(nextRow.target_email_masked),
          decline_action: "decline",
          item: {
            name: clean(nextRow.target_name),
            email: clean(nextRow.target_email),
          },
        });
      }

      return NextResponse.json({
        ok: true,
        state: "declined",
        code: "approval_request_declined",
        message:
          actor === "owner"
            ? "You declined this request. The email will not be added."
            : "You declined this request. The email will not be added.",
        request: publicApprovalRequest(nextRow),
      });
    }
    if (nextState === "fully_approved") {
      const finalizedNow = await finalizeContactIfReady(sb, nextRow);

      if (finalizedNow) {
        const approvedContact = await loadApprovedContactItem(sb, nextRow);

        await invokeInternalEdgeBestEffort("contact_added_notify", {
          adder_user_id: clean(nextRow.requester_id),
          added_type: approvedContact.addedType,
          adder_name: clean(nextRow.requester_name) || "StayKnown User",
          requester_email_masked: clean(nextRow.requester_email_masked),
          target_user_id: clean(nextRow.target_user_id),
          target_name: clean(nextRow.target_name),
          target_email: clean(nextRow.target_email),
          target_email_masked: clean(nextRow.target_email_masked),
          request_id: clean(nextRow.id),
          items: [
            {
              ...approvedContact.item,
              target_user_id: clean(nextRow.target_user_id),
            },
          ],
        });
      }

      const { data: finalData } = await sb
        .from("contact_approval_requests")
        .select(
          `
            id,
            requester_id,
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
        code: "approval_request_completed",
        message:
          "Both confirmations are complete. The contact has now been added successfully.",
        request: publicApprovalRequest(
          (finalData as ApprovalRow | null) ?? nextRow,
        ),
      });
    }

    // Approval state is already authoritative at this point. Push/email
    // progress delivery is a secondary side effect. Missing push registration,
    // provider failure or an Edge timeout must never turn the recorded
    // approval into a public failure.
    await invokeInternalEdgeBestEffort("contact_approval_progress_notify", {
      request_id: clean(nextRow.id),
      completed_actor: actor,
    });

    return NextResponse.json({
      ok: true,
      state: "pending_other_party",
      code: "approval_decision_recorded",
      message:
        actor === "owner"
          ? "Your confirmation has been recorded. The request will complete when the contact email owner also confirms."
          : "Your confirmation has been recorded. The request will complete when the account owner also confirms.",
      request: publicApprovalRequest(nextRow),
    });
  } catch (error) {
    logInternalRouteError(error);
    return publicServerFailure();
  }
}
